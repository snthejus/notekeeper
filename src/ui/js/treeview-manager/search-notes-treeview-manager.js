class SearchNotesTreeviewManager {
    static initialize() {
        SearchNotesTreeviewManager.instance = new SearchNotesTreeviewManager();
    }

    constructor() {
        this.treeview = $('#search-notes-treeview');
        this.treeviewData = []; // intially empty
        this.lastSelectedTreeviewNode = null;
    }

    reloadTreeviewData() {
        var searchText = $('#search-notes-textbox').val();
        if (searchText) {
            var response = ServerManager.instance.getSearchNotesTreeviewData(searchText);
            this.treeviewData = JSON.parse(response);

            // unselect the previously selected node
            this.lastSelectedTreeviewNode = null;
            this.loadSeachNotesData();

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
                console.debug('Search Notepage ' + node.notepageId + ' selected');
                SearchNotesTreeviewManager.instance.lastSelectedTreeviewNode = node;
                SearchNotesTreeviewManager.instance.loadSeachNotesData();
            },

            onNodeUnselected: function (event, node) {
                console.debug('Search Notepage ' + node.notepageId + ' unselected');
                SearchNotesTreeviewManager.instance.lastSelectedTreeviewNode = null;
                SearchNotesTreeviewManager.instance.loadSeachNotesData();
            }
        });
    }

    loadSeachNotesData() {
        if (this.lastSelectedTreeviewNode) {
            ExploreNotebooksTreeviewManager.instance.lastNotebookId = this.lastSelectedTreeviewNode.notebookId;
            ExploreNotepagesTreeviewManager.instance.lastNotepageId = this.lastSelectedTreeviewNode.notepageId;
            ExploreNotepagesTreeviewManager.instance.reloadTreeviewData(true);

        } else {
            ExploreNotebooksTreeviewManager.instance.lastNotebookId = null;
            ExploreNotepagesTreeviewManager.instance.lastNotepageId = null;
            ExploreNotepagesTreeviewManager.instance.resetNotepageData(true);
        }
    }
}
