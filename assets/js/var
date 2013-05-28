var
	Backbone = require( "backbone" ),
	imageTemplate = require( "../templates/image-dialog.jade" );

var ImageView = Backbone.View.extend({
	events: {
		"hide": "hide",
		"click .close": "close"
	},
	className: "modal hide fade",
	initialize: function(){
		this.model.on( "change", this.render, this );
	},
	render: function(){
		this.$el.html(
			imageTemplate({
				image: this.model.toJSON()
			})
		).modal();
		return this;
	},
	hide: function( e ){
		Backbone.history.navigate( "/", true );
	},
	close: function( e ){
		this.$el.modal( "hide" );
		return false;
	}
});

module.exports = ImageView;