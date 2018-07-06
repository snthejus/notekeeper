const { dialog } = require('electron');

const { logger } = require('../utils/logger');
const { Notespace } = require('../datanodes/notespace');
const { AppPreferences } = require('./app-preferences');

class AppMain {
    static initialize() {
        try {
            AppMain.instance = new AppMain();
        } catch (e) {
            logger.error('In AppMain. Error while initializing AppMain.', e);
            dialog.showErrorBox('Failed to initialize', 'Please try restarting the app');
            throw e;
        }
    }

    constructor() {
        this.preferences = AppPreferences.loadPreferences();
        this.notespace = new Notespace(this.preferences.notespaceDirectory);
    }
}

module.exports = {
    AppMain
}
