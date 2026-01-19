import { APIInteractionResponseCallbackData, ComponentType, InteractionResponseType, Locale, MessageFlags } from 'discord-api-types/v10';
import { isGuildInteraction } from 'discord-api-types/utils';
import { AvailableFortuneDeck, FortuneCard, FortuneCardManifest, FortuneCardWithImage, Handler } from '@/discord/types';
import clowBase from '@static/clow.data.json';
import clowManifest from '@static/clow.manifest.json';
import spriteBase from '@static/sprite.data.json';
import spriteManifest from '@static/sprite.manifest.json';
import { getRandomIndex, snowflakeToNumber } from '@/utils';
import { snowflakeToTimestamp } from '@/utils';
import { DISCORD_EPOCH, mapCommandOptions, unimplementInteractionResponse } from '@/discord/utils';
import { type AssetFilePath } from '@/types';
import { noMentionAllowed, TimeMode } from '@shared/consts';
import { StorageManager } from '@/storage';

const cardHandler: Handler<'chatInputCommand'> = async (interaction, storageMgr, deskName: AvailableFortuneDeck) => {
	// Extract inputs, load settings
	const userId = isGuildInteraction(interaction) ? interaction.member.user.id : interaction.user!.id;
	const timestamp = snowflakeToTimestamp(interaction.id, DISCORD_EPOCH);
	const settings = await storageMgr.fetch('userPrefs', userId);
	const timezone = settings?.timezone;
	const locale = settings?.locale ?? interaction.locale;
	const options = mapCommandOptions(interaction.data.options);
	const timemode = (options['timemode'] as TimeMode) ?? TimeMode.Daily;
	const hashMaterial = [snowflakeToNumber(userId)];

	// Load deck
	let deckData = await deckLoad(deskName, locale, storageMgr);
	if (deckData === null) return unimplementInteractionResponse();
	let { deck, manifest } = deckData;

	// Get a random card
	const randomConfig = {
		timemode: timemode,
		timestamp: timestamp,
		timezone: timezone,
		collectionLength: deck.length,
	};
	const index = getRandomIndex(randomConfig, hashMaterial);
	const card = deck[index];

	// Add image url
	const imageFile = manifest.images[card.name] ?? manifest.images.NA;
	const imageFilePath: AssetFilePath = [deskName, 'images', imageFile];
	const imageUrlStr = storageMgr.getStaticUrl(imageFilePath).toString();
	const cardWithImage: FortuneCardWithImage = {
		...card,
		image: imageUrlStr,
	};

	// Construct response
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: constructCardResponseData(cardWithImage),
	};
};

async function deckLoad(deckName: AvailableFortuneDeck, locale: Locale, storageMgr: StorageManager) {
	let deck: FortuneCard[];
	let manifest: FortuneCardManifest;

	switch (deckName) {
		case 'clow':
			deck = clowBase;
			manifest = clowManifest as FortuneCardManifest;
			break;
		case 'sprite':
			deck = spriteBase;
			manifest = spriteManifest as FortuneCardManifest;
			break;
		default:
			return null;
	}

	if (manifest.locales.includes(locale)) {
		const deckFilePath: AssetFilePath = [deckName, 'locales', ['data', locale, 'json'].join('.')];
		const response = await storageMgr.getStatic(deckFilePath);
		if (response.ok) {
			deck = await response.json();
		}
	}

	return {
		deck: deck,
		manifest: manifest,
	};
}

function constructCardResponseData({ name, meaning, warning, message, image }: FortuneCardWithImage) {
	return {
		flags: MessageFlags.IsComponentsV2,
		allowed_mentions: noMentionAllowed,
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

export default cardHandler;
