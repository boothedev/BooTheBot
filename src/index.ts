/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import {
	APIApplicationCommandInteractionData,
	APIApplicationCommandInteractionWrapper,
	APIBaseInteraction,
	APIChatInputApplicationCommandInteraction,
	APIInteractionResponse,
	APIInteractionResponseChannelMessageWithSource,
	APIInteractionResponsePong,
	ApplicationCommandType,
	InteractionResponseType,
	InteractionType,
	MessageFlags,
} from 'discord-api-types/v10';
import { verifyKey } from 'discord-interactions';

interface Env {
	DISCORD_PUBLIC_KEY: string;
}
type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
type Handler = ExportedHandler<Env>['fetch'];
type EndpointHandler = Partial<Record<Method, Handler>>;

const ERROR_RESPONSES = {
	NotFound: (body = 'Not Found') => new Response(body, { status: 404 }),
	BadRequest: (body = 'Bad Request') => new Response(body, { status: 400 }),
	Unauthorized: (body = 'Authentication Required') => new Response(body, { status: 401 }),
	Forbiden: (body = 'Permission Denied') => new Response(body, { status: 403 }),
};

const homeHandler: Handler = async () => {
	return new Response('Hello World!');
};

const pingCommandHandler = () => ({ type: InteractionResponseType.Pong }) as APIInteractionResponsePong;

const unimplementedCommandHandler = () =>
	({
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			flags: MessageFlags.Ephemeral,
			content: 'Unimplemented Command',
		},
	}) as APIInteractionResponseChannelMessageWithSource;

const applicationCommandChatInputHandler = (command: APIChatInputApplicationCommandInteraction): APIInteractionResponse => {
	return unimplementedCommandHandler();
};

const interactionHandler: Handler = async (request, env, ctx) => {
	const rawBody = await request.text();
	const signature = request.headers.get('x-signature-ed25519');
	const timestamp = request.headers.get('x-signature-timestamp');
	const clientPublicKey = env.DISCORD_PUBLIC_KEY;
	if (!signature || !timestamp) return ERROR_RESPONSES.BadRequest();
	const isValidSignatureRequest = await verifyKey(rawBody, signature, timestamp, clientPublicKey);
	if (isValidSignatureRequest) return ERROR_RESPONSES.Unauthorized('invalid request signature');

	const interaction = JSON.parse(rawBody) as APIBaseInteraction<InteractionType, any>;
	let interactionResponse: APIInteractionResponse = unimplementedCommandHandler();

	switch (interaction.type) {
		case InteractionType.Ping:
			interactionResponse = pingCommandHandler();
			break;
		case InteractionType.ApplicationCommand:
			const applicationCommandInteraction = interaction as APIApplicationCommandInteractionWrapper<APIApplicationCommandInteractionData>;
			const commandType = applicationCommandInteraction.data.type;
			switch (commandType) {
				case ApplicationCommandType.ChatInput:
					const applicationCommandChatInputInteraction = interaction as APIChatInputApplicationCommandInteraction;
					interactionResponse = applicationCommandChatInputHandler(applicationCommandChatInputInteraction);
					break;
			}
			break;
		case InteractionType.MessageComponent:
			break;
		case InteractionType.ModalSubmit:
			break;
		case InteractionType.ApplicationCommandAutocomplete:
			break;
	}
	return Response.json(interactionResponse);
};

const ENDPOINTS: Record<string, EndpointHandler> = {
	'/': {
		GET: homeHandler,
	},
	'/interaction': {
		POST: interactionHandler,
	},
};

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const path = url.pathname;
		const method = request.method as Method;
		const endpoint = ENDPOINTS[path]?.[method] ?? null;
		if (endpoint === null) return ERROR_RESPONSES.NotFound();
		return endpoint(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;
