define(['admission-oauth2',
        'ajax',
        'class'],
function(OAuth2Provider, ajax, clazz) {
  // TODO: Switch to lighter-weight `xhr` dependency.
  
  /**
   * `Provider` constructor.
   *
   * Examples:
   *
   *     admission.use(new FacebookProvider({
   *         clientID: '123456789',
   *         redirectURL: 'http://127.0.0.1:3000/auth/facebook/redirect',
   *         responseType: 'token'
   *       }));
   *
   * @param {Object} opts
   * @api public
   */
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
  
  /**
   * Retrieve info for `token`.
   *
   * References:
   *  - [The Login Flow for Web (without JavaScript SDK)](https://developers.facebook.com/docs/facebook-login/login-flow-for-web-no-jssdk/)
   *  - [Access Tokens](https://developers.facebook.com/docs/facebook-login/access-tokens/)
   *
   * @param {String} token
   * @param {Function} cb
   * @api protected
   */
  Provider.prototype.tokenInfo = function(token, cb) {
    // Facebook's API documentation details a debug token endpoint at:
    //   https://graph.facebook.com/debug_token
    //
    // However, this requires an app access token, which in turn would entail
    // embedding the app secret in the JavaScript application.  Since this is
    // not secure, the below endpoint is used which does not have that
    // requirement.  This endpoint is undocumented, but details about it can
    // be found on at the following locations:
    //   http://stackoverflow.com/questions/8141037/get-application-id-from-user-access-token-or-verify-the-source-application-for
    //   http://www.thread-safe.com/2012/02/more-on-oauth-implicit-flow-application.html
    
    var url = 'https://graph.facebook.com/app?access_token=' + token;
    var req = ajax.get(url, function(res) {
      res.on('end', function() {
        // TODO: Check status code.
        
        var json = JSON.parse(res.responseText)
          , info = {};
        info.audience = json.id;
        return cb(null, info);
      });
    });

    req.on('error', function(err) {
      return cb(err);
    });
  }
  
  /**
   * Retrieve the user profile from Facebook.
   *
   * @param {String} token
   * @param {Function} cb
   * @api protected
   */
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
      return cb(err);
    });
  }
  
  return Provider;
});
