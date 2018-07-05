class Constants {

}

// Declare static constant values

// App version
Constants.APP_DATA_VERSION = '1.0';

// Debug/Prod build
Constants.IS_DEBUG_BUILD = false;
Constants.IS_DEV_TOOLS_ENABLED = true;
Constants.OPEN_DEV_TOOLS_ON_LAUNCH = false;

// Window width/height
Constants.WINDOW_WIDTH = 1100;
Constants.WINDOW_HEIGHT = 700;

// Split as words (for search)
Constants.WORD_SPLIT_REGEX = /\b(\w+)\b/g;

// Number of recent notepage history
Constants.MAX_RECENT_NOTEPAGES = 20;

module.exports = {
    Constants
}
