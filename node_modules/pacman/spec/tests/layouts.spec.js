var config = require("../../lib/config");
var pacman = require("../../lib/pacman");
var fss    = require("../../lib/fss");
var _      = require("underscore")._;

exports.setUp = function(callback) {
  fss.resetDir(config.pubdir);
  callback();
};

var testContent = function(test, expected, path) {
  pacman.build();
  test.equal(fss.readFile(path || "spec/out/layouts/index.html"), expected);
};

exports.canSkipLayout = function(test) {
  config.init({
    appdir: "spec/cases/layouts",
    pubdir: "spec/out/layouts",
    layout: false
  });
  testContent(test, "c");
  test.done();
};

exports.canUseDefaultLayout = function(test) {
  config.init({
    appdir: "spec/cases/layouts",
    pubdir: "spec/out/layouts"
  });
  testContent(test, "d c d");
  test.done();
};

exports.canUseCustomLayoutPath = function(test) {
  config.init({
    appdir: "spec/cases/layouts",
    pubdir: "spec/out/layouts",
    layout: "_ls/1.html"
  });
  testContent(test, "1 c 1");
  config.layout = "_ls/2.html";
  testContent(test, "2 c 2");
  test.done();
};

exports.canUseMultipleLayouts = function(test) {
  config.init({
    appdir: "spec/cases/layouts",
    pubdir: "spec/out/layouts",
    layouts: { "index2.html": "_layouts/other.html" }
  });
  testContent(test, "d c d", "spec/out/layouts/index.html");
  testContent(test, "o o o", "spec/out/layouts/index2.html");
  test.done();
};
