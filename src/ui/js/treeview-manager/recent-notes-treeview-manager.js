class RecentNotesTreeviewManager {
    static initialize() {
        RecentNotesTreeviewManager.instance = new RecentNotesTreeviewManager();
    }

    constructor() {
        this.treeview = $('#recent-notes-treeview');
        this.treeviewData = []; // intially empty
    }

    reloadTreeviewData(reloadContent) {
        let notebookTreeviewData = ServerManager.instance.getRecentNotesTreeviewData();
        if (notebookTreeviewData) {
            let treeviewNodes = JSON.parse(notebookTreeviewData);
            let treeviewNode = treeviewNodes[0];
            treeviewNode.state['selected'] = true;
            notebookTreeviewData = JSON.stringify(treeviewNodes);
            this.treeviewData = notebookTreeviewData;

            if (reloadContent) {
                ExploreNotebooksTreeviewManager.instance.lastNotebookId = treeviewNode.notebookId;
                ExploreNotepagesTreeviewManager.instance.lastNotepageId = treeviewNode.notepageId;
                ExploreNotepagesTreeviewManager.instance.reloadTreeviewData(true);
            }

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
                console.debug('Recent Notepage ' + node.notepageId + ' selected');

                ExploreNotebooksTreeviewManager.instance.lastNotebookId = node.notebookId;
                ExploreNotepagesTreeviewManager.instance.lastNotepageId = node.notepageId;

                ExploreNotepagesTreeviewManager.instance.reloadTreeviewData(true);
            },

            onNodeUnselected: function (event, node) {
                console.debug('Recent Notepage ' + node.notepageId + ' unselected');

                ExploreNotebooksTreeviewManager.instance.lastNotebookId = null;
                ExploreNotepagesTreeviewManager.instance.lastNotepageId = null;

                ExploreNotepagesTreeviewManager.instance.resetNotepageData(true);
            }
        });
    }
}
