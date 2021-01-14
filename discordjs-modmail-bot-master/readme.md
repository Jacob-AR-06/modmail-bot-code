# Modmail Bot
A simple modmail bot created with TypeScript and discord.js.

# Installation
Run `npm install` in the same directory as the bot in order to install the required packages.

# Using the bot
Run `npm run dev` if you want to edit the bot and want it to restart everytime it saves.\
Run `npm run build` to create a build and then run `npm run start` to start the bot.

Recent versions of Node.js may return an error when attempting to build/run the bot. To rectify this, navigate to `src/utils/structures/BaseCommand.ts` and remove `async` from line 12. It should now read `abstract run(client: DiscordClient, message: Message, args: Array<string> | null);`.

# dotenv Example
You will need to add a `.env` file if you want to run your bot on a VPS or on your own PC. If you want to use Heroku, I would recommend using the built-in environment variables system. Don't forget to copy the exact names of the environment variables. If you don't do that, you will break the system.

```ts
DISCORD_BOT_TOKEN= //bot token here
DISCORD_BOT_PREFIX= //prefix here
GUILD_ID= // guild id here
TICKET_LOGS= // ticket log channel here
```

# Useful information
You will need to install `Node.js` to run this bot.

[Node.js](https://nodejs.org/en/)

[Discord Developer Portal](https://discord.com/developers/applications)

[How to Create an Application](https://discordpy.readthedocs.io/en/latest/discord.html)

[How to Install Node.js](https://www.youtube.com/watch?v=qYwLOXjAiwM)

