const { logger } = require('./logger');

class StringUtils {
    static getContentTextFromHTML(html) {
        const HTML_TO_TEXT_REGEX = /(<([^>]+)>)/ig;
        return html.replace(HTML_TO_TEXT_REGEX, "");
    }

    static getHyperlinkTextFromHTML(html) {
        const LINK_EXTRACTION_REGEX = /href=['"]([^\s"']+)['"]/ig;
        let links = html.match(LINK_EXTRACTION_REGEX, "")
        if(links) {
            return links.toString();
        } else {
            return "";
        }
    }
}

module.exports = {
    StringUtils
}
