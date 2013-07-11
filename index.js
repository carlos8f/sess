var cookie = require('cookie')
  , modeler = require('modeler')
  , idgen = require('idgen')
  , pause = require('pause')

module.exports = function (_opts) {
  _opts || (_opts = {});
  var coll = _opts.sessions || modeler(_opts);

  var options = coll.copy(_opts);
  options.cookie = coll.copy(_opts.cookie || {});
  if (typeof options.cookie.httpOnly === 'undefined') options.cookie.httpOnly = true;
  options.cookie.name || (options.cookie.name = 'sess');

  return function (req, res, next) {
    var paused = pause(req);
    req.resume = function () {
      // note: avoid bind() per-request because it's really slow!
      paused.resume();
    };

    if (!req.headers['cookie']) return create();
    var cookies = cookie.parse(req.headers['cookie']);
    if (!cookies || !cookies[options.cookie.name]) return create();

    // attempt to load based on cookie's id
    coll.load(cookies[options.cookie.name], function (err, session) {
      if (err) return next(err);
      if (!session) return create();
      req.session = session;
      req.sessionID = req.session.id;
      doNext();
    });

    function create () {
      generate();
      doNext();
    }

    function generate () {
      req.session = coll.create();
      // additional id entropy because session ids are supposed to be secret
      req.session.id = idgen(32);
      req.sessionID = req.session.id;
    }

    function doNext () {
      // expose some stuff on session, also some basic connect compatibility
      req.session.__proto__ = {
        req: req,
        res: res,
        save: function (cb) {
          // @todo: check hash if session changed?
          coll.save(req.session, function (err) {
            if (err && !cb) return res.emit('error', err);
            cb && cb(err);
          });
        },
        destroy: function (cb) {
          coll.destroy(req.session.id, function (err) {
            if (err && !cb) return res.emit('error', err);
            if (!err) {
              delete req.session;
              delete req.sessionID;
            }
            cb && cb(err);
          });
        },
        regenerate: function (cb) {
          req.session.destroy(function (err) {
            if (err && !cb) return res.emit('error', err);
            if (!err) generate();
            cb && cb(err);
          });
        }
      };

      // proxy res.writeHead() to set cookie
      var _writeHead = res.writeHead;
      res.writeHead = function () {
        // session was just saved for the first time?
        // account for writeHead() called before end()
        if (req.session && req.session.rev < 2) {
          // @todo: refuse to set header options.secure and proto != 'https'
          res.setHeader('Set-Cookie', cookie.serialize(options.cookie.name, req.session.id, options.cookie));
        }
        _writeHead.apply(res, [].slice.call(arguments));
      };
      // proxy res.end() to save session
      var _end = res.end;
      res.end = function () {
        var args = [].slice.call(arguments);
        if (!req.session) return _end.apply(res, args);
        req.session.save(function (err) {
          if (err) return res.emit('error', err);
          _end.apply(res, args);
        });
      };
      next();
    }
  };
};
