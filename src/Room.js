const Helper = require('./Helper')

module.exports = class Room extends Helper
{
    constructor()
    {
        super()
        
        this.id = this.randomStr(50)
        this.users = new Map
        this.owner = null
        this.chat = []
        this.caps = {
            user: {
                userVolume: 100,
                overlayVolume: 100,
            },
            guest: {
                userVolume: 100,
                overlayVolume: 100,
            },
        }
    }
}