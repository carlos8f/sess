var modeler = require('modeler-redis')
  , client = require('redis').createClient()

var sessions = modeler({
  name: 'sessions',
  prefix: testId + ':',
  client: client
});

describe('redis test', basicTest({
  sessions: sessions
}));
