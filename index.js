const mySyslog = require('./mySyslog');
const myAD = require('./myAD');
const express = require('express');
const path = require('path');
const helmet = require("helmet");
const cookieparser = require("cookie-parser");
const cors = require('cors');
const bodyParser = require('body-parser');
const MyLDAP = require('./myLDAP')
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

const PORT = 5000;
const HOST = 'localhost'
var pathAD = 'ldaps://192.168.143.213'
//pathAD = 'ldap://192.168.178.95'
pathAD = 'ldap://192.168.143.245'
const baseDN = 'DC=netsecurelab,DC=net'

app.get("/", (req, res) => {
    res.json({ body: req.body, query: req.query, params: req.params, "root": "Home" });
})

app.get("/ad", (req, res) => {

    const username = req.query.username || null
    const password = req.query.password || null
    const process = req.query.process || 'ldap'


    const result = {
        // body: req.body,
        // query: req.query,
        // params: req.params,
        root: "",
        user: username,
        auth: false,
        attributes: {},
        groups: [],
        message: '',
        status: 200
    }

    const attributes = []
    attributes.push('wWWHomePage')
    attributes.push('mail')

    try {
        (async () => {

            try {
                var response = {}
                if (username && password) {

                    if (process === 'ad') {
                        result.root = 'AD'
                        response = await createConnection(username, password, attributes, true)
                        result.auth = response.auth
                        result.message = response.message
                        result.attributes = response.attribute
                        result.groups = response.groups
                    }
                    else {
                        result.root = 'LDAP'
                        response = await createLDAPConnection(username, password, attributes, true)
                        result.auth = response.auth
                        result.message = response.message
                        result.attributes = response.attributes
                        result.groups = response.groups
                    }

                }

                res.json(result)
            }
            catch (err) {
                console.log('ERROR =>', err.message)
                result.status = 401;
                result.message = err.message;
                res.json(result);
            }

        })()

    }
    catch (err) {
        console.log('base error', err)
        result.status = 403;
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

const createConnection = async (username, password, attributes = [], groups = false) => {

    console.log('create connection AD')
    const response = {
        auth: false,
        groups: [],
        message: '',
        attribute: { name: '', value: '' },
        attributes: []
    }
    const ad = new myAD(username, password, pathAD, baseDN)
    const logger = new mySyslog(pathAD, 514)

    response.auth = await ad.authenticate()

    if (!response.auth) {
       // response.message = "authenticate faild"
        console.log(response.message)
        logger.sendLogg(`${username} ${response.message}`)
        return response
    }

    response.message = "authenticate success"
    logger.sendLogg(`${username} ${response.message}`)
   // console.log(response.message)

    if (attributes.length > 0) {
        const value = await ad.readAttribute(attributes)
        response.attribute = value
    }

    if (groups) {
        const adGroups = await ad.readADGroups()
        response.groups = adGroups
    }

    return response
}

async function createLDAPConnection(username, password, attributes = [], groups = false) {

    console.log('create connection LDAP')
    const response = {
        auth: false,
        attributes: {},
        message: 'authenticate failed'
    }
    const ldap = new MyLDAP(username, password, pathAD, baseDN);

    response.auth = await ldap.authenticate()

    if (!response.auth) {
        return response
    }
    response.message = 'authenticate success'
    
    if(attributes.length > 0){
        response.attributes = await ldap.readAttribute(attributes)
    }

    if(groups){
        response.groups = await ldap.readGroups()
    }

    return response
}




