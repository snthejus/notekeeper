const fs = require('fs');
const { URL } = require('url');
const { dialog } = require('electron');

const { ProcessUtils } = require('../utils/process-utils');
const { Constants } = require('../utils/constants');
const { logger } = require('../utils/logger');

class AppPreferences {
    static loadPreferences() {
        let appPreferences;

        if (!AppPreferences.doesPreferencesFileExist()) {
            let notespaceDirectoryPath = dialog.showOpenDialog({ properties: ['openDirectory'] });

            if (notespaceDirectoryPath) {
                appPreferences = new AppPreferences();
                appPreferences.notespaceDirectory = notespaceDirectoryPath[0];

                AppPreferences.writeToFile(appPreferences);

            } else {
                logger.error('Failed to load App preferences. User has not selected an empty notespace directory.');
                throw 'You need to select an empty notespace directory';
            }

        } else {
            appPreferences = AppPreferences.readFromFile();
        }

        return appPreferences;
    }

    constructor() {

    }

    static doesPreferencesFileExist() {
        return fs.existsSync(AppPreferences.getPreferencesFilepath());
    }

    static getPreferencesFilepath() {
        return ProcessUtils.getCWD() + '/notekeeper.config';
    }

    static readFromFile() {
        let fileURL = new URL('file:' + AppPreferences.getPreferencesFilepath());

        // TODO Handle IO Error
        let metadataStr = fs.readFileSync(fileURL, 'utf8');
        let metadata = JSON.parse(metadataStr);

        if (metadata.app_data_version !== Constants.APP_DATA_VERSION) {
            throw 'App version ' + Constants.APP_DATA_VERSION + ' is different from Notekeeper.config version ' + metadata.app_data_version;
        }

        let appPreferences = new AppPreferences();
        appPreferences.notespaceDirectory = metadata.notespace_directory;

        logger.info("Succesfully read Notekeeper.config from file " + AppPreferences.getPreferencesFilepath());
        return appPreferences;
    }

    static writeToFile(appPreferences) {
        let metadata = {
            'app_data_version': Constants.APP_DATA_VERSION,
            'notespace_directory': appPreferences.notespaceDirectory
        }
        let metadataStr = JSON.stringify(metadata);

        // TODO Handle IO Error
        fs.writeFileSync(AppPreferences.getPreferencesFilepath(), metadataStr, 'utf8');
        logger.info("Succesfully saved Notekeeper.config to file " + AppPreferences.getPreferencesFilepath());
        return true;
    }
}

module.exports = {
    AppPreferences
}
