sess
====

connect/express-style session middleware for apps that don't use connect/express

[![build status](https://secure.travis-ci.org/carlos8f/sess.png)](http://travis-ci.org/carlos8f/sess)

## Pluggable storage

`sess` uses a memory store out of the box. It has limitations:

- not persistent through web server restarts
- if you run multiple web servers, each server will have its own set of sessions
(which might be fine if you have "sticky" sessions configured on your load balancer)

However pluggable storage is supported through [modeler](https://github.com/carlos8f/modeler)
so you might want to use that for production. See example below for using redis
as a store.

## Simple example with [middler](https://github.com/carlos8f/node-middler)

```js
var middler = require('middler')
  , server = require('http').createServer()
  , sess = require('sess')

middler(server)
  .add(sess())
  .add(function (req, res, next) {
    // req.session now available
    // also req.sessionID
  })
```

## Options

`sess()` can be passed these options:

- `key` (String, default: `sess`) - cookie name (can also be passed as `options.cookie.name`)
- `cookie` (Object, default: `{httpOnly: true, path: '/'}`) - options to pass to
  [cookie](https://npmjs.org/package/cookie), and additionally supported are:
      - `alwaysSet` (Boolean, default: `false`) - always issue `Set-Cookie` header
- `sessions` ([modeler](https://github.com/carlos8f/modeler) collection, default: memory store) -
  pass a modeler collection to achieve persistence or clustering (see redis example
  below)

## connect/express compatibility

`req.session` with `sess` acts pretty much like it does in connect/express.
It may even be compatible with some middleware that expects `connect.session` in
the middleware stack. _Disclaimer: I haven't tested the compatibility very thoroughly._

## Using redis as a store

`sess` uses a [modeler](https://github.com/carlos8f/modeler) collection to store
sessions, which can be passed with `options.sessions`. Any modeler store, such
as [modeler-redis](https://github.com/carlos8f/modeler-redis) can be used to
store sessions:

```js
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
```

- - -

### Developed by [Terra Eclipse](http://www.terraeclipse.com)
Terra Eclipse, Inc. is a nationally recognized political technology and
strategy firm located in Aptos, CA and Washington, D.C.

- - -

### License: MIT

- Copyright (C) 2013 Carlos Rodriguez (http://s8f.org/)
- Copyright (C) 2013 Terra Eclipse, Inc. (http://www.terraeclipse.com/)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
