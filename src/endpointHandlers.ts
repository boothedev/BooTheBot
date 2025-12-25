import { APIBaseInteraction, APIInteractionResponse, InteractionType } from 'discord-api-types/v10';
import { verifyKey } from 'discord-interactions';
import { interactionHandler } from './interactionHandlers';

const ERROR_RESPONSES = {
	NotFound: (body = 'Not Found') => new Response(body, { status: 404 }),
	BadRequest: (body = 'Bad Request') => new Response(body, { status: 400 }),
	Unauthorized: (body = 'Authentication Required') => new Response(body, { status: 401 }),
	Forbiden: (body = 'Permission Denied') => new Response(body, { status: 403 }),
};

const extractInteractionObject = async (...[request, env]: Parameters<EndpointHandler>) => {
	const rawBody = await request.text();
	const signature = request.headers.get('x-signature-ed25519');
	const timestamp = request.headers.get('x-signature-timestamp');
	const clientPublicKey = env.DISCORD_PUBLIC_KEY;
	if (!signature || !timestamp) return null;
	const isValidSignatureRequest = await verifyKey(rawBody, signature, timestamp, clientPublicKey);
	if (!isValidSignatureRequest) return null;
	return JSON.parse(rawBody) as APIBaseInteraction<InteractionType, any>;
};

const homeEndpoint: EndpointHandler = () => {
	return new Response('Hello World!');
};

const interactionEndpoint: EndpointHandler = async (...args) => {
	const interaction = await extractInteractionObject(...args);
	if (interaction === null) return ERROR_RESPONSES.Unauthorized('invalid request signature');
	let interactionResponse: APIInteractionResponse = interactionHandler(interaction);
	return Response.json(interactionResponse);
};

const ENDPOINTS: Record<string, EndpointPairHandler> = {
	'/': {
		GET: homeEndpoint,
	},
	'/interaction': {
		POST: interactionEndpoint,
	},
};

export { ENDPOINTS, ERROR_RESPONSES };
