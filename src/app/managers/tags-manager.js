const { logger } = require('../utils/logger');
const { AppMain } = require('../main/app-main.js')

class TagsManager {
    static getExploreTagsTreeviewData() {
        return AppMain.instance.notespace.getExploreTagsTreeviewData();
    }
}

module.exports = {
    TagsManager
}
