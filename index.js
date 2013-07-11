var cookie = require('cookie')
  , modeler = require('modeler')
  , idgen = require('idgen')
  , pause = require('pause')

module.exports = function (_opts) {
  _opts || (_opts = {});
  var coll = _opts.collection || modeler(_opts);

  var options = coll.copy(_opts);
  options.cookie = coll.copy(_opts.cookie || {});
  if (typeof options.cookie.httpOnly === 'undefined') options.cookie.httpOnly = true;
  options.cookie.name || (options.cookie.name = 'sess');

  coll.options.create = function (session) {
    // additional id entropy because session ids are supposed to be secret
    if (!session.rev) session.id = idgen(32);
  };

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
      doNext();
    });

    function create () {
      req.session = coll.create();
      doNext();
    }

    function doNext () {
      // proxy res.writeHead() to set cookie
      var _writeHead = res.writeHead;
      res.writeHead = function () {
        if (req.session) {
          // @todo: refuse to set header options.secure and proto != 'https'
          res.setHeader('Set-Cookie', cookie.serialize(options.cookie.name, req.session.id, options.cookie));
        }
        _writeHead.apply(res, [].slice.call(arguments));
      };
      // proxy res.end() to save session
      var _end = res.end;
      res.end = function () {
        var args = [].slice.call(arguments);
        // @todo: check hash if session changed?
        coll.save(req.session, function (err) {
          if (err) return res.emit('error', err);
          _end.apply(res, args);
        });
      };
      next();
    }
  };
};
