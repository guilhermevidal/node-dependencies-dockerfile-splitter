/// <reference path="../typings/main" />
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var path = require('path');
var DockerfileSplitter_1 = require('../dist/DockerfileSplitter');
chai.use(chaiAsPromised);
chai.should();
var expect = chai.expect;
describe('DockerfileSplitter', function () {
    describe('getApplicationName', function () {
        it('should throw if package.json file could not be found', function () {
            return createSplitter(getFake('DockerfileWithWrongPathToPackageJsonFile')).getApplicationName()
                .should.eventually.be.rejectedWith(DockerfileSplitter_1.PackageJsonFileCouldNotBeFoundError);
        });
        it('should return application name from package.json file', function () {
            return createSplitter(getFake('Dockerfile')).getApplicationName()
                .should.eventually.be.eq('dummy');
        });
    });
    describe('getDependenciesImageName', function () {
        it('should return the name of the image to be used as the dependencies for the application', function () {
            return createSplitter(getFake('Dockerfile')).getDependenciesImageName()
                .should.eventually.be.eq('dummy-deps');
        });
    });
    function getFake(fakeName) {
        return path.join('fakes', fakeName);
    }
    function createSplitter(relativePath) {
        return new DockerfileSplitter_1.DockerfileSplitter(path.join(__dirname, relativePath));
    }
});
//# sourceMappingURL=DockerfileSplitterSpec.js.map