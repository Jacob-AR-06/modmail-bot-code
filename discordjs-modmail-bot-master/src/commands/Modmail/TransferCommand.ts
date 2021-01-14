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
      return message.channel.send(`> <:Error:799329110463610940> | Error. \n \`No one was tagged. The ticket could not be transferred.\` \n > 💁‍♂️ | Remember to get the user's ID and lay it out like this: \`<@[id here>\``);
    }

    if (!user) return message.channel.send(`> <:Error:799329110463610940> | Error. \n \`No one was tagged. The ticket could not be transferred.\` \n > 💁‍♂️ | Remember to get the user's ID and lay it out like this: \`<@[id here>\``);

    const dm = await user.createDM();
    const channel: TextChannel = message.channel as TextChannel;
    try {
      const filter = (reaction: MessageReaction, user: User) => {
        return ['✅', '❌'].includes(reaction.emoji.name) && !user.bot;
      };

      const opener = await client.users.cache.get(channel.name.slice(0, -26)).createDM();

      const msg = await dm.send(`> 📬 | **New Ticket Transfer Request** \n > ${message.author.tag} has requested to make a ticket transfer. \n > ℹ️ | React below to either accept or deny it.`);
      await msg.react('✅');
      await msg.react('❌');

      message.channel.send(`> <:Success:797140929374715984> | Successfully sent ticket transfer request.`);

      msg.awaitReactions(filter, { max: 1, time: 864e5, errors: ['time'] })
      .then(async collected => {
        const claimer = collected.first().users.cache.last();
        switch (collected.first().emoji.name) {
          case '✅':
            if (!channel) return;
            await channel.setName(`${channel.name.slice(0, -26)}-${claimer.id}-ticket`);
            await channel.updateOverwrite(claimer, { SEND_MESSAGES: true, VIEW_CHANNEL: true, ATTACH_FILES: true });
            dm.send(`> <:Success:797140929374715984> | Request accepted. You are now the claimer of the ticket.`);
            message.author.send(`> <:Success:797140929374715984> | Your ticket was successfully transferred to **${claimer.tag}**!`);
            return opener.send(`> 📨 | Your ticket has been transferred to **<@${claimer.id}>**.`);
          case '❌':
            if (!channel) return;
            await message.author.send(`> <:Error:799329110463610940> | Could not transfer the ticket \n \`The user who you tried to transfer the ticket to denied your request.\``);
            return dm.send(`> <:Success:797140929374715984> | Successfully denied ticket transfer.`);
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
