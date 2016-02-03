import {Command, CopyCommand} from './Command';

export interface CommandsReader {
    getPackageJsonCommand(): CopyCommand;
    getDependenciesCommands(): Command[];
}
