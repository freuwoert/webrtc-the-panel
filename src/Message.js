module.exports = class User
{
    constructor(sender, message, receiver = null)
    {
        this.id = Math.random() + ''
        this.senderId = sender
        this.receiverId = receiver
        this.rawMessage = message
        this.receivedBy = []
        this.readBy = []
        this.timestamp = null
    }
}