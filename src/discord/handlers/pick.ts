import { Handler } from '@/discord/types';
import { RandomConfig } from '@/types';
import extra from '@static/pick.extra.json';
import { escapeMarkdown, getRandomIndex, snowflakeToNumber } from '@/utils';
import { noMentionAllowed } from '@shared/consts';
import { isGuildInteraction } from 'discord-api-types/utils';
import {
	APIInteractionResponseCallbackData,
	ApplicationCommandOptionType,
	ComponentType,
	InteractionResponseType,
	MessageFlags,
} from 'discord-api-types/v10';

const VISIBLE_OPTIONS_LIMIT = 4;

const pickHandler: Handler<'chatInputCommand'> = async (interaction) => {
	// Collect input choices
	const choices = (interaction.data.options ?? [])
		.filter((op) => op.type === ApplicationCommandOptionType.String)
		.map((op) => op.value.trim())
		.filter((op) => op.length > 0);
	const sortedChoiceList = choices.toSorted();

	// Format choices for display
	let visibleChoices = choices.slice(0, VISIBLE_OPTIONS_LIMIT).map((choice) => `- ${escapeMarkdown(choice)}`);
	if (choices.length > VISIBLE_OPTIONS_LIMIT) {
		visibleChoices = visibleChoices.slice(0, -1);
		visibleChoices.push(`(and ${choices.length - VISIBLE_OPTIONS_LIMIT + 1} other choices)`);
	}
	const choiceListStr = visibleChoices.join('\n');

	// Prep
	const userId = isGuildInteraction(interaction) ? interaction.member.user.id : interaction.user!.id;
	const hashMaterial = [snowflakeToNumber(userId), ...sortedChoiceList];
	const randomConfig: RandomConfig = {
		collectionLength: sortedChoiceList.length,
	};

	// Randomly pick indices
	const index = getRandomIndex(randomConfig, hashMaterial);
	const vibeIndex = getRandomIndex({ ...randomConfig, collectionLength: extra.vibes.length }, hashMaterial);

	// Reference to the actual object
	const choice = sortedChoiceList[index];
	const { phrase, emoji, color } = extra.vibes[vibeIndex];

	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			flags: MessageFlags.IsComponentsV2,
			allowed_mentions: noMentionAllowed,
			components: [
				{
					type: ComponentType.Container,
					accent_color: color,
					components: [
						{
							type: ComponentType.TextDisplay,
							content: `## ${phrase}\n**From your choices:**\n>>> ${choiceListStr}`,
						},
						{
							type: ComponentType.TextDisplay,
							content: `### ${emoji} ${escapeMarkdown(choice)}`,
						},
					],
				},
			],
		} satisfies APIInteractionResponseCallbackData,
	};
};

export default pickHandler;
