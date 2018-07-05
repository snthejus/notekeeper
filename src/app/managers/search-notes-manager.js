const { logger } = require('../utils/logger');
const { AppMain } = require('../main/app-main.js')

class SearchNotesManager {
    static getSearchNotesTreeviewData(searchText) {
        return AppMain.instance.notespace.getSearchNotesTreeviewData(searchText);
    }
}

module.exports = {
    SearchNotesManager
}
