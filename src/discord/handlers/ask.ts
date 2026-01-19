import { Handler } from '@/discord/types';
import askBase from '@static/ask.data.json';
import manifest from '@static/ask.manifest.json';
import extra from '@static/ask.extra.json';
import { isGuildInteraction } from 'discord-api-types/utils';
import { escapeMarkdown, getRandomIndex, snowflakeToNumber } from '@/utils';
import {
	APIInteractionResponseCallbackData,
	ApplicationCommandOptionType,
	ComponentType,
	InteractionResponseType,
	MessageFlags,
} from 'discord-api-types/v10';
import { noMentionAllowed } from '@shared/consts';
import { AssetFilePath, RandomConfig } from '@/types';

const askHandler: Handler<'chatInputCommand'> = async (interaction, storageMgr) => {
	// Extract inputs, load settings
	const userId = isGuildInteraction(interaction) ? interaction.member.user.id : interaction.user!.id;
	const settings = await storageMgr.fetch('userPrefs', userId);
	const locale = settings?.locale ?? interaction.locale;
	const options: Record<string, string> = (interaction.data.options ?? [])
		.filter(
			(option) => option.type !== ApplicationCommandOptionType.Subcommand && option.type !== ApplicationCommandOptionType.SubcommandGroup,
		)
		.reduce((acc, option) => ({ [option.name]: option.value, ...acc }), {});
	const question = escapeMarkdown(options['question'] as string);
	const hashMaterial = [snowflakeToNumber(userId), question];

	// Get locale deck
	let answerCollection = askBase;
	if (manifest.locales.includes(locale)) {
		const deckFilePath: AssetFilePath = ['answer', 'locales', ['data', locale, 'json'].join('.')];
		const response = await storageMgr.getStatic(deckFilePath);
		if (response.ok) {
			answerCollection = await response.json();
		}
	}

	// Get a random answer
	const randomConfig: RandomConfig = {
		collectionLength: answerCollection.length,
	};
	const index = getRandomIndex(randomConfig, hashMaterial);
	const answer = answerCollection[index];
	const emojiIndex = getRandomIndex({ ...randomConfig, collectionLength: extra.emojies.length }, hashMaterial);
	const emoji = extra.emojies[emojiIndex];

	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			flags: MessageFlags.IsComponentsV2,
			allowed_mentions: noMentionAllowed,
			components: [
				{
					type: ComponentType.Container,
					// accent_color: 0x2f3136,
					components: [
						{
							type: ComponentType.TextDisplay,
							content: `**Question:** ${question}`,
						},
						{
							type: ComponentType.Separator,
						},
						{
							type: ComponentType.TextDisplay,
							content: `### ${emoji} ${answer}`,
						},
					],
				},
			],
		} satisfies APIInteractionResponseCallbackData,
	};
};

export default askHandler;
