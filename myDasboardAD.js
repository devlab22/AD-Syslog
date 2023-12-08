
const myAD = require('./myAD')


class MyDashboartAD{

    constructor(username, password, adServer, baseDN){
        this.username = username
        this.password = password
        this.adServer = adServer
        this.baseDN   = baseDN
    }

    async authenticateAD(){

        const ad = new myAD(this.username, this.password, this.adServer, this.baseDN)
        const auth = await ad.authenticate()
        return auth
    }

    async readAttributeAD(name){

        const ad = new myAD(this.username, this.password, this.adServer, this.baseDN)

        const value = await ad.readAttribute(name)
        return value
    }

}

module.exports = MyDashboartAD;