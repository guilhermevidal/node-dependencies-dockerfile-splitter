/// <reference path="../typings/main" />
var chai = require('chai');
var NodeDockerfileWritter_1 = require('../dist/NodeDockerfileWritter');
chai.should();
var expect = chai.expect;
describe('NodeDockerfileWritter', function () {
    describe('write', function () {
        describe('FROM', function () {
            it('should write FROM commands', function () {
                assertCommandIsWrittenLike(NodeDockerfileWritter_1.DockerfileCommand.FROM, 'debian:wheezy', 'FROM debian:wheezy\n');
            });
        });
        describe('MAINTAINER', function () {
            it('should write MAINTAINER commands', function () {
                assertCommandIsWrittenLike(NodeDockerfileWritter_1.DockerfileCommand.MAINTAINER, 'Author', 'MAINTAINER Author\n');
            });
        });
        describe('RUN', function () {
            it('should write RUN commands', function () {
                assertCommandIsWrittenLike(NodeDockerfileWritter_1.DockerfileCommand.RUN, 'command', 'RUN command\n');
                assertCommandIsWrittenLike(NodeDockerfileWritter_1.DockerfileCommand.RUN, ["executable", "param1", "param2"], 'RUN ["executable","param1","param2"]\n');
            });
        });
        describe('CMD', function () {
            it('should write CMD commands', function () {
                assertCommandIsWrittenLike(NodeDockerfileWritter_1.DockerfileCommand.CMD, ["executable", "param1", "param2"], 'CMD ["executable","param1","param2"]\n');
                assertCommandIsWrittenLike(NodeDockerfileWritter_1.DockerfileCommand.CMD, "command param1 param2", 'CMD command param1 param2\n');
            });
        });
        describe('LABEL', function () {
            it('should write LABEL commands', function () {
                assertCommandIsWrittenLike(NodeDockerfileWritter_1.DockerfileCommand.LABEL, {
                    "com.example.vendor": "ACME Incorporated",
                    "com.example.label-with-value": "foo",
                    "version": "1.0",
                    "description": "This text illustrates that label-values can span multiple lines.",
                    "multi.label1": "value1",
                    "multi.label2": "value2",
                    "other": "value3"
                }, "LABEL com.example.vendor = ACME Incorporated\nLABEL com.example.label-with-value = foo\nLABEL version = 1.0\nLABEL description = This text illustrates that label-values can span multiple lines.\nLABEL multi.label1 = value1\nLABEL multi.label2 = value2\nLABEL other = value3\n");
            });
        });
        describe('EXPOSE', function () {
            it('should write EXPOSE commands', function () {
                assertCommandIsWrittenLike(NodeDockerfileWritter_1.DockerfileCommand.EXPOSE, ["1", "2", "3"], 'EXPOSE 1\nEXPOSE 2\nEXPOSE 3\n');
            });
        });
        describe('ENV', function () {
            it('should write ENV commands', function () {
                assertCommandIsWrittenLike(NodeDockerfileWritter_1.DockerfileCommand.ENV, { "myName": "John Doe" }, 'ENV myName John Doe\n');
                assertCommandIsWrittenLike(NodeDockerfileWritter_1.DockerfileCommand.ENV, { "myName": "\"John Doe\"" }, 'ENV myName "John Doe"\n');
                assertCommandIsWrittenLike(NodeDockerfileWritter_1.DockerfileCommand.ENV, { "myName": "\"John Doe\"", "myDog": "Rex\\ The\\ Dog  myCat=fluffy" }, 'ENV myName "John Doe"\nENV myDog Rex\\ The\\ Dog  myCat=fluffy\n');
            });
        });
        describe('ADD', function () {
            it('should write ADD commands', function () {
                assertCommandIsWrittenLike(NodeDockerfileWritter_1.DockerfileCommand.ADD, ['test', 'relativeDir/'], 'ADD ["test","relativeDir/"]\n');
            });
        });
        describe('COPY', function () {
            it('should write COPY commands', function () {
                assertCommandIsWrittenLike(NodeDockerfileWritter_1.DockerfileCommand.COPY, ['test', 'relativeDir/'], 'COPY ["test","relativeDir/"] \n');
                assertCommandIsWrittenLike(NodeDockerfileWritter_1.DockerfileCommand.COPY, ['test', '"relativeDir with spaces/"'], 'COPY ["test","relativeDir with spaces/"] \n');
            });
        });
        describe('ENTRYPOINT', function () {
            it('should write ENTRYPOINT commands', function () {
                assertCommandIsWrittenLike(NodeDockerfileWritter_1.DockerfileCommand.ENTRYPOINT, "command param1 param2", 'ENTRYPOINT command param1 param2\n');
                assertCommandIsWrittenLike(NodeDockerfileWritter_1.DockerfileCommand.ENTRYPOINT, ["executable", "param1", "param2"], 'ENTRYPOINT ["executable","param1","param2"]\n');
            });
        });
        describe('VOLUME', function () {
            it('should write VOLUME commands', function () {
                assertCommandIsWrittenLike(NodeDockerfileWritter_1.DockerfileCommand.VOLUME, ["/myvol"], 'VOLUME ["/myvol"]\n');
                assertCommandIsWrittenLike(NodeDockerfileWritter_1.DockerfileCommand.VOLUME, ["/data/db", "/data/configdb"], 'VOLUME ["/data/db","/data/configdb"]\n');
            });
        });
        function assertCommandIsWrittenLike(name, args, expected) {
            createWriter()
                .write({ name: name, lineno: 0, args: args })
                .toString()
                .should.be.eq(expected);
        }
    });
    function createWriter() {
        return new NodeDockerfileWritter_1.NodeDockerfileWritter();
    }
});
//# sourceMappingURL=NodeDockerfileWritterSpecs.js.map