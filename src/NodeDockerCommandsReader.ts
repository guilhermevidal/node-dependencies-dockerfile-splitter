/// <reference path="../typings/main" />
import * as parser from 'docker-file-parser';
import * as os from 'os';

import {CommandsReader} from './CommandsReader';
import {Command, CopyCommand} from './Command';

export class NodeDockerCommandsReader implements CommandsReader {
    constructor(private fileContents: string) {
    }

    getPackageJsonCommand() {
        return this._packageJsonCommand || (this._packageJsonCommand = this.getCopyPackageJsonCommand());
    }
    private _packageJsonCommand: CopyCommand;

    private getCopyPackageJsonCommand() {
        var result = <CopyCommand>this.commands
            .filter((cmd) => /(ADD|COPY)/g.test(cmd.name))
            .filter((cmd: CopyCommand) => cmd.args.filter((arg) => /package\.json/g.test(arg)).length > 0)
        [0];

        if (!result)
            throw new PackageJsonNotFoundError();

        return result;
    }

    getDependenciesCommands(): Command[] {
        return this.commands.slice(0, 1 + this.commands.indexOf(this.npmInstallCommand));
    }

    getApplicationCommands() {
        return this.commands.slice(1 + this.commands.indexOf(this.npmInstallCommand));
    }
    
    private get npmInstallCommand() {
        return this._npmInstallCommand || (this._npmInstallCommand = this.getNpmInstallCommand());
    }
    private _npmInstallCommand: Command;

    private getNpmInstallCommand() {
        var result = this.commands
            .filter((cmd) => /(RUN|CMD)/g.test(cmd.name))
            .filter((cmd) => {
                if (Array.isArray(cmd.args))
                    return this.arrayContainsNpmInstall(<string[]>cmd.args);
                return /npm\s+install/g.test(<string>cmd.args);
            })
        [0];

        if (!result)
            throw new NpmInstallNotFoundError();

        return result;
    }
    private arrayContainsNpmInstall(args: string[]) {
        return args.indexOf('npm') >= 0 && args.indexOf('install') > 0;
    }

    private get commands() {
        return this._commands || (this._commands = this.parseDockerfile());
    }
    private _commands: Command[];

    protected parseDockerfile(): Command[] {
        return <Command[]>parser.parse(this.getFileContentsAsArray(), { includeComments: true });
    }

    private getFileContentsAsArray() {
        return this.fileContents
            .split(os.EOL)
            .join('\n');
    }
}

export class PackageJsonNotFoundError extends Error {
    constructor() {
        super();
        this.message = "Could not find an ADD or COPY command copying the package.json file.";
    }
}

export class NpmInstallNotFoundError extends Error {
    constructor() {
        super();
        this.message = "Could not find a RUN or CMD command executing npm install";
    }
}