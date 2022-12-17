const { ShardClient } = require("detritus-client");
const { GatewayActivityTypes } = require("detritus-client-socket/lib/constants");

/***
 * @param {ShardClient} client
 */
module.exports = (client, CLIENT_ID, {
  song,
  artist,
  image
}) => client.gateway.setPresence({
  activity: {
    assets: {
      smallImage: image
    },
    type: GatewayActivityTypes.LISTENING,
    name: song
  }
});