import { Handler } from '@/discord/types';
import { unimplementInteractionResponse } from '@/discord/utils';

const pickHandler: Handler<'chatInputCommand'> = () => {
	return unimplementInteractionResponse();
};

export default pickHandler;
