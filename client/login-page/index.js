/**
 * Dependencies
 */

var alerts = require('alerts');
var config = require('config');
var debug = require('debug')(config.name() + ':login-page');
var page = require('page');
var request = require('request');
var template = require('./template.html');
var view = require('view');

/**
 * Create `View`
 */

var View = view(template);

/**
 * On button click
 */

View.prototype.login = function(e) {
  e.preventDefault();
  var email = this.find('#email').value;
  var password = this.find('#password').value;
  var self = this;

  request.post('/login', {
    email: email,
    password: password
  }, function(err, res) {
    if (res.ok) {
      alerts.push({
        type: 'success',
        text: 'Welcome back!'
      });
      page('/manager/organizations');
    } else {
      window.alert(err || res.text || 'Failed to login.');
    }
  });
};

/**
 * Expose `render`
 */

module.exports = function(ctx, next) {
  ctx.view = new View();

  next();
};