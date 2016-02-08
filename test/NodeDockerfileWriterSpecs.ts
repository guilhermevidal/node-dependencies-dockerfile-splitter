/// <reference path="../typings/main" />
import * as chai from 'chai';
import {DockerfileCommand} from 'ya-dockerfile-parser';
import {NodeDockerfileWriter} from '../dist/NodeDockerfileWriter';

chai.should();
let expect = chai.expect;

describe('NodeDockerfileWriter', () => {

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
                assertCommandIsWrittenLike(DockerfileCommand.RUN, '/bin/sh -c', 'RUN /bin/sh -c\n');
                assertCommandIsWrittenLike(DockerfileCommand.RUN, "/bin/bash -c 'source $HOME/.bashrc ;\\\necho $HOME'", "RUN /bin/bash -c 'source $HOME/.bashrc ;\\\necho $HOME'\n");
                assertCommandIsWrittenLike(DockerfileCommand.RUN, ["/bin/bash", "-c", "echo hello"], 'RUN ["/bin/bash","-c","echo hello"]\n');
            });
        });

        describe('CMD', () => {
            it('should write CMD commands', () => {
                assertCommandIsWrittenLike(DockerfileCommand.CMD, 'echo "This is a test." | wc -', 'CMD echo "This is a test." | wc -\n');
                assertCommandIsWrittenLike(DockerfileCommand.CMD, ["sh", "-c", "echo", "$HOME"], 'CMD ["sh","-c","echo","$HOME"]\n');
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
                assertCommandIsWrittenLike(DockerfileCommand.EXPOSE, [1, 2, 3], 'EXPOSE 1\nEXPOSE 2\nEXPOSE 3\n');
            });
        });

        describe('ENV', () => {
            it('should write ENV commands', () => {
                assertCommandIsWrittenLike(DockerfileCommand.ENV, { "myName": "John Doe" }, 'ENV myName John Doe\n');
                assertCommandIsWrittenLike(DockerfileCommand.ENV, { "myName": "John Doe" }, 'ENV myName John Doe\n');
                assertCommandIsWrittenLike(DockerfileCommand.ENV, { "myName": "John Doe", "myDog": "Rex\\ The\\ Dog  myCat=fluffy" }, 'ENV myName John Doe\nENV myDog Rex\\ The\\ Dog  myCat=fluffy\n');
            });
        });

        describe('ADD', () => {
            it('should write ADD commands', () => {
                assertCommandIsWrittenLike(DockerfileCommand.ADD, ['test', 'relativeDir/'], 'ADD ["test","relativeDir/"]\n');
                assertCommandIsWrittenLike(DockerfileCommand.ADD, ['test', '"relativeDir with spaces/"'], 'ADD ["test","relativeDir with spaces/"]\n');
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
                assertCommandIsWrittenLike(DockerfileCommand.ENTRYPOINT, 'echo "This is a test." | wc -', 'ENTRYPOINT echo "This is a test." | wc -\n');
                assertCommandIsWrittenLike(DockerfileCommand.ENTRYPOINT, ["sh", "-c", "echo", "$HOME"], 'ENTRYPOINT ["sh","-c","echo","$HOME"]\n');
            });
        });

        describe('VOLUME', () => {
            it('should write VOLUME commands', () => {
                assertCommandIsWrittenLike(DockerfileCommand.VOLUME, ["/myvol"], 'VOLUME ["/myvol"]\n');
                assertCommandIsWrittenLike(DockerfileCommand.VOLUME, ["/data/db", "/data/configdb"], 'VOLUME ["/data/db","/data/configdb"]\n');
            });
        });

        describe('USER', () => {
            it('should write USER commands', () => {
                assertCommandIsWrittenLike(DockerfileCommand.USER, "daemon", 'USER daemon\n');
            });
        });

        describe('WORKDIR', () => {
            it('should write WORKDIR commands', () => {
                assertCommandIsWrittenLike(DockerfileCommand.WORKDIR, "/path/to/workdir", 'WORKDIR /path/to/workdir\n');
                assertCommandIsWrittenLike(DockerfileCommand.WORKDIR, '"/path/to/workdir"', 'WORKDIR "/path/to/workdir"\n');
            });
        });

        describe('ARG', () => {
            it('should write ARG commands', () => {
                assertCommandIsWrittenLike(DockerfileCommand.ARG, { 'user1': undefined }, 'ARG user1\n');
                assertCommandIsWrittenLike(DockerfileCommand.ARG, { 'buildno': undefined }, 'ARG buildno\n');
                assertCommandIsWrittenLike(DockerfileCommand.ARG, { 'user1': 'someuser' }, 'ARG user1=someuser\n');
                assertCommandIsWrittenLike(DockerfileCommand.ARG, { 'buildno': '1' }, 'ARG buildno=1\n');
            });
        });

        describe('ONBUILD', () => {
            it('should write ONBUILD commands', () => {
                assertCommandIsWrittenLike(DockerfileCommand.ONBUILD, "RUN /usr/local/bin/python-build --dir /app/src", 'ONBUILD RUN /usr/local/bin/python-build --dir /app/src\n');
            });
        });

        describe('STOPSIGNAL', () => {
            it('should write STOPSIGNAL commands', () => {
                assertCommandIsWrittenLike(DockerfileCommand.STOPSIGNAL, "9", 'STOPSIGNAL 9\n');
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
        return new NodeDockerfileWriter();
    }
});