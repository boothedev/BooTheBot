import { Handler } from '@/discord/types';
import cardHandler from './card';

const clowHandler: Handler<'chatInputCommand'> = async (interaction, storageMgr) => {
	return cardHandler(interaction, storageMgr, 'clow');
};

export default clowHandler;
