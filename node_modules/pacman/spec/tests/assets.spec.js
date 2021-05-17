var fs     = require("fs");
var config = require("../../lib/config");
var pacman = require("../../lib/pacman");
var fss    = require("../../lib/fss");
var _      = require("underscore")._;

var css = function(path) {
  return "<link rel='stylesheet' href='" + path;
};

var js = function(path) {
  return "<script src='" + path;
};

var assertSubstr = function(test, supstr, substr) {
  test.ok(supstr.indexOf(substr) === 0);
};

exports.setUp = function(callback) {
  config.init({
    appdir: "spec/cases/assets",
    pubdir: "spec/out/assets",
    packed: "assets",
    config: "spec/cases/assets/assets1.js",
    layout: false,
    ignore_processing: []
  });
  fss.resetDir(config.pubdir);
  callback();
};

exports.canGenerateDevAssets = function(test) {
  config.dev   = true;
  config.build = false;
  pacman.build(function() {
    assertSubstr(test, fss.readFile("spec/out/assets/css.html"), css("/css/1.css"));
    assertSubstr(test, fss.readFile("spec/out/assets/js_helper.html"),  js("/js_helper/1.js"));
    test.done();
  });
};

exports.canGenerateBuildAssets = function(test) {
  config.dev   = false;
  config.build = true;
  pacman.build(function() {
    assertSubstr(test, fss.readFile("spec/out/assets/css.html"), css("/assets/all.css"));
    assertSubstr(test, fss.readFile("spec/out/assets/js_helper.html"),  js("/assets/helper.js"));
    test.equal(fss.readFile("spec/out/assets/assets/all.css"), "*{z-index:1}");
    test.equal(fss.readFile("spec/out/assets/assets/helper.js"),  "var a=1;");
    test.done();
  });
};

exports.canGenerateIgnoredAssets = function(test) {
  config.dev   = false;
  config.build = true;
  config.ignore_processing = ["templates/", "t2.html"];
  pacman.build(function() {
    test.equal(fss.readFile("spec/out/assets/templates/t1.html"), '<%= render("foo", "foo") %>');
    test.equal(fss.readFile("spec/out/assets/templates/t2.html"), '<%= render("bar", "bar") %>');
    test.done();
  });
};

exports.canProcessEmptyAssetLists = function(test) {
  config.dev   = false;
  config.build = true;
  pacman.build(function() {
    test.ok(!fs.existsSync("spec/out/assets/assets/js_empty.js"));
    test.done();
  });
};

exports.canIgnoreDuplicateAssets = function(test) {
  config.dev   = false;
  config.build = true;
  pacman.build(function() {
    assertSubstr(test, fss.readFile("spec/out/assets/js_duplicates.html"), js("/assets/duplicates.js"));
    test.equal(fss.readFile("spec/out/assets/assets/duplicates.js"), "var a=1;");
    test.done();
  });
};

exports.canIgnoreFilesWithWrongExtension = function(test) {
  config.dev   = false;
  config.build = true;
  pacman.build(function() {
    assertSubstr(test, fss.readFile("spec/out/assets/js_filetype.html"), js("/assets/filetype.js"));
    test.equal(fss.readFile("spec/out/assets/assets/filetype.js"), "function f(){}");
    test.done();
  });
};
