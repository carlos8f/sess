var client = require('redis').createClient()
  , middler = require('middler')
  , server = require('http').createServer()

// create a modeler-redis collection for sessions
var sessions = require('sosa_redis')({
  client: client,
  prefix: 'myapp'
})('sessions');

// pass that to sosa_session
var sosa_session = require('../')({
  sessions: sessions
});

// use as middleware
middler(server)
  .add(sosa_session)
  .add(function (req, res, next) {
    // req.session now available
    // also req.sessionID
  })
