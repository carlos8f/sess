var sess = require('../')
  , middler = require('middler')
  , expres = require('expres')

module.exports = function (options) {
  // a REST endpoint that interacts with session data
  var server = require('http').createServer();
  middler(server)
    .first(['post', 'put'], function bodyParser (req, res, next) {
      var buf = '';
      req.on('data', function (data) {
        buf += data;
      });
      req.once('end', function () {
        try {
          var body = JSON.parse(buf);
        }
        catch (e) {
          return next(e);
        }
        req.body = body;
        next();
      });
      req.resume();
    })
    .first(sess(options)) // here's the session middleware
    .first(expres.middleware)
    .get(['/', '/session'], function (req, res, next) {
      res.json(req.session);
    })
    .post('/session', function (req, res, next) {
      Object.keys(req.body).forEach(function (k) {
        if (k.match(/^id|rev|created|updated$/i) || req.session.__proto__[k]) return;
        req.session[k] = req.body[k];
      });
      res.json(req.session);
    })
    .delete('/session', function (req, res, next) {
      req.session.destroy(function (err) {
        if (err) return next(err);
        res.send(204);
      });
    })
    .last(function (req, res, next) {
      res.send(404);
    });
  return server;
};

if (!module.parent) {
  var server = module.exports();
  server.listen(3000, function () {
    console.log('server listening at http://localhost:3000/');
  });
}
