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
  { readdirSync } = require("node:fs"),
  { logError } = require("./chalk.js"),

  statuses = new Map([
    [1, ["playing", chalk.yellowBright.bold]],
    [2, ["listening", chalk.greenBright.bold]],
    [3, ["streaming", chalk.magentaBright.bold]]
  ]),
  getArg = name => process.argv.find(arg => arg.startsWith(`--${name}`))?.match(/(?<=\=).+/)?.[0] ?? null;

dotenv.config();

if (!/^\d+$/.test(CLIENT_ID)) logError("Read the top of the file once again");
if (!process.env.TOKEN) logError("You need to add a token inside replit's secrets or through a .env file");

const statusArgs = [
    "type",
    ...new Set(readdirSync("./statuses").map(file => Object.values(require(`./statuses/${file}`).args)).flat(3))
  ].reduce((a, c) => ({ ...a, [c]: getArg(c) }), {}),
  [statusName, style] = (statusArgs.type && (statuses.get(+statusArgs.type) ?? [...statuses.values()].find(([name]) => name.toLowerCase() === statusArgs.type.toLowerCase()))) || [];

if (!statusName) logError(`\
${!statusArgs.type
  ? "You need to type --type=<statusType> after the node command"
  : "Invalid status type"
}

Supported status types:
${[...statuses.entries()].map(([number, [name]]) => `[${chalk.white(number)}] - ${chalk.green(name)}`).join("\n")}

You can use either the number or the name
Examples: (yes you need the ")
` + chalk.whiteBright(`
node . --type=playing --game="Half-Life 2"

node . --type=listening --song="Medic!" --artist="Valve Studio Orchestra" --album="Fight Songs" --image="mp:attachments/1043947086946766888/1055860217163829258/ss_2c78852e39f4d838007b34460baeb40aabe41193.png"

node . --type=streaming --url="https://twitch.tv/SealedSaucer" --title="Half-Life 2"`));
// you can tell that the person who wrote this is a major fan


const statusModule = require(`./statuses/${statusName}.js`);

if (statusModule.args.required.some(arg => !statusArgs[arg])) logError(`The status type ${chalk.yellow(statusName)} needs the args ${chalk.yellow(statusModule.args.required.join(", "))}` + (statusModule.args.optional ? `It also supports ${chalk.yellow(statusModule.args.optional.join(", "))}` : ""));
statusModule.validateArgs(statusArgs);

const client = new ShardClient(process.env.TOKEN, {
  isBot: false
});

console.log(`${chalk.cyanBright.bold("Statuscord")} | ${chalk.greenBright.bold("SealedSaucer")} & ${chalk.yellowBright.bold("code913")}`);

client.run().then(async _ => {
  console.log(chalk.green(`[${style(statusName.toUpperCase())}] Successfully logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})!\nYour status will update every minute to ensure your status doesn't get overriden`));

  server.all("/", (req, res) => res.send(`<meta http-equiv="refresh" content="0; URL=https://phantom.is-a.dev/support"/>`));
  server.listen(process.env.PORT ?? 3000);

  console.log(`\n[${chalk.green.bold("REPLIT")}] The webserver is ready.\n`);


  const startTime = Date.now();
  function update() {
    statusModule.run({
      client,
      statusInfo: statusArgs,
      setPresence: presenceData => client.gateway.setPresence({
        activity: {
          ...presenceData,
          createdAt: startTime,
          timestamps: {
            start: startTime
          }
        }
      }),
      CLIENT_ID
    }).then(_ => console.log(chalk.green(`[${new Intl.DateTimeFormat('en-US', { timeStyle: 'medium' }).format(new Date())}] Sucessfully updated status!`)))
      .catch(err => {
        console.error(err);
        process.exit();
      });
  }

  setInterval(_ => update(), 60000);
  update();
});
