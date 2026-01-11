import { APIInteractionResponseCallbackData, ComponentType, InteractionResponseType, Locale, MessageFlags } from 'discord-api-types/v10';
import { isDMInteraction, isGuildInteraction } from 'discord-api-types/utils';
import { ClowCard, ClowCardManifest, Handler } from '@/discord/types';
import clowcardBase from '@/data/clow/data.json';
import clowcardManifest from '@/data/clow/manifest.json';
import { getRandomItem, Hasher } from '@/utils';
import { snowflakeToTimestamp } from '@/utils';
import { DISCORD_EPOCH } from '@/discord/utils';
import { type AssetFilePath } from '@/types';
import { TimeMode } from '@shared/consts';

const clowHandler: Handler<'chatInputCommand'> = async (interaction, storageMgr) => {
	// Extract inputs, load settings
	const userId = isGuildInteraction(interaction) ? interaction.member.user.id : interaction.user!.id;
	const timestamp = snowflakeToTimestamp(interaction.id, DISCORD_EPOCH);
	const settings = await storageMgr.fetch('userPrefs', userId);
	const timezone = settings?.timezone;
	const locale = settings?.locale ?? interaction.locale;
	const timemode = interaction.data.options?.[0].name as TimeMode;
	const manifest = clowcardManifest as ClowCardManifest;

	// Get target deck
	let deck: ClowCard[] = clowcardBase;
	if (manifest.locales.includes(locale)) {
		const deckFilePath: AssetFilePath = ['clow', 'locales', ['data', locale, 'json'].join('.')];
		const response = await storageMgr.getStatic(deckFilePath);
		if (response.ok) {
			deck = await response.json();
		}
	}

	// Get a random card
	const randomConfig = {
		timemode: timemode,
		timestamp: timestamp,
		timezone: timezone,
	};
	const card = getRandomItem(deck, randomConfig, [userId]);
	const imageFile = manifest.images[card.name] ?? manifest.images.NA;
	const imageFilePath: AssetFilePath = ['clow', 'images', imageFile];
	const imageUrl = storageMgr.getStaticUrl(imageFilePath).toString();

	// Construct response
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: constructCardResponseData(card, imageUrl),
	};
};

function constructCardResponseData({ name, meaning, warning, message }: ClowCard, image: string) {
	return {
		flags: MessageFlags.IsComponentsV2,
		components: [
			{
				type: ComponentType.Container,
				components: [
					{
						type: ComponentType.Section,
						components: [
							{
								type: ComponentType.TextDisplay,
								content: `# ${name}`,
							},
							{
								type: ComponentType.TextDisplay,
								content: `**Meaning:** ${meaning}`,
							},
							{
								type: ComponentType.TextDisplay,
								content: `**Warning:** ${warning}`,
							},
						],
						accessory: {
							type: ComponentType.Thumbnail,
							media: {
								url: image,
							},
						},
					},
					{
						type: ComponentType.Separator,
					},
					{
						type: ComponentType.TextDisplay,
						content: message,
					},
				],
			},
		],
	} satisfies APIInteractionResponseCallbackData;
}

export default clowHandler;
