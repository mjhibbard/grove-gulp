const gulp = require("gulp");
const babel = require("gulp-babel");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
const cleanCSS = require("gulp-clean-css");
const del = require("del");
const source = require("gulp-sourcemaps");
//const pump = require("pump");
const ejs = require("gulp-ejs");

// Sass config and compiler
const sass = require("gulp-sass");
sass.compiler = require("node-sass");

// BrowserSync with "live reload" feature:
const browserSync = require("browser-sync");
const reload = browserSync.reload;

//Image compression plugins:
const imagemin = require("gulp-imagemin");
const imageminPngQuant = require("imagemin-pngquant");
const imageminJpegRecompress = require("imagemin-jpeg-recompress");

// Paths for tasks:
const paths = {
  styles: {
    src: "../../theGrove2.0/public/stylesheets/**/*.css",
    dest: "assets/stylesheets/"
  },
  sassStyles: {
    src: "../../theGrove2.0/public/stylesheets/**/*.scss",
    dest: "assets/stylesheets/"
  },
  scripts: {
    src: "../../theGrove2.0/public/**/*.js",
    dest: "assets/"
  },
  images: {
    src: "../../theGrove2.0/public/images/**/*.{png,PNG,jpeg,jpg,svg,gif}",
    dest: "assets/images/"
  },
  ejs: {
    src: "../../theGrove2.0/views/**/*.ejs",
    dest: "assets/"
  }
};

//Handle errors (with the use of 'pump' later):
function createErrorHandler(name) {
  return function(err) {
    console.error("Error from " + name + " in gulp task", err.toString());
  };
}

//Clean up old files that are to be rebuilt:
function clean() {
  return del([
    "assets/partials",
    "assets/stylesheets",
    "assets/*.html",
    "assets/*.js"
  ]);
}
function cleanImages() {
  return del(["assets/images"]);
}
function cleanAll() {
  return del(["assets"]);
}

//EJS file combine and convert to HTML:
function serveEjs() {
  return gulp
    .src(paths.ejs.src)
    .on("error", createErrorHandler("gulp.src"))
    .pipe(ejs({ msg: "Hello Gulp!" }, {}, { ext: ".html" }))
    .on("error", createErrorHandler("gulp-ejs"))
    .pipe(gulp.dest(paths.ejs.dest))
    .on("error", createErrorHandler("gulp.dest"));
}

//Scripts concat and compression:
function scripts() {
  return gulp
    .src(paths.scripts.src, { sourcemaps: true })
    .on("error", createErrorHandler("gulp.src"))
    .pipe(babel())
    .on("error", createErrorHandler("babel"))
    .pipe(uglify())
    .on("error", createErrorHandler("uglify"))
    .pipe(concat("app.js")) //name the concat file here
    .on("error", createErrorHandler("concat"))
    .pipe(gulp.dest(paths.scripts.dest))
    .on("error", createErrorHandler("gulp.dest"));
}

//Styles compression:
function styles() {
  return gulp
    .src(paths.styles.src, { sourcemaps: true })
    .pipe(source.init())
    .pipe(cleanCSS())
    .pipe(
      rename({
        basename: "main"
        // suffix: ".min"
      })
    )
    .pipe(source.write())
    .pipe(gulp.dest(paths.styles.dest));
}

function sassStyles() {
  return gulp
    .src(paths.sassStyles.src)
    .on("error", createErrorHandler("gulp.src"))
    .pipe(source.init())
    .pipe(sass().on("error", sass.logError))
    .on("error", createErrorHandler("gulp sass function"))
    .pipe(cleanCSS())
    //.pipe(rename({ basename: "stylesTwo" }))
    .pipe(source.write())
    .pipe(gulp.dest(paths.sassStyles.dest));
}

//Image compression (lossy and lossless):
function images() {
  return gulp
    .src(paths.images.src)
    .on("error", createErrorHandler("gulp.src"))
    .pipe(
      imagemin([
        imagemin.gifsicle(),
        imagemin.jpegtran(),
        imagemin.optipng(),
        imagemin.svgo(),
        imageminPngQuant(),
        imageminJpegRecompress()
      ])
    )
    .on("error", createErrorHandler("imagemin"))
    .pipe(gulp.dest(paths.images.dest))
    .on("error", createErrorHandler("gulp.dest"));
}

//Serve the files to the browser for development:
function serve() {
  browserSync({
    server: {
      baseDir: "assets"
    }
  });
  gulp.watch(paths.ejs.src, async function watcherEjs() {
    await serveEjs();
    reload();
    return;
  });
  gulp.watch(paths.styles.src, async function watcherStyles() {
    await styles();
    reload();
    return;
  });
  gulp.watch(paths.scripts.src, async function watcherScripts() {
    await scripts();
    reload();
    return;
  });
  gulp.watch(paths.sassStyles.src, async function watcherSassStyles() {
    await sassStyles();
    reload();
    return;
  });
}

//Watch certain files for changes and other stuff:
function watch() {
  gulp.watch(paths.ejs.src, serveEjs);
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.sassStyles.src, sassStyles);
}

exports.clean = clean;
exports.cleanImages = cleanImages;
exports.cleanAll = cleanAll;
exports.serveEjs = serveEjs;
exports.serve = serve;
exports.images = images;
exports.styles = styles;
exports.sassStyles = sassStyles;
exports.scripts = scripts;
exports.watch = watch;

const build = gulp.series(
  clean,
  gulp.parallel(styles, sassStyles, scripts, serveEjs, serve)
);
const buildMore = gulp.series(
  cleanAll,
  images,
  gulp.parallel(styles, sassStyles, scripts, serveEjs, serve)
);

gulp.task("build", buildMore);
gulp.task("default", build);
