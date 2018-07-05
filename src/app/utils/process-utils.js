class ProcessUtils {
    static getCWD() {
        let pwd = process.cwd();
        if (pwd == '/') {
            let dirnameIndex = __dirname.indexOf('/notekeeper.app');
            if (dirnameIndex == -1) {
                throw 'Failed to get current working directory. Could not find /notekeeper.app in __dirname.';
            }
            pwd = __dirname.substring(0, dirnameIndex);
        }

        return pwd;
    }
}

module.exports = {
    ProcessUtils
}
