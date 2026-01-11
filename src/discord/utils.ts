import {
	APIInteractionResponse,
	ApplicationCommandType,
	ComponentType,
	InteractionResponseType,
	InteractionType,
	MessageFlags,
} from 'discord-api-types/v10';
import { InteractionMap } from './types';

function interactionClassifier(interaction: InteractionMap[keyof InteractionMap]): keyof InteractionMap | null {
	// Classify interactions
	switch (interaction.type) {
		// Handle Ping interaction
		case InteractionType.Ping:
			return 'ping';
		// Handle ApplicationCommand interaction
		case InteractionType.ApplicationCommand:
			const commandType = interaction.data.type;
			// Classify application commands
			switch (commandType) {
				// Handle ChatInput command
				case ApplicationCommandType.ChatInput:
					return 'chatInputCommand';
				// Handle Message command
				case ApplicationCommandType.Message:
					return 'messageCommand';
				// Handle User command
				case ApplicationCommandType.User:
					return 'userCommand';
				// Handle PrimaryEntryPoint command
				case ApplicationCommandType.PrimaryEntryPoint:
					return 'primaryEntryPointCommand';
				default:
					return null;
			}
		// Handle MessageComponent interaction
		case InteractionType.MessageComponent:
			const componentType = interaction.data.component_type;
			// Classify message components
			switch (componentType) {
				case ComponentType.Button:
					return 'buttonMessage';
				case ComponentType.StringSelect:
					return 'stringSelectMenuMessage';
				case ComponentType.UserSelect:
					return 'userSelectMenuMessage';
				case ComponentType.RoleSelect:
					return 'roleSelectMenuMessage';
				case ComponentType.MentionableSelect:
					return 'mentionableSelectMenuMessage';
				case ComponentType.ChannelSelect:
					return 'channelSelectMenuMessage';
				default:
					return null;
			}
		// Handle ModalSubmit interaction
		case InteractionType.ModalSubmit:
			return 'modalSubmit';
		// Handle Autocomplete interaction
		case InteractionType.ApplicationCommandAutocomplete:
			return 'applicationCommandAutocomplete';
		default:
			return null;
	}
}

function unimplementInteractionResponse(): Promise<APIInteractionResponse> | APIInteractionResponse {
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: 'unimplemented',
			flags: MessageFlags.Ephemeral,
		},
	};
}

const DISCORD_EPOCH = 1420070400000;

export { interactionClassifier, unimplementInteractionResponse, DISCORD_EPOCH };
