import BaseEvent from '../../utils/structures/BaseEvent';
import { Message } from 'discord.js';
import DiscordClient from '../../client/client';
import DmEvent from '../dm';

const dm = new DmEvent();

export default class MessageEvent extends BaseEvent {
  constructor() {
    super('message');
  }

  async run(client: DiscordClient, message: Message) {
    if (message.author.bot) return;
    if (message.channel.type === "dm") return dm.run(client, message);
    if (message.channel.name.includes(`-${message.author.id}-ticket`)) return dm.channelTicket(client, message);
    
    if (message.content.startsWith(client.prefix)) {
      const [cmdName, ...cmdArgs] = message.content
        .slice(client.prefix.length)
        .trim()
        .split(/\s+/);
      const command = client.commands.get(cmdName);
      if (command) {
        command.run(client, message, cmdArgs);
      }
    }
  }
}