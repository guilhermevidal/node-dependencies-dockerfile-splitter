/// <reference path="../typings/main" />
var chai = require('chai');
var NodeDockerCommandsReader_1 = require('../dist/NodeDockerCommandsReader');
chai.should();
var expect = chai.expect;
describe("NodeDockerCommandsReader", function () {
    var addCommandFormat1 = 'ADD package.json src/package.json';
    var addCommandFormat2 = 'ADD ["package.json", "src/package.json"]';
    var copyCommandFormat1 = 'COPY package.json src/package.json';
    var copyCommandFormat2 = 'COPY ["package.json", "src/package.json"]';
    describe('getPackageJsonCommand', function () {
        it('should throw when package.json not found.', function () {
            expect(function () { return createReader().getPackageJsonCommand(); })
                .to.throw(NodeDockerCommandsReader_1.PackageJsonNotFoundError);
        });
        it('should return ADD command when package.json is bein copied by an ADD command', function () {
            var expected = {
                name: "ADD",
                lineno: 1,
                args: ["package.json", "src/package.json"]
            };
            createReader(addCommandFormat1).getPackageJsonCommand().should.deep.equal(expected);
            createReader(addCommandFormat2).getPackageJsonCommand().should.deep.equal(expected);
        });
        it('should return COPY command when package.json is bein copied by a COPY command', function () {
            var expected = {
                name: "COPY",
                lineno: 1,
                args: ["package.json", "src/package.json"]
            };
            createReader(copyCommandFormat1).getPackageJsonCommand().should.deep.equal(expected);
            createReader(copyCommandFormat2).getPackageJsonCommand().should.deep.equal(expected);
        });
    });
    describe('getDependenciesCommands', function () {
        it('should throw when npm install command could not be found', function () {
            expect(function () { return createReader(addCommandFormat1).getDependenciesCommands(); })
                .to.throw(NodeDockerCommandsReader_1.NpmInstallNotFoundError);
        });
        it('should return all commands until npm install is found, with npm install included', function () {
            var commands = createReader(completeFileContents).getDependenciesCommands();
            commands.should.have.lengthOf(8);
            createReader(addCommandFormat1.concat('\nRUN npm install')).getDependenciesCommands().should.have.lengthOf(2);
            createReader(addCommandFormat1.concat('\nRUN ["npm", "install"]')).getDependenciesCommands().should.have.lengthOf(2);
            createReader(addCommandFormat1.concat('\nRUN something && npm install')).getDependenciesCommands().should.have.lengthOf(2);
            createReader(addCommandFormat1.concat('\nRUN something \\\n && npm install')).getDependenciesCommands().should.have.lengthOf(2);
        });
    });
    describe('getApplicationCommands', function () {
        it('should throw when npm install command could not be found', function () {
            expect(function () { return createReader(addCommandFormat1).getApplicationCommands(); })
                .to.throw(NodeDockerCommandsReader_1.NpmInstallNotFoundError);
        });
        it('should return all commands after npm install', function () {
            var commands = createReader(completeFileContents).getApplicationCommands();
            commands.should.have.lengthOf(4);
        });
        it('should read LABEL commands', function () {
            assertCommandParsedAs('LABEL "com.example.vendor"="ACME Incorporated"', { "\"com.example.vendor\"": "\"ACME Incorporated\"" });
            assertCommandParsedAs('LABEL description="This text illustrates \\\nthat label-values can span multiple lines."', { "description": "\"This text illustrates  that label-values can span multiple lines.\"" });
        });
        it('should read EXPOSE commands', function () {
            assertCommandParsedAs('EXPOSE 1 2 3', ["1", "2", "3"]);
        });
        it('should read ENV commands', function () {
            assertCommandParsedAs('ENV myName John Doe', { "myName": "John Doe" });
            assertCommandParsedAs('ENV myName="John Doe"', { "myName": "\"John Doe\"" });
            // assertCommandParsedAs('ENV myName="John Doe" myDog=Rex\\ The\\ Dog \\\nmyCat=fluffy', {
            //     "myName": "\"John Doe\"",
            //     "myDog": "Rex The Dog",
            //     "myCat": "fluffy"
            // });
        });
        it('should read ENTRYPOINT commands', function () {
            assertCommandParsedAs('ENTRYPOINT command param1 param2', "command param1 param2");
            assertCommandParsedAs('ENTRYPOINT ["executable", "param1", "param2"]', ["executable", "param1", "param2"]);
        });
        it('should read VOLUME commands', function () {
            assertCommandParsedAs('VOLUME /myvol', ["/myvol"]);
            assertCommandParsedAs('VOLUME ["/data"]', ["/data"]);
            assertCommandParsedAs('VOLUME /data/db /data/configdb', ["/data/db", "/data/configdb"]);
        });
        function assertCommandParsedAs(command, expected) {
            getCommands(command)[0].args
                .should.deep.equal(expected);
        }
        function getCommands(commands) {
            return createReader(addCommandFormat1.concat('\nRUN npm install\n', commands)).getApplicationCommands();
        }
    });
    describe('lineno', function () {
        it('should not skip more lines when there is an empty line', function () {
            var contents = '# Line 1\n# Line 2\r\n\r\n# Line 4\n'.concat(addCommandFormat1);
            createReader(contents).getPackageJsonCommand().lineno.should.be.equals(5);
        });
    });
    function createReader(contents) {
        if (contents === void 0) { contents = ''; }
        return new NodeDockerCommandsReader_1.NodeDockerCommandsReader(contents);
    }
    var completeFileContents = "FROM    centos:centos6\n\n# Enable Extra Packages for Enterprise Linux (EPEL) for CentOS\nRUN     yum install -y epel-release\n# Install Node.js and npm\nRUN     yum install -y nodejs npm\n\n# Install app dependencies\nCOPY package.json /src/package.json\nRUN cd /src; npm install\n\n# Bundle app source\nCOPY . /src\n\nEXPOSE  8080\nCMD [\"node\", \"/src/index.js\"]";
});
//# sourceMappingURL=NodeDockerCommandsReaderSpecs.js.map