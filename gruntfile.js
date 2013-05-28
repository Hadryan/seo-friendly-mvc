"use strict";

module.exports = function(grunt) {
	grunt.registerTask( "reload-pkg", function(){
		grunt.config.set("pkg", grunt.file.readJSON( "package.json" ) );
	});
	grunt.registerTask( "writeconfig", function(){
		var currentConfig;
		if( grunt.file.exists( "./config/production.json" ) ){
			currentConfig = grunt.file.readJSON( "./config/production.json" );
		}
		currentConfig = currentConfig || {};
		currentConfig.js = grunt.template.process( "http://pin-clone.s3.amazonaws.com/static/<%= pkg.name %>-<%= pkg.version %>.min.js" );
		currentConfig.css = grunt.template.process( "http://pin-clone.s3.amazonaws.com/static/<%= pkg.name %>-<%= pkg.version %>.min.css" );
		grunt.file.write( "./config/production.json", JSON.stringify( currentConfig ) );
	});
	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON("package.json"),
		banner: "/*! <%= pkg.name %> - v<%= pkg.version %> - " +
			"<%= grunt.template.today('yyyy-mm-dd') %>\n" +
			"<%= pkg.homepage ? '* ' + pkg.homepage + '\\n' : '' %>" +
			"* Copyright (c) <%= grunt.template.today('yyyy') %> <%= pkg.author.name %>;" +
			" Licensed <%= _.pluck(pkg.licenses, 'type').join(', '') %> */\n",
		// Task configuration.
		uglify: {
			options: {
				//banner: "<%= banner %>"
			},
			dist: {
				src: "./build/<%= pkg.name %>-<%= pkg.version %>.js",
				dest: "./build/<%= pkg.name %>-<%= pkg.version %>.min.js",
			},
		},
		jshint: {
			options: {
				jshintrc: ".jshintrc"
			},
			gruntfile: {
				src: "Gruntfile.js"
			},
			lib: {
				options: {
					jshintrc: "./.jshintrc"
				},
				src: ["lib/**/*.js", "./*.js"]
			},
			test: {
				src: ["test/**/*.js"]
			},
		},
		browserify2: {
			compile: {
				beforeHook: function(bundle){
					bundle.transform( require( "jadeify2" ) );
				},
				compile: "./build/<%= pkg.name %>-<%= pkg.version %>.js",
				entry: "./public/js/main.js",
				require: true
			}
		},
		cssmin: {
			compress: {
				files: {
					"./build/<%= pkg.name %>-<%= pkg.version %>.min.css": [ "public/css/style.css" ]
				}
			}
		},
		clean: {
			build: [ "build/" ]
		}
	});

	// These plugins provide necessary tasks.

	grunt.loadNpmTasks( "grunt-contrib-uglify" );
	grunt.loadNpmTasks( "grunt-contrib-jshint" );
	grunt.loadNpmTasks( "grunt-browserify2" );
	grunt.loadNpmTasks( "grunt-contrib-clean" );
	// Default task.
	//grunt.registerTask("default", ["jshint", "nodeunit", "concat", "uglify"]);

	grunt.registerTask( "build", [ "clean", "jshint", "bump", "reload-pkg", "browserify2:compile", "uglify:dist", "cssmin", "writeconfig","s3:build", "clean" ] );

};