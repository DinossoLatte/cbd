const request = require("request");
const util = require('util');

const DFS_NAMENODE = "http://ec2-52-47-114-146.eu-west-3.compute.amazonaws.com";
const DFS_DATANODE = "http://ec2-35-180-45-216.eu-west-3.compute.amazonaws.com"
const WEBDFS_PORT = ":50070";

function mkdir(dirName) {
    return new Promise((accept, reject) => {
        request.put(DFS_NAMENODE+ WEBDFS_PORT + "/webhdfs/v1/" + dirName + "?op=MKDIRS&ser.name=ubuntu")
            .on("response", (response) => {
                if(response.statusCode != 200) {
                    reject("Failure when attempting to create a directory\nCuerpo: "+JSON.stringify(response.toJSON()));
                } else {
                    accept(response.body);
                }
            });
    });
}

function listDirectory(dirName) {
    return new Promise((accept, reject) => {
        request.get(DFS_NAMENODE+ WEBDFS_PORT + "/webhdfs/v1/"+dirName+"?op=LISTSTATUS", (err, response, body) => {
                if(response.statusCode != "200") {
                    reject("Failure when attempting to create a directory\nCuerpo: "+body);
                } else {
                    accept(JSON.parse(body));
                }
            });
    });
}

function writeFile(filePath, fileBytes) {
    return new Promise((accept, reject) => {
        request.post(DFS_NAMENODE + WEBDFS_PORT + "/webhdfs/v1/"+filePath+"?op=CREATE&user.name=ubuntu", () => {
            request.put({ 
                url: DFS_DATANODE + ":50075" + "/webhdfs/v1/"+filePath+"?op=CREATE&user.name=ubuntu&&namenoderpcaddress=ec2-52-47-114-146.eu-west-3.compute.amazonaws.com:9000&overwrite=true",
                body: fileBytes
            }, (err, response, body) => {
                if(response.statusCode == 201) {
                    accept();
                } else {
                    reject();
                }
            });
        });
    });
}

function readFile(filePath) {
    return new Promise((accept) => {
        request.get(DFS_NAMENODE + WEBDFS_PORT + "/webhdfs/v1/"+filePath+"?op=OPEN&user.name=ubuntu", (err, result) => {
            request.get(DFS_DATANODE + ":50075" + "/webhdfs/v1/"+filePath+"?op=OPEN&user.name=ubuntu&namenoderpcaddress=ec2-52-47-114-146.eu-west-3.compute.amazonaws.com:9000&offset=0", (err, response, body) => {
                accept(body);
            });
        })
    })
}

module.exports = {
    mkdir,
    listDirectory,
    writeFile,
    readFile
}