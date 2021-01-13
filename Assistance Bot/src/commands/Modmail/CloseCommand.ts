import { Message, TextChannel, Guild } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';

export default class CloseCommand extends BaseCommand {
  constructor() {
    super('close', 'Modmail', []);
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    if (message.channel.type === 'dm') {
      const guild: Guild = client.guilds.cache.get(process.env.GUILD_ID);
      const channel: TextChannel = guild.channels.cache.filter(c => c.name.startsWith(message.author.id) && c.name.endsWith('-ticket')).first() as TextChannel;
      if (!channel) return;
      
      const claimer = client.users.cache.get(channel.name.slice(19).slice(0, -7));
      const ticketLogs: TextChannel = guild.channels.cache.get(process.env.TICKET_LOGS) as TextChannel;
      const msg = (await ticketLogs.messages.fetch({ limit: 100 })).filter(m => m.content.includes(message.author.tag && claimer.tag)).last();

      try {
        await claimer.send(`> <:PER_Logo_Transparent:791008398887223357> | **${message.author.tag} (<@${message.author.id}>**) has the closed the ticket that you claimed.`);
      } finally {
        msg ? await msg.delete() : '';
        return channel.delete('> <:PER_Logo_Transparent:791008398887223357> | Ticket closed by' + message.author.tag).catch(e => channel.send('> ❌ | The channel could not be deleted!'));
      }
    } else {
      const guild: Guild = client.guilds.cache.get(process.env.GUILD_ID);
      const channel: TextChannel = message.channel as TextChannel;
      if (!channel.name.endsWith(message.author.id + '-ticket')) return;
      
      const opener = client.users.cache.get(channel.name.slice(0, -26));
      const ticketLogs: TextChannel = guild.channels.cache.get(process.env.TICKET_LOGS) as TextChannel;
      const msg = (await ticketLogs.messages.fetch({ limit: 100 })).filter(m => m.content.includes(message.author.tag && opener.tag)).last();

      try {
        await opener.send(`> <:PER_Logo_Transparent:791008398887223357> | The claimer of your inquiry has now closed this ticket. Thank you for getting in touch! :smile: \n > :question: | If you ever need assistance again, feel free to DM me whenever!`);
      } finally {
        msg ? await msg.delete() : '';
        channel.delete('> :ticket: | Ticket closed by' + message.author.tag).catch(e => channel.send('> ❌ | The channel could not be deleted.'));
      }
    }
  }
}