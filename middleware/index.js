const responseBody = require('./response-body');
const errorHandle = require('./error-handle');

function combineMiddleWare(app, dirname) {
    app.use(responseBody());
    app.use(errorHandle)
}


module.exports = combineMiddleWare;
