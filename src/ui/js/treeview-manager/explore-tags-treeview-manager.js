class ExploreTagsTreeviewManager {
    static initialize() {
        ExploreTagsTreeviewManager.instance = new ExploreTagsTreeviewManager();
    }

    constructor() {
        this.treeview = $('#explore-tags-treeview');
        this.treeviewData = []; // intially empty
    }

    loadTagsData() {
        let exploreTagsTreeviewData = ServerManager.instance.getExploreTagsTreeviewData();
        if (exploreTagsTreeviewData) {
            this.treeviewData = JSON.parse(exploreTagsTreeviewData);
        } else {
            this.treeviewData = '[]';
        }

        this.resetNotepageData(null);
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
                console.debug('Tag ' + node.text + ' selected');
                ExploreTagsTreeviewManager.instance.resetNotepageData(node.text);
            },

            onNodeUnselected: function (event, node) {
                console.debug('Tag ' + node.text + ' unselected');
                ExploreTagsTreeviewManager.instance.resetNotepageData(null);
            }
        });
    }

    resetNotepageData(searchTag) {
        ExploreNotebooksTreeviewManager.instance.lastNotebookId = null;
        ExploreNotepagesTreeviewManager.instance.lastNotepageId = null;

        // if searchTag is null, then this resets the quill editor.
        ExploreNotepagesTreeviewManager.instance.reloadTreeviewDataForTagSearch(searchTag);
    }
}
