import BaseEvent from '../../utils/structures/BaseEvent';
import DiscordClient from '../../client/client';

export default class ReadyEvent extends BaseEvent {
  constructor() {
    super('ready');
  }
  async run (client: DiscordClient) {
    client.user.setActivity('with tickets | DM me to create a ticket', { type: 'PLAYING' });
    console.log('Success. Bot logged in.');
  }
}