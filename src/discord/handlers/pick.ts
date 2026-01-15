import { Handler } from '@/discord/types';
import { DISCORD_EPOCH, unimplementInteractionResponse } from '@/discord/utils';
import { getRandomItem, snowflakeToNumber, snowflakeToTimestamp } from '@/utils';
import { noMentionAllowed, TimeMode } from '@shared/consts';
import { isGuildInteraction } from 'discord-api-types/utils';
import {
	APIInteractionResponseCallbackData,
	ApplicationCommandOptionType,
	ComponentType,
	InteractionResponseType,
	MessageFlags,
} from 'discord-api-types/v10';

const pickHandler: Handler<'chatInputCommand'> = async (interaction, storageMgr) => {
	const choices = (interaction.data.options ?? [])
		.filter((op) => op.type === ApplicationCommandOptionType.String)
		.map((op) => op.value.trim())
		.filter((op) => op.length > 0);
	const sortedChoiceList = choices.toSorted();
	const tooManyChoices = choices.length > 4;
	const visibleChoiceList = tooManyChoices ? choices.slice(0, 3) : choices;
	let visibleChoiceListStr = visibleChoiceList.map((op) => `- ${op}\n`).join('');
	if (tooManyChoices) visibleChoiceListStr += `*...and ${choices.length - 3} more options.*`;

	const userId = isGuildInteraction(interaction) ? interaction.member.user.id : interaction.user!.id;
	const timestamp = snowflakeToTimestamp(interaction.id, DISCORD_EPOCH);
	const settings = await storageMgr.fetch('userPrefs', userId);
	const timezone = settings?.timezone;
	const timemode = TimeMode.Daily;
	const hashMaterial = [snowflakeToNumber(userId), ...sortedChoiceList];

	const randomConfig = {
		timemode: timemode,
		timestamp: timestamp,
		timezone: timezone,
	};
	const choice = getRandomItem(sortedChoiceList, randomConfig, hashMaterial);

	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			flags: MessageFlags.IsComponentsV2,
			components: [
				{
					type: ComponentType.Container,
					accent_color: 0x58b9ff,
					components: [
						{
							type: ComponentType.TextDisplay,
							content: `## 🔮 The Fates Have Spoken\n**From your choices:**\n>>> ${visibleChoiceListStr}`,
						},
						{
							type: ComponentType.Separator,
						},
						{
							type: ComponentType.TextDisplay,
							content: `### ✨ Recommended Action:\n**${choice}**`,
						},
					],
				},
			],
			allowed_mentions: noMentionAllowed,
		} satisfies APIInteractionResponseCallbackData,
	};
};

export default pickHandler;
