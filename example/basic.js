var sess = require('../')
  , middler = require('middler')
  , server = require('http').createServer()
  , expres = require('expres')

// a REST endpoint that interacts with session data
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
  .first(sess())
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

module.exports = server;

if (!module.parent) {
  server.listen(3000, function () {
    console.log('server listening at http://localhost:3000/');
  });
}

/*

curl localhost:3000

< HTTP/1.1 200 OK
< Content-Type: application/json; charset=utf-8
< Content-Length: 99
< Set-Cookie: sess=NM53IkH8lbzfUfVLKr7sz9n6knRlUqjz; HttpOnly
< Date: Thu, 11 Jul 2013 20:46:09 GMT
< Connection: keep-alive

{
  "id": "NM53IkH8lbzfUfVLKr7sz9n6knRlUqjz",
  "created": "2013-07-11T20:46:14.385Z",
  "rev": 0
}

curl -X POST -H 'Cookie: sess=NM53IkH8lbzfUfVLKr7sz9n6knRlUqjz' -d '{"mykey":"myvalue"}' localhost:3000/session

< HTTP/1.1 200 OK
< Content-Type: application/json; charset=utf-8
< Content-Length: 162
< Date: Thu, 11 Jul 2013 20:48:25 GMT
< Connection: keep-alive

{
  "id": "NM53IkH8lbzfUfVLKr7sz9n6knRlUqjz",
  "created": "2013-07-11T20:46:09.367Z",
  "rev": 1,
  "updated": "2013-07-11T20:48:12.366Z",
  "mykey": "myvalue"
}

curl -H 'Cookie: sess=NM53IkH8lbzfUfVLKr7sz9n6knRlUqjz' localhost:3000

< HTTP/1.1 200 OK
< Content-Type: application/json; charset=utf-8
< Content-Length: 162
< Date: Thu, 11 Jul 2013 20:50:25 GMT
< Connection: keep-alive

{
  "id": "NM53IkH8lbzfUfVLKr7sz9n6knRlUqjz",
  "created": "2013-07-11T20:46:09.367Z",
  "rev": 2,
  "updated": "2013-07-11T20:48:25.518Z",
  "mykey": "myvalue"
}

// curl -X DELETE -H 'Cookie: sess=NM53IkH8lbzfUfVLKr7sz9n6knRlUqjz' localhost:3000/session

< HTTP/1.1 204 No Content
< Date: Thu, 11 Jul 2013 20:54:51 GMT
< Connection: keep-alive

*/
