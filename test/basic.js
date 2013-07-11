describe('basic test', function () {
  var server;
  before(function (done) {
    server = require('http').createServer();
    middler(server)
      .first(expres.middleware)
      .first(['post', 'put'], function bodyParser (req, res, next) {
        var form = new formidable.IncomingForm();
        try {
          form.parse(req, function (err, fields, files) {
            req.fields = req.body = fields;
            req.files = files;
            next(err);
          });
        }
        catch (e) {
          // formidable throws if there is no content-type. weird.
          if (e.message === 'bad content-type header, no content-type') {
            e = null;
          }
          next(e);
        }
      })
      .first(sess({
        collection: modeler()
      }))
      .post('/session', function (req, res, next) {
        req.session
      })
      .get('/session', function (req, res, next) {

      })
      .delete('/session', function (req, res, next) {

      })
  });
});