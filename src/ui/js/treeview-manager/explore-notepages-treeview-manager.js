class ExploreNotepagesTreeviewManager {
    static initialize() {
        ExploreNotepagesTreeviewManager.instance = new ExploreNotepagesTreeviewManager();
    }

    constructor() {
        this.treeview = $('#explore-notepages-treeview');
        this.treeviewData = []; // intially empty
    }

    static markSelectedNotepage(treeviewNode, selectedNotepageId) {
        if (treeviewNode.notepageId == selectedNotepageId) {
            treeviewNode.state['selected'] = true;
            return true;
        }

        if (treeviewNode.hasOwnProperty('nodes')) {
            let nodes = treeviewNode.nodes;
            for (let child of nodes) {
                if (ExploreNotepagesTreeviewManager.markSelectedNotepage(child, selectedNotepageId)) {
                    return true;
                }
            }
        }

        return false;
    }

    reloadTreeviewData(reloadContent) {
        let notepageTreeviewData = null;

        if (ExploreNotebooksTreeviewManager.instance.lastNotebookId) {
            notepageTreeviewData = ServerManager.instance.getExploreNotepagesTreeviewData(ExploreNotebooksTreeviewManager.instance.lastNotebookId);
            if (notepageTreeviewData) {
                if (this.lastNotepageId) {
                    let treeviewNodes = JSON.parse(notepageTreeviewData);
                    for (let treeviewNode of treeviewNodes) {
                        if (ExploreNotepagesTreeviewManager.markSelectedNotepage(treeviewNode, this.lastNotepageId)) {
                            // found the node
                            notepageTreeviewData = JSON.stringify(treeviewNodes);
                            if (reloadContent) {
                                this.loadNotepageData();
                            }
                            break;
                        }
                    }
                }
            }
        }

        if (notepageTreeviewData) {
            this.treeviewData = notepageTreeviewData;
        } else {
            this.treeviewData = '[]';
        }

        this.reload();
    }

    reload() {
        this.treeview.treeview({
            color: "#428bca",
            showBorder: true,
            multiSelect: false,
            enableLinks: false,

            data: this.treeviewData,

            onNodeSelected: function (event, node) {
                console.debug('Notepage ' + node.notepageId + ' selected');
                ExploreNotepagesTreeviewManager.instance.lastNotepageId = node.notepageId;
                ExploreNotepagesTreeviewManager.instance.loadNotepageData();
            },

            onNodeUnselected: function (event, node) {
                console.debug('Notepage ' + node.notepageId + ' unselected');
                ExploreNotepagesTreeviewManager.instance.lastNotepageId = null;
                ExploreNotepagesTreeviewManager.instance.resetNotepageData(false);
            },

            onNodeExpanded: function (event, node) {
                ServerManager.instance.setExpansionForNotepage(node.notepageId, true);
            },

            onNodeCollapsed: function (event, node) {
                ServerManager.instance.setExpansionForNotepage(node.notepageId, false);
            }
        });
    }

    resetNotepageData(reloadTreeviewData) {
        QuillEditor.instance.reset();
        if (reloadTreeviewData) {
            this.reloadTreeviewData(false); // DO NOT reload content
        }
    }

    loadNotepageData() {
        let notepageData = ServerManager.instance.getNotepage(this.lastNotepageId);
        if (!notepageData) {
            console.error('Failed to call getNotepage().');
            return false; // failure
        }

        let notepage = JSON.parse(notepageData);
        QuillEditor.instance.load(notepage.notepageId, 'notepage', notepage.title, notepage.tags, notepage.source, notepage.content);
    }

    createNotepage() {
        let response = ServerManager.instance.createNotepage( //
            ExploreNotepagesTreeviewManager.instance.lastNotepageId, //
            ExploreNotebooksTreeviewManager.instance.lastNotebookId);

        if (response) { // check if notepage was created
            this.lastNotepageId = response;
            this.reloadTreeviewData(true); // gets latest treeview data, and reloads UI.
        }
    }

    deleteNotepage() {
        if (this.lastNotepageId) {
            let notepageData = ServerManager.instance.getNotepage(this.lastNotepageId);
            if (!notepageData) {
                console.warn('Failed to delete notepage ' + this.lastNotepageId + '. Error while getNotepage().');
                alert('Failed to delete the notepage');
            }

            let selectedNotepage = JSON.parse(notepageData);
            let deletionConfirmed = confirm('Do you want to delete notepage ' + selectedNotepage.title);
            if (deletionConfirmed) {
                let response = ServerManager.instance.deleteNotepage(selectedNotepage.notepageId);
                if (!response) {
                    console.warn('Failed to delete notepage ' + selectedNotepage.notepageId);
                    alert('Failed to delete the notepage');
                }

                this.lastNotepageId = null;
                this.resetNotepageData(true);
            }
        }
    }

    setExpansionForAllNotepages(expanded) {
        let response = ServerManager.instance.setExpansionForAllNotepages(ExploreNotebooksTreeviewManager.instance.lastNotebookId, expanded);
        if (!response) {
            console.warn('Failed to expand/collapse all notepages. Reloading treeview data.');
            alert('Failed to expand/collapse all notepages.');
        }

        this.lastNotepageId = null;
        this.resetNotepageData(true);;
    }
}
