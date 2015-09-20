import executor = require("./deps/executor");
import api0 = require("./api0");

var client = api0.createApi();

var channelsListResponse = client['channels_list'].get();

var channelId;

channelsListResponse.channels.forEach(channel=>{
    if(channel.name == 'ramltest') {
        channelId = channel.id;
    }
})

function printMessage(message: string) {
    client['chat_postMessage'].get({

        'channel': channelId,
        'text': message
    });
}

printMessage('ololo ololo!!!');
