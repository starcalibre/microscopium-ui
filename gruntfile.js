module.exports = function(grunt) {
    require('jit-grunt')(grunt);

    grunt.initConfig({
        jshint: {
            all: ['app/static/js/*.js'],
            options: {
                white: false,
                indent: 4,
                force: true
            }
        },

        browserify: {
            options: {
                browserifyOptions: {
                    debug: true
                }
            },
            // a separate dev task is needed for browserify here
            // ultimately another 'production' task will be added that will
            // minify the javascript file it builds
            dev: {
                options: {
                    plugin: [['minifyify']]
                },
                files: {
                    'app/static/js-build.js': 'app/static/js/script.js'
                }
            },
            // separate browserify tasks that handles test spec files
            tests: {
                files: {
                    'tests/testSpecs.js': ['tests/*.spec.js']
                }
            }
        },

        jasmine: {
            dev: {
                options: {
                    specs: 'tests/testSpecs.js'
                }
            }
        },

        // watch tasks are broken up into individual sub tasks
        // to avoid needless build steps. e.g. no point in browserifying
        // and testing javascript if only the CSS was changed
        watch: {
            // browserify, jshint and test JS when JS updated
            js: {
                files: ['app/static/js/*.js'],
                tasks: ['jshint', 'browserify:tests', 'browserify:dev',
                    'jasmine:dev']
            },
            // rebuild CSS/SASS when updated
            css: {
                files: ['app/static/css/*.scss'],
                tasks: ['sass:dev']
            }
        },

        sass: {
            // similar to browserify, we create a separate SASS task for
            // development as another task will also minify the CSS ultimately
            dev: {
                files: {
                    'app/static/style-build.css': 'app/static/css/style.scss'
                }
            }
        },

        // by default grunt tasks are blocking, but we need watch tasks
        // to run concurrently - grunt-concurrent lets us do just this!
        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            watch: ['watch:js', 'watch:css']
        }
    });

    // run this task for development
    grunt.registerTask('default', ['jshint', 'browserify:tests', 'browserify:dev', 'jasmine:dev',
        'sass:dev', 'concurrent:watch']);
    // run this task only when you want to build JS/CSS files (eg deployment)
    grunt.registerTask('build', ['jshint', 'jasmine:dev', 'browserify:dev', 'sass:dev']);
};
