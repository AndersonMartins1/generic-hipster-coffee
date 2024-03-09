const gulp = require('gulp');
const del = require('del');
const fs = require('fs');
const browsersync = require('browser-sync').create();
const htmlmin = require('gulp-htmlmin');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');
const sourcemaps = require('gulp-sourcemaps');

// Create default source folder structure
function createStructure(done) {
    const folders = ['dist', 'src', 'src/fonts', 'src/img', 'src/scss'];
    const files = ['src/index.html'];

    folders.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
            console.log('Folder created:', dir);
        }
    });

    files.forEach(file => {
        if (!fs.existsSync(file)) {
            fs.writeFileSync(file, '');
            console.log('File created:', file);
        }
    });

    return done();
}

// Delete all assets (HTML, fonts, images) in dist
function cleanAssets(done) {
    return del(['dist/**/*.html', 'dist/fonts/**/*', 'dist/img/**/*'], { force: true });
}

// Publish HTML files from src to dist
function publishHtml(done, forProduction = false) {
    let pipeline = gulp.src('src/**/*.html');

    if (forProduction) {
        pipeline.pipe(htmlmin({ collapseWhitespace: true }));
    }

    return pipeline.pipe(gulp.dest('dist'));
}

// Publish HTML for production
function publishHtmlProduction(done) {
    return publishHtml(done, true);
}

// Publish HTML for development
function publishHtmlDevelopment(done) {
    return publishHtml(done, false);
}

// Copy all fonts from src/fonts to dist
function publishFonts(done) {
    return gulp.src('src/fonts/**/*').pipe(gulp.dest('dist/fonts'));
}

// Copy all images from src/img to dist
function publishImages(done) {
    return gulp.src('src/img/**/*').pipe(gulp.dest('dist/img'));
}

// Compile SCSS files
function compileScss(done, forProduction = false) {
    let pipeline = gulp.src('src/scss/**/*.scss').pipe(sourcemaps.init()).pipe(sass().on('error', sass.logError));

    if (forProduction) {
        pipeline.pipe(autoprefixer({ overrideBrowserslist: ['last 2 version', '> 2%'], cascade: false })).pipe(csso());
    }

    return pipeline.pipe(sourcemaps.write('.')).pipe(gulp.dest('dist/css'));
}

// Compile SCSS for production
function compileScssProduction(done) {
    return compileScss(done, true);
}

// Compile SCSS for development
function compileScssDevelopment(done) {
    return compileScss(done, false);
}

// Watch files
function watchFiles(done) {
    gulp.watch('src/**/*.html', gulp.series(publishHtml, reload));
    gulp.watch('src/fonts/**/*', gulp.series(publishFonts, reload));
    gulp.watch('src/img/**/*', gulp.series(publishImages, reload));
    gulp.watch('src/scss/**/*.scss', gulp.series(compileScss, reload));
}

// BrowserSync server
function serve(done) {
    browsersync.init({ server: { baseDir: './dist/' } });
    done();
}

// BrowserSync reload
function reload(done) {
    browsersync.reload();
    done();
}

// Export tasks
exports.structure = createStructure;
exports.publish = gulp.series(cleanAssets, publishHtml, publishFonts, publishImages);
exports.build = gulp.series(cleanAssets, publishHtmlProduction, publishFonts, publishImages, compileScssProduction);
exports.buildDev = gulp.series(cleanAssets, publishHtmlDevelopment, publishFonts, publishImages, compileScssDevelopment);
exports.watch = gulp.series(cleanAssets, publishHtmlDevelopment, publishFonts, publishImages, compileScssDevelopment, serve, watchFiles);

