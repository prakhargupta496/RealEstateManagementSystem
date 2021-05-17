var mime     = require("mime"),
    express  = require("express"),
    config   = require("../lib/config"),
    log      = require("../lib/log"),
    fss      = require("../lib/fss"),
    pacman   = require("../lib/pacman");

/*
 * Decide which file to serve, mostly by checking for index.html files.
 */
var target = function(file) {
  if(file.substr(file.length - 1) === "/") {
    file = file + "index.html";
  }
  if(fss.exists(file + ".html")) {
    return file + ".html";
  } else if(fss.exists(file.replace(/\.html$/, ""))) {
    return file.replace(/\.html$/, "");
  } else if(fss.filename(file).indexOf(".") === -1 && fss.exists(file + "/index.html")) {
    return file + "/index.html";
  } else {
    return file;
  }
};

/*
 * Process requests on the fly, or forward it to the static file handler.
 */
var answer = function(req, res, next) {
  var file = target(fss.source(req.path)) || "";
  if(!fss.exists(file)) {
    res.status(404);
    res.send("404");
  } else {
    var result = pacman.process(file, {});
    if (result) {
      res.type(result.type);
      res.send(result.data);
    } else {
      next();
    }
  }
};

/*
 * Start a server in dev mode, where all assets are served on the fly, from the source directory.
 */
exports.dev = function() {
  log("server", "http://localhost:" + config.port);
  log("serving", fss.baseRelative(config.appdir));
  express()
    .use(answer)
    .use(express.static(config.appdir))
    .listen(config.port);
};
