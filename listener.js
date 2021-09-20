const http = require('http');
const url = require('url');
const port = 3000;

const requestHandler = (request, response) => {
    const queryObject = url.parse(request.url,true).query;
    console.log(queryObject.status);
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end('OK');
}

const server = http.createServer(requestHandler)
server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
})