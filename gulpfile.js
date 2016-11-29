var gulp = require('gulp'),
    minifyHtml = require('gulp-minify-html'),
    templateCache = require('gulp-angular-templatecache');

var minifyHtmlOpts = {
    empty: true,
    cdata: true,
    conditionals: true,
    spare: true,
    quotes: true
};

gulp.task('seo-clerk-bootstrap3', function () {
    gulp.src('template/clerk/bootstrap3/*.html')
        .pipe(minifyHtml(minifyHtmlOpts))
        .pipe(templateCache('seo-clerk-tpls-bootstrap3.js', {standalone: false, module: 'seo'}))
        .pipe(gulp.dest('src'));
});

gulp.task('default', ['seo-clerk-bootstrap3']);