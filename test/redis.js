var sosa_redis = require('sosa_redis')
  , client = require('redis').createClient()

var sessions = sosa_redis({
  prefix: testId,
  client: client
})('sessions');

describe('redis test', basicTest({
  sessions: sessions
}));
