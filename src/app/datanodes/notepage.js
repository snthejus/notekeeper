const fs = require('fs');
const { URL } = require('url');

const { Constants } = require('../utils/constants');
const { UUID } = require('../utils/uuid');
const { FileUtils } = require('../utils/file-utils');
const { StringUtils } = require('../utils/string-utils');
const { logger } = require('../utils/logger');

class Notepage {
    constructor(notepageId, parentNotepage, notebook) {
        this.notepageId = notepageId;
        this.parentNotepage = parentNotepage;
        this.notebook = notebook;
        this.notespace = notebook.notespace;

        this.title = 'Untitled';
        this.tags = '';
        this.source = '';
        this.content = '';
        this.expanded = true;

        this.notepages = [];

        if (notepageId) {
            // if notepage exists, read from file system.
            this.readFromFile();

        } else {
            // notepage does not exist. create new notepage.
            this.generateNotepageId();
            this.writeToFile();
        }
    }

    generateNotepageId() {
        this.notepageId = UUID.uuidv4();

        // create directory
        fs.mkdirSync(this.getNotepageDirectory());
    }

    getNotepageDirectory() {
        return this.notespace.getNotespaceDirectory() + '/notepages/' + this.notepageId;
    }

    /*
     * File IO
     */

    readFromFile() {
        return this.readMetadataFromFile() &&
            this.readContentFromFile();
    }

    writeToFile() {
        return this.writeMetadataToFile() &&
            this.writeContentToFile();
    }

    readMetadataFromFile() {
        let filepath = this.getNotepageDirectory() + '/notepage.json';
        let fileURL = new URL('file:' + filepath);

        // TODO Handle IO Error
        let metadataStr = fs.readFileSync(fileURL, 'utf8');
        let metadata = JSON.parse(metadataStr);

        if (metadata.app_data_version !== Constants.APP_DATA_VERSION) {
            throw 'App version ' + Constants.APP_DATA_VERSION + ' is different from Notepage version ' + metadata.app_data_version;
        }

        this.title = metadata.title;
        this.tags = metadata.tags;
        this.source = metadata.source;
        this.expanded = metadata.expanded;

        this.notepages = [];

        // write tags info to cache
        this.notespace.addTagsToCache(this.tags);

        for (let childNotepage of metadata.notepages) {
            if (this.notespace.doesNotepageExist(childNotepage)) {
                let notepage = new Notepage(childNotepage, this, this.notebook);
                this.notepages.push(notepage);
                this.notespace.addNotepageToCache(notepage);
            }
        }

        logger.debug("Succesfully read Notepage metadata from file " + filepath);
        return true;
    }

    readContentFromFile() {
        let filepath = this.getNotepageDirectory() + '/notepage.html';
        let fileURL = new URL('file:' + filepath);

        // TODO Handle IO Error
        this.content = fs.readFileSync(fileURL, 'utf8');
        logger.debug("Succesfully read Notepage content from file " + filepath);
        return true;
    }

    writeMetadataToFile() {
        let metadata = {
            'app_data_version': Constants.APP_DATA_VERSION,
            'title': this.title,
            'tags': this.tags,
            'source': this.source,
            'expanded': this.expanded,
            'notepages': this.getChildNotepageIds()
        }
        let metadataStr = JSON.stringify(metadata);

        // write tags info to cache
        this.notespace.addTagsToCache(this.tags);

        let filepath = this.getNotepageDirectory() + '/notepage.json';

        // TODO Handle IO Error
        fs.writeFileSync(filepath, metadataStr, 'utf8');
        logger.debug("Succesfully saved Notepage metadata file " + filepath);
        return true;
    }

    writeContentToFile() {
        let filepath = this.getNotepageDirectory() + '/notepage.html';

        // TODO Handle IO Error
        fs.writeFileSync(filepath, this.content, 'utf8');
        logger.debug("Succesfully saved Notepage content file " + filepath);
        return true;
    }

    getChildNotepageIds() {
        let childNotepageIds = [];
        for (let childNotepage of this.notepages) {
            childNotepageIds.push(childNotepage.notepageId);
        }
        return childNotepageIds;
    }

    /**
     * Create a childNotepage.
     * Update (i) Notespace cache (ii) parentNotepage metadata.
     */
    createChildNotepage() {
        let childNotepage = new Notepage(null, this, this.notebook);
        this.notepages.push(childNotepage);
        this.notespace.addNotepageToCache(childNotepage);
        this.writeMetadataToFile();

        return childNotepage.notepageId;
    }

    /**
     * Delete the childNotepage along with its children.
     * Update (i) Notespace cache (ii) parentNotepage metadata.
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
     * Set the expansion state of notepage in the treeview.
     * @param {*} expanded The value to be set for expansion state.
     * @param {*} recursive If set to true, set the state to child notepages as well.
     */
    setExpansionState(expanded, recursive) {
        this.expanded = expanded;
        if (!this.writeMetadataToFile()) {
            logger.error('Failed to write metadata to file for notepage ' + this.notepageId);
            return false;
        }

        if (recursive) {
            for (let childNotepage of this.notepages) {
                if (!childNotepage.setExpansionState(expanded, recursive)) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Delete the notepage and its children from file system.
     * This is a private method. Use deleteChildNotepage() instead.
     */
    deleteNotepage() {
        for (let childNotepage of this.notepages) {
            if (!childNotepage.deleteNotepage()) {
                return false;
            }
            this.notespace.deleteNotepageFromCache(childNotepage);
            this.notespace.removeRecentNotepage(childNotepage);
        }

        // TODO should we delete directories before updating the parent metadata?
        if (!FileUtils.deleteNonEmptyDirectory(this.getNotepageDirectory())) {
            logger.error('Failed to delete directory ' + this.getNotepageDirectory());
            return false;
        }

        return true; // notepage successfully deleted
    }

    /*
     * Search data (for left panel)
     */
    searchText(searchWords, treeviewData, parentScore) {
        let score = 0.0;
        if (parentScore > 0.0) {
            score = 1.0 / parentScore;
        }

        let contentText = StringUtils.getTextFromHTML(this.content);

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
            // TODO Use TF-IDF
            if (contentText.toLowerCase().indexOf(word) != -1) {
                score += 0.9;
            }

            if (score > 0.0) {
                let nodeData = {
                    text: this.title,
                    notepageId: this.notepageId,
                    notebookId: this.notebook.notebookId,
                    score: score
                };

                let index = 0;
                for (index = 0; index < treeviewData.length; index++) {
                    if (treeviewData[index].score < score) {
                        break;
                    }
                }

                treeviewData.splice(index, 0, nodeData);
            }
        }

        for (let childNotepage of this.notepages) {
            childNotepage.searchText(searchWords, treeviewData, score);
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

        if (score > 0.0) {
            let nodeData = {
                text: this.title,
                notepageId: this.notepageId,
                notebookId: this.notebook.notebookId,
                score: score
            };

            let index = 0;
            for (index = 0; index < treeviewData.length; index++) {
                if (treeviewData[index].score < score) {
                    break;
                }
            }

            treeviewData.splice(index, 0, nodeData);
        }

        for (let childNotepage of this.notepages) {
            childNotepage.searchTag(searchTag, treeviewData, score);
        }
    }

    /*
     * Treeview data (for middle panel)
     */
    getExploreNotepagesTreeviewData() {
        let treeviewData = {
            text: this.title,
            notepageId: this.notepageId,
            notebookId: this.notebook.notebookId,
            state: {
            }
        }

        if (this.notepages.length > 0) {
            let nodes = [];
            for (let childNotepage of this.notepages) {
                nodes.push(childNotepage.getExploreNotepagesTreeviewData());
            }

            treeviewData.nodes = nodes;
            treeviewData.state.expanded = this.expanded;
        }

        return treeviewData;
    }
}

module.exports = {
    Notepage
}
