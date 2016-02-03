import { CommandsReader } from './CommandsReader';
import { Command, CopyCommand } from './Command';
export declare class NodeDockerCommandsReader implements CommandsReader {
    private fileContents;
    constructor(fileContents: string);
    getPackageJsonCommand(): CopyCommand;
    private _packageJsonCommand;
    private getCopyPackageJsonCommand();
    getDependenciesCommands(): Command[];
    getApplicationCommands(): Command[];
    private npmInstallCommand;
    private _npmInstallCommand;
    private getNpmInstallCommand();
    private arrayContainsNpmInstall(args);
    private commands;
    private _commands;
    protected parseDockerfile(): Command[];
    private getFileContentsAsArray();
}
export declare class PackageJsonNotFoundError extends Error {
    constructor();
}
export declare class NpmInstallNotFoundError extends Error {
    constructor();
}
