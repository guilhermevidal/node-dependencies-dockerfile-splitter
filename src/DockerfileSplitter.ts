/// <reference path="../typings/main" />
import * as fs from 'fs';
import * as path from 'path';

import {Command} from './Command';
import {CommandsReader} from './CommandsReader';
import {NodeDockerCommandsReader} from './NodeDockerCommandsReader';

export class DockerfileSplitter {
    constructor(private filename: string) { }

    getApplicationName(): Promise<string> {
        return this.packageJson.then(pkg => pkg.name);
    }

    getDependenciesImageName(): Promise<string> {
        return this.getApplicationName().then(name => name.concat('-deps'));
    }

    private get packageJson() {
        if (this._packageJson)
            return Promise.resolve(this._packageJson);


        var steps = (function(filename: string) {
            return {
                getPackageJsonCommandSrc: function(reader: CommandsReader) {
                    return reader.getPackageJsonCommand().args[0]
                },
                combineDockerfilePathWithPackageJsonPath: function(p: string) {
                    return path.join(path.dirname(filename), p);
                },
                checkIfExistsOrThrow: function(packageJsonPath: string) {
                    return new Promise<string>((resolve, reject) => {
                        fs.exists(packageJsonPath, (exists) => {
                            if (exists) resolve(packageJsonPath)
                            else reject(new PackageJsonFileCouldNotBeFoundError(packageJsonPath));
                        })
                    });
                },
                readPackageJson: function(packageJsonPath: string) {
                    return new Promise<any>((resolve, reject) => {
                        fs.readFile(packageJsonPath, (err, data) => {
                            if (err) reject(err);
                            else resolve(JSON.parse(data.toString()));
                        })
                    });
                },
            }
        })(this.filename);

        return this.reader
            .then(steps.getPackageJsonCommandSrc)
            .then(steps.combineDockerfilePathWithPackageJsonPath)
            .then(steps.checkIfExistsOrThrow)
            .then(steps.readPackageJson)
            .then(packageJson => this._packageJson = packageJson)
            ;
    }
    private _packageJson: any;

    private get reader(): Promise<CommandsReader> {
        if (this._reader)
            return Promise.resolve(this._reader);

        return this.createReader().then(reader => this._reader = reader);
    }
    private _reader: CommandsReader;

    protected createReader() {
        return this.getFileContents()
            .then(data => new NodeDockerCommandsReader(data))
    }

    protected getFileContents(): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(this.filename, (err, data) => {
                if (err) reject(err)
                else resolve(data.toString());
            })
        });
    }
}

export class PackageJsonFileCouldNotBeFoundError extends Error {
    constructor(pathUsed: string) {
        super();
        this.message = 'Could not find package.json file at "'.concat(pathUsed, '".');
    }

}