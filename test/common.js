assert = require('assert');
request = require('request');
idgen = require('idgen');

testId = idgen();

basicTest = function (options) {
  return function () {
    var server, base, currentId;
    before(function (done) {
      var server = require('../example/basic')(options);
      server.listen(0, function () {
        base = 'http://localhost:' + server.address().port;
        done();
      });
    });
    it('has session, no cookie', function (done) {
      request({uri: base + '/session', json: true}, function (err, resp, body) {
        assert.ifError(err);
        assert.equal(resp.statusCode, 200);
        assert(!resp.headers['set-cookie']);
        assert(body.id);
        currentId = body.id;
        assert(body.created);
        done();
      });
    });
    it('sets session', function (done) {
      var vars = {a: 'ok', its: {working: true}, ok: 1};
      request({uri: base + '/session', method: 'post', json: true, body: vars}, function (err, resp, body) {
        assert.ifError(err);
        assert.equal(resp.statusCode, 200);
        assert(resp.headers['set-cookie']);
        assert.notEqual(body.id, currentId);
        currentId = body.id;
        done();
      });
    });
    it('is persistent', function (done) {
      request({uri: base + '/session', json: true}, function (err, resp, body) {
        assert.ifError(err);
        assert.equal(resp.statusCode, 200);
        assert(!resp.headers['set-cookie']);
        assert(body.id);
        assert.equal(body.id, currentId);
        assert(body.created);
        done();
      });
    });
    it("doesn't save on read", function (done) {
      request({uri: base + '/session', json: true}, function (err, resp, body) {
        assert.ifError(err);
        assert.equal(resp.statusCode, 200);
        assert(!resp.headers['set-cookie']);
        assert(body.id);
        assert.equal(body.id, currentId);
        assert.equal(body.rev, 1, 'no save unless there were changes');
        done();
      });
    });
    it('sets session', function (done) {
      var vars = {a: 'ok', its: {working: true}, ok: 1};
      request({uri: base + '/session', method: 'post', json: true, body: vars}, function (err, resp, body) {
        assert.ifError(err);
        assert.equal(resp.statusCode, 200);
        assert(!resp.headers['set-cookie']);
        assert.equal(body.id, currentId);
        done();
      });
    });
    it('is persistent', function (done) {
      request({uri: base + '/session', json: true}, function (err, resp, body) {
        assert.ifError(err);
        assert.equal(resp.statusCode, 200);
        assert(!resp.headers['set-cookie']);
        assert(body.id);
        assert.equal(body.id, currentId);
        assert.equal(body.a, 'ok');
        assert.deepEqual(body.its, {working: true});
        assert.strictEqual(body.ok, 1);
        done();
      });
    });
    it('alters', function (done) {
      var vars = {a: 'b', its: {working: true, yay: false}};
      request({uri: base + '/session', method: 'post', json: true, body: vars}, function (err, resp, body) {
        assert.ifError(err);
        assert.equal(resp.statusCode, 200);
        assert(!resp.headers['set-cookie']);
        assert.equal(body.id, currentId);
        assert.strictEqual(body.ok, 1);
        assert.strictEqual(body.a, 'b');
        assert.strictEqual(body.its.working, true);
        assert.strictEqual(body.its.yay, false);
        done();
      });
    });
    it('is persistent', function (done) {
      request({uri: base + '/session', json: true}, function (err, resp, body) {
        assert.ifError(err);
        assert.equal(resp.statusCode, 200);
        assert(!resp.headers['set-cookie']);
        assert(body.id);
        assert.equal(body.id, currentId);
        assert.strictEqual(body.ok, 1);
        assert.strictEqual(body.a, 'b');
        assert.strictEqual(body.its.working, true);
        assert.strictEqual(body.its.yay, false);
        done();
      });
    });
    it('destroys', function (done) {
      request({uri: base + '/session', method: 'delete'}, function (err, resp, body) {
        assert.ifError(err);
        assert.equal(resp.statusCode, 204);
        done();
      });
    });
    it('no new session on read', function (done) {
      request({uri: base + '/session', json: true}, function (err, resp, body) {
        assert.ifError(err);
        assert.equal(resp.statusCode, 200);
        assert(!resp.headers['set-cookie']);
        assert(body.id);
        assert.notEqual(body.id, currentId);
        currentId = body.id;
        assert.strictEqual(body.ok, undefined);
        assert.equal(body.rev, 0);
        done();
      });
    });
    it('sets session', function (done) {
      var vars = {a: 'ok', its: {working: true}, ok: 1};
      request({uri: base + '/session', method: 'post', json: true, body: vars}, function (err, resp, body) {
        assert.ifError(err);
        assert.equal(resp.statusCode, 200);
        assert(resp.headers['set-cookie']);
        assert.notEqual(body.id, currentId);
        currentId = body.id;
        done();
      });
    });
    it('is persistent', function (done) {
      request({uri: base + '/session', json: true}, function (err, resp, body) {
        assert.ifError(err);
        assert.equal(resp.statusCode, 200);
        assert(!resp.headers['set-cookie']);
        assert(body.id);
        assert.equal(body.id, currentId);
        assert.strictEqual(body.ok, 1);
        assert.strictEqual(body.a, 'ok');
        assert.strictEqual(body.its.working, true);
        assert.strictEqual(body.its.yay, undefined);
        done();
      });
    });
  };
};
