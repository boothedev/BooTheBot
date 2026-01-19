import {
	APIApplicationCommandStringOption,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	Locale,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	RESTPutAPIApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import dotenv from 'dotenv';
import { TimeMode } from '@shared/consts';

dotenv.config({ path: '.env.dev' });
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
	description: 'Draw your fortune card from the Clow Card deck',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'timemode',
			description: 'Choose a cycle to ground your reading',
			choices: Object.entries(TimeMode).map(([k, v]) => ({
				name: k + (v === TimeMode.Daily ? ' (default)' : ''),
				value: v,
			})),
		},
	],
};
const spriteCommand: RESTPostAPIChatInputApplicationCommandsJSONBody = {
	type: ApplicationCommandType.ChatInput,
	name: 'sprite',
	description: 'Draw your daily card from the Whimsical Sprite Oracle',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'timemode',
			description: 'Choose a cycle to ground your reading',
			choices: Object.entries(TimeMode).map(([k, v]) => ({
				name: k + (v === TimeMode.Daily ? ' (default)' : ''),
				value: v,
			})),
		},
	],
};
const answerCommand: RESTPostAPIChatInputApplicationCommandsJSONBody = {
	type: ApplicationCommandType.ChatInput,
	name: 'ask',
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
const settingsCommand: RESTPostAPIChatInputApplicationCommandsJSONBody = {
	type: ApplicationCommandType.ChatInput,
	name: 'settings',
	description: 'Set your preferences',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'timezone',
			description: 'What is your timezone? (type to search)',
			choices: [
				{ name: 'International Date Line (GMT-12)', value: 'Etc/GMT+12' },
				{ name: 'Honolulu (HST, GMT-10)', value: 'Pacific/Honolulu' },
				{ name: 'Anchorage (AKST, GMT-9/8)', value: 'America/Anchorage' },
				{ name: 'Los Angeles (PST, GMT-8/7)', value: 'America/Los_Angeles' },
				{ name: 'Denver (MST, GMT-7/6)', value: 'America/Denver' },
				{ name: 'Chicago (CST, GMT-6/5)', value: 'America/Chicago' },
				{ name: 'New York (EST, GMT-5/4)', value: 'America/New_York' },
				{ name: 'Halifax (AST, GMT-4/3)', value: 'America/Halifax' },
				{ name: 'Sao Paulo (BRT, GMT-3)', value: 'America/Sao_Paulo' },
				{ name: 'St Johns (NST, GMT-3:30/2:30)', value: 'America/St_Johns' },
				{ name: 'Azores (AZOT, GMT-1/0)', value: 'Atlantic/Azores' },
				{ name: 'London (GMT, GMT+0/1)', value: 'Europe/London' },
				{ name: 'Berlin (CET, GMT+1/2)', value: 'Europe/Berlin' },
				{ name: 'Kyiv (EET, GMT+2/3)', value: 'Europe/Kyiv' },
				{ name: 'Cairo (EET, GMT+2/3)', value: 'Africa/Cairo' },
				{ name: 'Moscow (MSK, GMT+3)', value: 'Europe/Moscow' },
				{ name: 'Dubai (GST, GMT+4)', value: 'Asia/Dubai' },
				{ name: 'Kolkata (IST, GMT+5:30)', value: 'Asia/Kolkata' },
				{ name: 'Bangkok (ICT, GMT+7)', value: 'Asia/Bangkok' },
				{ name: 'Singapore (SGT, GMT+8)', value: 'Asia/Singapore' },
				{ name: 'Tokyo (JST, GMT+9)', value: 'Asia/Tokyo' },
				{ name: 'Adelaide (ACDT, GMT+10:30/9:30)', value: 'Australia/Adelaide' },
				{ name: 'Sydney (AEDT, GMT+11/10)', value: 'Australia/Sydney' },
				{ name: 'Auckland (NZDT, GMT+13/12)', value: 'Pacific/Auckland' },
				{ name: 'Samoa (WST, GMT+13)', value: 'Pacific/Apia' },
			],
			required: false,
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'language',
			description: 'Select your language',
			choices: [
				{ name: 'English', value: Locale.EnglishUS },
				{ name: 'Tiếng Việt', value: Locale.Vietnamese },
			],
		},
	],
};

const commands: RESTPutAPIApplicationCommandsJSONBody = [pickCommand, clowCommand, spriteCommand, answerCommand, settingsCommand];

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
