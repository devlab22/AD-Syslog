const AD = require('activedirectory');

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
        const ad = new AD(config);

        let myPromise = new Promise((resolve, reject) => {
            ad.authenticate(this.username, this.password, function (err, auth) {

                if (err) {
                    console.log('ERROR: ' + JSON.stringify(err));
                    reject(err.name)
                    return;
                }

                if (auth) {
                    resolve('Authenticated!');
                } else {
                    reject('No Authenticated')
                }
            });


        });

        const auth = await myPromise.then((response) => {
            return true;
        }).catch(err => {
            console.log('error in promise', JSON.stringify(err))
            return false;
        })

        return auth;
    }

    async readAttribute(attribute) {

        const config = this.getConfig();
       
        config.attributes.user.push(attribute)

        const ad = new AD(config);
        const query = `cn=${this.username}`

        let myPromise = new Promise((resolve, reject) => {
            ad.findUser(query, function (err, user) {

                console.log('find user', user)

                if (err) {
                    console.log('ERROR: ' + JSON.stringify(err));
                    reject(err.name)
                    return;
                }

                if (user) {
                    resolve(user);
                } else {
                    reject(`User ${query} is not found`)
                }
            });


        });

        const value = await myPromise.then((response) => {
            return response;
        }).catch(err => {
            console.log('error in promise', JSON.stringify(err))
            return null;
        })

        return value;

    }

    async readAdGroups() {

        const config = this.getConfig();
        config.attributes.group.push('cn')

        const ad = new AD(config);
        const query = `cn=${this.username}`
        
        let myPromise = new Promise((resolve, reject) => {
            ad.getGroupMembershipForUser(query, function (err, groups) {

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

        const groups = await myPromise.then((response) => {
            return response;
        }).catch(err => {
            console.log('error in promise', JSON.stringify(err))
            return [];
        })

        return groups;
    }
}

module.exports = MyAD;