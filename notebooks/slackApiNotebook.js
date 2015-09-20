var api0 = require("./api0");
var client = api0.createApi();
var channelsListResponse = client['channels_list'].get();
var channelId;
channelsListResponse.channels.forEach(function (channel) {
    if (channel.name == 'ramltest') {
        channelId = channel.id;
    }
});
function printMessage(message) {
    client['chat_postMessage'].get({
        'channel': channelId,
        'text': message
    });
}
printMessage('ololo ololo!!!');
//# sourceMappingURL=slackApiNotebook.js.map