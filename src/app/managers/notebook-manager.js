const { logger } = require('../utils/logger');
const { AppMain } = require('../main/app-main')

class NotebookManager {
    static getNotebook(notebookId) {
        let notebook = AppMain.instance.notespace.getNotebook(notebookId);
        let notebookData;

        if (notebook) {
            notebookData = {
                'notebookId': notebook.notebookId,
                'title': notebook.title,
                'tags': notebook.tags,
                'source': notebook.source
            };
        }

        return notebookData;
    }

    static createNotebook(parentNotebookId) {
        let notebookId;

        let parentNotebook = AppMain.instance.notespace.getNotebook(parentNotebookId);
        if (parentNotebook) {
            notebookId = parentNotebook.createChildNotebook();
        } else {
            notebookId = AppMain.instance.notespace.createRootNotebook();
        }

        if (!notebookId) {
            throw 'Failed to create a new Notepage';
        }
        return notebookId;
    }

    static deleteNotebook(notebookId) {
        let notebook = AppMain.instance.notespace.getNotebook(notebookId);
        if (!notebook) {
            return false; // failure
        }

        if (notebook.parentNotebook) {
            return notebook.parentNotebook.deleteChildNotebook(notebook);
        } else {
            return notebook.notespace.deleteRootNotebook(notebook);
        }
    }

    static updateNotebook(notebookId, title, tags, source) {
        let notebook = AppMain.instance.notespace.getNotebook(notebookId);
        if (!notebook) {
            return false; // failure
        }

        notebook.title = title;
        notebook.tags = tags;
        notebook.source = source;

        return notebook.writeToFile();
    }

    static setExpansionForNotebook(notebookId, expansionState) {
        let notebook = AppMain.instance.notespace.getNotebook(notebookId);
        if (!notebook) {
            return false; // failure
        }

        return notebook.setExpansionState(expansionState, false); // second param: isRecursive
    }

    static setExpansionForAllNotebooks(expansionState) {
        for (let notebook of AppMain.instance.notespace.rootNotebooks) {
            if (!notebook.setExpansionState(expansionState, true)) { // second param: isRecursive
                return false;
            }
        }

        return true;
    }

    static getExploreNotebooksTreeviewData() {
        return AppMain.instance.notespace.getExploreNotebooksTreeviewData();
    }
}

module.exports = {
    NotebookManager
}
