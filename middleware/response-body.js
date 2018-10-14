const {
    CODE_TABLE
} = require('../config/err-code-table');
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// 当前中间件的职能是为ctx对象添加一个easyResponse成员，可以便捷的返回Json格式化的信息
//////////////////////////////////////////////////////////////////////////////////////////////////////////////



function responseBody() {
    return async (ctx, next) => {
        ctx.easyResponse = {
            success: (data, msg='') => {
                ctx.response.type = 'application/json';
                ctx.response.body = JSON.stringify({
                    code: CODE_TABLE.success,
                    data: data,
                    msg: msg,
                });
            },
            error: (errmsg, errCode=CODE_TABLE.error) => {
                ctx.response.type = 'application/json';
                ctx.response.body = JSON.stringify({
                    code: errCode,
                    msg: errmsg
                });
            }
        };
        await next();
    }
}

module.exports = responseBody;
