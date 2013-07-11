describe('basic test', function () {
  var server, port;
  before(function (done) {
    server = require('http').createServer();
    middler(server)
      .first(expres.middleware)
      .first(['post', 'put'], function bodyParser (req, res, next) {
        var buf = '';
        res.on('data', function (data) {
          buf += data;
        });
        res.once('end', function () {
          try {
            var body = JSON.parse(buf);
          }
          catch (e) {
            return next(e);
          }
          req.body = body;
          next();
        });
      })
      .first(sess())
      .post('/session', function (req, res, next) {
        Object.keys(req.body).forEach(function (k) {
          req.session[k] = req.body[k];
        });
        res.json(req.session);
      })
      .get('/session', function (req, res, next) {
        res.json(req.session);
      })
      .delete('/session', function (req, res, next) {
        req.session.destroy(function (err) {
          if (err) return next(err);
          res.send(201);
        });
      })
      .last(function (req, res, next) {
        res.send(404);
      });

    server.listen(0, function () {
      port = server.address().port;
      done();
    });
  });
  it('has session', function (done) {
    request({uri: 'http://localhost:' + port + '/session', json: true}, function (err, resp, body) {
      if (err) return done(err);
      assert.equal(resp.statusCode, 200);
      assert(body.id);
      assert(body.created);
      done();
    });
  });
});