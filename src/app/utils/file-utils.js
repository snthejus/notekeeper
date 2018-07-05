const fs = require('fs');

const { AppPreferences } = require('../main/app-preferences');
const { logger } = require('./logger');

class FileUtils {
    static deleteNonEmptyDirectory(path) {
        // TODO check why AppMain.instance.preferences does not work
        let appPreferences = AppPreferences.loadPreferences();
        if (!path.startsWith(appPreferences.notespaceDirectory)) {
            logger.info("Cannot delete directory " + path + " . Reason for failure: Path is not within notespace directory.");
            return false;
        }

        if (!fs.existsSync(path)) {
            logger.info("Cannot delete directory " + path + " . Reason for failure: Path does not exist.");
            return false;
        }

        logger.info("Deleting non-empty directory " + path);
        fs.readdirSync(path).forEach(function (file, index) {
            let childPath = path + "/" + file;
            if (fs.lstatSync(childPath).isDirectory()) { // recursion
                FileUtils.deleteNonEmptyDirectory(childPath);
            } else { // delete file
                fs.unlinkSync(childPath);
            }
        });
        fs.rmdirSync(path);

        return true;
    }
}

module.exports = {
    FileUtils
}
