module.exports = class User
{
    constructor(socketId, name = 'User', isOverlay = false)
    {
        this.id = socketId
        this.name = name
        this.isSelf = false
        this.isModerator = false
        this.isStreamer = false
        this.isOwner = false
        this.isOverlay = isOverlay
        this.audio = {
            volume: 100,
            overlayVolume: 100,
            level: 0,
            isMuted: false,
            freq: null,
            track: null,
            audioContext: null,
            audioSource: null,
            audioAnalyzer: null,
            audioGainNode: null,
            audioDestination: null,
        }
        this.video = {
            stream: null,
            track: null,
        }
        this.peer = null
    }
}