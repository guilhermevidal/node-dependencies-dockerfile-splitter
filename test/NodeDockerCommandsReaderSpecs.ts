/// <reference path="../typings/main" />
import * as chai from 'chai';
import {NodeDockerCommandsReader, PackageJsonNotFoundError, NpmInstallNotFoundError} from '../dist/NodeDockerCommandsReader';

chai.should();
let expect = chai.expect;

describe("NodeDockerCommandsReader", () => {
    var addCommandFormat1 = 'ADD package.json src/package.json';
    var addCommandFormat2 = 'ADD ["package.json", "src/package.json"]';
    var copyCommandFormat1 = 'COPY package.json src/package.json';
    var copyCommandFormat2 = 'COPY ["package.json", "src/package.json"]';

    describe('getPackageJsonCommand', () => {
        it('should throw when package.json not found.', () => {
            expect(() => createReader().getPackageJsonCommand())
                .to.throw(PackageJsonNotFoundError);
        });

        it('should return ADD command when package.json is bein copied by an ADD command', () => {
            var expected = {
                name: "ADD",
                lineno: 1,
                args: ["package.json", "src/package.json"]
            };

            createReader(addCommandFormat1).getPackageJsonCommand().should.deep.equal(expected);
            createReader(addCommandFormat2).getPackageJsonCommand().should.deep.equal(expected);
        });

        it('should return COPY command when package.json is bein copied by a COPY command', () => {
            var expected = {
                name: "COPY",
                lineno: 1,
                args: ["package.json", "src/package.json"]
            };

            createReader(copyCommandFormat1).getPackageJsonCommand().should.deep.equal(expected);
            createReader(copyCommandFormat2).getPackageJsonCommand().should.deep.equal(expected);
        });
    });

    describe('getDependenciesCommands', () => {
        it('should throw when npm install command could not be found', () => {
            expect(() => createReader(addCommandFormat1).getDependenciesCommands())
                .to.throw(NpmInstallNotFoundError);
        });

        it('should return all commands until npm install is found, with npm install included', () => {
            var commands = createReader(completeFileContents).getDependenciesCommands();
            commands.should.have.lengthOf(8);

            createReader(addCommandFormat1.concat('\nRUN npm install')).getDependenciesCommands().should.have.lengthOf(2);
            createReader(addCommandFormat1.concat('\nRUN ["npm", "install"]')).getDependenciesCommands().should.have.lengthOf(2);
            createReader(addCommandFormat1.concat('\nRUN something && npm install')).getDependenciesCommands().should.have.lengthOf(2);
            createReader(addCommandFormat1.concat('\nRUN something \\\n && npm install')).getDependenciesCommands().should.have.lengthOf(2);
        });
    });

    describe('getApplicationCommands', () => {
        it('should throw when npm install command could not be found', () => {
            expect(() => createReader(addCommandFormat1).getApplicationCommands())
                .to.throw(NpmInstallNotFoundError);
        });

        it('should return all commands after npm install', () => {
            var commands = createReader(completeFileContents).getApplicationCommands();
            commands.should.have.lengthOf(4);
        });

        it('should read LABEL commands', () => {
            assertCommandParsedAs('LABEL "com.example.vendor"="ACME Incorporated"', { "\"com.example.vendor\"": "\"ACME Incorporated\"" });
            assertCommandParsedAs('LABEL description="This text illustrates \\\nthat label-values can span multiple lines."', { "description": "\"This text illustrates  that label-values can span multiple lines.\"" });
        });

        it('should read EXPOSE commands', () => {
            assertCommandParsedAs('EXPOSE 1 2 3', ["1", "2", "3"]);
        });

        it('should read ENV commands', () => {
            assertCommandParsedAs('ENV myName John Doe', { "myName": "John Doe" });
            assertCommandParsedAs('ENV myName="John Doe"', { "myName": "\"John Doe\"" });
            // assertCommandParsedAs('ENV myName="John Doe" myDog=Rex\\ The\\ Dog \\\nmyCat=fluffy', {
            //     "myName": "\"John Doe\"",
            //     "myDog": "Rex The Dog",
            //     "myCat": "fluffy"
            // });
        });

        it('should read ENTRYPOINT commands', () => {
            assertCommandParsedAs('ENTRYPOINT command param1 param2', "command param1 param2");
            assertCommandParsedAs('ENTRYPOINT ["executable", "param1", "param2"]', ["executable", "param1", "param2"]);
        });

        it('should read VOLUME commands', () => {
            assertCommandParsedAs('VOLUME /myvol', ["/myvol"]);
            assertCommandParsedAs('VOLUME ["/data"]', ["/data"]);
            assertCommandParsedAs('VOLUME /data/db /data/configdb', ["/data/db", "/data/configdb"]);
        });

        function assertCommandParsedAs(command, expected) {
            getCommands(command)[0].args
                .should.deep.equal(expected)
        }

        function getCommands(commands: string) {
            return createReader(addCommandFormat1.concat('\nRUN npm install\n', commands)).getApplicationCommands();
        }
    });

    describe('lineno', () => {
        it('should not skip more lines when there is an empty line', () => {
            var contents = '# Line 1\n# Line 2\r\n\r\n# Line 4\n'.concat(addCommandFormat1);
            createReader(contents).getPackageJsonCommand().lineno.should.be.equals(5);
        });
    });

    function createReader(contents = '') {
        return new NodeDockerCommandsReader(contents);
    }

    var completeFileContents = `FROM    centos:centos6

# Enable Extra Packages for Enterprise Linux (EPEL) for CentOS
RUN     yum install -y epel-release
# Install Node.js and npm
RUN     yum install -y nodejs npm

# Install app dependencies
COPY package.json /src/package.json
RUN cd /src; npm install

# Bundle app source
COPY . /src

EXPOSE  8080
CMD ["node", "/src/index.js"]`;
});