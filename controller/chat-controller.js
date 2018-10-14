const fs = require('fs');

const chat = async ctx => {
};

const index=  async ctx => {
    ctx.response.type = 'html';
    ctx.response.body = fs.createReadStream('./views/index.html');
};

module.exports = {
    'GET /': index,
    'GET /chat': chat,
};


