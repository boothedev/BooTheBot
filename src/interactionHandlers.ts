import {
	APIApplicationCommandInteractionData,
	APIApplicationCommandInteractionWrapper,
	APIBaseInteraction,
	APIChatInputApplicationCommandInteraction,
	APIInteractionResponse,
	APIInteractionResponseChannelMessageWithSource,
	APIInteractionResponsePong,
	ApplicationCommandType,
	InteractionResponseType,
	InteractionType,
	MessageFlags,
} from 'discord-api-types/v10';

function interactionHandler(interaction: APIBaseInteraction<InteractionType, any>) {
	// Classify interactions
	switch (interaction.type) {
		// Handle Ping interaction
		case InteractionType.Ping:
			return pingInteractionHandler();

		// Handle ApplicationCommand interaction
		case InteractionType.ApplicationCommand:
			const appCommandInteraction = interaction as APIApplicationCommandInteractionWrapper<APIApplicationCommandInteractionData>;
			const commandType = appCommandInteraction.data.type;

			// Classify application commands
			switch (commandType) {
				// Handle ChatInput command
				case ApplicationCommandType.ChatInput:
					const chatInputCommand = interaction as APIChatInputApplicationCommandInteraction;
					return chatInputCommandHandler(chatInputCommand);
				// Handle Message command
				case ApplicationCommandType.Message:
				// Handle User command
				case ApplicationCommandType.User:
				// Handle PrimaryEntryPoint command
				case ApplicationCommandType.PrimaryEntryPoint:
			}
			break;

		// Handle MessageComponent interaction
		case InteractionType.MessageComponent:
		// Handle ModalSubmit interaction
		case InteractionType.ModalSubmit:
		// Handle Autocomplete interaction
		case InteractionType.ApplicationCommandAutocomplete:
	}
	return unimplementedInteractionHandler();
}

const pingInteractionHandler = () => ({ type: InteractionResponseType.Pong }) as APIInteractionResponsePong;

const unimplementedInteractionHandler = () =>
	({
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			flags: MessageFlags.Ephemeral,
			content: 'Unimplemented Interaction',
		},
	}) as APIInteractionResponseChannelMessageWithSource;

const chatInputCommandHandler = (command: APIChatInputApplicationCommandInteraction): APIInteractionResponse => {
	return unimplementedInteractionHandler();
};

export { interactionHandler };
