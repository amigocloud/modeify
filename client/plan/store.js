var config = require('config');
var debug = require('debug')(config.name() + ':plan:store');
var session = require('session');
var store = require('store');

/**
 * Expose `storePlan`
 */

module.exports = storePlan;

/**
 * Store a plan
 */

function storePlan(plan) {
  debug('--> storing plan');

  // convert to "JSON", remove routes & patterns
  var json = {};
  for (var key in plan.attrs) {
    if (key === 'routes' || key === 'patterns') continue;
    json[key] = plan.attrs[key];
  }

  // if we've created a commuter object, save to the commuter
  var commuter = session.commuter();
  if (commuter) {
    json._commuter = commuter._id();
    commuter.opts(json);
    commuter.save();
  }

  // save in local storage
  store('plan', json);
  debug('<-- stored plan');

  return json;
}

/**
 * Clear storage
 */

module.exports.clear = function() {
  store('plan', null);
};