var _        = require("underscore"),
    fs       = require("fs"),
    path     = require("path"),
    uglifyJS = require("uglify-js"),
    cleanCSS = require("clean-css"),
    config   = require("../config"),
    log      = require("../log"),
    fss      = require("../fss");

/*
 * A cache of already concatenated and minified assets.
 */
var assetCache = {};

/*
 * Check if JS and CSS asset files have the correct file extension.
 */
var assetFileTypeMismatch = function(type, f) {
  return (type === "css" || type === "js" || type === "tmpl") && type !== _.last(f.split("."));
};

/*
 * Find asset files in a directory.
 */
var assetFilesFromDir = function(dir) {
  return _.chain(fss.all(dir)).map(function(f) {
    return fss.source(dir + "/" + f);
  }).filter(function(f) {
    return !fs.lstatSync(f).isDirectory();
  }).value();
};

/*
 * Produce a URL parameter for cache busting old assets.
 */
var version = function() {
  return config.timestamp && config.build ? "?v=" + config.time : "";
};

/*
 * Decide the HTML based on asset type and path.
 */
var toHtml = function(type, file, path) {
  if(config.html[type]) return config.html[type](file, path, version());
  if(type === "css") return "<link rel='stylesheet' href='" + path + version() + "'>";
  if(type === "js") return "<script src='" + path + version() + "'></script>";
  if(type === "tmpl") return "<script src='" + path + version() + "'></script>";
  return "";
};

/*
 * Pack assets based on type, files and their content.
 */
var pack = function(type, files, content) {
  if(config.pack[type]) return config.pack[type](files, content);
  if(type === "css") return minifyCSS(content);
  if(type === "js") return minifyJS(content);
  if(type === "tmpl") return minifyJS(compileTemplates(files));
  return "";
};

/*
 * Minify JS content.
 */
var minifyJS = function(content) {
  return uglifyJS.minify(content, { fromString: true }).code;
};

/*
 * Minify CSS content.
 */
var minifyCSS = function(content) {
  return cleanCSS.process(content);
};


/*
 * Compile underscore templates
 */
var compileTemplates = function(files) {
  return _.chain(files).map(config.getPlugin("tmpl").compile).value().join("");
};

/*
 * Get all asset files by type and group from the config file.
 */
var assetFiles = function(type, group) {
  if(!config.assets) throw("No assets found in config");
  var t = config.assets[type];
  if(!t) throw("Asset type not found: " + type);
  var g = t[group];
  if(!g) throw("Asset group not found: " + group);

  if(!_.isArray(g)) g = [g];
  return _.chain(g).map(function(f) {
    return fss.source(f);
  }).map(function(f) {
    if(fs.lstatSync(f).isDirectory()) return assetFilesFromDir(f);
    return f;
  }).flatten().uniq().filter(function(f) {
    var process = fss.isProcessableFile(f);
    var include = !fss.isHelperFile(_.last(f.split("/")));
    return process && include && !assetFileTypeMismatch(type, f);
  }).value();
};

/*
 * Serve assets in dev mode, by serving the files as they are.
 */
var dev = function(type, group) {
  return _.map(assetFiles(type, group), function(file) {
    return toHtml(type, file, path.join(config.root, fss.relative(file)));
  }).join("\n");
};

/*
 * Serve assets in build mode, by concatenating and miniying resources.
 */
var build = function(type, group) {
  var name = path.join(config.packed, group + "." + type);
  var target = fss.target(name);

  if(!fss.exists(target) || !assetCache[target]) {
    log("packing", fss.baseRelative(target));
    var files   = assetFiles(type, group);
    var content = fss.readAllFiles(files);

    if(_.isArray(files) && files.length > 0 && content !== "") {
      var packed = pack(type, files, content);
      var html = toHtml(type, files, path.join(config.root, name));
      if(packed) fss.writeFile(target, packed);
      if(html) assetCache[target] = html;
    }
  }

  return assetCache[target] || "";
};

/*
 * Export this plugin.
 */
module.exports = function(assetType, assetGroup) {
  return config.dev ?
    dev(assetType,   assetGroup) :
    build(assetType, assetGroup);
};
