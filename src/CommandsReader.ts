import {Command, CopyCommand} from 'ya-dockerfile-parser';

export interface CommandsReader {
    getPackageJsonCommand(): CopyCommand;
    getDependenciesCommands(): Command[];
    getApplicationCommands(): Command[];
}
