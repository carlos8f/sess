describe('secure', function () {
  var server, base, currentId;
  before(function (done) {
    var server = require('../example/basic')({
      cookie: {secure: true}
    });
    server.listen(0, function () {
      base = 'http://localhost:' + server.address().port;
      done();
    });
  });
  it('no unsecure cookie', function (done) {
    var vars = {a: 'ok', its: {working: true}, ok: 1};
    request({uri: base + '/session', method: 'post', json: true, body: vars}, function (err, resp, body) {
      assert.ifError(err);
      assert.equal(resp.statusCode, 200);
      assert(!resp.headers['set-cookie']);
      done();
    });
  });
  it('secure cookie', function (done) {
    var vars = {a: 'ok', its: {working: true}, ok: 1};
    request({uri: base + '/session', method: 'post', json: true, body: vars, headers: {'X-Forwarded-Proto': 'https'}}, function (err, resp, body) {
      assert.ifError(err);
      assert.equal(resp.statusCode, 200);
      assert(resp.headers['set-cookie']);
      done();
    });
  });
});
