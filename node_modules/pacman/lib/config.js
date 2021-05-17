var _      = require("underscore"),
    path   = require("path"),
    fss    = require("../lib/fss"),
    config = exports,
    fns    = {};

/*
 * Default config.
 */
var defaults = {

  // The source directory
  source: "content",

  // The target directory in build mode
  target: "public",

  // Root path for generated absolute paths
  root: "/",

  // Path for packed assets (under config.root)
  packed: "assets/packed/",

  // The config file
  config: "config.js",

  // Server post to use in dev mode
  port: 3000,

  // Turn logging off or on
  silent: true,

  // Add version timestamp to asset paths in build mode
  timestamp: true,

  // Default layout file for HTML files
  layout: "_layouts/default.html",

  // Other layouts for specific file paths
  layouts: {},

  // HTML helper functions
  helpers: {},

  // Specify a function to transform filenames in build mode.
  // The function should take a complete file path as its only argument,
  // and should return a changed (or the original) path.
  filename: false,

  // Specify asset groups
  assets: {},

  // Functions for turning asset groups or asset files into html
  html: {},

  // Functions for turning asset content into packed versions
  pack: {},

  // Files which should always be ignored
  ignore: [],

  // Files which should be ignored in dev mode
  ignore_dev: [],

  // Files which should be ignored in build mode
  ignore_build: [],

  // Files which should not be processed as HTML
  ignore_processing: [],

  // The rsync command used for syncing files
  rsync: "rsync -a --delete",

  // Remote server address
  remote: false,

  // Which plugins to use for processing files
  plugins: ["html", "assets", "tmpl"],

  // Underscore template settings
  templateSettings:  {
    evaluate    : /<%([\s\S]+?)%>/g,  // code <% ... %>
    interpolate : /<%=([\s\S]+?)%>/g, // echo, not escaped <%html ... %>
    escape      : /<%-([\s\S]+?)%>/g  // echo, escaped <%= ... %>
  }

};

/*
 * Extend the current config with custom flags.
 */
fns.extend = function(custom) {
  config = _.extend(config, custom);
  if(custom.config) config = _.extend(config, fns.load(fns.getPath()));
  return config;
};

/*
 * Get the absolute layout path from the current config.
 */
fns.getLayout = function(f) {
  if(!config.layout) return null;
  var match = _.chain(config.layouts).keys().filter(function(key) {
    return f.indexOf(key) !== -1;
  }).last().value();
  return path.join(config.appdir, match ? config.layouts[match] : config.layout);
};

/*
 * Get the config file path.
 */
fns.getPath = function() {
  var c1 = path.join(config.pwd, "" + config.config);
  var c2 = path.join(config.pwd, "pacman.js");
  var c3 = path.join(config.pwd, "config.js");
  if(fss.exists(c1)) return c1;
  if(fss.exists(c2)) return c2;
  return c3;
};

/*
 * Get a list of all ignored files.
 */
fns.getIgnored = function() {
  return config.dev ?
    _.union(config.ignore, config.ignore_dev) :
    _.union(config.ignore, config.ignore_build);
};

/*
 * Check if a file is ignored from processing.
 */
fns.needsProcessing = function(f) {
  return _.filter(config.ignore_processing, function(ignored) {
    return f.indexOf(ignored) !== -1;
  }).length === 0;
};

/*
 * Load a config file from a path.
 */
fns.load = function(f) {
  if(!fss.exists(f)) return {};
  return require(f).config;
};

/*
 * An object holding the processing function of each plugin.
 */
fns.plugin = {};

/*
 * Load each plugin to its correct place.
 */
fns.loadPlugin = function(name) {
  fns.plugin[name] = require("../lib/plugins/" + name + ".js");
};

/*
 * Get the processing function of a plugin by name.
 */
fns.getPlugin = function(name) {
  return fns.plugin[name];
};

/*
 * Initialize the default config with custom flags.
 */
fns.init = function(custom) {
  config.time = (new Date()).getTime();
  config = _.extend(config, defaults);
  config = _.extend(config, fns);

  config.pwd = process.cwd();
  config.appdir = path.join(config.pwd, config.source);
  config.pubdir = path.join(config.pwd, config.target);

  config = _.extend(config, custom);
  config = _.extend(config, fns.load(fns.getPath()));

  _.templateSettings = config.templateSettings;
  _.each(config.plugins || [], fns.loadPlugin);
  return config;
};

/*
 * Create the default config on first load.
 */
module.exports = fns.init();
