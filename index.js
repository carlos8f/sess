var cookie = require('cookie')
  , modeler = require('modeler')
  , idgen = require('idgen')
  , sig = require('sig')
  , href = require('href')

module.exports = function (_opts) {
  _opts || (_opts = {});
  var coll = _opts.sessions || modeler(_opts);

  var options = coll.copy(_opts);
  options.cookie = coll.copy(_opts.cookie || {});
  if (typeof options.cookie.httpOnly === 'undefined') options.cookie.httpOnly = true;
  options.cookie.name || (options.cookie.name = options.key || 'sess');
  options.cookie.path || (options.cookie.path = '/');

  return function sess (req, res, next) {
    href(req, res, function (err) {
      if (err) return next(err);

      var touch = false, hash;

      if (!req.headers['cookie']) return create();
      var cookies = cookie.parse(req.headers['cookie']);
      if (!cookies || !cookies[options.cookie.name]) return create();

      // attempt to load based on cookie's id
      coll.load(cookies[options.cookie.name], function (err, session) {
        if (err) return next(err);
        if (!session) return create();
        set(session);
        doNext();
      });

      function create () {
        generate();
        doNext();
      }

      function generate (id) {
        var session = coll.create({id: id});
        if (!id) session.id = idgen(32);
        set(session);
      }

      function set (session) {
        req.session = session;
        req.sessionID = req.session.id;
        hash = sig(req.session);
        // expose some stuff on session, also some connect compatibility
        req.session.__proto__ = {
          req: req,
          res: res,
          save: function (cb) {
            // check signature for changes
            if ((!options.cookie.secure || req.href.protocol === 'https:') && sig(req.session) !== hash) {
              coll.save(req.session, function (err) {
                // if another request saved the session first, defer
                if (err && err.code === 'REV_CONFLICT') return cb && cb();
                if (err && !cb) return res.emit('error', err);
                cb && cb(err);
              });
            }
            // no changes, just return
            else cb && cb();
            return this;
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
            return this;
          },
          touch: function () {
            // set-cookie again
            touch = true;
            return this;
          },
          reload: function (cb) {
            coll.load(req.session.id, function (err, session) {
              if (err && !cb) return res.emit('error', err);
              if (!err) {
                if (session) set(session);
                // create an empty session with the same id
                else generate(req.session.id);
              }
              cb && cb(err);
            });
            return this;
          },
          regenerate: function (cb) {
            req.session.destroy(function (err) {
              if (err && !cb) return res.emit('error', err);
              if (!err) generate();
              cb && cb(err);
            });
            return this;
          }
        };
      }

      function doNext () {
        // proxy res.writeHead() to set cookie
        var _writeHead = res.writeHead;
        res.writeHead = function () {
          res.writeHead = _writeHead;
          // session was just saved for the first time?
          // account for writeHead() called before end()
          if (req.session && ((sig(req.session) !== hash && req.session.rev < 2) || touch || options.cookie.alwaysSet)) {
            if (!options.cookie.secure || req.href.protocol === 'https:') {
              res.setHeader('Set-Cookie', cookie.serialize(options.cookie.name, req.session.id, options.cookie));
            }
          }
          res.writeHead.apply(res, [].slice.call(arguments));
        };
        // proxy res.end() to save session
        var _end = res.end;
        res.end = function () {
          res.end = _end;
          var args = [].slice.call(arguments);
          if (!req.session) return res.end.apply(res, args);
          req.session.save(function (err) {
            if (err) return res.emit('error', err);
            res.end.apply(res, args);
          });
        };
        next();
      }
    });
  };
};
