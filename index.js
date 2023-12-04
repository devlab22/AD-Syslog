const mySyslog = require('./mySyslog');
const myAD = require('./myAD');


const pathSyslog = '192.168.178.94'
const portSyslog = 514

const createConnection = async () => {
    
    const pathAD = '192.168.178.94'
    const baseDN = 'DC=netsecurelab,DC=net'

    const ad = new myAD("slava", "!Meraki21", pathAD, baseDN)

    const auth = await ad.authenticate()

    if (auth === false) {
        console.log("authenticate faild")
        return false
    }
    console.log("authenticate success")
    var name = 'wWWHomePage'
    var value = ''

    value = await ad.readAttribute(name)
    console.log(name, '=>', value)
    // const adGroups = await ad.readAdGroups()
    //console.log(adGroups)

}

const processData = async () => {

    (async () => {

        try {
            await createConnection()
        }
        catch (err) {
            console.log(err.message)
        }

    })()

}

processData()

