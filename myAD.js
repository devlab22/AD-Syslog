const ActiveDirectory = require('activedirectory');

class MyAD {
    constructor(username, password, ADServer, BaseDN) {
        this.username = username;
        this.password = password;
        this.ADServer = `ldap://${ADServer}`;
        this.BaseDN = BaseDN;
    }

    getConfig() {

        return {
            url: this.ADServer,
            baseDN: this.BaseDN,
            username: this.username,
            password: this.password,
            attributes: {
                user: [],
                group: []
            }
        }
    }

    async authenticate() {

        const config = this.getConfig();
        const ad = new ActiveDirectory(config);
        const query = `${this.username}`

        let myPromise = new Promise((resolve, reject) => {
            ad.authenticate(query, this.password, function (err, auth) {

                if (err) {
                    console.log('ERROR: ' + JSON.stringify(err));
                    reject(err.name)
                    return;
                }

                if (auth) {
                    resolve(true);
                } else {
                    reject(false)
                }
            });


        });

        const value = await myPromise.then(
            function(response) {
                return response;
            },
            function(err) {
                console.log('error in promise authenticate', JSON.stringify(err))
                throw new Error(err.toString())
            }
        )

        if(!value){
            throw new Error('authenticate failed')
        }
        return value;
    }

    async readAttribute(name) {

        const config = this.getConfig();
        config.attributes.user.push(name)
        
        const ad = new ActiveDirectory(config);
        var query = `${this.username}`

        console.log(config)
        
        let myPromise = new Promise(function(resolve, reject) {
            ad.findUser(query, (err, user) => {

                if (err) {
                    console.log('ERROR: ' + JSON.stringify(err));
                    reject(err.name)
                    return;
                }

                if (user) {
                    console.log('resolve')
                    resolve(user);
                } else {
                    console.log('reject')
                    reject(`No Attribute ${name}`)
                }
            });


        });

        const value = await myPromise.then(
            (response) => {
                return response[name] || '';
            }/* ,
            (err) => {
                console.log('error in promise read attribute', JSON.stringify(err))
                return null;
            } */
        )

        return value;

    }

    async readADGroups() {

        const config = this.getConfig();
        config.attributes.group.push('cn')

        const ad = new ActiveDirectory(config);

        let myPromise = new Promise(function(resolve, reject) {
            ad.getGroupMembershipForUser(this.username, function (err, groups) {

                if (err) {
                    console.log('ERROR: ' + JSON.stringify(err));
                    reject('error')
                    return;
                }

                if (groups) {
                    resolve(groups);
                } else {
                    reject('groups not found')
                }
            });


        });

        const value = await myPromise.then(
            function(response) {
                const result = []
                if (Array.isArray(response)) {
                    response.forEach(element => result.push(element.cn))
                }
                return result;
            },
            function(err) {
                console.log('error in promise read groups', JSON.stringify(err))
                return [];
            }
        )

        return value;

    }
}

module.exports = MyAD;