const { ipcRenderer } = require('electron')

class ServerManager {
    static initialize() {
        ServerManager.instance = new ServerManager();
    }

    constructor() {
        // nothing to-do
    }

    sendSync(functionName, functionArgs) {
        return ipcRenderer.sendSync(functionName, JSON.stringify(functionArgs));
    }

    /*
     * Notepage related APIs
     */

    getNotepage(notepageId) {
        return this.sendSync('get-notepage', {
            'notepageId': notepageId
        });
    }

    createNotepage(parentNotepageId, notebookId) {
        return this.sendSync('create-notepage', {
            'parentNotepageId': parentNotepageId,
            'notebookId': notebookId
        });
    }

    deleteNotepage(notepageId) {
        return this.sendSync('delete-notepage', {
            'notepageId': notepageId
        });
    }

    updateNotepage(notepageId, title, tags, source, content) {
        return this.sendSync('update-notepage', {
            'notepageId': notepageId,
            'title': title,
            'tags': tags,
            'source': source,
            'content': content
        });
    }

    setExpansionForNotepage(notepageId, expanded) {
        return this.sendSync('set-expansion-for-notepage', {
            'notepageId': notepageId,
            'expanded': expanded
        });
    }

    setExpansionForAllNotepages(notebookId, expanded) {
        return this.sendSync('set-expansion-for-all-notepages', {
            'notebookId': notebookId,
            'expanded': expanded
        });
    }

    getExploreNotepagesTreeviewData(notebookId) {
        return this.sendSync('get-explore-notepages-treeview-data', {
            'notebookId': notebookId
        });
    }

    /*
     * Notebook related APIs
     */

    getNotebook(notebookId) {
        return this.sendSync('get-notebook', {
            'notebookId': notebookId
        });
    }

    createNotebook(parentNotebookId) {
        return this.sendSync('create-notebook', {
            'parentNotebookId': parentNotebookId
        });
    }

    deleteNotebook(notebookId) {
        return this.sendSync('delete-notebook', {
            'notebookId': notebookId
        });
    }

    updateNotebook(notebookId, title, tags, source) {
        return this.sendSync('update-notebook', {
            'notebookId': notebookId,
            'title': title,
            'tags': tags,
            'source': source
        });
    }

    setExpansionForNotebook(notebookId, expanded) {
        return this.sendSync('set-expansion-for-notebook', {
            'notebookId': notebookId,
            'expanded': expanded
        });
    }

    setExpansionForAllNotebooks(expanded) {
        return this.sendSync('set-expansion-for-all-notebooks', {
            'expanded': expanded
        });
    }

    getExploreNotebooksTreeviewData() {
        return this.sendSync('get-explore-notebooks-treeview-data', {
        });
    }

    /*
     * RecentNotes related APIs
     */
    getRecentNotesTreeviewData() {
        return this.sendSync('get-recent-notes-treeview-data', {
        });
    }

    /*
     * SearchNotes related APIs
     */
    getSearchNotesTreeviewData(searchText) {
        return this.sendSync('get-search-notes-treeview-data', {
            'search_text': searchText
        });
    }
}
