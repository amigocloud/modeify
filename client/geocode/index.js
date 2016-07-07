var config = require('config');
var log = require('./client/log')('geocode');
var get = require('./client/request').get;
var googleGeocode = require('./google_geocode');

/**
 * Geocode
 */

module.exports = geocode;
module.exports.reverseAmigo = reverseAmigo;
module.exports.suggestAmigo = suggestAmigo;

/**
 * Geocode (not currently in use!)
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
 * Geocoding options (google or amigo)
 **/

var geocodingOptions = {
  amigoSuggestions: function (text, res) {
    var bounding = res.body.boundingbox;
    var bounding_split = bounding.split(",");
    var boinding_first = bounding_split[0].split(" ");
    var boinding_second = bounding_split[1].split(" ");
    var parameter = {
        'token': config.realtime_access_token() ,
        'boundary.rect.min_lat': boinding_first[1],
        'boundary.rect.min_lon': boinding_first[0],
        'boundary.rect.max_lat': boinding_second[1],
        'boundary.rect.max_lon': boinding_second[0],
        'sources':'osm,oa',
        'text': text
    };

    return {
      get: function () {
        return $.get('https://www.amigocloud.com/api/v1/me/geocoder/search', parameter).then(function (data) {
          return {
            body: data
          };
        });
      }
    };
  },

  amigoReverse: function (ll) {
    var parameter = {
      'token':config.realtime_access_token() ,
      'point.lon':ll[0],
      'point.lat':ll[1]
    };

    return {
      parameter: parameter,
      endpoint: 'https://www.amigocloud.com/api/v1/me/geocoder/reverse'
    };
  },

  googleSuggestions: googleGeocode.googleSuggestions,

  googleReverse: googleGeocode.googleReverse
};

/**
 * Reverse geocode
 */

function reverseAmigo(ll, callback) {
  log('--> reverse geocoding %s', ll);

  // var query = geocodingOptions.amigoReverse(ll);
  var query = geocodingOptions.googleReverse(ll);

  get(query.endpoint, query.parameter, function(err, res) {

    if (err) {
      log('<-- geocoding error %e', err);
      //return false;
    } else {
      if (query.responseMapper) {
        res = query.responseMapper(res);
      }

      log('<-- geocoding complete %j', res.body);
      //return res.body;
      callback(false, res.body);
    }
  });
}

/**
 * Suggestions!
 */

function suggestAmigo(text, callback) {

    var databoundary = [];
    get('https://www.amigocloud.com/api/v1/users/1/projects/661/datasets/22492', {'token' : config.realtime_access_token()}, function(err, res) {

        if (err) {
            console.log("error");
        }else {
            var list_address;
            
            // var query = geocodingOptions.amigoSuggestions(text, res);
            var query = geocodingOptions.googleSuggestions(text, res);

            query.get().then(function(res) {

              if (query.responseMapper) {
                var res = query.responseMapper(res);
              }

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
            });
        }

    });
}

function suggest(text, callback) {
  var bingSuggestions, nominatimSuggestions, totalSuggestions;
  log('--> getting suggestion for %s', text);

  get('/geocode/suggest/'+ text, function(err, res){

    if (err) {
      log('<-- suggestion error %s', err);
      callback(err, res);
    } else {
      log('<-- got %s suggestions', res.body.length);

	bingSuggestions = res.body;

	get('http://nominatim.openstreetmap.org/search' +
	    '?format=json&addressdetails=1&' +
	    'viewbox=' + southWest[0] + ',' +
	    northEast[1] + ',' + northEast[0] + ',' + southWest[1] +
	    '&bounded=1' +
	    'countrycodes=us&q=' + text, function (err, nRes) {
		var inside = false;
	    nominatimSuggestions = [];
            for (var i = 0; i < nRes.body.length; i++) {
                    nominatimSuggestions.push(nRes.body[i]);
            }
            callback(
		null,
		nominatimSuggestions.slice(0,2).concat(bingSuggestions.slice(0,3))
	    );
	});
    }
  });

}