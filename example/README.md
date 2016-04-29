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
  "rev": 1,
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
  "rev": 2,
  "mykey": "myvalue"
}

// curl -X DELETE -H 'Cookie: sess=NM53IkH8lbzfUfVLKr7sz9n6knRlUqjz' localhost:3000/session

< HTTP/1.1 204 No Content
< Date: Thu, 11 Jul 2013 20:54:51 GMT
< Connection: keep-alive
```
