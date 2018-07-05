const { logger } = require('../utils/logger');
const { Notespace } = require('../datanodes/notespace');
const { AppPreferences } = require('./app-preferences');

class AppMain {
    static initialize() {
        AppMain.instance = new AppMain();

        // To debug the unit-test failure
        // VideoURLParser.getVideoURL('https://www.youtube.com/watch?v=ZihEgF-sBvI', 'watch');
    }

    constructor() {
        this.preferences = AppPreferences.loadPreferences();
        this.notespace = new Notespace(this.preferences.notespaceDirectory);
    }
}

module.exports = {
    AppMain
}
