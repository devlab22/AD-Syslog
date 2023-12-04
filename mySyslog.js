const syslog = require('syslog-client');

class MySyslog{

    constructor(host, port=514){

        this.logger = syslog.createClient(host, {
            syslogHostname: '',
            transport: syslog.Transport.Udp,
            port: port
        });
    }

    sendLogg(message = 'info') {
        this.logger.log(message);
    }
}

module.exports = MySyslog;