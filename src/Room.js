const Helper = require('./Helper')

module.exports = class Room extends Helper
{
    constructor()
    {
        super()
        
        this.id = this.randomStr(50)
        this.users = []
        this.owner = null
        this.moderators = []
    }
}