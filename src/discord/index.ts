import { verifyKey } from 'discord-interactions';
import { InteractionResponseType } from 'discord-api-types/v10';
import { ERROR_RESPONSES } from '@/endpointHandlers';
import { interactionClassifier } from './utils';
import { GenericHandler, GenericInteraction, Handlers } from './types';

const extractInteractionObject = async (...[request, env]: Parameters<EndpointHandler>) => {
	const rawBody = await request.text();
	const signature = request.headers.get('x-signature-ed25519');
	const timestamp = request.headers.get('x-signature-timestamp');
	const clientPublicKey = env.DISCORD_PUBLIC_KEY;
	if (!signature || !timestamp) return null;
	const isValidSignatureRequest = await verifyKey(rawBody, signature, timestamp, clientPublicKey);
	if (!isValidSignatureRequest) return null;
	return JSON.parse(rawBody) as GenericInteraction;
};

const interactionProcess = async (interactionHandlers: Handlers, interaction: GenericInteraction, ...args: any[]) => {
	const handlers = {
		ping: () => ({ type: InteractionResponseType.Pong }),
		...interactionHandlers,
	};
	const type = interactionClassifier(interaction);

	if (type && handlers[type]) {
		const handler = handlers[type] as GenericHandler<typeof type>;
		return handler(interaction, ...args);
	}
	return null;
};

const discordInteractionEndpoint: EndpointHandler = async (...args) => {
	const interaction = await extractInteractionObject(...args);
	if (interaction === null) return ERROR_RESPONSES.Unauthorized('invalid request signature');

	const handlers = {};
	const interactionResponse = await interactionProcess(handlers, interaction);
	if (interactionResponse) return Response.json(interactionResponse);
	return ERROR_RESPONSES.NotFound();
};

export default discordInteractionEndpoint;
