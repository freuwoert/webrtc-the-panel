module.exports = class User
{
    constructor(socketId, name = 'User')
    {
        this.id = socketId
        this.name = name
        this.isSelf = false
        this.isModerator = false
        this.isStreamer = false
        this.isOwner = false
        this.volume = 100
        this.overlayVolume = 100
        this.level = 0
        this.freq = null
        this.peer = null
    }
}