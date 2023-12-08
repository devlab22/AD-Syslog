const ldap = require('ldapjs')

class MyLDAP {
    constructor(username, password, adServer, baseDN) {
        this.username = username
        this.password = password
        this.adServer = adServer
        this.baseDN = baseDN
    }

    async authenticate() {

        const client = ldap.createClient({
            url: this.adServer
        });

        client.on('connectError', (err) => {
            console.log('Error in connect =>', JSON.stringify(err))
        })

        const query = `cn=${this.username},ou=people,${this.baseDN}`
        console.log(query)
        const myPromise = new Promise((resolve, reject) => {

            client.bind(query, this.password, (err) => {

                if (err) {
                    console.log(JSON.stringify(err))
                    reject(new Error(`LDAP bind error: ${err}`));
                }
                else {
                    console.log('Authenticate Success')
                    resolve(true);
                }
            })
        })

        const value = await myPromise.then(
            (response) => {
                return response;
            }
        )

        return value;

        /*
        const query = `CN=${this.username}`

        client.bind(query, this.password, (err) => {
            if (err) {
                console.log('Error in authenticate =>', JSON.stringify(err))
               
            }
            else {
                console.log('Authenticate Success')
            }
        }) */


    }

    async readAttribute(name) {

        const client = ldap.createClient({
            url: this.adServer,
            user: this.username,
            password: this.password
        });

        client.on('connectError', (err) => {
            console.log('Error in connect =>', JSON.stringify(err))
        })

       

        const opts = {
            filter: `(cn=${this.username})`,
            scope: 'sub',
            attributes: ['cn', name]
        };

        var query = `DC=netsecurelab,DC=net`
        client.search(query, opts, (err, res) => {

            if (err) {
                console.log('Error in search =>', JSON.stringify(err))
            }
            else {
                res.on('searchRequest', (searchRequest) => {
                    console.log('searchRequest: ', searchRequest.messageId);
                });
                res.on('searchEntry', (entry) => {
                    console.log('entry: ' + JSON.stringify(entry.pojo));
                });
                res.on('searchReference', (referral) => {
                    console.log('referral: ' + referral.uris.join());
                });
                res.on('error', (err) => {
                    console.error('error: ' + JSON.stringify(err));
                });
                res.on('end', (result) => {
                    console.log('status: ' + result.status);
                });
            }

        });
    }

}

module.exports = MyLDAP