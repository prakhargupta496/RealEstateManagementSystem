var config = require("../../lib/config");
var pacman = require("../../lib/pacman");
var fss    = require("../../lib/fss");
var _      = require("underscore")._;

exports.setUp = function(callback) {
  config.init({
    appdir: "spec/cases/html",
    pubdir: "spec/out/html",
    layout: false
  });
  fss.resetDir(config.pubdir);
  callback();
};

var f1 = "spec/out/html/1.html";
var f2 = "spec/out/html/2.html";

exports.canIgnoreFilesInDev = function(test) {
  config.dev = true;
  config.build = false;
  config.ignore_build = ["1.html"];
  config.ignore_dev = ["2.html"];
  pacman.build();
  test.ok( fss.exists(f1));
  test.ok(!fss.exists(f2));
  test.done();
};

exports.canIgnoreFilesInBuild = function(test) {
  config.dev = false;
  config.build = true;
  config.ignore_build = ["1.html"];
  config.ignore_dev = ["2.html"];
  pacman.build();
  test.ok(!fss.exists(f1));
  test.ok( fss.exists(f2));
  test.done();
};

exports.canIgnoreNothing = function(test) {
  config.dev = false;
  config.build = true;
  config.ignore_build = [];
  config.ignore_dev = [];
  pacman.build();
  test.ok(fss.exists(f1));
  test.ok(fss.exists(f2));
  test.done();
};
