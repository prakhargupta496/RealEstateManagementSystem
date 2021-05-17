var config = require("../../lib/config");
var pacman = require("../../lib/pacman");
var fss    = require("../../lib/fss");
var _      = require("underscore")._;

exports.partialsAreInCorrectOrder = function(test) {
  config.init({
    appdir: "spec/cases/part",
    pubdir: "spec/out/part"
  });
  fss.resetDir(config.pubdir);
  pacman.build();
  test.equal("1 2 3 4 5 6 7", fss.readFile("spec/out/part/index.html"));
  test.done();
};

exports.partialsCanSetVars = function(test) {
  config.init({
    appdir: "spec/cases/vars",
    pubdir: "spec/out/vars"
  });
  fss.resetDir(config.pubdir);
  pacman.build();
  test.equal("1 a pa 1", fss.readFile("spec/out/vars/a.html"));
  test.equal("2 b pb 2", fss.readFile("spec/out/vars/b.html"));
  test.equal("3 c 3",    fss.readFile("spec/out/vars/c.html"));
  test.done();
};
