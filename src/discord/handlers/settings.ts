import { Handler } from '@/discord/types';
import { unimplementInteractionResponse } from '@/discord/utils';

const settingsHandler: Handler<'chatInputCommand'> = () => {
	return unimplementInteractionResponse();
};

export default settingsHandler;
