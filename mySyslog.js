const syslog = require('syslog-client');

class MySyslog{
    
    static Severety = syslog.Severity
    static Facility = syslog.Facility
    
    constructor(host, port=514){

        this.logger = syslog.createClient(host, {
            syslogHostname: '',
            transport: syslog.Transport.Udp,
            port: port
        });
    }

    sendLogg(message = 'info', options={}) {
        this.logger.log(message, options);
    }
}

module.exports = MySyslog;