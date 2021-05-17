var _        = require("underscore"),
    exec     = require("child_process").exec,
    shell    = require("shelljs"),
    config   = require("../lib/config"),
    log      = require("../lib/log"),
    fss      = require("../lib/fss");

/*
 * Report result from rsync.
 */
var rsync_end = function(callback) {
  return function(err, stdout, stderr) {
    if(err) {
      throw err;
    } else if(stderr) {
      log("sync error", "failed with the following output:");
      console.log("\n", stderr, "\n");
    } else {
      log("sync", "completed successfully");
      log();
      if(callback) callback();
    }
  };
};

/*
 * Make sure rsync options are all right, and sync.
 */
var rsync_begin = function(source, target, callback) {
  source = fss.slashify(source);
  target = fss.slashify(target);

  if(!shell.which("rsync")) {
    log("sync error", "no rsync command found");
    callback();
  } else {
    log("rsync", fss.baseRelative(source));
    log("remote", target);
    var cmd = [config.rsync, source, target].join(" ");
    var opt = { maxBuffer: 5000*1024 };
    exec(cmd, opt, rsync_end(callback));
  }
};

/*
 * Deploy the target folder, using rsync.
 */
exports.perform = function(callback) {
  if(!_.isString(config.remote) || config.remote.length === 0) {
    log("sync error", "config.remote is not set");
  } else {
    rsync_begin(config.pubdir, config.remote, callback);
  }
};
