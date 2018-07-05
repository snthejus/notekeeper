const { logger } = require('../utils/logger');
const { AppMain } = require('../main/app-main.js')

class RecentNotesManager {
    static getRecentNotesTreeviewData() {
        return AppMain.instance.notespace.getRecentNotesTreeviewData();
    }
}

module.exports = {
    RecentNotesManager
}
