var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../typings/main" />
var fs = require('fs');
var path = require('path');
var NodeDockerCommandsReader_1 = require('./NodeDockerCommandsReader');
var DockerfileSplitter = (function () {
    function DockerfileSplitter(filename) {
        this.filename = filename;
    }
    DockerfileSplitter.prototype.getApplicationName = function () {
        return this.packageJson.then(function (pkg) { return pkg.name; });
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
//# sourceMappingURL=DockerfileSplitter.js.map