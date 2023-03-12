var express = require('express');
const http = require('http');
const fs = require('fs');
var cors = require('cors');
var app = express();
// const server = http.createServer((req, res) => {
//   res.writeHead(200, { 'content-type': 'text/html' })
//   fs.createReadStream('auto_index.html').pipe(res)
// });

// server.listen(process.env.PORT || 3000);

app.use(cors({ origin: 'https://bmxf17dhzg.execute-api.ap-northeast-1.amazonaws.com', credentials :  true }));
app.use(cors({ origin: 'https://s3.ap-northeast-2.amazonaws.com', credentials :  true }));
app.use(express.static('.'));

// app.get('*', function (req, res, next) {
//   res.json({msg: 'This is CORS-enabled for all origins!'})
// })

app.listen(3000, function () {
  console.log('CORS-enabled web server listening on port 80')
})