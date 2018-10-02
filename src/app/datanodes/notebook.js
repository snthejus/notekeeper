const fs = require('fs');
const { URL } = require('url');

const { Constants } = require('../utils/constants');
const { UUID } = require('../utils/uuid');
const { FileUtils } = require('../utils/file-utils');
const { logger } = require('../utils/logger');

const { Notepage } = require('./notepage');

class Notebook {
    constructor(notebookId, parentNotebook, notespace) {
        this.notebookId = notebookId;
        this.parentNotebook = parentNotebook;
        this.notespace = notespace;

        this.title = 'Untitled';
        this.tags = '';
        this.source = '';
        this.expanded = true;

        this.notebooks = [];
        this.notepages = [];

        if (notebookId) {
            // if notebook exists, read from file system.
            this.readFromFile();

        } else {
            // notebook does not exist. create new notebook.
            this.generateNotebookId();
            this.writeToFile();
        }
    }

    generateNotebookId() {
        this.notebookId = UUID.uuidv4();

        // create directory
        fs.mkdirSync(this.getNotebookDirectory());
    }

    getNotebookDirectory() {
        return this.notespace.getNotespaceDirectory() + '/notebooks/' + this.notebookId;
    }

    /*
     * File IO
     */

    readFromFile() {
        return this.readMetadataFromFile();
    }

    writeToFile() {
        return this.writeMetadataToFile();
    }

    readMetadataFromFile() {
        let filepath = this.getNotebookDirectory() + '/notebook.json';
        let fileURL = new URL('file:' + filepath);

        // TODO Handle IO Error
        let metadataStr = fs.readFileSync(fileURL, 'utf8');
        let metadata = JSON.parse(metadataStr);

        if (metadata.app_data_version !== Constants.APP_DATA_VERSION) {
            throw 'App version ' + Constants.APP_DATA_VERSION + ' is different from Notebook version ' + metadata.app_data_version;
        }

        this.title = metadata.title;
        this.tags = metadata.tags;
        this.source = metadata.source;
        this.expanded = metadata.expanded;

        this.notebooks = [];
        this.notepages = [];

        // write tags info to cache
        this.notespace.addTagsToCache(this.tags);

        for (let childNotebookId of metadata.notebooks) {
            if (this.notespace.doesNotebookExist(childNotebookId)) {
                let notebook = new Notebook(childNotebookId, this, this.notespace);
                this.notebooks.push(notebook);
                this.notespace.addNotebookToCache(notebook);
            }
        }

        for (let childNotepageId of metadata.notepages) {
            if (this.notespace.doesNotepageExist(childNotepageId)) {
                let notepage = new Notepage(childNotepageId, null, this);
                this.notepages.push(notepage);
                this.notespace.addNotepageToCache(notepage);
            }
        }

        logger.debug("Succesfully read Notebook metadata from file " + filepath);
        return true;
    }

    writeMetadataToFile() {
        let metadata = {
            'app_data_version': Constants.APP_DATA_VERSION,
            'title': this.title,
            'tags': this.tags,
            'source': this.source,
            'expanded': this.expanded,
            'notebooks': this.getChildNotebookIds(),
            'notepages': this.getChildNotepageIds()
        }
        let metadataStr = JSON.stringify(metadata);

        // write tags info to cache
        this.notespace.addTagsToCache(this.tags);

        let filepath = this.getNotebookDirectory() + '/notebook.json';

        // TODO Handle IO Error
        fs.writeFileSync(filepath, metadataStr, 'utf8');
        logger.debug("Succesfully saved Notebook metadata file " + filepath);
        return true;
    }

    getChildNotebookIds() {
        let childNotebookIds = [];
        for (let childNotebook of this.notebooks) {
            childNotebookIds.push(childNotebook.notebookId);
        }
        return childNotebookIds;
    }

    getChildNotepageIds() {
        let childNotepageIds = [];
        for (let childNotepage of this.notepages) {
            childNotepageIds.push(childNotepage.notepageId);
        }
        return childNotepageIds;
    }

    /**
     * Create a childNotebook.
     * Update (i) Notespace cache (ii) parentNotebook metadata.
     */
    createChildNotebook() {
        let childNotebook = new Notebook(null, this, this.notespace);
        this.notebooks.push(childNotebook);
        this.notespace.addNotebookToCache(childNotebook);
        this.writeMetadataToFile();

        return childNotebook.notebookId;
    }

    /**
     * Delete the childNotebook along with its children.
     * Update (i) Notespace cache (ii) parentNotebook metadata.
     */
    deleteChildNotebook(childNotebook) {
        let index = this.notebooks.indexOf(childNotebook);

        // ensure the input parameter is actually a child notebook
        if (index != -1) {
            if (!childNotebook.deleteNotebook()) {
                logger.error("Error while deleting childNotebook.");
                return false;
            }

            this.notebooks.splice(index, 1);
            this.notespace.deleteNotebookFromCache(childNotebook);
            this.writeMetadataToFile();

            return true;
        }

        return false;
    }

    /**
     * Create a childNotepage.
     * Update (i) Notespace cache (ii) parentNotebook metadata.
     */
    createChildNotepage() {
        let childNotepage = new Notepage(null, null, this);
        this.notepages.push(childNotepage);
        this.notespace.addNotepageToCache(childNotepage);
        this.writeMetadataToFile();

        return childNotepage.notepageId;
    }

    /**
     * Delete the childNotepage along with its children.
     * Update (i) Notespace cache (ii) parentNotebook metadata.
     */
    deleteChildNotepage(childNotepage) {
        let index = this.notepages.indexOf(childNotepage);

        // ensure the input parameter is actually a child notepage
        if (index != -1) {
            if (!childNotepage.deleteNotepage()) {
                logger.error("Error while deleting childNotepage.");
                return false;
            }

            this.notepages.splice(index, 1);
            this.notespace.deleteNotepageFromCache(childNotepage);
            this.notespace.removeRecentNotepage(childNotepage);
            this.writeMetadataToFile();

            return true;
        }

        return false;
    }

    /**
     * Set the expansion state of notebook in the treeview.
     * @param {*} expanded The value to be set for expansion state.
     * @param {*} recursive If set to true, set the state to child notebooks as well.
     */
    setExpansionState(expanded, recursive) {
        this.expanded = expanded;
        if (!this.writeMetadataToFile()) {
            logger.error('Failed to write metadata to file for notebook ' + this.notebookId);
            return false;
        }

        if (recursive) {
            for (let childNotebook of this.notebooks) {
                if (!childNotebook.setExpansionState(expanded, recursive)) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Delete the notebook and its children from file system.
     * This is a private method. Use deleteChildNotebook() instead.
     */
    deleteNotebook() {
        for (let childNotebook of this.notebooks) {
            if (!childNotebook.deleteNotebook()) {
                return false;
            }
            this.notespace.deleteNotebookFromCache(childNotebook);
        }
        for (let childNotepage of this.notepages) {
            if (!childNotepage.deleteNotepage()) {
                return false;
            }
            this.notespace.deleteNotepageFromCache(childNotepage);
            this.notespace.removeRecentNotepage(childNotepage);
        }

        // TODO should we delete directories before updating the parent metadata?
        if (!FileUtils.deleteNonEmptyDirectory(this.getNotebookDirectory())) {
            logger.error('Failed to delete directory ' + this.getNotebookDirectory());
            return false;
        }

        return true; // notebook successfully deleted
    }

    /*
     * Search data (for left panel)
     */
    searchText(searchWords, treeviewData, parentScore) {
        let score = 0.0;
        if (parentScore > 0.0) {
            score = 1.0 / parentScore;
        }

        for (let word of searchWords) {
            if (this.title.toLowerCase().indexOf(word) != -1) {
                score += 1.0;
            }
            if (this.tags.toLowerCase().indexOf(word) != -1) {
                score += 0.8;
            }
            if (this.source.toLowerCase().indexOf(word) != -1) {
                score += 0.7;
            }
        }

        for (let childNotepage of this.notepages) {
            childNotepage.searchText(searchWords, treeviewData, score);
        }
        for (let childNotebook of this.notebooks) {
            childNotebook.searchText(searchWords, treeviewData, score);
        }
    }

    searchTag(searchTag, treeviewData, parentScore) {
        let score = 0.0;
        if (parentScore > 0.0) {
            score = 1.0 / parentScore;
        }

        // this.tags is csv separated values
        if (this.tags.indexOf(searchTag) != -1) {
            // split the csv into array, and check for exact match
            if (this.tags.split(',').includes(searchTag)) {
                score += 1.0;
            }
        }

        for (let childNotepage of this.notepages) {
            childNotepage.searchTag(searchTag, treeviewData, score);
        }
        for (let childNotebook of this.notebooks) {
            childNotebook.searchTag(searchTag, treeviewData, score);
        }
    }

    /*
     * Treeview data (for left panel)
     */
    getExploreNotebooksTreeviewData() {
        let treeviewData = {
            text: this.title,
            notebookId: this.notebookId,
            state: {
            }
        }

        if (this.notebooks.length > 0) {
            let nodes = [];
            for (let childNotebook of this.notebooks) {
                nodes.push(childNotebook.getExploreNotebooksTreeviewData());
            }

            treeviewData.nodes = nodes;
            treeviewData.state.expanded = this.expanded;
        }

        return treeviewData;
    }

    /*
     * Treeview data (for middle panel)
     */
    getExploreNotepagesTreeviewData() {
        let treeviewData = [];
        for (let notepage of this.notepages) {
            treeviewData.push(notepage.getExploreNotepagesTreeviewData());
        }

        return treeviewData;
    }
}

module.exports = {
    Notebook
}
