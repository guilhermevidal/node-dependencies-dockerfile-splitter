var Builder = require('node-dockerfile');
var NodeDockerfileWritter = (function () {
    function NodeDockerfileWritter() {
        this._initialized = false;
    }
    NodeDockerfileWritter.prototype.write = function (command) {
        this._initialize();
        this._skipLines(command.lineno - this._lineno);
        switch (command.name) {
            case DockerfileCommand.FROM:
                this._writeFromCommand(command);
                break;
            case DockerfileCommand.MAINTAINER:
                this._writeMaintainerCommand(command);
                break;
            case DockerfileCommand.RUN:
                this._writeRunCommand(command);
                break;
            case DockerfileCommand.CMD:
                this._writeCmdCommand(command);
                break;
            case DockerfileCommand.LABEL:
                this._writeLabelCommand(command);
                break;
            case DockerfileCommand.EXPOSE:
                this._writeExposeCommand(command);
                break;
            case DockerfileCommand.ENV:
                this._writeEnvCommand(command);
                break;
            case DockerfileCommand.ADD:
                this._writeAddCommand(command);
                break;
            case DockerfileCommand.COPY:
                this._writeCopyCommand(command);
                break;
            case DockerfileCommand.ENTRYPOINT:
                this._writeEntrypointCommand(command);
                break;
            case DockerfileCommand.VOLUME:
                this._writeVolumeCommand(command);
                break;
            case DockerfileCommand.USER:
                this._writeUserCommand(command);
                break;
            case DockerfileCommand.WORKDIR:
                this._writeWorkdirCommand(command);
                break;
            case DockerfileCommand.ARG:
                this._writeArgCommand(command);
                break;
            case DockerfileCommand.ONBUILD:
                this._writeOnbuildCommand(command);
                break;
            case DockerfileCommand.STOPSIGNAL:
                this._writeStopsignalCommand(command);
                break;
            case DockerfileCommand.COMMENT:
                this._writeCommentCommand(command);
                break;
            default: return;
        }
        this._lineno++;
        return this;
    };
    NodeDockerfileWritter.prototype._initialize = function () {
        if (!this._initialized) {
            this._initialized = true;
            this._lineno = 1;
            this._dockerfile = new Builder();
        }
    };
    NodeDockerfileWritter.prototype._skipLines = function (numberOfLines) {
        for (var index = 0; index < numberOfLines; index++) {
            this._dockerfile.newLine();
            this._lineno++;
        }
    };
    NodeDockerfileWritter.prototype._writeFromCommand = function (cmd) {
        this._dockerfile.from(cmd.args);
    };
    NodeDockerfileWritter.prototype._writeMaintainerCommand = function (cmd) {
        this._dockerfile.maintainer(cmd.args);
    };
    NodeDockerfileWritter.prototype._writeRunCommand = function (cmd) {
        if (Array.isArray(cmd.args))
            this._dockerfile.run(JSON.stringify(cmd.args));
        else
            this._dockerfile.run(cmd.args);
    };
    NodeDockerfileWritter.prototype._writeCmdCommand = function (cmd) {
        this._dockerfile.cmd(cmd.args);
    };
    NodeDockerfileWritter.prototype._writeLabelCommand = function (cmd) {
        var _this = this;
        this._forEachKeyValuePair(cmd.args, function (key, value) { return _this._dockerfile.label(key, value); });
    };
    NodeDockerfileWritter.prototype._writeExposeCommand = function (cmd) {
        var _this = this;
        var ports = cmd.args;
        ports.forEach(function (p) { return _this._dockerfile.expose(p); });
    };
    NodeDockerfileWritter.prototype._writeEnvCommand = function (cmd) {
        var _this = this;
        this._forEachKeyValuePair(cmd.args, function (key, value) { return _this._dockerfile.env(key, value); });
    };
    NodeDockerfileWritter.prototype._writeAddCommand = function (cmd) {
        this._dockerfile.add(cmd.args[0], cmd.args[1]);
    };
    NodeDockerfileWritter.prototype._writeCopyCommand = function (cmd) {
        var s = /(^("|'))|(("|')$)/g;
        this._dockerfile.copy(JSON.stringify([cmd.args[0].replace(s, ''), cmd.args[1].replace(s, '')]), '');
    };
    NodeDockerfileWritter.prototype._writeEntrypointCommand = function (cmd) {
        this._dockerfile.entryPoint(cmd.args);
    };
    NodeDockerfileWritter.prototype._writeVolumeCommand = function (cmd) {
        this._dockerfile.volume(cmd.args);
    };
    NodeDockerfileWritter.prototype._writeUserCommand = function (cmd) {
        this._dockerfile.user(cmd.args);
    };
    NodeDockerfileWritter.prototype._writeWorkdirCommand = function (cmd) {
        this._dockerfile.workDir(cmd.args);
    };
    NodeDockerfileWritter.prototype._writeArgCommand = function (cmd) {
        this._dockerfile.instructions.push({ command: cmd.name, instruction: cmd.args });
    };
    NodeDockerfileWritter.prototype._writeOnbuildCommand = function (cmd) {
        this._dockerfile.onBuild(cmd.args);
    };
    NodeDockerfileWritter.prototype._writeStopsignalCommand = function (cmd) {
        this._dockerfile.instructions.push({ command: cmd.name, instruction: cmd.args });
    };
    NodeDockerfileWritter.prototype._writeCommentCommand = function (cmd) {
        this._dockerfile.comment(cmd.args.toString().replace(/^#\s*/, ''));
    };
    NodeDockerfileWritter.prototype._forEachKeyValuePair = function (object, cb) {
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                cb(key, object[key]);
            }
        }
    };
    NodeDockerfileWritter.prototype.toString = function () {
        var contents = [];
        this._readAllText(function (chunk) { return contents.push(chunk); });
        return contents.join('');
    };
    NodeDockerfileWritter.prototype._readAllText = function (cb) {
        var readStream = this._dockerfile.writeStream();
        var chunk;
        while (null !== (chunk = readStream.read())) {
            cb(chunk.toString());
        }
    };
    return NodeDockerfileWritter;
})();
exports.NodeDockerfileWritter = NodeDockerfileWritter;
var DockerfileCommand = (function () {
    function DockerfileCommand() {
    }
    DockerfileCommand.FROM = "FROM";
    DockerfileCommand.MAINTAINER = "MAINTAINER";
    DockerfileCommand.RUN = "RUN";
    DockerfileCommand.CMD = "CMD";
    DockerfileCommand.LABEL = "LABEL";
    DockerfileCommand.EXPOSE = "EXPOSE";
    DockerfileCommand.ENV = "ENV";
    DockerfileCommand.ADD = "ADD";
    DockerfileCommand.COPY = "COPY";
    DockerfileCommand.ENTRYPOINT = "ENTRYPOINT";
    DockerfileCommand.VOLUME = "VOLUME";
    DockerfileCommand.USER = "USER";
    DockerfileCommand.WORKDIR = "WORKDIR";
    DockerfileCommand.ARG = "ARG";
    DockerfileCommand.ONBUILD = "ONBUILD";
    DockerfileCommand.STOPSIGNAL = "STOPSIGNAL";
    DockerfileCommand.COMMENT = "COMMENT";
    return DockerfileCommand;
})();
exports.DockerfileCommand = DockerfileCommand;
//# sourceMappingURL=NodeDockerfileWritter.js.map