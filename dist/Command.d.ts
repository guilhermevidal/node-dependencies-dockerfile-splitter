export interface Command {
    name: string;
    lineno: number;
    args: string | string[];
}
export interface CopyCommand extends Command {
    args: string[];
}
