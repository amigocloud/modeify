var config = require('config');
var log = require('./client/log')('geocode');
var get = require('./client/request').get;

/**
 * Geocode
 */

module.exports = geocode;
module.exports.reverseAmigo = reverseAmigo;
module.exports.suggestAmigo = suggestAmigo;

/**
 * Geocode
 */

function geocode(address, callback) {
  log('--> geocoding %s', address);
  get('/geocode/' + address, function(err, res) {
    if (err) {
      log('<-- geocoding error %s', err);
      callback(err, res);
    } else {
      log('<-- geocoding complete %j', res.body);
      callback(null, res.body);
    }
  });
}

/**
 * Reverse geocode
 */

function reverseAmigo(ll, callback) {

  var parameter = {
      'token':config.realtime_access_token() ,
      'point.lon':ll[0],
      'point.lat':ll[1]
  };

  get('https://www.amigocloud.com/api/v1/me/geocoder/reverse', parameter, function(err, res) {

    if (err) {
      log('<-- geocoding error %e', err);

    } else {
      callback(false, res.body);
    }
  });
}

/**
 * Suggestions!
 */

function suggestAmigo(text, callback) {

    var list_address;
    var parameter = {
        'token': config.realtime_access_token() ,
        'boundary.rect.min_lat': '36.155617833819',
        'boundary.rect.min_lon': '-123.607177734375',
        'boundary.rect.max_lat': '38.826870521381',
        'boundary.rect.max_lon': '-120.701293945312',
        'sources':'osm,oa',
        'text': text
    };

    get('https://www.amigocloud.com/api/v1/me/geocoder/search', parameter, function(err, res) {

            if(err) {
                log("Amigo Cloud Response Error ->", err);

            }else{
                if(res.body.features) {

                    list_address = res.body.features;
                    if (list_address.length > 0) {
                         callback(
                            null,
                            list_address
                        );
                    }else {
                        callback(true, res);
                    }

                }
            }
    });
}
