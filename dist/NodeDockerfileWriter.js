var ya_dockerfile_parser_1 = require('ya-dockerfile-parser');
var Builder = require('node-dockerfile');
var NodeDockerfileWriter = (function () {
    function NodeDockerfileWriter() {
        this._initialized = false;
    }
    NodeDockerfileWriter.prototype.write = function (command) {
        this._initialize();
        this._skipLines(command.lineno - this._lineno);
        switch (command.name) {
            case ya_dockerfile_parser_1.DockerfileCommand.FROM:
                this._writeFromCommand(command);
                break;
            case ya_dockerfile_parser_1.DockerfileCommand.MAINTAINER:
                this._writeMaintainerCommand(command);
                break;
            case ya_dockerfile_parser_1.DockerfileCommand.RUN:
                this._writeRunCommand(command);
                break;
            case ya_dockerfile_parser_1.DockerfileCommand.CMD:
                this._writeCmdCommand(command);
                break;
            case ya_dockerfile_parser_1.DockerfileCommand.LABEL:
                this._writeLabelCommand(command);
                break;
            case ya_dockerfile_parser_1.DockerfileCommand.EXPOSE:
                this._writeExposeCommand(command);
                break;
            case ya_dockerfile_parser_1.DockerfileCommand.ENV:
                this._writeEnvCommand(command);
                break;
            case ya_dockerfile_parser_1.DockerfileCommand.ADD:
                this._writeAddCommand(command);
                break;
            case ya_dockerfile_parser_1.DockerfileCommand.COPY:
                this._writeCopyCommand(command);
                break;
            case ya_dockerfile_parser_1.DockerfileCommand.ENTRYPOINT:
                this._writeEntrypointCommand(command);
                break;
            case ya_dockerfile_parser_1.DockerfileCommand.VOLUME:
                this._writeVolumeCommand(command);
                break;
            case ya_dockerfile_parser_1.DockerfileCommand.USER:
                this._writeUserCommand(command);
                break;
            case ya_dockerfile_parser_1.DockerfileCommand.WORKDIR:
                this._writeWorkdirCommand(command);
                break;
            case ya_dockerfile_parser_1.DockerfileCommand.ARG:
                this._writeArgCommand(command);
                break;
            case ya_dockerfile_parser_1.DockerfileCommand.ONBUILD:
                this._writeOnbuildCommand(command);
                break;
            case ya_dockerfile_parser_1.DockerfileCommand.STOPSIGNAL:
                this._writeStopsignalCommand(command);
                break;
            case ya_dockerfile_parser_1.DockerfileCommand.COMMENT:
                this._writeCommentCommand(command);
                break;
            default: return;
        }
        this._lineno++;
        return this;
    };
    NodeDockerfileWriter.prototype._initialize = function () {
        if (!this._initialized) {
            this._initialized = true;
            this._lineno = 1;
            this._dockerfile = new Builder();
        }
    };
    NodeDockerfileWriter.prototype._skipLines = function (numberOfLines) {
        for (var index = 0; index < numberOfLines; index++) {
            this._dockerfile.newLine();
            this._lineno++;
        }
    };
    NodeDockerfileWriter.prototype._writeFromCommand = function (cmd) {
        this._dockerfile.from(cmd.args);
    };
    NodeDockerfileWriter.prototype._writeMaintainerCommand = function (cmd) {
        this._dockerfile.maintainer(cmd.args);
    };
    NodeDockerfileWriter.prototype._writeRunCommand = function (cmd) {
        if (Array.isArray(cmd.args))
            this._dockerfile.run(JSON.stringify(cmd.args));
        else
            this._dockerfile.run(cmd.args);
    };
    NodeDockerfileWriter.prototype._writeCmdCommand = function (cmd) {
        this._dockerfile.cmd(cmd.args);
    };
    NodeDockerfileWriter.prototype._writeLabelCommand = function (cmd) {
        var _this = this;
        this._forEachKeyValuePair(cmd.args, function (key, value) { return _this._dockerfile.label(key, value); });
    };
    NodeDockerfileWriter.prototype._writeExposeCommand = function (cmd) {
        var _this = this;
        var ports = cmd.args;
        ports.forEach(function (p) { return _this._dockerfile.expose(p); });
    };
    NodeDockerfileWriter.prototype._writeEnvCommand = function (cmd) {
        var _this = this;
        this._forEachKeyValuePair(cmd.args, function (key, value) { return _this._dockerfile.env(key, value); });
    };
    NodeDockerfileWriter.prototype._writeAddCommand = function (cmd) {
        var s = /(^("|'))|(("|')$)/g;
        this._dockerfile.add(cmd.args[0].replace(s, ''), cmd.args[1].replace(s, ''));
    };
    NodeDockerfileWriter.prototype._writeCopyCommand = function (cmd) {
        var s = /(^("|'))|(("|')$)/g;
        this._dockerfile.copy(JSON.stringify([cmd.args[0].replace(s, ''), cmd.args[1].replace(s, '')]), '');
    };
    NodeDockerfileWriter.prototype._writeEntrypointCommand = function (cmd) {
        this._dockerfile.entryPoint(cmd.args);
    };
    NodeDockerfileWriter.prototype._writeVolumeCommand = function (cmd) {
        this._dockerfile.volume(cmd.args);
    };
    NodeDockerfileWriter.prototype._writeUserCommand = function (cmd) {
        this._dockerfile.user(cmd.args);
    };
    NodeDockerfileWriter.prototype._writeWorkdirCommand = function (cmd) {
        this._dockerfile.workDir(cmd.args);
    };
    NodeDockerfileWriter.prototype._writeArgCommand = function (cmd) {
        var _this = this;
        this._forEachKeyValuePair(cmd.args, function (key, value) {
            var args = (value === undefined) ? key : ''.concat(key, '=', value);
            _this._dockerfile.instructions.push({ command: cmd.name, instruction: args });
        });
    };
    NodeDockerfileWriter.prototype._writeOnbuildCommand = function (cmd) {
        this._dockerfile.onBuild(cmd.args);
    };
    NodeDockerfileWriter.prototype._writeStopsignalCommand = function (cmd) {
        this._dockerfile.instructions.push({ command: cmd.name, instruction: cmd.args });
    };
    NodeDockerfileWriter.prototype._writeCommentCommand = function (cmd) {
        this._dockerfile.comment(cmd.args.toString().replace(/^#\s*/, ''));
    };
    NodeDockerfileWriter.prototype._forEachKeyValuePair = function (object, cb) {
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                cb(key, object[key]);
            }
        }
    };
    NodeDockerfileWriter.prototype.toString = function () {
        var contents = [];
        this._readAllText(function (chunk) { return contents.push(chunk); });
        return contents.join('');
    };
    NodeDockerfileWriter.prototype._readAllText = function (cb) {
        var readStream = this._dockerfile.writeStream();
        var chunk;
        while (null !== (chunk = readStream.read())) {
            cb(chunk.toString());
        }
    };
    return NodeDockerfileWriter;
})();
exports.NodeDockerfileWriter = NodeDockerfileWriter;
//# sourceMappingURL=NodeDockerfileWriter.js.map