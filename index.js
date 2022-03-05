const WebSocket = require('ws')
var wss = new WebSocket.Server({
    port: 8080
}, () => {
    console.log('server started')
})

class PlayerObject {
    constructor(id, position) {
            this.id = id;
            this.position = {
                x: 0,
                y: 0,
                z: 0
            };
        }
        // setter position
    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
        this.position.z = 0;
    }

    getUser() {
        return { id: this.id, position: this.position };
    }
}

var listPlayers = [];

wss.getUniqueID = function() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
};

const topics = {
    'registry': function(data, ws) {
        listPlayers.push(new PlayerObject(data.id, data.position));
        ws.send(JSON.stringify({
            type: 'registry',
            data: {
                id: data.id,
            }
        }));
    },
    'setPosition': function(data, ws) {
        var player = listPlayers.find(player => player.id == data.id);
        player.setPosition(data.position.x, data.position.y);
        ws.send(JSON.stringify({
            topic: 'setPosition',
            data: player.getUser()
        }));
    }
}

wss.on('connection', function connection(ws) {
    console.log('new connection')
    ws.on('message', (data) => {
        var data = JSON.parse(data);
        topics[data.topic](data.data, ws)
    })
    wss.on('listening', () => {
        console.log('listening on 8080')
    })
})