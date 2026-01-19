import { StorageManager } from '@/storage';
import {
	APIBaseInteraction,
	APIMessageMentionableSelectInteractionData,
	APIMessageRoleSelectInteractionData,
	APIMessageChannelSelectInteractionData,
	APIMessageSelectMenuInteractionData,
	APIMessageStringSelectInteractionData,
	APIMessageUserSelectInteractionData,
	APIApplicationCommandAutocompleteInteraction,
	APIChatInputApplicationCommandInteraction,
	APIInteractionResponse,
	APIMessageApplicationCommandInteraction,
	APIMessageComponentButtonInteraction,
	APIModalSubmitInteraction,
	APIPingInteraction,
	APIPrimaryEntryPointCommandInteraction,
	APIUserApplicationCommandInteraction,
	InteractionType,
	Locale,
} from 'discord-api-types/v10';

type APIMessageBaseSelectMenuInteraction<
	MessageSelectData extends APIMessageSelectMenuInteractionData = APIMessageSelectMenuInteractionData,
> = APIBaseInteraction<InteractionType.MessageComponent, MessageSelectData> &
	Required<
		Pick<
			APIBaseInteraction<InteractionType.MessageComponent, APIMessageSelectMenuInteractionData>,
			'app_permissions' | 'channel_id' | 'channel' | 'data' | 'message'
		>
	>;
export type APIMessageChannelSelectMenuInteraction = APIMessageBaseSelectMenuInteraction<APIMessageChannelSelectInteractionData>;
export type APIMessageStringSelectMenuInteraction = APIMessageBaseSelectMenuInteraction<APIMessageStringSelectInteractionData>;
export type APIMessageUserSelectMenuInteraction = APIMessageBaseSelectMenuInteraction<APIMessageUserSelectInteractionData>;
export type APIMessageRoleSelectMenuInteraction = APIMessageBaseSelectMenuInteraction<APIMessageRoleSelectInteractionData>;
export type APIMessageMentionableSelectMenuInteraction = APIMessageBaseSelectMenuInteraction<APIMessageMentionableSelectInteractionData>;

export interface InteractionMap {
	ping: APIPingInteraction;
	chatInputCommand: APIChatInputApplicationCommandInteraction;
	messageCommand: APIMessageApplicationCommandInteraction;
	userCommand: APIUserApplicationCommandInteraction;
	primaryEntryPointCommand: APIPrimaryEntryPointCommandInteraction;
	buttonMessage: APIMessageComponentButtonInteraction;
	stringSelectMenuMessage: APIMessageChannelSelectMenuInteraction;
	channelSelectMenuMessage: APIMessageStringSelectMenuInteraction;
	roleSelectMenuMessage: APIMessageUserSelectMenuInteraction;
	userSelectMenuMessage: APIMessageRoleSelectMenuInteraction;
	mentionableSelectMenuMessage: APIMessageMentionableSelectMenuInteraction;
	modalSubmit: APIModalSubmitInteraction;
	applicationCommandAutocomplete: APIApplicationCommandAutocompleteInteraction;
}

export type GenericInteraction = InteractionMap[keyof InteractionMap];
export type Handler<T extends keyof InteractionMap> = (
	interaction: InteractionMap[T],
	storageMgr: StorageManager,
	...args: any[]
) => Promise<APIInteractionResponse> | APIInteractionResponse;

export type HandlerMap = {
	[K in keyof InteractionMap]?: Handler<K>;
};

export type HandlerCustomMap<K extends keyof InteractionMap> = Record<string, Handler<K>>;

export type FortuneCard = {
	name: string;
	meaning: string;
	message: string;
	warning: string;
};

export type FortuneCardWithImage = FortuneCard & {
	image: string;
};

export type FortuneCardManifest = {
	locales: Locale[];
	images: { NA: string } & Record<string, string>;
};

export type AvailableFortuneDeck = 'clow' | 'sprite';

export type BookOfAnswer = string;

export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
