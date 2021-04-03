module.exports = class User
{
    constructor(socketId, name = 'User')
    {
        this.id = socketId
        this.name = name
        this.volume = 100
        this.overlayVolume = 100
        this.isModerator = false
        this.isStreamer = false
        this.isOwner = false
    }
}