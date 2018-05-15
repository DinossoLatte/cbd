const request = require("request");
const util = require('util');

const NAMENODE_HOST = "ec2-35-180-28-156.eu-west-3.compute.amazonaws.com";

const DFS_NAMENODE = "http://" + NAMENODE_HOST;
const DFS_DATANODE = "http://ec2-35-180-27-93.eu-west-3.compute.amazonaws.com";
const WEBDFS_PORT = ":50070";
//Estas son una serie de funciones que sirven para interactuar con el servidor AWS

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
            if (response.statusCode != "200") {
                reject("Failure when attempting to create a directory\nCuerpo: " + body);
            } else {
                accept(JSON.parse(body));
            }
        });
    });
}

function writeFile(filePath, fileBytes) {
    return new Promise((accept, reject) => {
        request.put(DFS_NAMENODE + WEBDFS_PORT + "/webhdfs/v1/"+filePath+"?op=CREATE&user.name=ubuntu", (err, response) => {
            request.put({ 
                url: DFS_DATANODE + ":50075" + "/webhdfs/v1/"+filePath+"?op=CREATE&user.name=ubuntu&overwrite=true&namenoderpcaddress="+NAMENODE_HOST+":9000",
                body: fileBytes
            }, (err, response, body) => {
                console.log(response);
                if(err) {
                    reject();
                } else {
                    accept();
                }
            });
        });
    });
}

function readFile(filePath) {
    return new Promise((accept, reject) => {
        request.get(DFS_NAMENODE + WEBDFS_PORT + "/webhdfs/v1/"+filePath+"?op=OPEN&user.name=ubuntu", (err, result) => {
            request.get(DFS_DATANODE + ":50075" + "/webhdfs/v1/"+filePath+"?op=OPEN&user.name=ubuntu&offset=0&namenoderpcaddress="+NAMENODE_HOST+":9000", (err, response, body) => {
                console.log(response);
                if(err) {
                    reject(err);
                } else {
                    accept(body);
                }
            });
        })
    })
}

function appendFile(filePath, newData) {
    return new Promise((accept, reject) => {
        request.post(DFS_NAMENODE + WEBDFS_PORT + "/webhdfs/v1/" + filePath + "?op=APPEND&user.name=ubuntu", (err, result) => {
            request.post({
                url: DFS_DATANODE + ":50075" + "/webhdfs/v1/" + filePath + "?op=APPEND&user.name=ubuntu&namenoderpcaddress="+NAMENODE_HOST+":9000",
                body: newData
            }, (err, response, body) => {
                if(err) {
                    reject();
                } else {
                    accept(response);
                }
            });
        });
    });
}

module.exports = {
    mkdir,
    listDirectory,
    writeFile,
    readFile,
    appendFile
}
