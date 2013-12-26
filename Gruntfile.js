'use strict';

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // configurable paths
  var yeomanConfig = {
    src: 'src',
    dist: 'dist',
    demo: 'demo'
  };

  // Project configuration.
  grunt.initConfig({
    yeoman: yeomanConfig,
    pkg: grunt.file.readJSON('package.json'),
    modules: [],//to be filled in by buildmodules task
    moduleprefix: '<%= pkg.name %>.',
    meta: {
      modules: 'angular.module("<%= pkg.name %>", [<%= srcModules %>]);',
      tplmodules: 'angular.module("<%= pkg.name %>.tpls", [<%= tplModules %>]);',
      all: 'angular.module("<%= pkg.name %>", ["<%= pkg.name %>.tpls", <%= srcModules %>]);',
      banner: '/**\n' +
        ' * <%= pkg.description %>\n' +
        ' * @version v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' * @link <%= pkg.homepage %>\n' +
        ' * @author <%= pkg.author.name %>\n' +
        ' * @license MIT License, http://www.opensource.org/licenses/MIT\n' +
        ' */\n\n'
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: [
          '{.tmp,<%= yeoman.src %>}/**/*.js',
          '!<%= yeoman.src %>/**/*.spec.js'
        ],
        tasks: ['jshint:all']
      },
      jsTest: {
        files: ['<%= yeoman.src %>/**/*.spec.js'],
        tasks: ['karma']
      },
      compass: {
        files: ['<%= yeoman.src %>/**/*.{scss,sass}'],
        tasks: ['compass:server', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          'demo/*.html',
          '<%= yeoman.src %>/**/*.html',
          '.tmp/styles/{,*/}*.css'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          base: [
            '.tmp',
            '<%= yeoman.src %>',
            'demo',
            ''
          ]
        }
      },
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            '<%= yeoman.src %>'
          ]
        }
      },
      dist: {
        options: {
          base: [
            '<%= yeoman.dist %>',
            ''
          ]
        }
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles',
          src: '{,*/}*.css',
          dest: '.tmp/styles'
        }]
      }
    },

    // Compiles Sass to CSS and generates necessary files if requested
    compass: {
      options: {
        sassDir: '<%= yeoman.src %>',
        cssDir: '.tmp/styles',
        relativeAssets: false,
        assetCacheBuster: false
      },
      server: {
        options: {
          debugInfo: true
        }
      },
      dist: {
        options: {
          noLineComments: true
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.src %>/{,*/}*.js'
      ],
      test: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: ['<%= yeoman.src %>/{,*/}*.spec.js']
      }
    },

    // Test settings
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },

    // Join scripts into a single file
    concat: {
      options: {
        banner: '<%= meta.banner %>'
      },
      dist: {
        options: {
          // Replace all 'use strict' statements in the code with a single one at the top
          banner: '(function(window, document, undefined) {\n\'use strict\';\n<%= meta.modules %>\n',
          footer: '\n})(window, document);\n',
          process: function(src, filepath) {
            return src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
          }
        },
        files: {
          '<%= yeoman.dist %>/<%= pkg.name %>.js': [
            '<%= yeoman.src %>/{,*/}*.js',
            '!<%= yeoman.src %>/{,*/}*.spec.js'
          ]
        }
      },
      dist_tpls: {
        options: {
          // Replace all 'use strict' statements in the code with a single one at the top
          banner: '(function(window, document, undefined) {\n\'use strict\';\n<%= meta.all %>\n<%= meta.tplmodules %>\n',
          footer: '\n})(window, document);\n',
          process: function(src, filepath) {
            return src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
          }
        },
        files: {
          '<%= yeoman.dist %>/<%= pkg.name %>-tpls.js': [
            '<%= yeoman.dist %>/<%= pkg.name %>-tpls.js',
            '<%= yeoman.src %>/{,*/}*.js',
            '!<%= yeoman.src %>/{,*/}*.spec.js'
          ]
        }
      },
      banner: {
        banner: '<%= meta.banner %>',
        src: ['<%= yeoman.dist %>/<%= pkg.name %>.js'],
        dest: '<%= yeoman.dist %>/<%= pkg.name %>.js'
      },
      banner_tpls: {
        banner: '<%= meta.banner %>',
        src: ['<%= yeoman.dist %>/<%= pkg.name %>-tpls.js'],
        dest: '<%= yeoman.dist %>/<%= pkg.name %>-tpls.js'
      },
      css: {
        options: {
          banner: ''
        },
        src: [
          '.tmp/styles/{,*/}*.css',
          '<%= yeoman.src %>/{,*/}*.css'
        ],
        dest: '<%= yeoman.dist %>/<%= pkg.name %>.css'
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngmin: {
      // options: {
      //   stripBanners: true,
      //   banner: '<%= meta.banner %>'
      // },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: '<%= pkg.name %>.js',
          dest: '<%= yeoman.dist %>'
        }]
      },
      dist_tpls: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: '<%= pkg.name %>-tpls.js',
          dest: '<%= yeoman.dist %>'
        }]
      }
    },

    cssmin: {
      dist: {
        files: {
          '<%= yeoman.dist %>/<%= pkg.name %>.css': [
            '.tmp/styles/{,*/}*.css',
            '<%= yeoman.src %>/{,*/}*.css'
          ]
        }
      }
    },

    uglify: {
      dist: {
        files: {
          '<%= yeoman.dist %>/<%= pkg.name %>.min.js': [
            '<%= yeoman.dist %>/<%= pkg.name %>.js'
          ]
        }
      },
      dist_tpls: {
        files: {
          '<%= yeoman.dist %>/<%= pkg.name %>-tpls.min.js': [
            '<%= yeoman.dist %>/<%= pkg.name %>-tpls.js'
          ]
        }
      }
    },

    html2js: {
      dist: {
        options: {
          module: null, // no bundle module for all the html2js templates
          base: 'src'
        },
        src: [ 'src/**/*.tpl.html' ],
        dest: '<%= yeoman.dist %>/<%= pkg.name %>-tpls.js'
      }
    },

    optionaltasks: {
      css: {
        options: {
          tasks: ['concat:css']
        },
        src: ['.tmp/styles/{,*/}*.css', '<%= yeoman.src %>/{,*/}*.css']
      },
      tpls: {
        options: {
          tasks: [
            'html2js',
            'concat:dist_tpls',
            'ngmin:dist_tpls',
            'concat:banner_tpls',
            'uglify:dist_tpls'
          ]
        },
        src: ['src/**/*.tpl.html']
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'compass:server',
        'copy:styles'
      ]
    },

    copy: {
      styles: {
        expand: true,
        src: '<%= yeoman.src %>/**/*.css',
        dest: '.tmp/'
      }
    },

    processhtml: {
      dist: {
        files: {
          'dist/index.html': ['demo/index.html']
        }
      }
    },

    /**
     * Increments the version number
     */
    bump: {
      options: {
        files: [
          'package.json',
          'bower.json'
        ],
        commit: true,
        commitMessage: 'chore(release): v%VERSION%',
        commitFiles: [
          'package.json',
          'bower.json'
        ],
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false,
        pushTo: 'origin'
      }
    }
  });

  //findModule: Adds a given module to config
  var foundModules = {};
  function findModule(name) {
    if (foundModules[name]) { return; }
    foundModules[name] = true;

    function enquote(str) {
      return '"' + str + '"';
    }

    function removeroot(str) {
      return str.slice(str.indexOf('/') + 1, str.length);
    }
    
    var module = {
      name: name,
      moduleName: enquote(grunt.config('moduleprefix')+name),
      srcFiles: grunt.file.expand(['src/'+name+'/*.js','!src/'+name+'/*.spec.js']),
      tplFiles: grunt.file.expand('src/'+name+'/*.tpl.html'),
      tplModules: grunt.file.expand('src/'+name+'/*.tpl.html').map(removeroot).map(enquote),
      dependencies: dependenciesForModule(name)
    };
    module.dependencies.forEach(findModule);
    grunt.config('modules', grunt.config('modules').concat(module));
  }

  function dependenciesForModule(name) {
    var deps = [];
    grunt.file.expand(['src/'+name+'/*.js','!src/'+name+'/*.spec.js'])
    .map(grunt.file.read)
    .forEach(function(contents) {
      //Strategy: find where module is declared,
      //and from there get everything inside the [] and split them by comma
      var moduleDeclIndex = contents.indexOf('angular.module(');
      var depArrayStart = contents.indexOf('[', moduleDeclIndex);
      var depArrayEnd = contents.indexOf(']', depArrayStart);
      var dependencies = contents.substring(depArrayStart + 1, depArrayEnd);
      dependencies.split(',').forEach(function(dep) {
        if (dep.indexOf(grunt.config('moduleprefix')) > -1) {
          var depName = dep.trim().replace( grunt.config('moduleprefix'),'').replace(/['"]/g,'');
          if (deps.indexOf(depName) < 0) {
            deps.push(depName);
            //Get dependencies for this new dependency
            deps = deps.concat(dependenciesForModule(depName));
          }
        }
      });
    });
    return deps;
  }

  grunt.registerTask('buildmodules', function() {
    var _ = grunt.util._;

    //Build all modules
    grunt.file.expand({
      filter: 'isDirectory',
      cwd: '.'
    }, 'src/*').forEach(function(dir) {
      findModule(dir.split('/')[1]);
    });

    var modules = grunt.config('modules');
    grunt.config('srcModules', _.pluck(modules, 'moduleName'));
    grunt.config('tplModules', _.pluck(modules, 'tplModules').filter(function(tpls) { return tpls.length > 0;} ));
  });

  grunt.registerMultiTask('optionaltasks', 'Run task only if source files exists', function() {
    var options = this.options({
      tasks: []
    });

    var filesExist = false;
    this.files.forEach(function(f) {
      var src = f.src.filter(function(filepath) {
        if (!grunt.file.exists(filepath)) {
          return false;
        } else {
          filesExist = true;
          return true;
        }
      });
    });

    if(filesExist) {
      console.log('true');
      options.tasks.forEach(function(task) {
        grunt.task.run(task);
      });
    }
  });

  grunt.registerTask('test', [
    'clean:server',
    'connect:test',
    'karma:unit'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'compass:dist',
    'autoprefixer',
    'buildmodules',
    'optionaltasks:css',
    'optionaltasks:tpls',
    'concat:dist',
    'ngmin:dist',
    'concat:banner',
    'uglify:dist',
    'processhtml'
  ]);

  grunt.registerTask('serve', function (target) {
    grunt.task.run([
      'clean:server',
      'concurrent:server',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('default', ['test', 'build']);
};