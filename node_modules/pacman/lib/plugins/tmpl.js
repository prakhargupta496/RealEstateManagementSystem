var _   = require("underscore"),
    fss = require("../fss");

/*
 * Prefix JS for templates.
 */
var prefix = function() {
    return 'window.templates = window.templates || {}; ';
};

/*
 * Namespace for one template.
 */
var namespace = function(file) {
    return 'window.templates["' + fss.relative(file) + '"] = ';
};

/*
 * Compile a template.
 */
var compile = function(file) {
    return _.template(fss.readFile(file)).source;
};

/*
 * Generate output JS for one template file.
 */
var output = function(file) {
    var pre = prefix();
    var ns  = namespace(file);
    var src = compile(file);
    var res = pre + ns + src + ';';
    return res;
};

/*
 * Export this plugin for dev mode.
 */
exports.process = function(f, data, locals) {
	return {
		'type' : 'application/javascript',
		'data' : output(f)
	};
};

/*
 * Export this plugin for build mode.
 */
exports.compile = function(f) {
	return output(f);
};
