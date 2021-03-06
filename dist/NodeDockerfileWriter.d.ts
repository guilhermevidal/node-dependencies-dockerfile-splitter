import { Command } from 'ya-dockerfile-parser';
import { CommandsWriter } from './CommandsWriter';
export declare class NodeDockerfileWriter implements CommandsWriter {
    private _initialized;
    private _lineno;
    private _dockerfile;
    constructor();
    write(command: Command): this;
    private _initialize();
    private _skipLines(numberOfLines);
    private _writeFromCommand(cmd);
    private _writeMaintainerCommand(cmd);
    private _writeRunCommand(cmd);
    private _writeCmdCommand(cmd);
    private _writeLabelCommand(cmd);
    private _writeExposeCommand(cmd);
    private _writeEnvCommand(cmd);
    private _writeAddCommand(cmd);
    private _writeCopyCommand(cmd);
    private _writeEntrypointCommand(cmd);
    private _writeVolumeCommand(cmd);
    private _writeUserCommand(cmd);
    private _writeWorkdirCommand(cmd);
    private _writeArgCommand(cmd);
    private _writeOnbuildCommand(cmd);
    private _writeStopsignalCommand(cmd);
    private _writeCommentCommand(cmd);
    private _forEachKeyValuePair(object, cb);
    toString(): string;
    private _readAllText(cb);
}
