var
	Backbone = require( "backbone" ),
	firstTemplate = require( "../../../views/root.jade" ),
	layoutTemplate = require( "../../../views/layout.jade" );

var FirstView = Backbone.View.extend({
	events: {
		"hide": "hide",
		"click .close": "close"
	}
});

module.exports = FirstView;