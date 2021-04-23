const express = require('express')
const socketIO = require('socket.io')
const path = require('path')
const {createServer} = require('http')
const Room = require('./Room.js')
const User = require('./User.js')
const Message = require('./Message.js')

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
        // Give the client all overlay-keys to cennect to
        // WARNING: in a release no overlay-keys should be exposed
        this.app.post('/overlay/get-available-keys', (req, res) => {
            res.json(Array.from(this.overlayDict.keys()))
        })

        this.app.post('/room/check', (req, res) => {
            let room = this.roomDict.get(req.body.id)

            res.json(room || null)
        })

        // Serves Vue
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
            socket.on('create.room', data => {
                let room = new Room()
                let user = new User(socket.id, data.name)

                user.isOwner = true
                user.isModerator = true

                room.users.set(socket.id, user)
                room.owner = socket.id

                this.roomDict.set(room.id, room)
                this.overlayDict.set(data.id, room.id)

                socket.join(room.id)

                socket.emit('room.self.joined', {
                    room: {...room, users: Array.from(room.users.values())},
                })
            })

            socket.on('join.room', data => {
                let room = this.roomDict.get(data.id)
                let user = new User(socket.id, data.name)

                room.users.set(socket.id, user)

                socket.join(room.id)

                socket.emit('room.self.joined', {
                    room: {...room, users: Array.from(room.users.values())},
                })

                socket.broadcast.to(room.id).emit('room.user.joined', {
                    user
                })
            })

            socket.on('room.user.set-volume', data => {
                let roomIds = this.getRoomIdsFromSocket(socket)

                for (const roomId of roomIds)
                {
                    let room = this.roomDict.get(roomId)
                    let user = room.users.get(data.userId)

                    user.audio.volume = data.volume

                    this.io.to(roomId).emit('room.user.set-volume', {
                        user: data.userId,
                        volume: data.volume,
                    })
                }
            })

            socket.on('room.user.set-mute', data => {
                let roomIds = this.getRoomIdsFromSocket(socket)

                for (const roomId of roomIds)
                {
                    let room = this.roomDict.get(roomId)
                    let user = room.users.get(data.userId)

                    user.audio.isMuted = data.isMuted

                    this.io.to(roomId).emit('room.user.set-mute', {
                        user: data.userId,
                        isMuted: data.isMuted,
                    })
                }
            })

            socket.on('room.message.send', data => {
                let roomIds = this.getRoomIdsFromSocket(socket)

                for (const roomId of roomIds)
                {
                    let room = this.roomDict.get(roomId)
                    let rawMessageText = data.message.trim()

                    if (!rawMessageText) return

                    let message = new Message(socket.id, rawMessageText, roomId)
                    
                    room.chat.push(message)

                    this.io.to(roomId).emit('room.message.sent', {
                        message
                    })
                }
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

            socket.on('peer.add.candidate', data => {
                socket.to(data.to).emit('peer.add.candidate', {
                    candidate: data.candidate,
                    from: socket.id,
                })
            })



            socket.on('disconnecting', () => {
                let roomIds = this.getRoomIdsFromSocket(socket)

                for (const roomId of roomIds)
                {
                    let room = this.roomDict.get(roomId)

                    room.users.delete(socket.id)

                    this.io.to(roomId).emit('room.user.left', {
                        userId: socket.id,
                    })

                    // Remove room if empty
                    if (room.users.size == 0)
                    {
                        let overlayDict = Array.from(this.overlayDict.entries())
                        
                        // returns array with exactly one entry containing an array with two entries
                        // (key and value from the original map)
                        let currentOverlayIdFromRoom = overlayDict.filter(e => e[1] === room.id)[0][0]
                        
                        this.overlayDict.set(currentOverlayIdFromRoom, null)

                        this.roomDict.delete(room.id)
                    }
                }
            })
        })
    }

    getRoomIdsFromSocket(socket) {
        let roomIds = Array.from(socket.rooms.values())
    
        // First item is always the socket id...
        // With a shift we get rid of it
        roomIds.shift()

        return roomIds
    }

    configureApp() {
        this.app.use(express.static('./vue/dist'))
        this.app.use(express.json())
    }

    listen() {
        this.httpServer.listen(this.port)
    }
}