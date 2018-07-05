const usernameLib = require('username');

const { logger } = require('../utils/logger');

class User {
    static getOSUsername() {
        // TODO handle error
        let os_username = usernameLib.sync();
        logger.info('Username retrieved from OS: ' + os_username);
        return os_username;
    }
}

module.exports = {
    User
}
