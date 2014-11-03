module.exports = function(grunt)
{
	var js_files = [
		"./bower_components/jquery/dist/jquery.js",
		"./bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js",
		"./bower_components/angular/angular.js",
		"./bower_components/angular-route/angular-route.js",
		"./bower_components/angular-animate/angular-animate.js",
		"./bower_components/moment/moment.js",
		"./bower_components/moment/locale/nb.js",
		"./public/assets/src/javascript/**.js"
	];
	grunt.initConfig({
		concat: {
			options: {
				separator: ";\n",
				sourceMap: true
			},
			js_frontend: {
				src: js_files,
				dest: "./public/assets/javascript/frontend.js"
			}
		},
		sass: {
			dev: {
				options: {
					style: 'expanded',
					sourcemap: true
				},
				files: {
					"./public/assets/stylesheets/frontend.css": "./public/assets/src/stylesheets/frontend.scss"
				}
			},
			prod: {
				options: {
					style: 'compressed'
				},
				files: {
					"./public/assets/stylesheets/frontend.css": "./public/assets/src/stylesheets/frontend.scss"
				}
			}
		},
		uglify: {
			all: {
				files: {
					'./public/assets/javascript/frontend.js': './public/assets/javascript/frontend.js'
				}
			}
		},
		watch: {
			js: {
				files: js_files,
				tasks: ['concat'],
				options: {
					//livereload: true // reloads browser
				}
			},
			sass: {
				files: ["./public/assets/src/stylesheets/**/*.scss"],
				tasks: ["sass:dev"],
				options: {
					//livereload: true // reloads browser
				}
			}
		},
		ngAnnotate: {
			options: {},
			all: {
				files: {
					'./public/assets/javascript/frontend.js': ['./public/assets/javascript/frontend.js']
				}
			}
		}
	});

	// Plugin loading
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-ng-annotate');
	
	// Task definition
	grunt.registerTask('default', [
		'sass:dev',
		'concat',
		'watch'
	]);
	grunt.registerTask('prod', [
		'sass:prod',
		'concat',
		'ngAnnotate',
		'uglify'
	]);
};