/// <reference path="../typings/main" />
import * as fs from 'fs';
import * as path from 'path';
import * as Q from 'q';

import {Command, DockerfileCommand} from 'ya-dockerfile-parser';

import {CommandsReader} from './CommandsReader';
import {NodeDockerCommandsReader} from './NodeDockerCommandsReader';

import {CommandsWriter} from './CommandsWriter';
import {NodeDockerfileWriter} from './NodeDockerfileWriter';

export class DockerfileSplitter {
    constructor(private filename: string) { }

    split(): Promise<SplitFile> {
        return Q.all<any>([
            this.getApplicationName(),
            this.getVersion(),
            this.getDependenciesImageName(),
            this.reader,
        ]).spread((name: string, version: string, dependenciesName: string, reader: CommandsReader) => {
            return new Splitter(name, version, dependenciesName, reader).split();
        })
    }

    getApplicationName(): Promise<string> {
        return this.packageJson.then(pkg => pkg.name);
    }

    getVersion(): Promise<string> {
        return this.packageJson.then(pkg => pkg.version);
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

class Splitter {
    constructor(
        private name: string,
        private version: string,
        private dependenciesName: string,
        private reader: CommandsReader
    ) {
    }

    split(): SplitFile {
        return {
            name: this.name,
            version: this.version,
            dependencies: this.getDependenciesContents(),
            application: this.getApplicationContents()
        }
    }

    private getDependenciesContents() {
        this.reader.getDependenciesCommands()
            .forEach(cmd => {
                this.dependenciesWriter.write(cmd);
                this.numberOfLinesInDependencies++;
            });
        return this.dependenciesWriter.toString();
    }

    private getApplicationContents() {
        this.applicationWriter.write(this.createFromDependenciesCommand());
        this.reader.getApplicationCommands()
            .map(cmd => {
                cmd.lineno -= this.numberOfLinesInDependencies;
                return cmd;
            })
            .forEach(cmd => this.applicationWriter.write(cmd));
        return this.applicationWriter.toString();
    }
    private numberOfLinesInDependencies = 1;

    get dependenciesWriter(): CommandsWriter {
        return this._dependenciesWriter || (this._dependenciesWriter = this.createDependenciesWriter());
    }
    private _dependenciesWriter: CommandsWriter;
    protected createDependenciesWriter() {
        return new NodeDockerfileWriter();
    }

    get applicationWriter(): CommandsWriter {
        return this._applicationWriter || (this._applicationWriter = this.createApplicationWriter());
    }
    private _applicationWriter: CommandsWriter;
    protected createApplicationWriter() {
        return new NodeDockerfileWriter();
    }

    private createFromDependenciesCommand(): Command {
        return {
            name: DockerfileCommand.FROM,
            lineno: 0,
            args: this.dependenciesName
        };
    }
}

export interface SplitFile {
    name: string,
    version: string,
    dependencies: string;
    application: string;
}