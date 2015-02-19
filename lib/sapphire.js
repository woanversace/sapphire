var mootools = require('./mootools').apply(GLOBAL);
var path = require('path');

global.CONFIG = require('./config').CONFIG;
global.logger = CONFIG.logger?require(CONFIG.logger):require('./consoleLogger');

CONFIG.sapphireRoot = path.dirname(module.filename);
logger.configNode();

if (!CONFIG.mangler)
{
	var Mangler = require('./mangler').Mangler;
	CONFIG.mangler = Mangler;
}

var Q = require('q');
var http = require('http');
var express = require('express');
var Cookies = require( 'cookies' )
var compression = require('compression');
var bodyParser = require('body-parser');
var urls = require('./urls');
var deliverCss = require('./deliverCss');
var staticRouter = require('./staticRouter');
var sessions = require('./sessions');
var appPath = require('./appPath');
var appRouter = require('./appRouter');
var serviceRouter = require('./serviceRouter');
var notFound = require('./notFound');

module.exports.createServer = function()
{
	var app = express();
	var useCompression = CONFIG.useCompression===true?true:false;
	if (useCompression) app.use(compression({threshold: 5000 }))

	app
		.use(logger.middleware())
		.use(Cookies.express())
		.use(bodyParser.urlencoded({extended: false}))
		.use(bodyParser.json())
		.use(urls())
		.use(deliverCss())
		.use(staticRouter())
		.use(sessions())
		.use(appPath())

// Add app-specific middleware if it exists
	if (CONFIG.middleware)
	{
		var middleware = require(CONFIG.basePath + '/' + CONFIG.middleware);
		middleware.createMiddleware(app);
	}

	app
		.use(serviceRouter())
		.use(appRouter())
		.use(notFound())

	return http.createServer(app);
}

module.exports.Application = require('./application').Application;
module.exports.Service = require('./service').Service;
module.exports.Feature = require('./feature').Feature;
module.exports.CONFIG = CONFIG;