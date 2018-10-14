const Koa = require('koa');
const controller = require('./controllers');
const combineMiddleWare = require('./middleware');
const cors = require('koa2-cors');
const bodyParser = require('koa-bodyparser');
const IO = require('koa-socket-2');
const app = new Koa();

const io = new IO();
const roomInfos = [];
io.attach(app);

app._io.on('connection', function (socket) {

    //处理加入房间的处理
    socket.on('JOIN_ROOM', function (msg) {
        let {room_num, nickname} = msg;
        if (!roomInfos[room_num]) {       //第一个加入
            console.log('first add: ' + msg);
            roomInfos[room_num] = {
                count: 1,
                peers: [],
            }
        } else {
            console.log('not first add: ' + msg);
            roomInfos[room_num].count += 1;
        }

        socket.room_info = {
            nickname: nickname,
            room_num: room_num
        };
        console.log(roomInfos[room_num]);
        //放入到房间的信息组当中
        roomInfos[room_num].peers.push(socket.room_info);
        console.log(roomInfos);

        //将用户加入房间
        socket.join(room_num);

        //向该用户发送Hello信息
        socket.emit('HELLO_MSG', roomInfos[room_num]);

        //新用户加入，向该房间的所有用户发送
        app.io.to(room_num)
            .emit('PEER_CONNECTED', {
                nickname: nickname,
            });

    });

    //处理消息转发
    socket.on('CHAT_MSG', function (msg) {
        if(!!socket.room_info) {
            app.io.to(socket.room_info.room_num).emit('CHAT_MSG', {
                ...msg,
                time: Date.now()
            });
        }
    });

    /**
     * 处理连接断开的情况
     */
    socket.on('disconnect', function () {
        if(!!socket.room_info) {
            let room = roomInfos[socket.room_info.room_num];
            if(!!room) {
                room.count--;
                const index = room.peers.indexOf(socket.room_info);
                if(index >= 0) {
                    room.peers.splice(index, 1);
                    console.log('remove: ' + JSON.stringify(socket.room_info));
                }
            }
            //有用户退出，向该房间的所有用户发送
            app.io.to(socket.room_info.room_num)
                .emit('PEER_DISCONNECTED', socket.room_info);
        }
    })
});

combineMiddleWare(app, __dirname);

app.use(bodyParser());
app.use(cors());

app.use(controller());

app.listen(9797);
console.log('app started at port 9797');
