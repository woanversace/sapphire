var CONFIG;
var Q = require('q');
var fs = require('fs');
var crypto = require('crypto');
var paths = require('./routePaths');
var cachedHashes = $H({});

exports.Mangler = new Class({
	initialize : function()
	{
		this.urls = $H({});
		this.hashes = $H({});
		if (!CONFIG) CONFIG = require('./config').CONFIG;
	},

	start : function()
	{
		if (!CONFIG.builderCache)
		{
			this.urls = $H({});
			this.hashes = $H({});
		}
	},

	md5Hash : function(data)
	{
		var md5sum = crypto.createHash('md5');
		md5sum.update(data);
		return md5sum.digest('hex');
	},

	hashUrl : function(url)
	{
		url = url.split('?')[0];
		var deferred = Q.defer();
		var filename = paths.urlPathToFilePath(url);

		if (cachedHashes[url] != undefined || CONFIG.builderCache)
		{
			this.hashes.set(url, cachedHashes[url]);
			return Q(this.hashes.get(url));
		}

		fs.readFile(filename, function (err, data)
		{
			if (err) deferred.resolve(null);
			else
			{
				data = data.toString();
				this.hashes.set(url, this.md5Hash(data));
				deferred.resolve(this.hashes.get(url));
			}
		}.bind(this));

		return deferred.promise;
	},

	hashUrls : function(urls)
	{
		var promises = [];

		urls.each(function(url)
		{
			promises.push(this.hashUrl(url));
		}, this);

		return Q.all(promises);
	},

	mangleUrls : function(urls)
	{
		return this.hashUrls(urls)
			.then(function()
			{
				urls.each(function(url)
				{
//					this.urls.set(this.constructUrl(url));
				}, this);
				return Q(true);
			}.bind(this));
	},

	mangle : function(name)
	{
		var prefix = CONFIG.manglePrefix?CONFIG.manglePrefix:'';
		var hash = this.hashes.get(name);
		var url = '';

		if (name.indexOf(':') == -1 && name.indexOf(prefix) != 0) url += prefix + name;
		else url = name;
		url += (hash)?('?v=' + hash):'';

		return url;
	},

	demangle : function(name)
	{
		var prefix = CONFIG.manglePrefix?CONFIG.manglePrefix:'';
		if (prefix != '')
		{
			if (name.indexOf(prefix) == 0)
				name = name.substring(prefix.length);
		}

		return name;
	},

});

