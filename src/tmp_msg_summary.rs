use twilight_model::channel::Message;

use crate::models::app_state::AppState;

use async_openai::{
    types::chat::{
        ChatCompletionRequestSystemMessage, ChatCompletionRequestUserMessage,
        CreateChatCompletionRequestArgs,
    },
    Client,
};

// collect 50 messages before the command and use OpenAI to summarize those messages
pub async fn message_summary_command(state: AppState, msg: &Message) {
    let channel_id = msg.channel_id;
    let message_id = msg.id;
    let messages = state
        .bot
        .channel_messages(channel_id)
        .await
        .unwrap()
        .models()
        .await
        .unwrap_or_else(|_| vec![]);

    let summary = messages
        .iter()
        .rev()
        .take(50)
        .map(|m| {
            format!(
                "[{}] [{}] {}",
                m.author.global_name.as_ref().unwrap_or(&m.author.name),
                m.timestamp.as_secs(),
                m.content
            )
        })
        .collect::<Vec<_>>()
        .join("\n\n");

    let summary = summarize_with_openai(&summary).await;
    state
        .bot
        .create_message(channel_id)
        .content(&summary)
        .reply(message_id)
        .await
        .unwrap();
}

async fn summarize_with_openai(messages: &str) -> String {
    let client = Client::new();

    let request = CreateChatCompletionRequestArgs::default()
        .model("gpt-5-nano")
        .messages([
            ChatCompletionRequestSystemMessage::from(
r#"You summarize Discord chat logs. Each message is formatted as:
[author] [unix_timestamp] message content

Use the timestamps (in seconds) to judge how messages relate: messages close together in time (seconds to a couple minutes apart) are likely part of the same exchange; long gaps (many minutes or more) usually signal a topic shift or a new, unrelated conversation starting.

Write a short summary (2-4 sentences) covering only the main topic(s) discussed. If there's a clear time gap that splits the log into distinct conversations, summarize each briefly instead of blending them together. Skip minor chit-chat, greetings, and reactions. Don't list every speaker or quote messages — just capture the gist."#,
            )
            .into(),
            ChatCompletionRequestUserMessage::from(format!(
"Summarize these Discord messages briefly:

<messages>
{}
</messages>",
                messages
            ))
            .into(),
        ])
        .build()
        .unwrap();

    let response = client.chat().create(request).await.unwrap();
    let result = response
        .choices
        .first()
        .and_then(|choice| choice.message.content.clone())
        .unwrap_or_default();

    format!("Summary:\n{}", result)
}
