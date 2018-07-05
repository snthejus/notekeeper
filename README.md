# NoteKeeper
A simple and easy-to-use tool to save, organize and retrieve all your notes.

## Features
- Supports rich-text editing
- Create notepages to add notes
- Create notebooks to organize the notepages
- Create nested notebooks and notepages for better organization
- Copy-paste entire webpage from any web browser to notepage
- Add images to notepage
- Add videos to notepage (only Youtube and Facebook videos are supported as of now)


## How to use

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
$ git clone https://github.com/snthejus/notekeeper.git
# Go into the repository
$ cd notekeeper
# Install bower GLOBALLY
$ npm install -g bower
# Install dependencies
$ npm install
# Run the app
$ npm start

# [Optional] Package the app, so that you can share the compiled binary with others. This may takes 2-5 mins.
$ export ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES=true
$ npm run dist # Once complete, you can find the compiled binary at dist/mac/notekeeper.app (for Mac OS)
```

## Documentation on the libraries used by NoteKeeper

- [Electron](https://electron.atom.io/)
- [Electron Docs](https://electron.atom.io/docs/)
- [Electron Quickstart](https://github.com/electron/electron-quick-start)

- [QuillJS](https://quilljs.com/)
- [QuillJS Docs](https://quilljs.com/docs/api/)
- [QuillJS Quickstart](https://quilljs.com/docs/quickstart/)


## Downloads used by NoteKeeper (Copyright references)

- Icon downloaded from [IconArchive](http://www.iconarchive.com/show/colobrush-icons-by-gianni-polito/note-edit-icon.html) - from [Gianni Polito](http://www.iconarchive.com/artist/gianni-polito.html) with [CC Attribution-Noncommercial-No Derivate 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/) license


## LICENSE

[MIT License](LICENSE)
