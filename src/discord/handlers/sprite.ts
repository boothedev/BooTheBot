import { Handler } from '@/discord/types';
import cardHandler from './card';

const spriteHandler: Handler<'chatInputCommand'> = async (interaction, storageMgr) => {
	return cardHandler(interaction, storageMgr, 'sprite');
};

export default spriteHandler;
