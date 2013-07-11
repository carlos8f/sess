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
    if (!session.req) throw new Error('session.req is required');
    if (!session.res) throw new Error('session.res is required');
    // move req and res to __proto__, essentially hiding these properties
    session.__proto__ = {};
    ['req', 'res'].forEach(function (k) {
      session.__proto__[k] = session[k];
      delete session[k];
    });
    // proxy res.writeHead() to set cookie
    var _writeHead = session.res.writeHead;
    session.res.writeHead = function () {
      if (session && session.req && session.req.session) {
        // @todo: refuse to set header options.secure and proto != 'https'
        session.res.setHeader('Set-Cookie', cookie.serialize(options.cookie.name, session.id, options.cookie));
      }
      _writeHead.apply(session.res, [].slice.call(arguments));
    };
    // proxy res.end() to save session
    var _end = session.res.end;
    session.res.end = function () {
      var args = [].slice.call(arguments);
      // @todo: check hash if session changed?
      coll.save(session, function (err) {
        if (err) return session.res.emit('error', err);
        _end.apply(session.res, args);
      });
    };
  };

  return function (req, res, next) {
    var paused = pause(req);

    if (!req.headers['cookie']) return create();
    var cookies = cookie.parse(req.headers['cookie']);
    if (!cookies || !cookies[options.cookie.name]) return create();

    coll.load(cookies[options.cookie.name], function (err, session) {
      if (err) return next(err);
      if (!session) return create();
      req.session = session;
      doNext();
    });

    function create () {
      req.session = coll.create({req: req, res: res});
      doNext();
    }

    function doNext () {
      process.nextTick(function () {
        paused.resume();
      });
      next();
    }
  };
};
