const dfs = require("./services/dfs");
const fs = require('fs');

// test de petición
function main() {
    dfs.listDirectory("cbd").then((val) => {
        return new Promise((accept) => accept(val.FileStatuses.FileStatus[0].pathSuffix) );
    }).then((res) => {
        fs.readFile("index.js", (err, data) => {
            dfs.writeFile("cbd/testFile", data).then((result) => {
                console.log(result);
            });
        });
    }).catch((err) => {
        console.warn(err);
    });
}

main();