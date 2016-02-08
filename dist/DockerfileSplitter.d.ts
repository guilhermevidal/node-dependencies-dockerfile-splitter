import { NodeDockerCommandsReader } from './NodeDockerCommandsReader';
export declare class DockerfileSplitter {
    private filename;
    constructor(filename: string);
    split(): Promise<SplitFile>;
    getApplicationName(): Promise<string>;
    getDependenciesImageName(): Promise<string>;
    private packageJson;
    private _packageJson;
    private reader;
    private _reader;
    protected createReader(): Promise<NodeDockerCommandsReader>;
    protected getFileContents(): Promise<string>;
}
export declare class PackageJsonFileCouldNotBeFoundError extends Error {
    constructor(pathUsed: string);
}
export interface SplitFile {
    dependencies: string;
    application: string;
}