const mySyslog = require('./mySyslog');
const myAD = require('./myAD');
const express = require('express');
const path = require('path');
const helmet = require("helmet");
const cookieparser = require("cookie-parser");
const cors = require('cors');
const bodyParser = require('body-parser');
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
const pathAD = '192.168.143.245'
const baseDN = 'DC=netsecurelab,DC=net'

app.get("/", (req, res) => {
    res.json({ body: req.body, query: req.query, params: req.params, "root": "Home" });
})

app.get("/ad", (req, res) => {

    const result = {
       // body: req.body,
       // query: req.query,
       // params: req.params,
        root: "AD",
        auth: false,
        attribute: {},
        groups: []
    }

    const name = req.query.name || 'wWWHomePage'
    const username = req.query.username || null
    const password = req.query.password || null

    try {
        (async () => {

            try {

                if (username && password) {
                    const response = await createConnection(username, password, name, true)
                    result.auth = response.auth
                    result.attribute[response.attribute.name] = response.attribute.value
                    result.groups = response.groups
                    
                }

                res.json(result)
            }
            catch (err) {
                result.code = 401;
                result.message = err.message;
                res.json(result);
            }

        })()

    }
    catch (err) {
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

    const auth = await ad.authenticate()

    if (!auth) {
        console.log("authenticate faild")
        response.message = "authenticate faild"
        response.auth = false
        return response
    }
    console.log("authenticate success")

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



