const mySyslog = require('./mySyslog');
const myAD = require('./myAD');
const express = require('express');
const path = require('path');
const helmet = require("helmet");
const cookieparser = require("cookie-parser");
const cors = require('cors');
const bodyParser = require('body-parser');
const MyLDAP = require('./myLDAP')
const MyDashboartAD = require('./myDasboardAD')
//const fs = require('fs');
//const dirname = process.cwd();




const app = express()

app.use(helmet());
app.use(cookieparser());
//app.use(express.static(path.join(dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));

var corsOptions = {
    "origin": "*",
    "Access-Control-Request-Method": "POST,GET,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "X-Requested-With,Content-Type",
    "optionsSuccessStatus": 200
};

app.use(cors(corsOptions))

const PORT = 8080;
const HOST = 'localhost'
var pathAD = '192.168.143.213'
pathAD = '192.168.178.94'
const baseDN = 'DC=netsecurelab,DC=net'

app.get("/", (req, res) => {
    res.json({ body: req.body, query: req.query, params: req.params, "root": "Home" });
})

app.get("/ad", (req, res) => {

    const name = req.query.name || 'wWWHomePage'
    const username = req.query.username || null
    const password = req.query.password || null

    const result = {
       // body: req.body,
       // query: req.query,
       // params: req.params,
        root: "",
        user: username,
        auth: false,
        attribute: {},
        groups: [],
        message: ''
    }

    result.attribute[name] = null

    try {
        (async () => {

            try {
                var response = {}
                if (username && password) {
                   /*  result.root = 'AD'
                    response = await createConnection(username, password, name, true)                   
                    result.auth = response.auth
                    result.message = response.message
                    result.attribute[response.attribute.name] = response.attribute.value
                    result.groups = response.groups */

                    result.root = 'LDAP'
                    response = await createLDAPConnection(username, password, name, true)                   
                    result.auth = response.auth
                    result.message = response.message

                   /*  result.root = 'DB'

                    const db = new MyDashboartAD(username, password, pathAD, baseDN)
                    result.auth = await db.authenticateAD()
                    const value = await db.readAttributeAD(name) */
                    
                    
                    
                }

                res.json(result)
            }
            catch (err) {
                console.log('ERROR =>', err.message)
                result.code = 401;
                result.message = err.message;
                res.json(result);
            }

        })()

    }
    catch (err) {
        console.log('base error', err)
        result.code = 403;
        result.message = err.message;
        res.json(result);
    }

})


app.listen(PORT, HOST, () => {
    console.log(`Server listening on ${HOST}:${PORT}`);
});

const sendLogg = () => {

    const myLog = new mySyslog(path, 514)
    myLog.sendLogg('hallo world')
}

const createConnection = async (username, password, name = null, groups = false) => {

    const response = {
        auth: false,
        groups: [],
        message: '',
        attribute: { name: '', value: ''}
    }
    const ad = new myAD(username, password, pathAD, baseDN)
    const logger = new mySyslog(pathAD, 514)

    response.auth = await ad.authenticate()
    
    if (!response.auth) {
        response.message = "authenticate faild"
        console.log(response.message)        
        logger.sendLogg(`${username} ${response.message}`)
        return response
    }
    
    response.message = "authenticate success"
    logger.sendLogg(`${username} ${response.message}`)
    console.log(response.message)

    if (name) {
        const value = await ad.readAttribute(name)
        console.log(name, '=>', value)
        response.attribute.name = name
        response.attribute.value = value
    }

    if (groups) {
        const adGroups = await ad.readADGroups()
        console.log(adGroups)
        response.groups = adGroups
    }

    return response
}

 async function createLDAPConnection(username, password, name=null, groups=false){

    const response = {
          auth: false,
          message: ''
    }
    const ldap = new MyLDAP(username, password, pathAD, baseDN);

   // await ldap.readAttribute('mail')
    response.auth = await ldap.authenticate()
    
    if(!response.auth){
        response.message = 'authenticate failed'
        return response
    }
}




