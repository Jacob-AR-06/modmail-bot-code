import BaseEvent from '../utils/structures/BaseEvent';
import { DMChannel, TextChannel, Message, Guild, Collection, User, MessageReaction, MessageAttachment } from 'discord.js';
import DiscordClient from '../client/client';

export default class DmEvent extends BaseEvent {
  constructor() {
    super('dm');
  }

  async run(client: DiscordClient, message: Message) {
    const channel: DMChannel = await message.author.createDM();
    const guild: Guild = client.guilds.cache.get(process.env.GUILD_ID);

    if (!guild.available) return channel.send('> 🔥 | It looks like the server you tried to contact is on an outage, please try again later!').catch(e => { if (e) return; });
    const ticket: TextChannel = guild.channels.cache.filter(c => c.name.startsWith(message.author.id) && c.name.endsWith('-ticket')).first() as TextChannel;
    if (ticket) return this.ticket(client, message, ticket);

    const ticketClaimChannel: TextChannel = guild.channels.cache.get(process.env.TICKET_LOGS) as TextChannel;
    const qdchannel: TextChannel = guild.channels.cache.get('808268637525114891') as TextChannel;
    const dschannel: TextChannel = guild.channels.cache.get('808268708362584064') as TextChannel;
    const gdchannel: TextChannel = guild.channels.cache.get('808268854098657360') as TextChannel;
    const prcchannel: TextChannel = guild.channels.cache.get('808268964517642260') as TextChannel;
    const anychannel: TextChannel = guild.channels.cache.get('798997832899231744') as TextChannel;
    const msgs = await ticketClaimChannel.messages.fetch();
    if (msgs.filter(m => m.content.includes(`🎫 | A new ticket has been opened by ${message.author.tag}`)).size) return channel.send(
      `> ❌ | Chill mate... A ticket has already been created fo your.`
    );

    try {
      const filter = (reaction: MessageReaction, user: User) => {
        return ['<:TPP_Driver:803332478131503135>', '<:Dispatch_Logo:797067270874333194>', '<:TPP_Guard:798248404806795305>', '<:TPPBot_Assistance:808264680829091911>', '<:TPP:803336087086694431>'].includes(reaction.emoji.name) && !user.bot;
      };
      const m = await channel.send(`> 📝 | Select a department to continue, react below: \n \n > <:TPP_Driver:803332478131503135> - Driving Department \n > <:Dispatch_Logo:797067270874333194> - Dispatcher Department \n > <:TPP_Guard:798248404806795305> - Guard Department \n > <:TPPBot_Assistance:808264680829091911> - Report a player (People Relations Department) \n > <:TPP:803336087086694431> - Any Department `);
      await m.react('<:TPP_Driver:803332478131503135>');
      await m.react('<:Dispatch_Logo:797067270874333194>');
      await m.react('<:TPP_Guard:798248404806795305>');
      await m.react('<:TPPBot_Assistance:808264680829091911>');
      await m.react('<:TPP:803336087086694431>');

      m.awaitReactions(filter, { max: 1, time: 864e5, errors: ['time'] })
      .then(async collected => {
        switch (collected.first().emoji.name) {
          case '<:TPP_Driver:803332478131503135>':
            if (!channel) return;
            await m.edit('📝 | You selected: \`Driver Department\`');
            await channel.send('> <:Success:797140929374715984> | Successfully bound your case to \`Dispatcher Department\`');
            await ticketClaimChannel.send('💡 | The ticket has been bound for \`Driver Department\`');
            break;
            break;
          case '<:Dispatch_Logo:797067270874333194>':
            if (!channel) return;
            await m.edit('📝 | You selected: \`Dispatcher Department\`');
            await channel.send('> <:Success:797140929374715984> | Successfully bound your case to \`Dispatcher Department\`');
            await ticketClaimChannel.send('💡 | The ticket has been bound for \`Dispatcher Department\`');
            break;
          case '<:TPP_Guard:798248404806795305>':
            if (!channel) return;
            await m.edit('📝 | You selected: \`Guard Department\`');
            await channel.send('> <:Success:797140929374715984> | Successfully bound your case to \`Guard Department\`');
            await ticketClaimChannel.send('💡 | The ticket has been bound for \`Guard Department\`');
            break;
          case '<:TPPBot_Assistance:808264680829091911>':
            if (!channel) return;
            await m.edit('📝 | You selected: \`People Relations Department\`');
            await channel.send('> <:Success:797140929374715984> | Successfully bound your case to \`People Relations Department\`');
            await ticketClaimChannel.send('💡 | The ticket has been bound for \`People Relations Department\`');
            break;
          case '<:TPP:803336087086694431>':
            if (!channel) return;
            await m.edit('📝 | You selected: \`Any Department\`');
            await channel.send('> <:Success:797140929374715984> | Successfully bound your case to \`Any Department\`');
            await ticketClaimChannel.send('💡 | The ticket has been bound for \`Any Department\`');
            break;
      } } )
      }  catch (e) { if (e) return; }

    try {
      const filter = (reaction: MessageReaction, user: User) => {
        return ['✅'].includes(reaction.emoji.name) && !user.bot;
      };

      const m = await ticketClaimChannel.send(
        `> <a:latency:801755488202915881> | A ticket is being generated, please wait. \n > DO NOT CLAIM THIS TICKET`
      );
      await m.react('✅');
      m.awaitReactions(filter, { max: 1, time: 864e5, errors: ['time'] })
      .then(collected => {
        const claimer = collected.first().users.cache.last();
        const claimMsg = collected.first().message;
        claimMsg.edit(`> 📝 | This ticket was claimed by **${claimer.tag}**`)
        return this.handleticket(message, channel, claimer, guild, claimMsg);
      })
      .catch(collected => {
        return channel.send(`> <:Error:799329110463610940> | Your ticket request timed out. Please open a new one and we will try and get back to you.`);
      });
    } catch (e) {
      console.log(e);
  
    }
  }
  
  async ticket(client: DiscordClient, message: Message, channel: TextChannel) {
    const prefix = process.env.DISCORD_BOT_PREFIX;
    if (message.content.startsWith(prefix)) return this.handleCommands(client, message);

    const claimer = client.users.cache.get(channel.name.slice(19).slice(0, -7));
    const files = this.getUrls(message.attachments);

    try {
      await channel.send(
        `> 💬 | Reply from <@${message.author.id}>: \`\`\`${message.content || 'No content'}\`\`\` \n > ❓ | To send a reply, send your message here. \n > :mailbox_with_no_mail: | If you want to close the ticket, use \`${prefix}close\`. \n > Use \`${prefix}transfer <user name/id/mention/tag>\` to transfer this ticket.`
      , { files });
      message.react('✅')
      return message.channel.send(`> <:Success:797140929374715984> | Your reply has successfully been sent to <@${claimer.id}>. You will receive a response shortly.`);
    } catch (e) {
      console.log(e);
    }
  }

  async channelTicket(client: DiscordClient, message: Message) {
    const prefix = process.env.DISCORD_BOT_PREFIX;
    if (message.content.startsWith(prefix)) return this.handleCommands(client, message);

    const ticketChannel: TextChannel = message.channel as TextChannel;
    const opener = client.users.cache.get(ticketChannel.name.slice(0, -26));
    const channel: DMChannel = await opener.createDM();
    const files = this.getUrls(message.attachments);
    try {
      await channel.send(
        `> 💬 | Reply from <@${message.author.id}>: \`\`\`${message.content}\`\`\` \n > ❓ | To send a reply, send your message in this DM.`
      , { files });
      message.react('✅')
      return ticketChannel.send(`> <:Success:797140929374715984> | Reply sent to <@${opener.id}>`);
    } catch (e) {
      console.log(e);
    }
  }

  async handleticket(message: Message, channel: DMChannel, claimer: User, guild: Guild, claimLogMessage: Message) {
    const prefix = process.env.DISCORD_BOT_PREFIX;
    try {
      const ticketChannel = await guild.channels.create(message.author.id + '-' + '-ticket', { type: 'text', topic: 'Please do not rename this channel.' });
      ticketChannel.updateOverwrite(claimer, { SEND_MESSAGES: true, VIEW_CHANNEL: true, ATTACH_FILES: true });
      ticketChannel.updateOverwrite(guild.me, { SEND_MESSAGES: true, VIEW_CHANNEL: true, ATTACH_FILES: true });
      ticketChannel.updateOverwrite(guild.id, { SEND_MESSAGES: false, VIEW_CHANNEL: false });
      await ticketChannel.send(
        `> 👤 | <@${message.author.id}>'s ticket. \n > 💬 | Message: \`\`\`${message.content}\`\`\` \n > ❓ | To send a reply, send your message here. \n > :mailbox_with_no_mail: | If you want to close the ticket, use \`${prefix}close\`. \n > Use \`${prefix}transfer <user name/id/mention/tag>\` to transfer this ticket.`
      );
      const member = guild.members.cache.get(claimer.id) || await guild.members.fetch(claimer.id);

      channel.send(`> 📢 | Your case has been claimed by **${member.nickname}** (<@${claimer.id}>). You will receive a response shortly.`)
    } catch (e) {
      console.log(e);
    }
  }

  handleCommands(client: DiscordClient, message: Message) {
    const [cmdName, ...cmdArgs] = message.content
      .slice(client.prefix.length)
      .trim()
      .split(/\s+/);
    const command = client.commands.get(cmdName);
    if (command) {
      command.run(client, message, cmdArgs);
    }
  }

  getUrls(attachments: Collection<string, MessageAttachment>) {
    const valid = /^.*(gif|png|jpg|jpeg|mp4|mp3|pdf|psd)$/g

    return attachments.array()
      .filter(attachment => valid.test(attachment.url))
      .map(attachment => attachment.url);
  }
}