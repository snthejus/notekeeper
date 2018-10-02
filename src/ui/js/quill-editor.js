var BlockEmbed = Quill.import('blots/block/embed');

class Video extends BlockEmbed {
  static create(value) {
    let node = super.create(value);

    let embedURL = Video.getVideoURL(value, 'embed');
    let watchURL = Video.getVideoURL(value, 'watch');

    if (embedURL && watchURL) {
      let iframe = document.createElement('iframe');
      iframe.setAttribute('class', 'quill_video_frame');
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('width', 500);
      iframe.setAttribute('height', 400);
      iframe.setAttribute('allowfullscreen', true);
      iframe.setAttribute('src', embedURL);

      if (QuillEditor.instance.isVideoEnabled) {
        iframe.setAttribute('style', 'display: inline');
      } else {
        iframe.setAttribute('style', 'display: none');
      }

      let paragraph = document.createElement("p");
      let text = document.createTextNode(watchURL);
      paragraph.appendChild(text);
      paragraph.setAttribute('style', 'background-color: #abebc6'); // light-green

      node.appendChild(paragraph);
      node.appendChild(iframe);

    } else {
      alert('Failed to parse video URL');
    }

    return node;
  }

  static getVideoURL(rawURL, outputFormat) {
    const YOUTUBE_EMBED_URL_PREFIX = 'https://www.youtube.com/embed/';
    const YOUTUBE_VIDEO_URL_PREFIX = 'https://www.youtube.com/watch?v=';
    const YOUTUBE_EMBED_URL_REGEX = /https?:\/\/www.youtube.com\/embed\/([-_a-zA-Z0-9]+).*/;
    const YOUTUBE_VIDEO_URL_REGEX = /https?:\/\/www.youtube.com\/watch\?v=([-_a-zA-Z0-9]+).*/;

    const FACEBOOK_VIDEO_URL_PREFIX = 'https://www.facebook.com/';
    const FACEBOOK_EMBED_URL_PREFIX = 'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2F';
    const FACEBOOK_VIDEO_SI_URL_REGEX = /https:\/\/www.facebook.com\/([^/]+)\/videos\/([0-9]+)\/?.*/;
    const FACEBOOK_VIDEO_SO_URL_REGEX = /https:\/\/www.facebook.com\/([^/]+)\/videos\/vb.[^/]+\/([0-9]+)\/?.*/;
    const FACEBOOK_EMBED_URL_REGEX = /https:\/\/www.facebook.com\/plugins\/video.php\?href=https%3A%2F%2Fwww.facebook.com%2F([^%]+)%2Fvideos%2F([^%]+)/;

    let youtubeWatchVideo = YOUTUBE_VIDEO_URL_REGEX.exec(rawURL);
    let youtubeEmbedVideo = YOUTUBE_EMBED_URL_REGEX.exec(rawURL);
    let facebookSIVideo = FACEBOOK_VIDEO_SI_URL_REGEX.exec(rawURL);
    let facebookSOVideo = FACEBOOK_VIDEO_SO_URL_REGEX.exec(rawURL);
    let facebookEmbedVideo = FACEBOOK_EMBED_URL_REGEX.exec(rawURL);

    if (youtubeWatchVideo || youtubeEmbedVideo) {
      let videoId;

      if (youtubeWatchVideo) {
        videoId = youtubeWatchVideo[1];
      } else if (youtubeEmbedVideo) {
        videoId = youtubeEmbedVideo[1];
      }

      if (outputFormat == 'embed') {
        return YOUTUBE_EMBED_URL_PREFIX + videoId;
      } else if (outputFormat == 'watch') {
        return YOUTUBE_VIDEO_URL_PREFIX + videoId;
      }

    } else if (facebookSIVideo || facebookSOVideo || facebookEmbedVideo) {
      let videoOwner, videoId;

      if (facebookSIVideo) {
        videoOwner = facebookSIVideo[1];
        videoId = facebookSIVideo[2];

      } else if (facebookSOVideo) {
        videoOwner = facebookSOVideo[1];
        videoId = facebookSOVideo[2];

      } else if (facebookEmbedVideo) {
        videoOwner = facebookEmbedVideo[1];
        videoId = facebookEmbedVideo[2];
      }

      if (outputFormat == 'embed') {
        return FACEBOOK_EMBED_URL_PREFIX + videoOwner + '%2Fvideos%2F' + videoId;
      } else if (outputFormat == 'watch') {
        return FACEBOOK_VIDEO_URL_PREFIX + videoOwner + '/videos/' + videoId;
      }
    }

    // unknown input/output format
    return "";
  }

  static value(domNode) {
    if (!domNode.firstChild) {
      // check for failure in URL parsing
      return "";

    } else {
      return domNode.firstChild.getAttribute('src');
    }
  }
}
Video.blotName = 'video';
Video.className = 'ql-video';
Video.tagName = 'div';

Quill.register({
  'formats/video': Video
});

const AUTO_SAVE_WAIT_TIME = 2000; // 2 seconds
const LOAD_WAIT_TIME = 250; // 0.25 seconds
const RESET_WAIT_TIME = 250; // 0.25 seconds

const TOOLBAR_OPTIONS = [
  ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
  ['blockquote', 'code-block'],

  [{ 'header': 1 }, { 'header': 2 }],               // custom button values
  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
  [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
  [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
  [{ 'direction': 'rtl' }],                         // text direction

  [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

  [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
  [{ 'font': [] }],
  [{ 'align': [] }],
  ['link', 'image', 'video'],
  ['clean']                                         // remove formatting button
];

class QuillEditor {
  static initialize() {
    // initialize the editor
    QuillEditor.instance = new QuillEditor();
    // register event handlers
    QuillEditor.instance.registerHandlers();
    // initialize typeahead for tags
    QuillEditor.instance.initializeTagsTypeahead();
    // make sure to reset (disable) the editor until some notepage is selected
    QuillEditor.instance.reset();
  }

  constructor() {
    // to indicate whether the notes is saved or not (saved by auto-save feature)
    this.isNotesEditedButton = $('#is-notes-edited-button');
    // to enable/disable notes editing (switch between read-only and read-write modes)
    this.isEditingEnabledButton = $('#is-editing-enabled-button');
    this.isEditingEnabled = true;
    // to enable/disable videos
    this.isVideoEnabledButton = $('#is-video-enabled-button');
    this.isVideoEnabled = true;

    this.titleEditor = $('#title-editor');
    this.tagsEditor = $('#tags-editor');
    this.sourceEditor = $('#source-editor');

    this.quillEditor = new Quill('#quill-editor', {
      modules: {
        toolbar: TOOLBAR_OPTIONS
      },
      theme: 'snow'
    });

    // information on notes being edited, and time saved etc.
    this.notesId = null;
    this.notesType = null;
    this.lastEditedTimestamp = null;
    this.lastSavedTimestamp = null;
    this.lastLoadTimestamp = null;
    this.lastResetTimestamp = null;

    this.tagsTypeaheadInitialized = false;
  }

  registerHandlers() {
    this.titleEditor.change(function () {
      if (QuillEditor.instance.isUserChange()) {
        // send data to server
        QuillEditor.instance.sendDataToServer();

        // reload treeview
        switch (QuillEditor.instance.getNotesType()) {
          case 'notebook':
            ExploreNotebooksTreeviewManager.instance.reloadTreeviewData(false);
            break;
          case 'notepage':
            ExploreNotepagesTreeviewManager.instance.reloadTreeviewData(false);
            break;
          default:
            console.warn('Unkown notesType on title change ' + QuillEditor.instance.getNotesType());
            alert('Failed to save title.');
            break;
        }
      }
    });

    this.tagsEditor.on('itemAdded', function (event) {
      if (QuillEditor.instance.isUserChange()) {
        QuillEditor.instance.sendDataToServer();

        // re-initialize the typeahead for tags (as a new tag was added).
        QuillEditor.instance.initializeTagsTypeahead();
      }
    });

    this.tagsEditor.on('itemRemoved', function (event) {
      if (QuillEditor.instance.isUserChange()) {
        QuillEditor.instance.sendDataToServer();
      }
    });

    this.sourceEditor.change(function () {
      if (QuillEditor.instance.isUserChange()) {
        QuillEditor.instance.sendDataToServer();
      }
    });

    this.quillEditor.on('text-change', function () {
      if (QuillEditor.instance.isUserChange()) {
        QuillEditor.instance.onContentChange();
      }
    });
  }

  getNotesId() {
    return this.notesId;
  }

  getNotesType() {
    return this.notesType;
  }

  getTitle() {
    return this.titleEditor.val();
  }

  getTags() {
    return this.tagsEditor.val();
  }

  getSource() {
    return this.sourceEditor.val();
  }

  getContent() {
    return this.quillEditor.root.innerHTML;
  }

  initializeTagsTypeahead() {
    let tagListResponse = ServerManager.instance.getTagsListForTypeahead();
    console.debug('Found tags: ' + tagListResponse);
    let tagList = JSON.parse(tagListResponse);

    if(!this.tagsTypeaheadInitialized) {
      console.log('Initializing Typeahead for tagsinput with ' + tagList.length + ' tags.');
      this.tagsTypeaheadInitialized = true;

    } else {
      console.log('(Reinitializing Typeahead for tagsinput with ' + tagList.length + ' tags.');
      this.tagsEditor.tagsinput('destroy');
    }

    let tags = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: $.map(tagList, function (tag) {
        return {
            name: tag
        };
      })
    });
    tags.initialize();

    this.tagsEditor.tagsinput({
      typeaheadjs: [{
          minLength: 1,
          highlight: true,
        },{
          name: 'tags',
          displayKey: 'name',
          valueKey: 'name',
          source: tags.ttAdapter()
        }]
    });
  }

  load(notesId, notesType, title, tags, source, content) {
    if (!this.saveIfEdited()) {
      return; // failed to save unsaved notes
    }

    this.lastLoadTimestamp = Date.now();

    // TODO PageLayout.instance.notesEditorTrigger('enable-notes-editor');

    if (this.isEditingEnabled) {
      this.titleEditor.prop('disabled', false);
      this.tagsEditor.prop('disabled', false);
      this.sourceEditor.prop('disabled', false);
    }

    this.notesId = notesId;
    this.notesType = notesType;

    this.titleEditor.val(title);
    this.sourceEditor.val(source);

    // reset value of tags
    this.tagsEditor.tagsinput('removeAll');
    for (let tag of tags.split(',')) {
      this.tagsEditor.tagsinput('add', tag);
    }
    this.tagsEditor.tagsinput('refresh');

    if (notesType == 'notepage') {
      if (this.isEditingEnabled) {
        this.quillEditor.enable(true);
      }

      // TODO Handle XSS attack
      this.quillEditor.clipboard.dangerouslyPasteHTML(content);

      // Disable 'undo' after loading the document
      this.quillEditor.history.clear();
    }
  }

  reset() {
    if (!this.saveIfEdited()) {
      return; // failed to save unsaved notes.
    }

    this.lastResetTimestamp = Date.now();

    this.notesId = null;
    this.notesType = null;
    this.titleEditor.val('');
    this.sourceEditor.val('');

    this.tagsEditor.tagsinput('removeAll');
    this.tagsEditor.tagsinput('refresh');

    this.quillEditor.clipboard.dangerouslyPasteHTML('');

    this.titleEditor.prop('disabled', true);
    this.tagsEditor.prop('disabled', true);
    this.sourceEditor.prop('disabled', true);
    this.quillEditor.enable(false);

    // TODO PageLayout.instance.notesEditorTrigger('disable-notes-editor');
  }

  /** Save any unsaved notes */
  saveIfEdited() {
    if (this.lastEditedTimestamp && this.notesId) {
      if (!this.sendDataToServer()) {
        alert('Failed to save notes.');
        return false;
      }
    }

    return true;
  }

  /** check if the edit is user-generated of programmatic (based on timestamp) */
  isUserChange() {
    let lastLoadTimestamp = this.lastLoadTimestamp;
    let lastResetTimestamp = this.lastResetTimestamp;
    let currentTimestamp = Date.now();

    if (!lastLoadTimestamp) {
      console.debug('Ignoring text change as no notes is loaded currently');
      return false; // no loaded notes. cannot be user change.

    } else {
      let elapsedTimeSinceLoad = currentTimestamp - lastLoadTimestamp;
      let elapsedTimeSinceReset = currentTimestamp - lastResetTimestamp;

      if (elapsedTimeSinceLoad <= LOAD_WAIT_TIME) {
        console.debug('Ignoring text change as notes was loaded ' + elapsedTimeSinceLoad + ' ms ago');
        return false; // programmatic load happened very recently.

      } else if (elapsedTimeSinceReset <= RESET_WAIT_TIME) {
        console.debug('Ignoring text change as notes was reset ' + elapsedTimeSinceReset + ' ms ago');
        return false; // programmatic reset happened very recently.

      } else {
        return true; // user change.
      }
    }
  }

  onContentChange() {
    let currentTimestamp = Date.now();

    // Mark as content edited. Send data to server after AUTO_SAVE_WAIT_TIME.
    if (this.lastEditedTimestamp == null) {
      // track the lastEditedTimestamp
      this.lastEditedTimestamp = currentTimestamp;
      // call sendTextToServer() method after AUTO_SAVE_WAIT_TIME (call once)
      setTimeout(function () { QuillEditor.instance.sendDataToServer() }, AUTO_SAVE_WAIT_TIME);
      // UI indication
      this.updateState_isNotesEdited('content-changed');

      console.debug('Text-edit detected. Changes will be auto-saved in ' + AUTO_SAVE_WAIT_TIME + ' ms.');

    } else {
      let elapsedTime = AUTO_SAVE_WAIT_TIME - (currentTimestamp - this.lastEditedTimestamp);
      console.debug('Text-edit detected. Changes are already tracked for auto-save in ' + elapsedTime + ' ms.');
    }
  }

  /** To send the latest data to server */
  sendDataToServer() {
    // clear lastEditedTimestamp (so that further edits are tracked).
    // before clearing the value, save the value for error handling.
    let tmpTimestamp = this.lastEditedTimestamp;
    this.lastEditedTimestamp = null;

    let snapshotTimestamp = Date.now();

    if (this.getNotesId()) {
      let success;
      switch (this.getNotesType()) {
        case 'notepage':
          success = ServerManager.instance.updateNotepage(this.getNotesId(), this.getTitle(), this.getTags(), this.getSource(), this.getContent());
          break;

        case 'notebook':
          success = ServerManager.instance.updateNotebook(this.getNotesId(), this.getTitle(), this.getTags(), this.getSource());
          break;

        default:
          console.error('Unknown notesType ' + this.getNotesType());
          this.lastEditedTimestamp = tmpTimestamp;
          alert('Failed to save notes.');
          return false;
      }

      if (success) {
        this.lastSavedTimestamp = snapshotTimestamp;
        console.debug('Text changes auto-saved at ' + snapshotTimestamp);

        // UI indication
        this.updateState_isNotesEdited('content-saved');
        return true;

      } else {
        console.error('Failed to save notepage data. Will retry after ' + AUTO_SAVE_WAIT_TIME + ' ms');
        this.lastEditedTimestamp = tmpTimestamp;

        // call sendTextToServer() method after AUTO_SAVE_WAIT_TIME (call once)
        setTimeout(function () { QuillEditor.instance.sendDataToServer() }, AUTO_SAVE_WAIT_TIME);
        return false;
      }

    } else {
      console.warn('No notes selected. Cannot save notes.');
      return false;
    }
  }

  // Call this function on detecting text-change or on-save
  updateState_isNotesEdited(arg) {
    if (arg == 'content-changed') {
      this.isNotesEditedButton.addClass('active');
    } else if (arg == 'content-saved') {
      this.isNotesEditedButton.removeClass('active');
    } else {
      console.warn('Unknown trigger to update isNotesEdited state ' + arg);
    }
  }

  toggleState_isEditingEnabled() {
    this.isEditingEnabled = !this.isEditingEnabled;
    console.info('Toggled isEditingEnabled to ' + this.isEditingEnabled);

    if (this.isEditingEnabled) {
      this.isEditingEnabledButton.removeClass('active');

      this.titleEditor.prop('disabled', false);
      this.tagsEditor.prop('disabled', false);
      this.sourceEditor.prop('disabled', false);
      this.quillEditor.enable(true);

    } else {
      this.isEditingEnabledButton.addClass('active');

      this.titleEditor.prop('disabled', true);
      this.tagsEditor.prop('disabled', true);
      this.sourceEditor.prop('disabled', true);
      this.quillEditor.enable(false);
    }
  }

  toggleState_isVideoEnabled() {
    this.isVideoEnabled = !this.isVideoEnabled;
    console.info('Toggled isVideoEnabled to ' + this.isVideoEnabled);

    if (this.isVideoEnabled) {
      this.isVideoEnabledButton.removeClass('active');

      // show video iframes
      for (let video_frame of document.querySelectorAll('.quill_video_frame')) {
        video_frame.style.display = 'inline';
      }

    } else {
      this.isVideoEnabledButton.addClass('active');

      // hide video iframes
      for (let video_frame of document.querySelectorAll('.quill_video_frame')) {
        video_frame.style.display = 'none';
      }
    }
  }
}
