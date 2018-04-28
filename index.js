const dfs = require("./services/dfs");

// test de petición
function main() {
    dfs.listDirectory("").then((val) => {
        console.log(val.FileStatuses);
        return new Promise((accept) => accept(val.FileStatuses.FileStatus[0].pathSuffix) );
    // }).then((res) => {
    //     dfs.mkdir(res + "/test").then((res) => {
    //         console.log(res);
    //     });
    }).catch((err) => {
        console.warn(err);
    });
}

main();