/// <reference path="../typings/main" />
import * as stream from 'stream';

import {Command} from './Command';
import {CommandsWritter} from './CommandsWritter';
import * as Builder from 'node-dockerfile';

export class NodeDockerfileWritter implements CommandsWritter {
    private _initialized = false;
    private _lineno: number;
    private _dockerfile: any;

    constructor() {
    }

    write(command: Command) {
        this._initialize();
        this._skipLines(command.lineno - this._lineno);

        switch (command.name) {
            case DockerfileCommand.FROM: this._writeFromCommand(command); break;
            case DockerfileCommand.MAINTAINER: this._writeMaintainerCommand(command); break;
            case DockerfileCommand.RUN: this._writeRunCommand(command); break;
            case DockerfileCommand.CMD: this._writeCmdCommand(command); break;
            case DockerfileCommand.LABEL: this._writeLabelCommand(command); break;
            case DockerfileCommand.EXPOSE: this._writeExposeCommand(command); break;
            case DockerfileCommand.ENV: this._writeEnvCommand(command); break;
            case DockerfileCommand.ADD: this._writeAddCommand(command); break;
            case DockerfileCommand.COPY: this._writeCopyCommand(command); break;
            case DockerfileCommand.ENTRYPOINT: this._writeEntrypointCommand(command); break;
            case DockerfileCommand.VOLUME: this._writeVolumeCommand(command); break;
            case DockerfileCommand.USER: this._writeUserCommand(command); break;
            case DockerfileCommand.WORKDIR: this._writeWorkdirCommand(command); break;
            case DockerfileCommand.ARG: this._writeArgCommand(command); break;
            case DockerfileCommand.ONBUILD: this._writeOnbuildCommand(command); break;
            case DockerfileCommand.STOPSIGNAL: this._writeStopsignalCommand(command); break;
            case DockerfileCommand.COMMENT: this._writeCommentCommand(command); break;
            default: return;
        }

        this._lineno++;
        return this;
    }

    private _initialize() {
        if (!this._initialized) {
            this._initialized = true;
            this._lineno = 1;
            this._dockerfile = new Builder();
        }
    }

    private _skipLines(numberOfLines: number) {
        for (var index = 0; index < numberOfLines; index++) {
            this._dockerfile.newLine();
            this._lineno++;
        }
    }

    private _writeFromCommand(cmd: Command) {
        this._dockerfile.from(cmd.args);
    }
    private _writeMaintainerCommand(cmd: Command) {
        this._dockerfile.maintainer(cmd.args);
    }
    private _writeRunCommand(cmd: Command) {
        if (Array.isArray(cmd.args))
            this._dockerfile.run(JSON.stringify(cmd.args));
        else
            this._dockerfile.run(cmd.args);
    }
    private _writeCmdCommand(cmd: Command) {
        this._dockerfile.cmd(cmd.args);
    }
    private _writeLabelCommand(cmd: Command) {
        this._forEachKeyValuePair(cmd.args, (key, value) => this._dockerfile.label(key, value));
    }
    private _writeExposeCommand(cmd: Command) {
        var ports = <string[]>cmd.args;
        ports.forEach(p => this._dockerfile.expose(p));
    }
    private _writeEnvCommand(cmd: Command) {
        this._forEachKeyValuePair(cmd.args, (key, value) => this._dockerfile.env(key, value));
    }
    private _writeAddCommand(cmd: Command) {
        this._dockerfile.add(cmd.args[0], cmd.args[1]);
    }
    private _writeCopyCommand(cmd: Command) {
        var s = /(^("|'))|(("|')$)/g;
        this._dockerfile.copy(JSON.stringify([cmd.args[0].replace(s, ''), cmd.args[1].replace(s, '')]), '');
    }
    private _writeEntrypointCommand(cmd: Command) {
        this._dockerfile.entryPoint(cmd.args);
    }
    private _writeVolumeCommand(cmd: Command) {
        this._dockerfile.volume(cmd.args);
    }
    private _writeUserCommand(cmd: Command) {
        this._dockerfile.user(cmd.args);
    }
    private _writeWorkdirCommand(cmd: Command) {
        this._dockerfile.workDir(cmd.args);
    }
    private _writeArgCommand(cmd: Command) {
        this._dockerfile.instructions.push({ command: cmd.name, instruction: cmd.args });
    }
    private _writeOnbuildCommand(cmd: Command) {
        this._dockerfile.onBuild(cmd.args);
    }
    private _writeStopsignalCommand(cmd: Command) {
        this._dockerfile.instructions.push({ command: cmd.name, instruction: cmd.args });
    }
    private _writeCommentCommand(cmd: Command) {
        this._dockerfile.comment(cmd.args.toString().replace(/^#\s*/, ''));
    }

    private _forEachKeyValuePair(object: any, cb: (key: string, value: string) => void) {
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                cb(key, object[key]);
            }
        }
    }

    toString() {
        var contents: string[] = [];
        this._readAllText(chunk => contents.push(chunk));
        return contents.join('');
    }

    private _readAllText(cb: (chunk: string) => void) {
        var readStream: stream.Readable = this._dockerfile.writeStream();
        var chunk: Buffer;
        while (null !== (chunk = readStream.read())) {
            cb(chunk.toString());
        }
    }
}

export class DockerfileCommand {
    static FROM = "FROM";
    static MAINTAINER = "MAINTAINER";
    static RUN = "RUN";
    static CMD = "CMD";
    static LABEL = "LABEL";
    static EXPOSE = "EXPOSE";
    static ENV = "ENV";
    static ADD = "ADD";
    static COPY = "COPY";
    static ENTRYPOINT = "ENTRYPOINT";
    static VOLUME = "VOLUME";
    static USER = "USER";
    static WORKDIR = "WORKDIR";
    static ARG = "ARG";
    static ONBUILD = "ONBUILD";
    static STOPSIGNAL = "STOPSIGNAL";
    static COMMENT = "COMMENT";
}
