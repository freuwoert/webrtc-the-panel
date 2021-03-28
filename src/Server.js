const express = require('express')
const socketIO = require('socket.io')
const path = require('path')
const {createServer} = require('http')
const Room = require('./Room.js')
const User = require('./User.js')

module.exports = class Server {
    constructor(port) {
        this.overlayDict = new Map
        this.roomDict = new Map
        this.port = port
        this.overlayDict.set('test_overlay_id_1', null)
        this.overlayDict.set('test_overlay_id_2', null)
        this.overlayDict.set('test_overlay_id_3', null)
        this.initialize()
    }

    initialize() {
        this.app = express()
        this.httpServer = createServer(this.app)
        this.io = socketIO(this.httpServer, {
            cors: {
                origin: "http://localhost:8080",
                methods: ["GET", "POST"]
            }
        })

        this.configureApp()
        this.handleRoutes()
        this.handleSocketConnection()
    }

    handleRoutes() {
        // this.app.get('/', (req, res) => {
        //     res.send(`<h1>Hello World</h1>`)
        // })
        this.app.all("*", (_req, res) => {
            try {
                res.sendFile('./vue/dist/index.html')
            } catch (error) {
                res.json({ success: false, message: "Something went wrong" })
            }
        })
    }

    handleSocketConnection() {
        this.io.on('connection', socket => {
            socket.emit('client.sync', {
                overlays: Array.from(this.overlayDict.keys())
            })

            socket.on('create.room', data => {
                
                let room = new Room()
                room.users.push(new User(socket.id, data.name))
                room.owner = socket.id

                this.roomDict.set(room.id, room)
                this.overlayDict.set(data.id, room.id)

                socket.join(room.id)

                socket.emit('room.join', {
                    users: room.users.map(e => e.id)
                })

                this.io.to(room.id).emit('room.sync', {
                    room,
                })
            })

            socket.on('join.room', data => {
                let room = this.roomDict.get(data.id)

                room.users.push(new User(socket.id, data.name))

                socket.join(room.id)

                socket.emit('room.join', {
                    users: room.users.map(e => e.id)
                })

                this.io.to(room.id).emit('room.sync', {
                    room,
                })
            })

            socket.on('server.check.room-id', data => {
                let room = this.roomDict.get(data.id)

                socket.emit('server.checked.room-id', {
                    room: room || null,
                    roomExists: room ? true : false,
                })
            })
            


            socket.on('join-request-offer', data => {
                socket.to(data.to).emit('join-request-offer', {
                    offer: data.offer,
                    from: socket.id,
                })
            })

            socket.on('join-request-answer', data => {
                socket.to(data.to).emit('join-request-answer', {
                    answer: data.answer,
                    from: socket.id,
                })
            })

            socket.on('disconnect', () => {
                // socket.broadcast.emit('remove-overlay', {
                //     socketId: socket.id
                // })
            })
        })
    }

    configureApp() {
        this.app.use(express.static('./vue/dist'))
    }

    listen() {
        this.httpServer.listen(this.port)
    }
}