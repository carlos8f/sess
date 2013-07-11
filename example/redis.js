var modeler = require('modeler-redis')
  , client = require('redis').createClient()
  , middler = require('middler')
  , server = require('http').createServer()

// create a modeler-redis collection for sessions
var sessions = modeler({
  name: 'sessions',
  prefix: 'myapp:',
  client: client
});

// pass that to sess
var sess = require('sess')({
  sessions: sessions
});

// use as middleware
middler(server)
  .add(sess)
  .add(function (req, res, next) {
    // req.session now available
    // also req.sessionID
  })
