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

export interface InteractionHandlerMap {
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

export type GenericInteraction = InteractionHandlerMap[keyof InteractionHandlerMap];
export type GenericHandler<T extends keyof InteractionHandlerMap> = (
	interaction: InteractionHandlerMap[T],
	...args: any[]
) => Promise<APIInteractionResponse> | APIInteractionResponse;

export type Handlers = {
	[K in keyof InteractionHandlerMap]?: GenericHandler<K>;
};
