const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const { generateMessage, generateLocation } = require('./utils/messages')
const {add, remove, getUser, getUsersRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket Connection')

    socket.on('join', (options, callback) => {
        const { error, user } = add({ id: socket.id, ...options})
        if (error) {
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message', generateMessage('Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined.`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('location', generateLocation(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = remove(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersRoom(user.room)
            })
        }

    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})