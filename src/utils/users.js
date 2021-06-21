const users = []

const add = ({ id, username, room }) => {
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    const existing = users.find((user) => {
        return user.room === room && user.username === username
    })
    if(existing) {
        return {
            error: 'Username is already in use'
        }
    }

    const user = { id, username, room }
    users.push(user)
    return { user }
}

const remove = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index != -1) {
        return users.splice(index, 1)[0]
    }

}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersRoom = (room) => {
    return users.filter((user) => user.room === room)
}

module.exports = {
    add,
    remove,
    getUsersRoom,
    getUser
}
