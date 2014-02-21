
/**
 * Dependencies
 */

var Builder = require('component-builder');
var component = require('./component.json');
var fs = require('fs');
var mkdir = require('mkdirp');
var minify = require('minify');
var myth = require('myth');
var path = require('path');
var resolve = path.resolve;
var sqwish = require('sqwish');
var uglify = require('uglify-js');
var write = fs.writeFileSync;

/**
 * Expose `build`
 */

module.exports = buildAll;

/**
 * Run if not `require`d
 */

if (!module.parent) {
  buildAll();
}

/**
 * Config. Do not put any private keys here!!!
 */

var config = {
  API_URL: process.env.API_URL,
  BASE_URL: process.env.BASE_URL,
  ENV: process.env.NODE_ENV,
  MAPBOX_MAP_ID: process.env.MAPBOX_MAP_ID,
  NAME: process.env.NAME,
  OTP_URL: process.env.OTP_URL
};

/**
 * Build all
 */

function buildAll() {
  component.local.forEach(build);
}

/**
 * Build.
 */

function build(bundle) {
  /**
   * Settings.
   */

  var dest = 'build/' + bundle;
  var production = process.env.NODE_ENV === 'production';

  /**
   * Builder.
   */

  var builder = new Builder('.');

  builder.copyAssetsTo(dest);
  builder.prefixUrls('/' + dest);
  builder.copyFiles(true);

  if (!production) {
    builder.development(true);
    builder.addSourceURLs(true);
  }

  builder.build(function (err, res) {
    if (err) throw err;
    mkdir.sync(dest);

    if (res.js) {
      var js = 'window.CONFIG=' + JSON.stringify(config) + ';' + res.require + res.js + ';require("' + bundle + '");';
      // if (production) js = uglify.minify(js, { fromString: true }).code;
      write(resolve(dest, 'build.js'), js);
    }

    if (res.css) {
      var css = myth(res.css);
      if (production) css = sqwish.minify(css);
      write(resolve(dest, 'build.css'), css);
    }
  });
}