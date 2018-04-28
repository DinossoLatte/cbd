const request = require("request");

const DFS_NAMENODE = "http://ec2-35-180-4-38.eu-west-3.compute.amazonaws.com";
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
        request.get(DFS_NAMENODE+ WEBDFS_PORT + "/webhdfs/v1/?op=LISTSTATUS", (err, response, body) => {
                if(response.statusCode != "200") {
                    reject("Failure when attempting to create a directory\nCuerpo: "+body);
                } else {
                    accept(JSON.parse(body));
                }
            });
    });
}

function writeFile(filePath) {
    return new Promise((accept, reject) => {
        request.post()
    })
}

module.exports = {
    mkdir,
    listDirectory
}