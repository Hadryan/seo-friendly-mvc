var
	Backbone  = require( "backbone" ),
	FirstView = require( "./views/first" );

var Router = Backbone.Router.extend({
	routes: {

		"": "default"
	},
	initialize: function(){
		Backbone.history.start({ pushState: true });
	},

	default: function(){

	}
});

module.exports = Router;