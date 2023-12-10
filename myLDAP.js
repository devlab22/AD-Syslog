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
        })
            .on('connectError', (err) => {
                console.log('Error in connect =>', JSON.stringify(err))
            })

        const myPromise = new Promise((resolve, reject) => {
            client.bind(this.username, this.password, (err) => {

                if (err) {
                    console.log(JSON.stringify(err))
                    reject(new Error(`LDAP bind error: ${err}`));
                }
                else {
                    //console.log('Authenticate Success')
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

    }

    async readAttribute(attributes) {

        const client = ldap.createClient({
            url: this.adServer,
            user: this.username,
            password: this.password
        })
            .on('connectError', (err) => {
                console.log('Error in connect =>', JSON.stringify(err))
            })

        const myPromise = new Promise((resolve, reject) => {
            client.bind(this.username, this.password, (err) => {

                if (err) {
                    console.log(JSON.stringify(err))
                    reject(new Error(`LDAP bind error: ${err}`));
                }
                else {
                    //console.log('Authenticate Success')

                    const opts = {
                        filter: `(cn=${this.username})`,
                        scope: 'sub',
                        attributes: [...attributes]
                    };

                    client.search(this.baseDN, opts, (err, res) => {

                        if (err) {
                            console.log('Error in search =>', JSON.stringify(err))
                            reject(new Error(err.message))
                        }
                        else {
                            res.on('searchRequest', (searchRequest) => {
                                //  console.log('searchRequest: ', searchRequest.messageId);
                            });
                            res.on('searchEntry', (entry) => {
                                // console.log('entry: ' + JSON.stringify(entry.pojo));
                                // console.log(entry.pojo)
                                resolve(entry.pojo)
                            });
                            res.on('searchReference', (referral) => {
                                // console.log('referral: ' + referral.uris.join());
                            });
                            res.on('error', (err) => {
                                console.error('error: ' + JSON.stringify(err));
                            });
                            res.on('end', (result) => {
                                // console.log('status: ' + result.status);
                            });
                        }

                    });


                }
            })
        })

        const value = await myPromise.then(
            (response) => {
                const result = {}
                response.attributes.forEach(element => {
                    result[element.type] = element.values[0]
                });
                return result;
            }
        )

        return value;
    }

    async readGroups() {

        const client = ldap.createClient({
            url: this.adServer,
            user: this.username,
            password: this.password
        })
            .on('connectError', (err) => {
                console.log('Error in connect =>', JSON.stringify(err))
            })

        const myPromise = new Promise((resolve, reject) => {
            client.bind(this.username, this.password, (err) => {

                if (err) {
                    //console.log(JSON.stringify(err))
                    reject(new Error(`LDAP bind error: ${err}`));
                }
                else {
                    //console.log('Authenticate Success')

                    const opts = {
                        filter: `(cn=${this.username})`,
                        scope: 'sub',
                        attributes: ['memberOf']
                    };

                    client.search(this.baseDN, opts, (err, res) => {

                        if (err) {
                            console.log('Error in search =>', JSON.stringify(err))
                            reject(new Error(err.message))
                        }
                        else {
                            res.on('searchRequest', (searchRequest) => {
                                //  console.log('searchRequest: ', searchRequest.messageId);
                            });
                            res.on('searchEntry', (entry) => {
                                // console.log('entry: ' + JSON.stringify(entry.pojo));
                                // console.log(entry.pojo)
                                resolve(entry.pojo)
                            });
                            res.on('searchReference', (referral) => {
                                // console.log('referral: ' + referral.uris.join());
                            });
                            res.on('error', (err) => {
                                console.error('error: ' + JSON.stringify(err));
                            });
                            res.on('end', (result) => {
                                // console.log('status: ' + result.status);
                            });
                        }

                    });


                }
            })
        })

        const value = await myPromise.then(
            (response) => {
                const result = []
                response.attributes.forEach(element => {
                    const tmp = this.convertMemberShip(element.values)
                    result.push(...tmp)
                });

                return result
            }
        )

        return value;

    }

    convertMemberShip(values = []) {

        const result = []
        values.forEach(value => {
            const tmp = value.split(',')
            result.push(tmp[0].slice(3))
        })

        return result
    }



}

module.exports = MyLDAP