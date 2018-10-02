const { ipcMain } = require('electron');
const fs = require('fs');

const { logger } = require('../utils/logger');

const { NotespaceManager } = require('../managers/notespace-manager');
const { NotebookManager } = require('../managers/notebook-manager');
const { NotepageManager } = require('../managers/notepage-manager');
const { TagsManager } = require('../managers/tags-manager');
const { RecentNotesManager } = require('../managers/recent-notes-manager');
const { SearchNotesManager } = require('../managers/search-notes-manager');

/*
 * Notepage related APIs
 */

ipcMain.on('get-notepage', (event, arg) => {
    try {
        let requestData = JSON.parse(arg);
        logger.debug('Received get-notepage request for with args: ' + JSON.stringify(requestData));
        let responseData = NotepageManager.getNotepage(requestData['notepageId']);
        event.returnValue = responseData ? JSON.stringify(responseData) : false;

    } catch (err) {
        logger.error(err.message);
        logger.info(err.stack);
        event.returnValue = false;
    }

    return;
});

ipcMain.on('create-notepage', (event, arg) => {
    try {
        let requestData = JSON.parse(arg);
        logger.info('Received create-notepage request for with args: ' + JSON.stringify(requestData));
        let responseData = NotepageManager.createNotepage(requestData['parentNotepageId'], requestData['notebookId']);
        event.returnValue = responseData ? responseData : false;

    } catch (err) {
        logger.error(err.message);
        logger.info(err.stack);
        event.returnValue = false;
    }

    return;
});

ipcMain.on('delete-notepage', (event, arg) => {
    try {
        let requestData = JSON.parse(arg);
        logger.info('Received delete-notepage request for with args: ' + JSON.stringify(requestData));
        let responseData = NotepageManager.deleteNotepage(requestData['notepageId']);
        event.returnValue = responseData ? responseData : false;

    } catch (err) {
        logger.error(err.message);
        logger.info(err.stack);
        event.returnValue = false;
    }

    return;
});

ipcMain.on('update-notepage', (event, arg) => {
    try {
        let requestData = JSON.parse(arg);
        logger.info('Received update-notepage request for notepageId: ' + requestData['notepageId']);
        let responseData = NotepageManager.updateNotepage(requestData['notepageId'], //
            requestData['title'], requestData['tags'], requestData['source'], requestData['content']);
        event.returnValue = responseData ? responseData : false;

    } catch (err) {
        logger.error(err.message);
        logger.info(err.stack);
        event.returnValue = false;
    }

    return;
});

ipcMain.on('set-expansion-for-notepage', (event, arg) => {
    try {
        let requestData = JSON.parse(arg);
        logger.debug('Received set-expansion-for-notepage request for with args: ' + JSON.stringify(requestData));
        let responseData = NotepageManager.setExpansionForNotepage(requestData['notepageId'], requestData['expanded']);
        event.returnValue = responseData ? responseData : false;

    } catch (err) {
        logger.error(err.message);
        logger.info(err.stack);
        event.returnValue = false;
    }

    return;
});

ipcMain.on('set-expansion-for-all-notepages', (event, arg) => {
    try {
        let requestData = JSON.parse(arg);
        logger.debug('Received set-expansion-for-all-notepages request for with args: ' + JSON.stringify(requestData));
        let responseData = NotepageManager.setExpansionForAllNotepages(requestData['notebookId'], requestData['expanded']);
        event.returnValue = responseData ? responseData : false;

    } catch (err) {
        logger.error(err.message);
        logger.info(err.stack);
        event.returnValue = false;
    }

    return;
});

ipcMain.on('get-explore-notepages-treeview-data', (event, arg) => {
    try {
        let requestData = JSON.parse(arg);
        logger.debug('Received get-explore-notepages-treeview-data request for with args: ' + JSON.stringify(requestData));
        let responseData = NotepageManager.getExploreNotepagesTreeviewData(requestData['notebookId']);
        event.returnValue = responseData ? JSON.stringify(responseData) : '[]';

    } catch (err) {
        logger.error(err.message);
        logger.info(err.stack);
        event.returnValue = false;
    }

    return;
});

ipcMain.on('get-explore-notepages-treeview-data-for-tag-search', (event, arg) => {
    try {
        let requestData = JSON.parse(arg);
        logger.debug('Received get-explore-notepages-treeview-data-for-tag-search request for with args: ' + JSON.stringify(requestData));
        let responseData = NotepageManager.getNotepageTreeviewDataForTagSearch(requestData['searchTag']);
        event.returnValue = responseData ? JSON.stringify(responseData) : '[]';

    } catch (err) {
        logger.error(err.message);
        logger.info(err.stack);
        event.returnValue = false;
    }

    return;
});

/*
 * Notebook related APIs
 */

ipcMain.on('get-notebook', (event, arg) => {
    try {
        let requestData = JSON.parse(arg);
        logger.debug('Received get-notebook request for with args: ' + JSON.stringify(requestData));
        let responseData = NotebookManager.getNotebook(requestData['notebookId']);
        event.returnValue = responseData ? JSON.stringify(responseData) : false;

    } catch (err) {
        logger.error(err.message);
        logger.info(err.stack);
        event.returnValue = false;
    }

    return;
});

ipcMain.on('create-notebook', (event, arg) => {
    try {
        let requestData = JSON.parse(arg);
        logger.info('Received create-notebook request for with args: ' + JSON.stringify(requestData));
        let responseData = NotebookManager.createNotebook(requestData['parentNotebookId']);
        event.returnValue = responseData ? responseData : false;

    } catch (err) {
        logger.error(err.message);
        logger.info(err.stack);
        event.returnValue = false;
    }

    return;
});

ipcMain.on('delete-notebook', (event, arg) => {
    try {
        let requestData = JSON.parse(arg);
        logger.info('Received delete-notebook request for with args: ' + JSON.stringify(requestData));
        let responseData = NotebookManager.deleteNotebook(requestData['notebookId']);
        event.returnValue = responseData ? responseData : false;

    } catch (err) {
        logger.error(err.message);
        logger.info(err.stack);
        event.returnValue = false;
    }

    return;
});

ipcMain.on('update-notebook', (event, arg) => {
    try {
        let requestData = JSON.parse(arg);
        logger.info('Received update-notebook request for with args: ' + JSON.stringify(requestData));
        let responseData = NotebookManager.updateNotebook(requestData['notebookId'], //
            requestData['title'], requestData['tags'], requestData['source']);
        event.returnValue = responseData ? responseData : false;

    } catch (err) {
        logger.error(err.message);
        logger.info(err.stack);
        event.returnValue = false;
    }

    return;
});

ipcMain.on('set-expansion-for-notebook', (event, arg) => {
    try {
        let requestData = JSON.parse(arg);
        logger.debug('Received set-expansion-for-notebook request for with args: ' + JSON.stringify(requestData));
        let responseData = NotebookManager.setExpansionForNotebook(requestData['notebookId'], requestData['expanded']);
        event.returnValue = responseData ? responseData : false;

    } catch (err) {
        logger.error(err.message);
        logger.info(err.stack);
        event.returnValue = false;
    }

    return;
});

ipcMain.on('set-expansion-for-all-notebooks', (event, arg) => {
    try {
        let requestData = JSON.parse(arg);
        logger.debug('Received set-expansion-for-all-notebooks request for with args: ' + JSON.stringify(requestData));
        let responseData = NotebookManager.setExpansionForAllNotebooks(requestData['expanded']);
        event.returnValue = responseData ? responseData : false;

    } catch (err) {
        logger.error(err.message);
        logger.info(err.stack);
        event.returnValue = false;
    }

    return;
});

ipcMain.on('get-explore-notebooks-treeview-data', (event, arg) => {
    try {
        let requestData = JSON.parse(arg);
        logger.debug('Received get-explore-notebooks-treeview-data request for with args: ' + JSON.stringify(requestData));
        let responseData = NotebookManager.getExploreNotebooksTreeviewData();
        event.returnValue = responseData ? JSON.stringify(responseData) : '[]';

    } catch (err) {
        logger.error(err.message);
        logger.info(err.stack);
        event.returnValue = false;
    }

    return;
});

/*
 * Tags related APIs
 */

ipcMain.on('get-explore-tags-treeview-data', (event, arg) => {
    try {
        let requestData = JSON.parse(arg);
        logger.debug('Received get-explore-tags-treeview-data request for with args: ' + JSON.stringify(requestData));
        let responseData = TagsManager.getExploreTagsTreeviewData();
        event.returnValue = responseData ? JSON.stringify(responseData) : '[]';

    } catch (err) {
        logger.error(err.message);
        logger.info(err.stack);
        event.returnValue = false;
    }

    return;
});

/*
 * RecentNotes related APIs
 */

ipcMain.on('get-recent-notes-treeview-data', (event, arg) => {
    try {
        let requestData = JSON.parse(arg);
        logger.debug('Received get-recent-notes-treeview-data request for with args: ' + JSON.stringify(requestData));
        let responseData = RecentNotesManager.getRecentNotesTreeviewData();
        event.returnValue = responseData ? JSON.stringify(responseData) : '[]';

    } catch (err) {
        logger.error(err.message);
        logger.info(err.stack);
        event.returnValue = false;
    }

    return;
});

/*
 * SearchNotes related APIs
 */

ipcMain.on('get-search-notes-treeview-data', (event, arg) => {
    try {
        let requestData = JSON.parse(arg);
        logger.debug('Received get-search-notes-treeview-data request for with args: ' + JSON.stringify(requestData));
        let responseData = SearchNotesManager.getSearchNotesTreeviewData(requestData['search_text']);
        event.returnValue = responseData ? JSON.stringify(responseData) : '[]';

    } catch (err) {
        logger.error(err.message);
        logger.info(err.stack);
        event.returnValue = false;
    }

    return;
});
