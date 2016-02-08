import { Command } from 'ya-dockerfile-parser';
export interface CommandsWriter {
    write(command: Command): void;
    toString(): string;
}
