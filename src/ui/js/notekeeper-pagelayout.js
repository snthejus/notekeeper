
class PageLayout {

    static initialize() {
        PageLayout.instance = new PageLayout();

        // add event handlers
        PageLayout.registerHandlers();

        // calculate the initial offsets, and adjust screen elements
        PageLayout.onWindowResize();
    }

    static registerHandlers() {
        PageLayout.instance.leftResizeHandle.on('mousedown', PageLayout.onLeftResizeMouseDown);
        PageLayout.instance.rightResizeHandle.on('mousedown', PageLayout.onRightResizeMouseDown);
        $(document).on('mousemove', PageLayout.onMouseMove);
        $(document).on('mouseup', PageLayout.onMouseUp);
        $(window).resize(PageLayout.onWindowResize);

        $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            // disable the editor
            QuillEditor.instance.reset();

            // get activated tab
            let target = $(e.target).attr("href");

            if (target == '#explore-notebooks') {
                ExploreNotebooksTreeviewManager.instance.reloadTreeviewData(true);

            } else if (target == '#recent-notes') {
                RecentNotesTreeviewManager.instance.reloadTreeviewData(true);

            } else if (target == '#search-notes') {
                // Do not reload treeview data. Just reload notes content.
                SearchNotesTreeviewManager.instance.loadSeachNotesData();
            }
        });

        $('#search-notes-textbox').keyup(function (e) {
            if (e.keyCode == 13) {
                // Reload treeview data.
                SearchNotesTreeviewManager.instance.reloadTreeviewData(true);
            }
        });
    }

    constructor() {
        this.mainSection = $('#main-section');
        this.leftPanel = $('#left-panel');
        this.middlePanel = $('#middle-panel');
        this.rightPanel = $('#right-panel');
        this.leftResizeHandle = $('#left-resize-handle');
        this.rightResizeHandle = $('#right-resize-handle');

        this.notesEditorSection = $('#notes-editor-div');
        this.notesMetadataEditorSection = $('#notes-metadata-editor-div');
        this.notesContentEditorSection = $('#notes-content-editor-div');

        this.titleEditor = $('#title-editor');
        this.tagsEditor = $('#tags-editor');
        this.sourceEditor = $('#source-editor');
        this.quillEditor = $('#quill-editor');
        this.quillEditorToolbar = $('#notes-editor-div .ql-toolbar.ql-snow');

        this.exploreNotebooksSection = $('#explore-notebooks');
        this.exploreNotebooksTreeviewController = $('#explore-notebooks-treeview-controller');
        this.exploreNotebooksTreeviewScroller = $('#explore-notebooks-treeview-scroller');

        this.exploreNotepagesSection = $('#explore-notepages');
        this.exploreNotepagesTreeviewController = $('#explore-notepages-treeview-controller');
        this.exploreNotepagesTreeviewScroller = $('#explore-notepages-treeview-scroller');

        this.recentNotesSection = $('#recent-notes');
        this.recentNotesTreeviewController = $('#recent-notes-treeview-controller');
        this.recentNotesTreeviewScroller = $('#recent-notes-treeview-scroller');

        this.searchNotesSection = $('#search-notes');
        this.searchNotesTreeviewController = $('#search-notes-treeview-controller');
        this.searchNotesTreeviewScroller = $('#search-notes-treeview-scroller');

        this.leftResizeHandleOffset = 0;
        this.rightResizeHandleOffset = 0;
        this.isLeftResizing = false;
        this.isRightResizing = false;
        this.leftResizeRatio = 0.25; /* 25% left-panel */
        this.rightResizeRatio = 0.55; /* 55% right-panel */

        // to enable/disable fullscreen mode
        this.isFullscreenModeEnabledButton = $('#is-fullscreen-mode-enabled-button');
        this.isFullscreenModeEnabled = false;
    }

    static onLeftResizeMouseDown() {
        let pl = PageLayout.instance;

        // start resizing
        pl.isLeftResizing = true;
    }

    static onRightResizeMouseDown() {
        let pl = PageLayout.instance;

        // start resizing
        pl.isRightResizing = true;
    }

    static onMouseMove(e) {
        let pl = PageLayout.instance;

        if (!(pl.isLeftResizing || pl.isRightResizing)) {
            // we don't want to do anything if we aren't resizing.
            return;
        }

        let mainSectionWidth = pl.mainSection.width();
        let mainSectionOffsetLeft = pl.mainSection.offset().left;
        let mainSectionOffsetRight = pl.mainSection.offset().left + pl.mainSection.width();

        if (pl.isLeftResizing) {
            pl.leftResizeRatio = (e.clientX - mainSectionOffsetLeft) / mainSectionWidth;
        } else if (pl.isRightResizing) {
            pl.rightResizeRatio = (mainSectionOffsetRight - e.clientX) / mainSectionWidth;
        } else {
            // we don't want to do anything if we aren't resizing.
        }

        PageLayout.onWindowResize();
    }

    static onMouseUp() {
        let pl = PageLayout.instance;

        // stop resizing
        pl.isLeftResizing = false;
        pl.isRightResizing = false;
    }

    static onWindowResize() {
        let pl = PageLayout.instance;

        let mainSectionWidth = pl.mainSection.width();
        let mainSectionOffsetLeft = pl.mainSection.offset().left;
        let mainSectionOffsetRight = pl.mainSection.offset().left + pl.mainSection.width();

        pl.leftResizeHandleOffset = Math.floor(pl.leftResizeRatio * mainSectionWidth) + mainSectionOffsetLeft;
        pl.rightResizeHandleOffset = mainSectionOffsetRight - Math.floor(pl.rightResizeRatio * mainSectionWidth);

        pl.leftPanel.css('right', mainSectionWidth - pl.leftResizeHandleOffset);
        pl.middlePanel.css('left', pl.leftResizeHandleOffset);
        pl.middlePanel.css('right', mainSectionWidth - pl.rightResizeHandleOffset);
        pl.rightPanel.css('left', pl.rightResizeHandleOffset);

        let quillEditorHeight = parseInt(pl.notesEditorSection.height() //
            - pl.titleEditor.outerHeight() - pl.tagsEditor.outerHeight() //
            - pl.sourceEditor.outerHeight() - pl.quillEditorToolbar.outerHeight());
        pl.quillEditor.height(quillEditorHeight);

        let leftPanelTreeviewWidth = pl.leftPanel.width();
        let middlePanelTreeviewWidth = pl.middlePanel.width();

        let exploreNotebooksTreeviewScrollerHeight = parseInt(pl.leftPanel.height() //
            // height of button is 34px
            - (pl.exploreNotebooksTreeviewController.outerHeight() || 34)
        );
        let exploreNotepagesTreeviewScrollerHeight = parseInt(pl.middlePanel.height() //
            // height of button is 34px
            - (pl.exploreNotepagesTreeviewController.outerHeight() || 34)
        );

        let recentNotesTreeviewScrollerHeight = pl.leftPanel.height();
        let searchNotesTreeviewScrollerHeight = parseInt(pl.leftPanel.height() //
            // height of button is 34px
            // TODO check why button is 1px off from textbox
            - (pl.searchNotesTreeviewController.outerHeight() || 35)
        );

        pl.exploreNotebooksSection.width(leftPanelTreeviewWidth);
        pl.exploreNotebooksTreeviewScroller.height(exploreNotebooksTreeviewScrollerHeight);

        pl.exploreNotepagesSection.width(middlePanelTreeviewWidth);
        pl.exploreNotepagesTreeviewScroller.height(exploreNotepagesTreeviewScrollerHeight);

        pl.recentNotesSection.width(leftPanelTreeviewWidth);
        pl.recentNotesTreeviewScroller.height(recentNotesTreeviewScrollerHeight);

        pl.searchNotesSection.width(leftPanelTreeviewWidth);
        pl.searchNotesTreeviewScroller.height(searchNotesTreeviewScrollerHeight);

        // If fullscreen mode is enabled
        if (pl.isFullscreenModeEnabled) {
            pl.rightPanel.css('left', 0);
        }
    }

    toggleState_isFullscreenModeEnabled() {
        let pl = PageLayout.instance;

        pl.isFullscreenModeEnabled = !pl.isFullscreenModeEnabled;
        console.info('Toggled isFullscreenModeEnabled to ' + pl.isFullscreenModeEnabled);

        if (pl.isFullscreenModeEnabled) {
            pl.isFullscreenModeEnabledButton.addClass('active');

            pl.leftPanel.css('display', 'none');
            pl.middlePanel.css('display', 'none');
            pl.rightResizeHandle.css('display', 'none');
            pl.rightPanel.css('left', 0);

        } else {
            pl.isFullscreenModeEnabledButton.removeClass('active');

            pl.leftPanel.css('display', 'block');
            pl.middlePanel.css('display', 'block');
            pl.rightResizeHandle.css('display', 'block');
            pl.rightPanel.css('left', pl.rightResizeHandleOffset);
        }
    }
}
