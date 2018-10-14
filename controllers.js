const fs = require('fs');

function addMapping(router, mapping) {
    let path;
    for (let url in mapping) {
        if (url.startsWith('GET ')) {
            path = url.substring(4);
            if(Array.isArray(mapping[url])){
                router.get(path, ...mapping[url]);
            } else {
                router.get(path, mapping[url]);
            }
            console.log(`register URL mapping: GET ${path}`);
        } else if (url.startsWith('POST ')) {
            path = url.substring(5);
            if(Array.isArray(mapping[url])){
                router.post(path, ...mapping[url]);
            } else {
                router.post(path, mapping[url]);
            }
            console.log(`register URL mapping: POST ${path}`);
        } else if(url.startsWith('DELETE')) {
            path = url.substring(7);
            if(Array.isArray(mapping[url])){
                router.delete(path, ...mapping[url]);
            } else {
                router.delete(path, mapping[url]);
            }
            console.log(`register URL mapping: DELETE ${path}`);
        } else {
            console.log(`invalid URL: ${url}`);
        }
    }
}

function addControllers(router, dir) {
    let files = fs.readdirSync(__dirname + '/' + dir);
    let js_files = files.filter((f) => {
        return f.endsWith('.js');
    });

    for (let f of js_files) {
        console.log(`process controller: ${f}...`);
        let mapping = require(__dirname + '/' + dir + '/' + f);
        addMapping(router, mapping);
    }
}



module.exports = function (dir) {
    let
        controllers_dir = dir || 'controller', // 如果不传参数，扫描目录默认为'controller'
        router = require('koa-router')();
    addControllers(router, controllers_dir);
    return router.routes();
};