// let project_folder = "dist";
let project_folder = require('path').basename(__dirname);
let source_folder = "#src";

let path = {
  build: {
    html: project_folder + "/",
    css: project_folder + "/css/",
    js: project_folder + "/js/",
    img: project_folder + "/img/",
    fonts: project_folder + "/fonts/",
  },
  src: {
    html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
    css: source_folder + "/scss/style.scss",
    js: source_folder + "/js/script.js",
    img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    fonts: source_folder + "/fonts/*.ttf",
  },
  watch: {
    html: source_folder + "/**/*.html",
    css: source_folder + "/scss/**/*.scss",
    js: source_folder + "/js/**/*.js",
    img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
  },
  clean: "./" + project_folder + "/"
}

let {src, dest} = require('gulp'),
  gulp = require('gulp'),
  browsersync = require('browser-sync').create(),
  fileinclude = require('gulp-file-include'),
  del = require('del'),
  scss = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  group_media = require('gulp-group-css-media-queries'),
  clean_css = require('gulp-clean-css'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify-es').default,
  imagemin = require('gulp-imagemin'),
  webp = require('gulp-webp'),
  webphtml = require('gulp-webp-html'),
  webpcss = require('gulp-webp-css'),
  svgsprite = require('gulp-svg-sprite'),
  ttf2woff = require('gulp-ttf2woff'),
  ttf2woff2 = require('gulp-ttf2woff2'),
  fonter = require('gulp-fonter'),
  babel = require('gulp-babel'),
  fs = require('fs');


function browserSync() {
  browsersync.init({
    server: {
      baseDir: "./" + project_folder + "/"
    },
    port: 3000,
    notify: false
  })
} 

function html() {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(webphtml())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
}

function css() {
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: "expanded"
      })
    )
    .pipe(group_media())
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 15 versions"],
        cascade: true
      })
    )
    // .pipe(webpcss())
    .pipe(dest(path.build.css))
    .pipe(clean_css())
    .pipe(webpcss())
    .pipe(rename({
      extname: ".min.css"
    }))
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
}

gulp.task('c', function () {
  gulp.src(project_folder + '/css/style.css')
      .pipe(webpcss()) // or .pipe(webpCss(['.jpg','.jpeg']))
      .pipe(gulp.dest('./public/css/'))
});

function cs() {
  return src(project_folder + '/css/style.css')
  .pipe(clean_css())
  .pipe(webpcss()) 
  .pipe(dest('./public/css/'))
}

function js() {
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(rename({
      extname: ".min.js"
    }))
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream())
}

function img() {
  return src(path.src.img)
    .pipe(webp({
      quality: 70
    }))
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      interlaced: true,
      optimizationlevel: 3
    }))
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream())
}

function watchFiles() {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], img);
}

function clean() {
  return del(path.clean);
}

function svgSprite() {
    return src([source_folder + '/iconsprite/*.svg'])
      .pipe(svgsprite({
        mode: {
          stack: {
            sprite: "../icons/icons.svg",
            example: true
          }
        }
      }))
      .pipe(dest(path.build.img))
}

function fonts() {
  src(path.src.fonts)
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonts));
  return src(path.src.fonts)
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts));
}

function otf2ttf() {
  return src([source_folder + '/fonts/*.otf'])
    .pipe(fonter({
      formats: ['ttf']
    }))
    .pipe(dest(source_folder + '/fonts/'));
}



function fontsStyle(params) {
  let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss'); 
  if (file_content == '') { 
    fs.writeFile(source_folder + '/scss/fonts.scss', '', cb); 
    return fs.readdir(path.build.fonts, function (err, items) { 
      if (items) { 
        let c_fontname; 
        for (var i = 0; i < items.length; i++) { 
          let fontname = items[i].split('.'); 
          fontname = fontname[0]; 
          if (c_fontname != fontname) { 
            fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb); 
          } 
          c_fontname = fontname; 
        } 
      } 
    }) 
  }  
}
  
function cb() { }
  

let build = gulp.series(clean, gulp.parallel(js, css, html, img, fonts), fontsStyle);
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.o2f = otf2ttf; /*  
открываем node_modules/gulp-fonter/dist/index.js, находим строку:

newFont.path = source.dirname + '\\' + source.stem + '.' + type;

, меняем '\\' на '/' 
*/
exports.cs = cs; // insert font-face
exports.fst = fontsStyle; // insert font-face
exports.f = fonts; // ttf2woff
exports.ss = svgSprite; // pack svg
exports.img = img;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;