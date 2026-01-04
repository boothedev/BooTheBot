import {
	APIApplicationCommandStringOption,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	RESTPutAPIApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import 'dotenv/config';

const applicationId = process.env.DISCORD_APPLICATION_ID;
const botToken = process.env.DISCORD_TOKEN;

const pickCommand: RESTPostAPIChatInputApplicationCommandsJSONBody = {
	type: ApplicationCommandType.ChatInput,
	name: 'pick',
	description: 'Randomly pick one of the provided options',
	options: Array.from(
		{ length: 25 },
		(_, i): APIApplicationCommandStringOption => ({
			type: ApplicationCommandOptionType.String,
			name: `option-${i + 1}`,
			description: `Option #${i + 1}`,
			required: i < 2, // Require the first 2 options
		}),
	),
};
const clowCommand: RESTPostAPIChatInputApplicationCommandsJSONBody = {
	type: ApplicationCommandType.ChatInput,
	name: 'clow',
	description: 'Draw your daily card from the Clow Card deck',
};
const spriteCommand: RESTPostAPIChatInputApplicationCommandsJSONBody = {
	type: ApplicationCommandType.ChatInput,
	name: 'sprite',
	description: 'Draw your daily card from the Whimsical Sprite Oracle',
};
const answerCommand: RESTPostAPIChatInputApplicationCommandsJSONBody = {
	type: ApplicationCommandType.ChatInput,
	name: 'answer',
	description: 'Ask a question and receive an answer from the void',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'question',
			description: 'What is your question?',
			required: true,
		},
	],
};

const commands: RESTPutAPIApplicationCommandsJSONBody = [pickCommand, clowCommand, spriteCommand, answerCommand];

async function register() {
	const url = `https://discord.com/api/v10/applications/${applicationId}/commands`;
	const response = await fetch(url, {
		method: 'PUT',
		headers: {
			Authorization: `Bot ${botToken}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(commands),
	});

	if (response.ok) {
		console.log('Commands registered successfully!');
	} else {
		console.error('Error registering commands:', await response.text());
	}
}

register();
