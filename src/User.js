module.exports = class User
{
    constructor(socketId, name = 'User')
    {
        this.id = socketId
        this.name = name
    }
}