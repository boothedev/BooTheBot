import { APIAllowedMentions } from 'discord-api-types/v10';

enum TimeMode {
	Daily = 'daily',
	Weekly = 'weekly',
	Monthly = 'monthly',
	Yearly = 'yearly',
	Randomly = 'randomly',
}

const noMentionAllowed: APIAllowedMentions = {
	parse: [],
};

export { TimeMode, noMentionAllowed };
