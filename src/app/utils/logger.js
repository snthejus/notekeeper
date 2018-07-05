const log4js = require('log4js');

const { ProcessUtils } = require('./process-utils');

log4js.configure({
    appenders: {
        out: { type: 'console' }, // might have to replace 'console' with 'stdout'
        app: { type: 'file', filename: ProcessUtils.getCWD() + '/notekeeper.log' }
    },
    categories: {
        'default': { appenders: ['app'], level: 'debug' },
        'dev': { appenders: ['out'], level: 'debug' },
        'dev_default': { appenders: ['app', 'out'], level: 'debug' }
    }
});

const logger = log4js.getLogger('default');
logger.level = 'debug';

module.exports = {
    logger
}
