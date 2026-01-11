import { Handler } from '@/discord/types';
import { unimplementInteractionResponse } from '@/discord/utils';

const spriteHandler: Handler<'chatInputCommand'> = () => {
	return unimplementInteractionResponse();
};

export default spriteHandler;
