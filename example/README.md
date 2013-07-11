# sess examples

## REST endpoint (basic example)

```
$ node example/basic.js
server listening at http://localhost:3000/

then try:

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
```
