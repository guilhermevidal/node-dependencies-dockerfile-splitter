var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../typings/main" />
var parser = require('docker-file-parser');
var os = require('os');
var NodeDockerCommandsReader = (function () {
    function NodeDockerCommandsReader(fileContents) {
        this.fileContents = fileContents;
    }
    NodeDockerCommandsReader.prototype.getPackageJsonCommand = function () {
        return this._packageJsonCommand || (this._packageJsonCommand = this.getCopyPackageJsonCommand());
    };
    NodeDockerCommandsReader.prototype.getCopyPackageJsonCommand = function () {
        var result = this.commands
            .filter(function (cmd) { return /(ADD|COPY)/g.test(cmd.name); })
            .filter(function (cmd) { return cmd.args.filter(function (arg) { return /package\.json/g.test(arg); }).length > 0; })[0];
        if (!result)
            throw new PackageJsonNotFoundError();
        return result;
    };
    NodeDockerCommandsReader.prototype.getDependenciesCommands = function () {
        return this.commands.slice(0, 1 + this.commands.indexOf(this.npmInstallCommand));
    };
    NodeDockerCommandsReader.prototype.getApplicationCommands = function () {
        return this.commands.slice(1 + this.commands.indexOf(this.npmInstallCommand));
    };
    Object.defineProperty(NodeDockerCommandsReader.prototype, "npmInstallCommand", {
        get: function () {
            return this._npmInstallCommand || (this._npmInstallCommand = this.getNpmInstallCommand());
        },
        enumerable: true,
        configurable: true
    });
    NodeDockerCommandsReader.prototype.getNpmInstallCommand = function () {
        var _this = this;
        var result = this.commands
            .filter(function (cmd) { return /(RUN|CMD)/g.test(cmd.name); })
            .filter(function (cmd) {
            if (Array.isArray(cmd.args))
                return _this.arrayContainsNpmInstall(cmd.args);
            return /npm\s+install/g.test(cmd.args);
        })[0];
        if (!result)
            throw new NpmInstallNotFoundError();
        return result;
    };
    NodeDockerCommandsReader.prototype.arrayContainsNpmInstall = function (args) {
        return args.indexOf('npm') >= 0 && args.indexOf('install') > 0;
    };
    Object.defineProperty(NodeDockerCommandsReader.prototype, "commands", {
        get: function () {
            return this._commands || (this._commands = this.parseDockerfile());
        },
        enumerable: true,
        configurable: true
    });
    NodeDockerCommandsReader.prototype.parseDockerfile = function () {
        return parser.parse(this.getFileContentsAsArray(), { includeComments: true });
    };
    NodeDockerCommandsReader.prototype.getFileContentsAsArray = function () {
        return this.fileContents
            .split(os.EOL)
            .join('\n');
    };
    return NodeDockerCommandsReader;
})();
exports.NodeDockerCommandsReader = NodeDockerCommandsReader;
var PackageJsonNotFoundError = (function (_super) {
    __extends(PackageJsonNotFoundError, _super);
    function PackageJsonNotFoundError() {
        _super.call(this);
        this.message = "Could not find an ADD or COPY command copying the package.json file.";
    }
    return PackageJsonNotFoundError;
})(Error);
exports.PackageJsonNotFoundError = PackageJsonNotFoundError;
var NpmInstallNotFoundError = (function (_super) {
    __extends(NpmInstallNotFoundError, _super);
    function NpmInstallNotFoundError() {
        _super.call(this);
        this.message = "Could not find a RUN or CMD command executing npm install";
    }
    return NpmInstallNotFoundError;
})(Error);
exports.NpmInstallNotFoundError = NpmInstallNotFoundError;
//# sourceMappingURL=NodeDockerCommandsReader.js.map