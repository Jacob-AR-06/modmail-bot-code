# Modmail Bot
A simple modmail bot created with typescript and discord.js.

# Installation
`npm install` you will need to do this in order to install the required packages.

# Using the bot
run `npm run dev` if you want to edit the bot and want it to restart everytime it saves.
run `npm run build` to create a build and than `npm run start` to start the bot.

# dotenv Example
You will need to add a `.env` file if you want to run your bot on a vps or your own pc, if you want to use heroku, I would recommend using the built-in envoirment variables system. Don't forget to copy the exact names of the enviorment variables, if you don't dont that, you will break the system.

```ts
DISCORD_BOT_TOKEN= //bot token here
DISCORD_BOT_PREFIX= //prefix here
GUILD_ID= // guild id here
TICKET_LOGS= // ticket log channel here
```

# Useful information
You will need to install `nodejs` to run this bot, a valid discord bot application and a host.

[nodejs](https://nodejs.org/en/)

[discord developer portal](https://discord.com/developers/applications)

[How to create an application](https://discordpy.readthedocs.io/en/latest/discord.html)

[how to install nodejs](https://www.youtube.com/watch?v=qYwLOXjAiwM)

