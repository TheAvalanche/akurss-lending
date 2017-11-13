// Load plugins
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cssnano = require('gulp-cssnano'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    livereload = require('gulp-livereload'),
    gprint = require('gulp-print'),
    del = require('del'),
    fileinclude = require('gulp-file-include'),
    ftp = require('vinyl-ftp'),
    config = require('./config.js');

// Styles
gulp.task('styles', function () {
    return gulp.src('src/styles/scss/main.scss')
        .pipe(sass({ outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer('last 2 version'))
        .pipe(gulp.dest('dist/styles'))
        .pipe(rename({suffix: '.min'}))
        .pipe(cssnano())
        .pipe(gulp.dest('dist/styles'));
});

// Scripts
gulp.task('scripts', function () {
    return gulp.src('src/scripts/**/*.js')
        .pipe(concat('main.js'))
        .pipe(gulp.dest('dist/scripts'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('dist/scripts'));
});

// Images
gulp.task('images', function () {
    return gulp.src('src/images/**/*')
        .pipe(gprint())
        .pipe(imagemin({optimizationLevel: 3, progressive: true, interlaced: true}))
        .pipe(gulp.dest('dist/images'));
});

// HTML
gulp.task('html', function() {
    return gulp.src('src/**/*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('dist/'));
});

// Favicon
gulp.task('favicon', function() {
    return gulp.src('src/*.{png,ico,json,xml}')
        .pipe(gulp.dest('dist/'));
});

// Clean
gulp.task('clean', function () {
    return del(['dist']);
});

// Deploy
gulp.task( 'deploy', function () {

    var conn = ftp.create( {
        host:     config.config.host,
        user:     config.config.user,
        password: config.config.password,
        parallel: 10
    } );

    var globs = [
        'dist/**/*'
    ];

    // using base = '.' will transfer everything to /public_html correctly
    // turn off buffering in gulp.src for best performance

    return gulp.src( globs, { buffer: false } )
        .pipe(gprint())
        //.pipe( conn.newer( '/httpdocs' ) ) // only upload newer files
        .pipe( conn.dest( '/httpdocs' ) );

} );

// Default task
gulp.task('default', ['clean'], function () {
    gulp.start('html', 'favicon', 'images', 'styles', 'scripts');
});

// Watch
gulp.task('watch', function () {

    // Watch .scss files
    gulp.watch('src/styles/**/*.scss', ['styles']);

    // Watch .js files
    gulp.watch('src/scripts/**/*.js', ['scripts']);

    // Watch image files
    gulp.watch('src/images/**/*', ['images']);

    // Watch image files
    gulp.watch('src/**/*.html', ['html']);

    // Create LiveReload server
    livereload.listen();

    // Watch any files in dist/, reload on change
    gulp.watch(['dist/**']).on('change', livereload.changed);

});