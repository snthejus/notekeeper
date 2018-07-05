const { logger } = require('../utils/logger');
const { AppMain } = require('../main/app-main.js');

class NotepageManager {
    static getNotepage(notepageId) {
        let notepage = AppMain.instance.notespace.getNotepage(notepageId);
        let notepageData;

        if (notepage) {
            AppMain.instance.notespace.addRecentNotepage(notepage);

            notepageData = {
                'notepageId': notepage.notepageId,
                'title': notepage.title,
                'tags': notepage.tags,
                'source': notepage.source,
                'content': notepage.content
            };
        }

        return notepageData;
    }

    static createNotepage(parentNotepageId, notebookId) {
        let notepageId;

        let parentNotepage = AppMain.instance.notespace.getNotepage(parentNotepageId);
        if (parentNotepage) {
            notepageId = parentNotepage.createChildNotepage();

        } else {
            let notebook = AppMain.instance.notespace.getNotebook(notebookId);
            if (notebook) {
                notepageId = notebook.createChildNotepage();
            }
        }

        if (!notepageId) {
            throw 'Failed to create a new Notepage';
        }
        return notepageId;
    }

    static deleteNotepage(notepageId) {
        let notepage = AppMain.instance.notespace.getNotepage(notepageId);
        if (!notepage) {
            return false; // failure
        }

        if (notepage.parentNotepage) {
            return notepage.parentNotepage.deleteChildNotepage(notepage);
        } else {
            return notepage.notebook.deleteChildNotepage(notepage);
        }

    }

    static updateNotepage(notepageId, title, tags, source, content) {
        let notepage = AppMain.instance.notespace.getNotepage(notepageId);
        if (!notepage) {
            return false; // failure
        }

        notepage.title = title;
        notepage.tags = tags;
        notepage.source = source;

        // TODO Do not save the style information of iframe. As of now, the style information is ignored on-load anyways.
        const FACEBOOK_URL_REGEX = /<p[^>]*>(<span>)?https:\/\/www.facebook.com\/[^/]+\/videos\/([0-9]+)(<\/span>)?<\/p>/g;
        const YOUTUBE_URL_REGEX = /<p[^>]*>(<span>)?https?:\/\/www.youtube.com\/watch\?v=([-_a-zA-Z0-9]+)(<\/span>)?<\/p>/g;
        notepage.content = content.replace(YOUTUBE_URL_REGEX, '').replace(FACEBOOK_URL_REGEX, '');

        return notepage.writeToFile();
    }

    static setExpansionForNotepage(notepageId, expansionState) {
        let notepage = AppMain.instance.notespace.getNotepage(notepageId);
        if (!notepage) {
            return false; // failure
        }

        return notepage.setExpansionState(expansionState, false); // second param: isRecursive
    }

    static setExpansionForAllNotepages(notebookId, expansionState) {
        let notebook = AppMain.instance.notespace.getNotebook(notebookId);
        if (!notebook) {
            return false; // failure
        }

        for (let notepage of notebook.notepages) {
            if (!notepage.setExpansionState(expansionState, true)) { // second param: isRecursive
                return false;
            }
        }

        return true;
    }

    static getExploreNotepagesTreeviewData(notebookId) {
        let notebook = AppMain.instance.notespace.getNotebook(notebookId);
        if (!notebook) {
            return false; // failure
        }

        return notebook.getExploreNotepagesTreeviewData();
    }
}

module.exports = {
    NotepageManager
}
