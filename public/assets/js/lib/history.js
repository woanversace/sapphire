Package('Sapphire', {
/**********************************************************************************
	Class: History

	This class manages browser history and deep linking. When included it is assumed
	that the second parameter passed to showPage is an object to be encoded on the pseudo-
	query string in the url hash
*/
	History : new Class({
		Extends : Sapphire.Eventer,

		initialize : function()
		{
			this.parent();

			this.first = false;
			SAPPHIRE.application.listenPageEvent('show', '', this.onPageShow.bind(this));
			SAPPHIRE.application.listenPanelEvent('show', '', '', this.onPanelShow.bind(this));
			SAPPHIRE.application.listen('start', this.onStart.bind(this));
			SAPPHIRE.application.listen('ready', this.onReady.bind(this));
		},

		handleFirst : function()
		{
			this.handleEvent(this.first);
		},

		parseEvent : function(event)
		{
			var result = {};
			var paths = event.path.split('/');
			paths.shift();
			var path = paths[0];
			result.page = path;
			result.path = event.path;
			result.query = (event.queryString != '')?event.queryString.parseQueryString():{};
			return result;
		},

		handleEvent : function(event)
		{
			var address = this.parseEvent(event);

			SAPPHIRE.application.showPage(address.page, address.path, address.query);
		},

		getFirst : function()
		{
			return this.parseEvent(this.first);
		},

		onReady : function()
		{
			$.address.autoUpdate(false);
			$.address.init(this.onInit.bind(this));
		},

		onStart : function(callback)
		{
			this.ignoreChange = true;
			callback();
		},

		onInit : function(event)
		{
			$.address.change(this.onChange.bind(this));
			this.first  = event;
			this.fire('init', event);
			this.handleFirst();
		},

		onChange : function(event)
		{
			if (this.ignoreChange)
			{
				this.ignoreChange = false;
				return;
			}
			this.ignoreChange = false;

			this.fire('change', event, this.first != false);
			if (this.first) this.first = false;
			this.handleEvent(event);
		},

		onPageShow : function(name, path, query)
		{
			path = (path !== undefined)?path:name;

			this.ignoreChange = true;
			var queryStr = Object.toQueryString(query);
			$.address.path(path);
			$.address.queryString(queryStr);
			$.address.update();
		},

		onPanelShow : function(name, path, query)
		{
			path = (path !== undefined)?path:name;

			this.ignoreChange = true;
			var queryStr = Object.toQueryString(query);
			$.address.path(path);
			$.address.queryString(queryStr);
			$.address.update();
		}

	})
});

SAPPHIRE.history = new Sapphire.History();
