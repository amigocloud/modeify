var evnt = require('event');
var log = require('./client/log')('planner-nav');
var MarkdownModal = require('./client/markdown-modal');
var showWalkThrough = require('planner-walkthrough');
var getTemplate = require('./client/template');
var page = require('page');
var view = require('view');
var map = require('map-view');
var mapModule = require('map');

/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'));

/**
 * Scroll to top
 */

View.prototype.scrollToTop = function(e) {
  e.preventDefault();
  document
    .getElementById('scrollable')
    .scrollTop = 0;
};

View.prototype.showMenu = function() {
  var menu = this.find('.menu');
  if (menu.classList.contains('hidden')) {
    menu.classList.remove('hidden');
    evnt.bind(document.documentElement, 'click', this.hideMenu.bind(this));
  } else {
    this.hideMenu();
  }
};

View.prototype.hideMenu = function() {
  this.find('.menu').classList.add('hidden');
  evnt.unbind(document.documentElement, 'click', this.hideMenu.bind(this));
};

View.prototype.showProfile = function(e) {
  if (e) e.preventDefault();
  this.hideMenu();
  page('/profile');
};

View.prototype.showAbout = function(e) {
  if (e) e.preventDefault();
  this.hideMenu();
  MarkdownModal({
    content: getTemplate('about')
  }).show();
};

View.prototype.showTermsAndConditions = function(e) {
  if (e) e.preventDefault();
  this.hideMenu();
  MarkdownModal({
    content: getTemplate('terms')
  }).show();
};

/**
 * Toggle Realtime Data
 */
View.prototype.toggleRealtime = function(e) {
  if (e) e.preventDefault();
  this.hideMenu();
  mapModule.toggleRealtime(map.getMap());
};

/**
 * Show Walk Through
 */

View.prototype.showWalkThrough = function(e) {
  if (e) e.preventDefault();
  this.hideMenu();
  showWalkThrough();
};
