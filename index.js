const Server = require('./src/Server')

const port = 5000
const server = new Server(port)

server.listen(port)
console.log('Listening on port: ' + port)