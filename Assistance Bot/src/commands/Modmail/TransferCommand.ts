import { Message, TextChannel, Guild, User, MessageReaction } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';

export default class CloseCommand extends BaseCommand {
  constructor() {
    super('transfer', 'Modmail', []);
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    if (message.channel.type === 'dm') return;

    let user: User;
    try {
      user = message.mentions.users.first() 
      || message.guild.members.cache.get(args[0] || '').user 
      || message.guild.members.cache.find(m => m.user.username === (args[0] || '')).user
      || message.guild.members.cache.find(m => m.user.tag === (args[0] || '')).user
    } catch (e) {
      return message.channel.send(`> ❌ | Please provide a username/id to transfer to.`);
    }

    if (!user) return message.channel.send(`> ❌ | Please provide a username/id to transfer to.`);

    const dm = await user.createDM();
    const channel: TextChannel = message.channel as TextChannel;
    try {
      const filter = (reaction: MessageReaction, user: User) => {
        return ['✅', '❌'].includes(reaction.emoji.name) && !user.bot;
      };

      const opener = await client.users.cache.get(channel.name.slice(0, -26)).createDM();

      const msg = await dm.send(`> 📨 | **${message.author.tag}** has requested to transfer their ticket to you. React with :white_check_mark: to accept it and react with :x: to reject it.`);
      await msg.react('✅');
      await msg.react('❌');

      message.channel.send(`> 📨 | Ticket transfer request successfully sent!`);

      msg.awaitReactions(filter, { max: 1, time: 864e5, errors: ['time'] })
      .then(async collected => {
        const claimer = collected.first().users.cache.last();
        switch (collected.first().emoji.name) {
          case '✅':
            if (!channel) return;
            await channel.setName(`${channel.name.slice(0, -26)}-${claimer.id}-ticket`);
            dm.send(`> ✅ | The ticket was transferred!`);
            message.author.send(`> 📨 | The ticket has been transferred to **${claimer.tag}**!`);
            return opener.send(`> 📨 | Your ticket has been transferred to **${claimer.tag}**!`);
          case '❌':
            if (!channel) return;
            await message.author.send(`> | ❌ The user you tried to transfer the ticket to has denied your request.`);
            return dm.send(`> ✅ | You have rejected the request to take over the ticket.`);
        }

      })
      .catch(collected => {
        return message.channel.send(`> ❌ | ${message.author.toString()}, No one claimed your ticket on time, you will stay as the ticket claimer.`);
      });
    } catch (e) { 
      return message.channel.send(`> ❌ | ${message.author.toString()}, No one claimed your ticket on time, you will stay as the ticket claimer.`);
    }
  }
}