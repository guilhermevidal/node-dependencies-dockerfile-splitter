var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../typings/main" />
var fs = require('fs');
var path = require('path');
var Q = require('q');
var ya_dockerfile_parser_1 = require('ya-dockerfile-parser');
var NodeDockerCommandsReader_1 = require('./NodeDockerCommandsReader');
var NodeDockerfileWriter_1 = require('./NodeDockerfileWriter');
var DockerfileSplitter = (function () {
    function DockerfileSplitter(filename) {
        this.filename = filename;
    }
    DockerfileSplitter.prototype.split = function () {
        return Q.all([
            this.getApplicationName(),
            this.getVersion(),
            this.getDependenciesImageName(),
            this.reader,
        ]).spread(function (name, version, dependenciesName, reader) {
            return new Splitter(name, version, dependenciesName, reader).split();
        });
    };
    DockerfileSplitter.prototype.getApplicationName = function () {
        return this.packageJson.then(function (pkg) { return pkg.name; });
    };
    DockerfileSplitter.prototype.getVersion = function () {
        return this.packageJson.then(function (pkg) { return pkg.version; });
    };
    DockerfileSplitter.prototype.getDependenciesImageName = function () {
        return this.getApplicationName().then(function (name) { return name.concat('-deps'); });
    };
    Object.defineProperty(DockerfileSplitter.prototype, "packageJson", {
        get: function () {
            var _this = this;
            if (this._packageJson)
                return Promise.resolve(this._packageJson);
            var steps = (function (filename) {
                return {
                    getPackageJsonCommandSrc: function (reader) {
                        return reader.getPackageJsonCommand().args[0];
                    },
                    combineDockerfilePathWithPackageJsonPath: function (p) {
                        return path.join(path.dirname(filename), p);
                    },
                    checkIfExistsOrThrow: function (packageJsonPath) {
                        return new Promise(function (resolve, reject) {
                            fs.exists(packageJsonPath, function (exists) {
                                if (exists)
                                    resolve(packageJsonPath);
                                else
                                    reject(new PackageJsonFileCouldNotBeFoundError(packageJsonPath));
                            });
                        });
                    },
                    readPackageJson: function (packageJsonPath) {
                        return new Promise(function (resolve, reject) {
                            fs.readFile(packageJsonPath, function (err, data) {
                                if (err)
                                    reject(err);
                                else
                                    resolve(JSON.parse(data.toString()));
                            });
                        });
                    },
                };
            })(this.filename);
            return this.reader
                .then(steps.getPackageJsonCommandSrc)
                .then(steps.combineDockerfilePathWithPackageJsonPath)
                .then(steps.checkIfExistsOrThrow)
                .then(steps.readPackageJson)
                .then(function (packageJson) { return _this._packageJson = packageJson; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DockerfileSplitter.prototype, "reader", {
        get: function () {
            var _this = this;
            if (this._reader)
                return Promise.resolve(this._reader);
            return this.createReader().then(function (reader) { return _this._reader = reader; });
        },
        enumerable: true,
        configurable: true
    });
    DockerfileSplitter.prototype.createReader = function () {
        return this.getFileContents()
            .then(function (data) { return new NodeDockerCommandsReader_1.NodeDockerCommandsReader(data); });
    };
    DockerfileSplitter.prototype.getFileContents = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fs.readFile(_this.filename, function (err, data) {
                if (err)
                    reject(err);
                else
                    resolve(data.toString());
            });
        });
    };
    return DockerfileSplitter;
})();
exports.DockerfileSplitter = DockerfileSplitter;
var PackageJsonFileCouldNotBeFoundError = (function (_super) {
    __extends(PackageJsonFileCouldNotBeFoundError, _super);
    function PackageJsonFileCouldNotBeFoundError(pathUsed) {
        _super.call(this);
        this.message = 'Could not find package.json file at "'.concat(pathUsed, '".');
    }
    return PackageJsonFileCouldNotBeFoundError;
})(Error);
exports.PackageJsonFileCouldNotBeFoundError = PackageJsonFileCouldNotBeFoundError;
var Splitter = (function () {
    function Splitter(name, version, dependenciesName, reader) {
        this.name = name;
        this.version = version;
        this.dependenciesName = dependenciesName;
        this.reader = reader;
        this.numberOfLinesInDependencies = 1;
    }
    Splitter.prototype.split = function () {
        return {
            name: this.name,
            version: this.version,
            dependencies: this.getDependenciesContents(),
            application: this.getApplicationContents()
        };
    };
    Splitter.prototype.getDependenciesContents = function () {
        var _this = this;
        this.reader.getDependenciesCommands()
            .forEach(function (cmd) {
            _this.dependenciesWriter.write(cmd);
            _this.numberOfLinesInDependencies++;
        });
        return this.dependenciesWriter.toString();
    };
    Splitter.prototype.getApplicationContents = function () {
        var _this = this;
        this.applicationWriter.write(this.createFromDependenciesCommand());
        this.reader.getApplicationCommands()
            .map(function (cmd) {
            cmd.lineno -= _this.numberOfLinesInDependencies;
            return cmd;
        })
            .forEach(function (cmd) { return _this.applicationWriter.write(cmd); });
        return this.applicationWriter.toString();
    };
    Object.defineProperty(Splitter.prototype, "dependenciesWriter", {
        get: function () {
            return this._dependenciesWriter || (this._dependenciesWriter = this.createDependenciesWriter());
        },
        enumerable: true,
        configurable: true
    });
    Splitter.prototype.createDependenciesWriter = function () {
        return new NodeDockerfileWriter_1.NodeDockerfileWriter();
    };
    Object.defineProperty(Splitter.prototype, "applicationWriter", {
        get: function () {
            return this._applicationWriter || (this._applicationWriter = this.createApplicationWriter());
        },
        enumerable: true,
        configurable: true
    });
    Splitter.prototype.createApplicationWriter = function () {
        return new NodeDockerfileWriter_1.NodeDockerfileWriter();
    };
    Splitter.prototype.createFromDependenciesCommand = function () {
        return {
            name: ya_dockerfile_parser_1.DockerfileCommand.FROM,
            lineno: 0,
            args: this.dependenciesName
        };
    };
    return Splitter;
})();
//# sourceMappingURL=DockerfileSplitter.js.map