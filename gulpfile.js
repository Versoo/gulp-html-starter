/*global -$ */
'use strict';
var gulp = require('gulp');
var concat = require('gulp-concat-css');
var concat_global = require('gulp-concat');
var imageop = require('gulp-image-optimization');
var browserSync = require('browser-sync').create();
var $ = require('gulp-load-plugins')();
var notify = require("gulp-notify");
var plumber = require("gulp-plumber");

var paths = {
    vendorJs: [
        'node_modules/jquery/dist/jquery.js',
        'node_modules/bootstrap-sass/assets/bootstrap.js',
    ]
};

gulp.task('serve', ['styles','scripts','images','vendors_js'], function() {

    browserSync.init({
        server: "./"
    });

    gulp.watch('raw/styles/**/*.scss', ['styles']);
    gulp.watch('raw/images/**/*', ['images'])
    gulp.watch('raw/javascripts/**/*.js', ['scripts']);
    gulp.watch("*.html").on('change', browserSync.reload);
});

gulp.task('styles', function () {
return gulp.src(['raw/styles/main.scss'])
        .pipe(plumber({errorHandler: notify.onError("Styles error: <%= error.message %>")}))
        .pipe($.sourcemaps.init())
        .pipe($.sass({
            outputStyle: 'compressed', // libsass doesn't support expanded yet
            precision: 10,
            includePaths: ['.'],
            onError: console.error.bind(console, 'Sass error:')
        }))
        .pipe($.sourcemaps.write('./maps'))
        .pipe(gulp.dest('assets/styles'))
    	.pipe(browserSync.stream())
        .pipe(notify('Sass success compiled'));
});

gulp.task('scripts', function () {
    return gulp.src('raw/javascripts/*.js')
        .pipe(plumber({errorHandler: notify.onError("Scripts error: <%= error.message %>")}))
        .pipe($.uglify())
        .pipe(concat_global('app.js'))
        .pipe(gulp.dest('assets/js'))
        .pipe(browserSync.stream())
        .pipe(notify('JavaScript success compiled'));
});
gulp.task('images', function (cb) {
    // Images Task
    gulp.src(['raw/images/**/*.png', 'raw/images/**/*.jpg', 'raw/images/**/*.gif', 'raw/images/**/*.jpeg'])
        .pipe(imageop({
            optimizationLevel: 5,
            progressive: true,
            interlaced: true
        }))
        .pipe(browserSync.stream())
        .pipe(gulp.dest('assets/images')).on('end',cb).on('error',cb);
});


gulp.task('vendors_js', function () {
    return gulp.src(paths.vendorJs)
        .pipe($.uglify())
        .pipe(concat_global('vendor.js'))
        .pipe(browserSync.stream())
        .pipe(gulp.dest('assets/js'));
});


gulp.task('watch', ['styles', 'images', 'scripts', 'vendors_js'], function () {
    gulp.watch('raw/styles/**/*.scss', ['styles']);
    gulp.watch('raw/images/**/*', ['images'])
    gulp.watch('raw/javascripts/**/*.js', ['scripts']);
});

gulp.task('build', ['styles', 'images', 'scripts', 'vendors_js'], function () {
    return true;
});

gulp.task('default', ['serve'], function () {
    return true;
});
