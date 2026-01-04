import discordInteractionEndpoint from './discord';

const ERROR_RESPONSES = {
	NotFound: (body = 'Not Found') => new Response(body, { status: 404 }),
	BadRequest: (body = 'Bad Request') => new Response(body, { status: 400 }),
	Unauthorized: (body = 'Authentication Required') => new Response(body, { status: 401 }),
	Forbiden: (body = 'Permission Denied') => new Response(body, { status: 403 }),
};

const homeEndpoint: EndpointHandler = () => {
	return new Response('Hello World!');
};

const ENDPOINTS: Record<string, EndpointPairHandler> = {
	'/': {
		GET: homeEndpoint,
	},
	'/discord': {
		POST: discordInteractionEndpoint,
	},
	'/messenger': {
		POST: discordInteractionEndpoint,
	},
};

export { ENDPOINTS, ERROR_RESPONSES };
