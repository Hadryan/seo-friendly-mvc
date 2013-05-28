"use strict";

/*
	debug everything \o/
	i know i shouldn't do this, because of this: https://gist.github.com/felixge/955659d1f1d8a530f2ff (https://github.com/felixge/node-mysql/issues/439)
*/

Error.stackTraceLimit = Infinity;

var
	http = require( "http" ),
	path = require( "path" ),
	express = require( "express" ),
	debug = require( "debug" )( "seo-friendly" ),
	_ = require( "lodash" );

var app = express();

app.configure(function(){
	app.set( "views", path.join( __dirname, "/views" ) );
	app.set( "view engine", "jade");
	app.set( "port", process.env.PORT||3000 );
	app.use( express.favicon() );
	app.use(function( req, res, next ){
		res.renderLayout = function( template, layout, options, cb ){
			options || ( options = {} );
			var self = this;
			res.render(template, options, function (err, result) {
				if( err ){
					return self.req.next( err );
				}
				options[ options.subName||"body" ] = result;
				res.render(layout, options, cb);
			});
		};
		next();
	});
	app.use( express.bodyParser() );
	app.use( express.methodOverride() );
	app.use( app.router );
});

app.configure( "development", function(){
	app.use( express.static(path.join(__dirname, "assets" )) );
	app.use( express.logger("dev") );
	app.use(
			express.errorHandler({
				dumpExceptions: true
		})
	);
	app.locals({
		item: "",
		itemsList: "",
		index: ""
	});
});

/*
	Routes
*/

app.configure( "development", function(){
	var
		browserify = require( "browserify-middleware" ),
		jadeify2 = require( "jadeify2" );
	browserify.settings({
		transform: [
			function _jadeifyTransform( file, options ){
				return jadeify2( file, _.extend( options||{}, {
					filename: file,
					pretty: true,
					client: true,
					compileDebug: true
				}));
			}
		]
	});
	app.get( "/js/bundle.js", browserify( "./assets/js/main.js" ) );
});

app.get( "/", function( req, res ){
	debug( "root route" );
	res.renderLayout( "root", "layout", {
		subName: "index"
	});
});

app.get( "/list", function( req, res ){
	debug( "list route" );
	var data = _.range( 0, 20 ).map(function( i ){
		return {
			id: i,
			name: "name#" + i
		};
	});
	res.format({
		"html": function(){
			res.renderLayout( "list", "layout", {
				items: data,
				subName: "itemsList"
			});
		},
		"json": function(){
			res.json( data );
		}
	});
});

app.get( "/list/:id", function( req, res ){
	debug( "list item route" );
	var data = {
		id: req.param( "id" ),
		name: "name#" + req.param( "id" )
	};
	res.format({
		"html": function(){
			res.renderLayout( "list-item", "layout", {
				item: data,
				subName: "item"
			});
		},
		"json": function(){
			res.json( data );
		}
	});
});
/*
	creating the http server
*/

if( module.parent ){
	module.exports = app;
}
else{
	var server = http.createServer( app );

	server.listen( app.get( "port" ), function( err ){
		if( err ){
			return console.error( "Couldn't start server, reason: ", err );
		}
		console.log( "Server is running:", server.address().address + ":" + server.address().port );
	});
}