/// <reference path="../typings/main" />
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as path from 'path';

import {DockerfileSplitter, PackageJsonFileCouldNotBeFoundError} from '../dist/DockerfileSplitter';

chai.use(chaiAsPromised);
chai.should();
let expect = chai.expect;

describe('DockerfileSplitter', () => {

    describe('getApplicationName', () => {
        it('should throw if package.json file could not be found', () => {
            return createSplitter(getFake('DockerfileWithWrongPathToPackageJsonFile')).getApplicationName()
                .should.eventually.be.rejectedWith(PackageJsonFileCouldNotBeFoundError);
        });

        it('should return application name from package.json file', () => {
            return createSplitter(getFake('Dockerfile')).getApplicationName()
                .should.eventually.be.eq('dummy');
        });
    });

    describe('getDependenciesImageName', () => {
        it('should return the name of the image to be used as the dependencies for the application', () => {
            return createSplitter(getFake('Dockerfile')).getDependenciesImageName()
                .should.eventually.be.eq('dummy-deps');
        });
    })

    function getFake(fakeName: string) {
        return path.join('fakes', fakeName);
    }

    function createSplitter(relativePath: string) {
        return new DockerfileSplitter(path.join(__dirname, relativePath));
    }
});