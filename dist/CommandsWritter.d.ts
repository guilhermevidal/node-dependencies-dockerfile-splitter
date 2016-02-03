import { Command } from './Command';
export interface CommandsWritter {
    write(command: Command): void;
    toString(): string;
}
