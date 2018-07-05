const { logger } = require('./logger');

class StringUtils {
    static getTextFromHTML(html) {
        const HTML_TO_TEXT = /(<([^>]+)>)/ig;
        return html.replace(HTML_TO_TEXT, "");
    }
}

module.exports = {
    StringUtils
}
