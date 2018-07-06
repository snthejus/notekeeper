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
            let notespaceDirectory = null;
            // cannot proceed without a valid preference file
            while (!notespaceDirectory) {
                notespaceDirectory = AppPreferences.selectNotespaceDirectory();
            }

            appPreferences = new AppPreferences();
            appPreferences.notespaceDirectory = notespaceDirectory;
            AppPreferences.writeToFile(appPreferences);

        } else {
            appPreferences = AppPreferences.readFromFile();
        }

        return appPreferences;
    }

    static selectNotespaceDirectory() {
        let notespaceDirectory = null;
        let notespaceDirectoryPath = dialog.showOpenDialog({
            title: 'Open an existing Notespace (or) Select an empty directory to create a new Notespace',
            // MacOS - Message to display above input boxes
            message: 'Open an existing Notespace (or) Select an empty directory to create a new Notespace',
            // Contains which features the dialog should use
            properties: [
                'openDirectory', // Open existing directory
                'createDirectory' // MacOS - Allow creating new directories from dialog
            ]
        });

        if (notespaceDirectoryPath && notespaceDirectoryPath[0]) {
            notespaceDirectory = notespaceDirectoryPath[0];

            if (!fs.existsSync(notespaceDirectory) || !fs.lstatSync(notespaceDirectory).isDirectory()) {
                logger.info('In AppPreferences. Cannot find the directory. Failed to create new Notespace.');
                dialog.showErrorBox('Failed to create/load Notespace', 'Cannot find the directory ' + notespaceDirectory);
                notespaceDirectory = null;

            } else if (!fs.existsSync(notespaceDirectory + '/notespace.json') && // Notespace does not exist
                fs.readdirSync(notespaceDirectory).length > 0) { // Directory not empty
                logger.info('In AppPreferences. Cannot create new Notespace as the directory is not empty');
                dialog.showErrorBox('Failed to create Notespace', 'The directory ' + notespaceDirectory + ' is not empty');
                notespaceDirectory = null;
            }
        }

        return notespaceDirectory;
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
