import { InteractionResponseType } from 'discord-api-types/v10';
import { ERROR_RESPONSES } from '@/endpoints';
import { interactionClassifier } from './utils';
import { Handler, GenericInteraction, HandlerMap } from './types';
import handlers from './handlers';
import { EndpointHandler, RequestState } from '@/types';
import { StorageManager } from '@/storage';

const createHandlers = (handlers: HandlerMap) => {
	const _handlers = {
		ping: () => ({ type: InteractionResponseType.Pong }),
		...handlers,
	};

	return {
		handle: async (interaction: GenericInteraction, storageMgr: StorageManager, ...args: any[]) => {
			const type = interactionClassifier(interaction);

			if (type && _handlers[type]) {
				const handler = _handlers[type] as Handler<typeof type>;
				return handler(interaction, storageMgr, ...args);
			}
			return null;
		},
	};
};

const discordEndpointHandler: EndpointHandler = async (storageMgr, ...args) => {
	const interaction = await storageMgr.extractInteractionObject();
	if (interaction === null) return ERROR_RESPONSES.Unauthorized('invalid request signature');
	const interactionResponse = await createHandlers(handlers).handle(interaction, storageMgr, ...args);
	if (interactionResponse) return Response.json(interactionResponse);
	return ERROR_RESPONSES.NotFound();
};

export default discordEndpointHandler;
