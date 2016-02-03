declare module 'docker-file-parser' {

    module parser {
        export function parse(contents: string, options: Options): Command[];

        interface Options {
            includeComments: boolean;
        }

        interface Command {
            name: string;
            lineno: number;
            args: string | string[] | {};
        }
    }

    export = parser;
} 