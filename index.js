const
  // You need to change this
  CLIENT_ID = "Add your client id here",
  // Don't remove the ""
  // Example:
  // CLIENT_ID = "42069420694206942069",

  // If you want to keep this running 24/7
  // add the run command with the options
  // to .replit

  // TODO: Add instructions for above in README.md





  // ---------------------------

  // Don't change anything below this

  { ShardClient } = require("detritus-client"),
  express = require("express"),
  chalk = require("chalk"),
  server = express(),
  dotenv = require("dotenv"),

  /**
   * @type Map<number, [string, chalk.ChalkFunction]>
   */
  statuses = new Map([
    [1, ["playing", chalk.yellowBright.bold]],
    [2, ["listening", chalk.greenBright.bold]],
    [3, ["streaming", chalk.magentaBright.bold]]
  ])
  
  getArg = name => process.argv.find(arg => arg.startsWith(`--${name}`))?.match(/(?<=\=).+/)?.[0] ?? "",
  logError = message => {
    console.error(chalk.redBright(message));
    process.exit();
  };

dotenv.config();

if (!/^\d+$/.test(CLIENT_ID)) logError("Read the top of the file once again");
if (!process.env.TOKEN) logError("You need to add a token inside replit's secrets or through a .env file");

const
  statusInfo = ["type", "game", "song", "artist", "image", "url"].reduce((a, c) => ({ ...a, [c]: getArg(c) }), {}),
  [statusName, style] = statuses.get(+statusInfo.type) ?? [ ...statuses.values() ].find(([name]) => name.toLowerCase() === statusInfo.type.toLowerCase()) ?? [];

// console.log(statusInfo, statusName);

if (!statusName) logError(`\
${
  !statusInfo.type
  ? "You need to type --type=<statusType> after the node command"
  : "Invalid status type"
}

Supported status types:
${[ ...statuses.entries() ].map(([ number, [name] ]) => `[${chalk.white(number)}] - ${chalk.green(name)}`).join("\n")}

You can use either the number or the name
Examples: (yes you need the ")
` + chalk.whiteBright(`
node . --type=1 --game="Half-Life 2"
node . --type=playing --game="Half-Life 2"

node . --type=2 --song="Medic!" --artist="Valve Studio Orchestra" --image="https://via.placeholder.com/256"
node . --type=listening --song="Medic!" --artist="Valve Studio Orchestra" --image="https://via.placeholder.com/256"

node . --type=3 --url=https://twitch.tv/SealedSaucer
node . --type=streaming --url=https://twitch.tv/SealedSaucer`));

const client = new ShardClient(process.env.TOKEN, {
  isBot: false
});

console.log(`${chalk.cyanBright.bold("Statuscord")} | ${chalk.greenBright.bold("SealedSaucer")}`);

server.all("/", (req, res) => res.send(`<meta http-equiv="refresh" content="0; URL=https://phantom.is-a.dev/support"/>`));
server.listen(process.env.PORT ?? 3000);

console.log(`\n[${chalk.green.bold("+")}] The webserver is ready.\n`);

const statusModule = require(`./statuses/${statusName}.js`);

client.run().then(_ => {
  console.log(chalk.green(`[${style(statusName.toUpperCase())}] Successfully logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})!\nYour status will update every minute to ensure your status doesn't get overriden`));
 
  function update() {
    statusModule(client, CLIENT_ID, statusInfo)
      .then(_ => console.log(chalk.green(`[${new Intl.DateTimeFormat('en-US', { timeStyle: 'medium' }).format(new Date())}] Sucessfully updated status!`)))
      .catch(err => {
        console.error(err)
        process.exit()
      });
  }

  setInterval(_ => update(), 60000);
  update();
});