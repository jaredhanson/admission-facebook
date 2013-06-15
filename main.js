define(['admission-oauth2',
        'ajax',
        'class'],
function(OAuth2Provider, ajax, clazz) {
  // TODO: Switch to lighter-weight `xhr` dependency.
  
  function Provider(opts) {
    opts = opts || {};
    opts.authorizationURL = opts.authorizationURL || 'https://www.facebook.com/dialog/oauth';
    OAuth2Provider.call(this, opts);
    this.name = 'facebook';
  }
  
  /**
   * Inherit from `OAuth2Provider`.
   */
  clazz.inherits(Provider, OAuth2Provider);
  
  Provider.prototype.audienceFor = function(token, cb) {
    var url = 'https://graph.facebook.com/app?access_token=' + token;
    var req = ajax.get(url, function(res) {
      res.on('end', function() {
        // TODO: Check status code.
        
        var json = JSON.parse(res.responseText);
        return cb(null, json.id);
      });
    });

    req.on('error', function(err) {
      return cb(err);
    });
  }
  
  Provider.prototype.userProfile = function(token, cb) {
    var url = 'https://graph.facebook.com/me?access_token=' + token;
    var req = ajax.get(url, function(res) {
      res.on('end', function() {
        // TODO: Check status code.
        
        var json = JSON.parse(res.responseText)
          , profile = {};
        profile.id = json.id;
        profile.name = json.name;
        return cb(null, profile);
      });
    });

    req.on('error', function(err) {
      console.log('problem with request: ' + e.message);
      return cb(err);
    });
  }
  
  return Provider;
});
