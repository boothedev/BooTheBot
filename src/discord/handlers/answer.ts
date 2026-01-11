import { Handler } from '@/discord/types';
import { unimplementInteractionResponse } from '@/discord/utils';

const answerHandler: Handler<'chatInputCommand'> = () => {
	return unimplementInteractionResponse();
};

export default answerHandler;
