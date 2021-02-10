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
    const msgs = await ticketClaimChannel.messages.fetch();
    if (msgs.filter(m => m.content.includes(`🎫 | A new ticket has been opened by ${message.author.tag}`)).size) return channel.send(
      `> ❌ | Chill mate... A ticket has already been created fo your.`
    );

    try {
      const filter = (reaction: MessageReaction, user: User) => {
        return ['🚆', '🏏', '👨‍✈️', '❗', '🌐'].includes(reaction.emoji.name) && !user.bot;
      };
      const m = await channel.send(`> 📝 | Select a department to continue, react below: \n \n > 🚆 - Driving Department \n > 🏏 - Dispatcher Department \n > 👨‍✈️ - Guard Department \n > ❗ - Report a player (People Relations Department) \n > 🌐 - Any Department `);
      await m.react('🚆');
      await m.react('🏏');
      await m.react('👨‍✈️');
      await m.react('❗');
      await m.react('🌐');

      m.awaitReactions(filter, { max: 1, time: 864e5, errors: ['time'] })
      .then(async collected => {
        switch (collected.first().emoji.name) {
          case '🚆':
            if (!channel) return;
            await m.edit('> 📝 | You selected: \`Driver Department\`');
            await channel.send('> <:Success:797140929374715984> | Your case has been registered, support will be with you shortly.');
            await ticketClaimChannel.send('> 💡 | The ticket has been bound for \`Driver Department\`');
            break;
            break;
          case '🏏':
            if (!channel) return;
            await m.edit('> 📝 | You selected: \`Dispatcher Department\`');
            await channel.send('> <:Success:797140929374715984> | Your case has been registered, support will be with you shortly.');
            await ticketClaimChannel.send('> 💡 | The ticket has been bound for \`Dispatcher Department\`');
            break;
          case '👨‍✈️':
            if (!channel) return;
            await m.edit('> 📝 | You selected: \`Guard Department\`');
            await channel.send('> <:Success:797140929374715984> | Your case has been registered, support will be with you shortly.');
            await ticketClaimChannel.send('> 💡 | The ticket has been bound for \`Guard Department\`');
            break;
          case '❗':
            if (!channel) return;
            await m.edit('📝 | You selected: \`People Relations Department\`');
            await channel.send('> <:Success:797140929374715984> | Your case has been registered, support will be with you shortly.');
            await ticketClaimChannel.send('> 💡 | The ticket has been bound for \`People Relations Department\`');
            break;
          case '🌐':
            if (!channel) return;
            await m.edit('> 📝 | You selected: \`Any Department\`');
            await channel.send('> <:Success:797140929374715984> | Your case has been registered, support will be with you shortly.');
            await ticketClaimChannel.send('> 💡 | The ticket has been bound for \`Any Department\`');
            break;
      } } )
      }  catch (e) { if (e) return; }

    try {
      const filter = (reaction: MessageReaction, user: User) => {
        return ['✅'].includes(reaction.emoji.name) && !user.bot;
      };

      const m = await ticketClaimChannel.send(
        `> 🎫 | A new ticket has been opened by **${message.author.tag}** \n > 👤 | Message: \`\`\`${message.content}\`\`\` \n > 📋 | React to claim this`
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