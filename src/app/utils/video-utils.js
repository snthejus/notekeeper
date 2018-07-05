const { logger } = require('./logger');

class VideoURLParser {
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
}

module.exports = {
    VideoURLParser
}
