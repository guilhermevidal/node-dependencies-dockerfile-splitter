/// <reference path="../typings/main" />
import * as chai from 'chai';
import {NodeDockerfileWritter, DockerfileCommand} from '../dist/NodeDockerfileWritter';

chai.should();
let expect = chai.expect;

describe('NodeDockerfileWritter', () => {

    describe('write', () => {

        describe('FROM', () => {
            it('should write FROM commands', () => {
                assertCommandIsWrittenLike(DockerfileCommand.FROM, 'debian:wheezy', 'FROM debian:wheezy\n');
            });
        });

        describe('MAINTAINER', () => {
            it('should write MAINTAINER commands', () => {
                assertCommandIsWrittenLike(DockerfileCommand.MAINTAINER, 'Author', 'MAINTAINER Author\n');
            });
        });

        describe('RUN', () => {
            it('should write RUN commands', () => {
                assertCommandIsWrittenLike(DockerfileCommand.RUN, 'command', 'RUN command\n');
                assertCommandIsWrittenLike(DockerfileCommand.RUN, ["executable", "param1", "param2"], 'RUN ["executable","param1","param2"]\n');
            });
        });

        describe('CMD', () => {
            it('should write CMD commands', () => {
                assertCommandIsWrittenLike(DockerfileCommand.CMD, ["executable", "param1", "param2"], 'CMD ["executable","param1","param2"]\n');
                assertCommandIsWrittenLike(DockerfileCommand.CMD, "command param1 param2", 'CMD command param1 param2\n');
            });
        });

        describe('LABEL', () => {
            it('should write LABEL commands', () => {
                assertCommandIsWrittenLike(DockerfileCommand.LABEL, {
                    "com.example.vendor": "ACME Incorporated",
                    "com.example.label-with-value": "foo",
                    "version": "1.0",
                    "description": "This text illustrates that label-values can span multiple lines.",
                    "multi.label1": "value1",
                    "multi.label2": "value2",
                    "other": "value3"
                }, `LABEL com.example.vendor = ACME Incorporated
LABEL com.example.label-with-value = foo
LABEL version = 1.0
LABEL description = This text illustrates that label-values can span multiple lines.
LABEL multi.label1 = value1
LABEL multi.label2 = value2
LABEL other = value3
`);
            });
        });

        describe('EXPOSE', () => {
            it('should write EXPOSE commands', () => {
                assertCommandIsWrittenLike(DockerfileCommand.EXPOSE, ["1", "2", "3"], 'EXPOSE 1\nEXPOSE 2\nEXPOSE 3\n');
            });
        });

        describe('ENV', () => {
            it('should write ENV commands', () => {
                assertCommandIsWrittenLike(DockerfileCommand.ENV, { "myName": "John Doe" }, 'ENV myName John Doe\n');
                assertCommandIsWrittenLike(DockerfileCommand.ENV, { "myName": "\"John Doe\"" }, 'ENV myName "John Doe"\n');
                assertCommandIsWrittenLike(DockerfileCommand.ENV, { "myName": "\"John Doe\"", "myDog": "Rex\\ The\\ Dog  myCat=fluffy" }, 'ENV myName "John Doe"\nENV myDog Rex\\ The\\ Dog  myCat=fluffy\n');
            });
        });

        describe('ADD', () => {
            it('should write ADD commands', () => {
                assertCommandIsWrittenLike(DockerfileCommand.ADD, ['test', 'relativeDir/'], 'ADD ["test","relativeDir/"]\n');
            });
        });

        describe('COPY', () => {
            it('should write COPY commands', () => {
                assertCommandIsWrittenLike(DockerfileCommand.COPY, ['test', 'relativeDir/'], 'COPY ["test","relativeDir/"] \n');
                assertCommandIsWrittenLike(DockerfileCommand.COPY, ['test', '"relativeDir with spaces/"'], 'COPY ["test","relativeDir with spaces/"] \n');
            });
        });

        describe('ENTRYPOINT', () => {
            it('should write ENTRYPOINT commands', () => {
                assertCommandIsWrittenLike(DockerfileCommand.ENTRYPOINT, "command param1 param2", 'ENTRYPOINT command param1 param2\n');
                assertCommandIsWrittenLike(DockerfileCommand.ENTRYPOINT, ["executable", "param1", "param2"], 'ENTRYPOINT ["executable","param1","param2"]\n');
            });
        });

        describe('VOLUME', () => {
            it('should write VOLUME commands', () => {
                assertCommandIsWrittenLike(DockerfileCommand.VOLUME, ["/myvol"], 'VOLUME ["/myvol"]\n');
                assertCommandIsWrittenLike(DockerfileCommand.VOLUME, ["/data/db", "/data/configdb"], 'VOLUME ["/data/db","/data/configdb"]\n');
            });
        });

        function assertCommandIsWrittenLike(name: string, args: any, expected: string) {
            createWriter()
                .write({ name: name, lineno: 0, args: args })
                .toString()
                .should.be.eq(expected);
        }
    });

    function createWriter() {
        return new NodeDockerfileWritter();
    }
});