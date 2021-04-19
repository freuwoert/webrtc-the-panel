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
        this.audio = {
            volume: 100,
            overlayVolume: 100,
            level: 0,
            isMuted: false,
            freq: null,
            audioContext: null,
            audioSource: null,
            audioAnalyzer: null,
            audioGainNode: null,
            audioDestination: null,
        }
        this.peer = null
    }
}