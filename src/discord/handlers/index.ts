import { Handler, HandlerCustomMap, HandlerMap } from '@/discord/types';
import pickHandler from './pick';
import clowHandler from './clow';
import spriteHandler from './sprite';
import askHandler from './ask';
import settingsHandler from './settings';

const chatInputCommandHandlers: HandlerCustomMap<'chatInputCommand'> = {
	pick: pickHandler,
	clow: clowHandler,
	sprite: spriteHandler,
	ask: askHandler,
	settings: settingsHandler,
};

const chatInputCommand: Handler<'chatInputCommand'> = (interaction, ...args) => {
	const name = interaction.data.name;
	const handler = chatInputCommandHandlers[name];
	if (handler) return handler(interaction, ...args);
	throw new Error(name);
};

const handlers: HandlerMap = {
	chatInputCommand: chatInputCommand,
};

export default handlers;
