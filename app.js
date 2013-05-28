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
			res.render(template, options, function (error, result) {
				if (error) return self.req.next(error);
				options.body = result;
				res.render(layout, options, cb);
			});
		};
		next();
	});
	app.use( express.bodyParser() );
	app.use( express.methodOverride() );
	app.use( app.router );

	app.locals({
		scripts: [ "http://code.jquery.com/jquery-1.9.1.min.js", "//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.0/js/bootstrap.min.js" ],
		styles: [ "//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.0/css/bootstrap-combined.min.css" ]
	});
});

app.configure( "development", function(){
	app.locals.scripts.push( "/js/bundle.js" );
	app.locals.styles.push( "/css/style.css" );
	app.use( express.static(path.join(__dirname, "assets" )) );
	app.use( express.logger("dev") );
	app.use(
			express.errorHandler({
				dumpExceptions: true
		})
	);
});

app.configure( "production", function(){
	app.use( express.static( path.join(__dirname, "public" ) ) );
	app.locals.scripts.push( config.js );
	app.locals.styles.push( config.css );
	app.use( express.errorHandler() );
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
					compileDebug: true,
					debug: true
				}));
			}
		]
	});
	app.get( "/js/bundle.js", browserify( "./assets/js/main.js" ) );
});

app.get( "/", function( req, res ){
	res.renderLayout( "first", "layout" );
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