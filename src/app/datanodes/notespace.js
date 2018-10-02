const fs = require('fs');
const { URL } = require('url');

const { Constants } = require('../utils/constants');
const { logger } = require('../utils/logger');

const { Notebook } = require('./notebook');
const { Notepage } = require('./notepage');

class Notespace {
    constructor(notespaceDirectory) {
        this.notespaceDirectory = notespaceDirectory;

        if (!Notespace.doesNotespaceExist(this.notespaceDirectory)) {
            this.createDefaultNotespace();
        }

        this.rootNotebooks = [];
        this.recentNotepages = [];

        this.notebookCache = new Map();
        this.notepageCache = new Map();
        this.tagsCache = new Set();

        this.readFromFile();
    }

    createDefaultNotespace() {
        if (!fs.existsSync(this.notespaceDirectory) || !fs.lstatSync(this.notespaceDirectory).isDirectory()) {
            logger.info('Cannot find the directory. Failed to create new Notespace.');
            throw 'Cannot find the directory. Failed to create new Notespace.';

        } else if (fs.readdirSync(this.notespaceDirectory).length > 0) {
            logger.info('Cannot create new Notespace as the directory is not empty');
            throw 'Cannot create new Notespace as the directory is not empty';

        } else {
            let defaultNotespaceMetadata = {
                'app_data_version': Constants.APP_DATA_VERSION,
                'root_notebooks': [],
                'recent_notepages': []
            };

            // TODO Handle IO Error
            fs.writeFileSync(this.notespaceDirectory + '/notespace.json', //
                JSON.stringify(defaultNotespaceMetadata), 'utf8');
            fs.mkdirSync(this.notespaceDirectory + '/notebooks');
            fs.mkdirSync(this.notespaceDirectory + '/notepages');
        }
    }

    getNotespaceDirectory() {
        return this.notespaceDirectory;
    }

    /*
     * File IO (to check if notes exists)
     */
    static doesNotespaceExist(notespaceDirectory) {
        return fs.existsSync(notespaceDirectory + '/notespace.json')
    }

    doesNotebookExist(notebookId) {
        return fs.existsSync(this.notespaceDirectory + '/notebooks/' + notebookId + '/notebook.json');
    }

    doesNotepageExist(notepageId) {
        return fs.existsSync(this.notespaceDirectory + '/notepages/' + notepageId + '/notepage.json');
    }

    /*
     * File IO
     */
    readFromFile() {
        this.readMetadataFromFile();
    }

    writeToFile() {
        this.writeMetadataToFile();
    }

    readMetadataFromFile() {
        let filepath = this.notespaceDirectory + '/notespace.json';
        let fileURL = new URL('file:' + filepath);

        // TODO Handle IO Error
        let metadataStr = fs.readFileSync(fileURL, 'utf8');
        let metadata = JSON.parse(metadataStr);

        if (metadata.app_data_version !== Constants.APP_DATA_VERSION) {
            throw 'App version ' + Constants.APP_DATA_VERSION + ' is different from Notespace version ' + metadata.app_data_version;
        }

        this.rootNotebooks = [];
        this.recentNotepages = [];

        for (let notebookId of metadata.root_notebooks) {
            if (this.doesNotebookExist(notebookId)) {
                // load Notebook from file system.
                let rootNotebook = new Notebook(notebookId, null, this);
                this.rootNotebooks.push(rootNotebook);
                this.addNotebookToCache(rootNotebook);
            }
        }

        for (let notepageId of metadata.recent_notepages) {
            // get Notepage from cache (the notepage would be read when notebooks were loaded)
            let notepage = this.getNotepage(notepageId);
            if (notepage) {
                this.recentNotepages.push(notepage);
                this.addNotepageToCache(notepage);
            }
        }

        logger.info("Succesfully read Notespace metadata from file " + filepath);
        return true;
    }

    /*
     * Note that data is ALSO written from createDefaultNotespace() method 
     */
    writeMetadataToFile() {
        let metadata = {
            'app_data_version': Constants.APP_DATA_VERSION,
            'root_notebooks': this.getRootNotebookIds(),
            'recent_notepages': this.getRecentNotepageIds()
        }
        let metadataStr = JSON.stringify(metadata);

        let filepath = this.notespaceDirectory + '/notespace.json';

        // TODO Handle IO Error
        fs.writeFileSync(filepath, metadataStr, 'utf8');
        // set logging level to 'debug'
        logger.debug("Succesfully saved Notespace metadata file " + filepath);
        return true;
    }

    getRootNotebookIds() {
        let rootNotebookIds = [];
        for (let notebook of this.rootNotebooks) {
            rootNotebookIds.push(notebook.notebookId);
        }
        return rootNotebookIds;
    }

    getRecentNotepageIds() {
        let recentNotepageIds = [];
        for (let notepage of this.recentNotepages) {
            recentNotepageIds.push(notepage.notepageId);
        }
        return recentNotepageIds;
    }

    /*
     * Root Notebooks
     */
    createRootNotebook() {
        let notebook = new Notebook(null, null, this);
        this.rootNotebooks.push(notebook);
        this.addNotebookToCache(notebook);
        this.writeMetadataToFile();

        return notebook.notebookId;
    }

    deleteRootNotebook(rootNotebook) {
        let index = this.rootNotebooks.indexOf(rootNotebook);

        // ensure the input parameter is actually a root notebook
        if (index != -1) {
            if (!rootNotebook.deleteNotebook()) {
                logger.error("Error while deleting rootNotebook.");
                return false;
            }

            this.rootNotebooks.splice(index, 1);
            this.deleteNotebookFromCache(rootNotebook);
            this.writeMetadataToFile();

            return true; // success
        }

        return false; // failed to find notebook
    }

    /*
     * Notebook Cache
     */
    getNotebook(notebookId) {
        return this.notebookCache.get(notebookId);
    }

    addNotebookToCache(notebook) {
        this.notebookCache.set(notebook.notebookId, notebook);
    }

    deleteNotebookFromCache(notebook) {
        this.notebookCache.delete(notebook.notebookId);
    }

    clearNotebookCache() {
        this.notebookCache.clear();
    }

    /*
     * Notepage Cache
     */
    getNotepage(notepageId) {
        return this.notepageCache.get(notepageId);
    }

    addNotepageToCache(notepage) {
        this.notepageCache.set(notepage.notepageId, notepage);
    }

    deleteNotepageFromCache(notepage) {
        this.notepageCache.delete(notepage.notepageId);
    }

    clearNotepageCache() {
        this.notepageCache.clear();
    }

    /*
     * Tags Cache
     */
    addTagsToCache(csvTagList) {
        if(csvTagList) {
            var tags = csvTagList.split(',');
            for(let tag of tags) {
                this.tagsCache.add(tag);
            }
        }
    }

    clearTagsCache() {
        this.tagsCache.clear();
    }

    /*
     * Recent Notepages
     */
    addRecentNotepage(notepage) {
        // delete the older instance
        this.removeRecentNotepage(notepage);

        // add the notepage to index 0
        this.recentNotepages.splice(0, 0, notepage);
        // delete older notepages
        this.recentNotepages = this.recentNotepages.slice(0, Constants.MAX_RECENT_NOTEPAGES);

        // save notespace data to file
        this.writeMetadataToFile();
    }

    removeRecentNotepage(notepage) {
        let index = this.recentNotepages.indexOf(notepage);
        if (index != -1) {
            this.recentNotepages.splice(index, 1);
            this.writeMetadataToFile();
        }
    }

    /*
     * Treeview data (for left panel)
     */
    getExploreNotebooksTreeviewData() {
        let treeviewData = [];
        for (let notebook of this.rootNotebooks) {
            treeviewData.push(notebook.getExploreNotebooksTreeviewData());
        }

        return treeviewData;
    }

    getExploreTagsTreeviewData() {
        let sortedTagList = Array.from(this.tagsCache).sort();

        let tagsTreevewData = [];
        for (let tag of sortedTagList) {
            tagsTreevewData.push({'text': tag});
        }

        return tagsTreevewData;
    }

    getRecentNotesTreeviewData() {
        let treeviewData = [];
        for (let notepage of this.recentNotepages) {
            treeviewData.push({
                text: notepage.title,
                notepageId: notepage.notepageId,
                notebookId: notepage.notebook.notebookId,
                state: {
                }
            });
        }

        return treeviewData;
    }

    getSearchNotesTreeviewData(searchText) {
        let treeviewData = [];
        if (searchText) {
            let searchWords = searchText.toLowerCase().match(Constants.WORD_SPLIT_REGEX);
            logger.debug('Searching notespace for words: ' + searchWords);

            if (searchWords) {
                for (let notebook of this.rootNotebooks) {
                    notebook.searchText(searchWords, treeviewData, 0.0);
                }
            }
        }

        return treeviewData;
    }

    /*
     * Treeview data (for middle panel)
     */
    getNotepageTreeviewDataForTagSearch(searchTag) {
        let treeviewData = [];
        let score = 0.0;

        // trim the search string first
        let trimmedSearchTag = searchTag.trim();
        if (trimmedSearchTag) {
            for (let notebook of this.rootNotebooks) {
                // treeviewData gets populated on successful search
                notebook.searchTag(trimmedSearchTag, treeviewData, score);
            }
        }

        return treeviewData;
    }

    /**
     * Tag data
     */
    getTagsListForTypeahead() {
        let sortedTagList = Array.from(this.tagsCache).sort();
        return sortedTagList;
    }
}

module.exports = {
    Notespace
}
