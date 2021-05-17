var _      = require("underscore")._;
var fs     = require("fs");
var config = require("../../lib/config");
var fss    = require("../../lib/fss");
var pacman = require("../../lib/pacman");

exports.canIngoreUnprocessableFiles = function(test) {
  config.init({
    appdir: "spec/cases/filetypes"
  });
  fss.resetDir(config.pubdir);
  test.ok( fss.isProcessableFile("spec/cases/filetypes/_a"), "_a");
  test.ok( fss.isProcessableFile("spec/cases/filetypes/a"),  "a");
  test.ok(!fss.isProcessableFile("spec/cases/filetypes/.a"), ".a");
  test.ok(!fss.isProcessableFile("spec/cases/filetypes"),    "dir");
  test.done();
};

exports.canCopyZipFiles = function(test) {
  config.init({
    appdir: "spec/cases/filetypes",
    pubdir: "spec/out/filetypes",
    config: false,
    layout: false,
    build: true,
    dev: false
  });

  fss.resetDir(config.pubdir);
  pacman.build();

  test.ok(fs.existsSync("spec/out/filetypes/foo.html"));
  test.ok(fs.lstatSync("spec/out/filetypes/Archive.zip").isFile());
  test.ok(fs.lstatSync("spec/out/filetypes/test/test.zip").isFile());
  test.done();
};
