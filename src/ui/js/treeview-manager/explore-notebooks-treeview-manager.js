class ExploreNotebooksTreeviewManager {
    static initialize() {
        ExploreNotebooksTreeviewManager.instance = new ExploreNotebooksTreeviewManager();
    }

    constructor() {
        this.treeview = $('#explore-notebooks-treeview');
        this.treeviewData = []; // intially empty
    }

    static markSelectedNotebook(treeviewNode, selectedNotebookId) {
        if (treeviewNode.notebookId == selectedNotebookId) {
            treeviewNode.state['selected'] = true;
            return true;
        }

        if (treeviewNode.hasOwnProperty('nodes')) {
            let nodes = treeviewNode.nodes;
            for (let child of nodes) {
                if (ExploreNotebooksTreeviewManager.markSelectedNotebook(child, selectedNotebookId)) {
                    return true;
                }
            }
        }

        return false;
    }

    reloadTreeviewData(reloadContent) {
        let notebookTreeviewData = ServerManager.instance.getExploreNotebooksTreeviewData();

        if (notebookTreeviewData) {
            if (ExploreNotebooksTreeviewManager.instance.lastNotebookId) {
                let treeviewNodes = JSON.parse(notebookTreeviewData);
                for (let treeviewNode of treeviewNodes) {
                    if (ExploreNotebooksTreeviewManager.markSelectedNotebook(treeviewNode, ExploreNotebooksTreeviewManager.instance.lastNotebookId)) {
                        // found the node
                        notebookTreeviewData = JSON.stringify(treeviewNodes);
                        if (reloadContent) {
                            this.loadNotebookData();
                        }
                        break;
                    }
                }
            }

            this.treeviewData = notebookTreeviewData;

        } else {
            this.treeviewData = '[]';
        }

        this.reload();
        ExploreNotepagesTreeviewManager.instance.reloadTreeviewData(true);
    }

    reload() {
        this.treeview.treeview({
            color: "#428bca",
            showBorder: true,
            multiSelect: false,
            enableLinks: false,

            data: this.treeviewData,

            onNodeSelected: function (event, node) {
                console.debug('Notebook ' + node.notebookId + ' selected');

                ExploreNotepagesTreeviewManager.instance.lastNotepageId = null;
                ExploreNotebooksTreeviewManager.instance.lastNotebookId = node.notebookId;

                ExploreNotebooksTreeviewManager.instance.loadNotebookData();
            },

            onNodeUnselected: function (event, node) {
                console.debug('Notebook ' + node.notebookId + ' unselected');

                ExploreNotepagesTreeviewManager.instance.lastNotepageId = null;
                ExploreNotebooksTreeviewManager.instance.lastNotebookId = null;

                ExploreNotebooksTreeviewManager.instance.resetNotebookData();
            },

            onNodeExpanded: function (event, node) {
                ServerManager.instance.setExpansionForNotebook(node.notebookId, true);
            },

            onNodeCollapsed: function (event, node) {
                ServerManager.instance.setExpansionForNotebook(node.notebookId, false);
            }
        });
    }

    resetNotebookData() {
        QuillEditor.instance.reset();
        this.reloadTreeviewData(false); // DO NOT reload content

        ExploreNotepagesTreeviewManager.instance.resetNotepageData(true);
    }

    loadNotebookData() {
        let notebookData = ServerManager.instance.getNotebook(this.lastNotebookId);
        if (!notebookData) {
            console.error('Failed to call getNotebook().');
            return false; // failure
        }

        let notebook = JSON.parse(notebookData);
        QuillEditor.instance.load(notebook.notebookId, 'notebook', notebook.title, notebook.tags, notebook.source);

        // reload notepage treeview
        ExploreNotepagesTreeviewManager.instance.reloadTreeviewData(false); // do not load notepage data
    }

    createNotebook() {
        let response = ServerManager.instance.createNotebook(this.lastNotebookId);
        if (response) { // check if notebook was created
            ExploreNotepagesTreeviewManager.instance.lastNotepageId = null;
            ExploreNotebooksTreeviewManager.instance.lastNotebookId = response;

            this.reloadTreeviewData(true); // gets latest treeview data, and reloads UI.
        }
    }

    deleteNotebook() {
        if (this.lastNotebookId) {
            let notebookData = ServerManager.instance.getNotebook(this.lastNotebookId);
            if (!notebookData) {
                console.warn('Failed to delete notebook ' + this.lastNotebookId + '. Error while getNotebook().');
                alert('Failed to delete the notebook');
            }

            let selectedNotebook = JSON.parse(notebookData);
            let deletionConfirmed = confirm('Do you want to delete notebook ' + selectedNotebook.title);
            if (deletionConfirmed) {
                let response = ServerManager.instance.deleteNotebook(selectedNotebook.notebookId);
                if (!response) {
                    console.warn('Failed to delete notebook ' + selectedNotebook.notebookId);
                    alert('Failed to delete the notebook');
                }

                ExploreNotepagesTreeviewManager.instance.lastNotepageId = null;
                ExploreNotebooksTreeviewManager.instance.lastNotebookId = null;

                this.resetNotebookData();
            }
        }
    }

    setExpansionForAllNotebooks(expanded) {
        let response = ServerManager.instance.setExpansionForAllNotebooks(expanded);
        if (!response) {
            console.warn('Failed to expand/collapse all notebooks. Reloading treeview data.');
            alert('Failed to expand/collapse all notebooks.');
        }

        ExploreNotepagesTreeviewManager.instance.lastNotepageId = null;
        ExploreNotebooksTreeviewManager.instance.lastNotebookId = null;

        this.resetNotebookData();
    }
}
