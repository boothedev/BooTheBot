use crate::models::seed_generator::{SeedGenerator, TimeHash};
use async_openai::{
    config::OpenAIConfig,
    types::chat::{
        ChatCompletionRequestSystemMessage, ChatCompletionRequestUserMessage,
        CreateChatCompletionRequestArgs,
    },
    Client,
};
use rand::{rngs::StdRng, seq::SliceRandom, SeedableRng};
use std::{ops::Deref, sync::LazyLock};
use tracing::warn;
use twilight_model::id::{marker::UserMarker, Id};

type Inner = Box<[Box<str>]>;

#[derive(Debug)]
pub struct BookOfAI(Inner);

impl BookOfAI {
    fn get_instance() -> &'static Self {
        static INSTANCE: LazyLock<BookOfAI> = LazyLock::new(|| {
            BookOfAI(
                std::fs::read_to_string("static/BookOfAnswers.en.txt")
                    .expect("`BookOfAnswers.en.txt` file should exist")
                    .split('\n')
                    .map(Into::into)
                    .collect::<Vec<Box<str>>>()
                    .into_boxed_slice(),
            )
        });
        &INSTANCE
    }

    pub fn draw(content: Option<&str>, author: Id<UserMarker>) -> String {
        let book_answer = Self::draw_raw(content, author);
        let Some(question) = content else {
            return book_answer.to_string();
        };

        let final_answer = tokio::task::block_in_place(|| {
            tokio::runtime::Handle::current()
                .block_on(async { craft_answer(question, book_answer).await })
        })
        .unwrap_or_else(|err| {
            warn!("Error crafting answer: {err}");
            Default::default()
        });

        if final_answer.is_empty() {
            book_answer.to_string()
        } else {
            final_answer
        }
    }

    pub fn draw_raw(content: Option<&str>, author: Id<UserMarker>) -> &'static str {
        let book = Self::get_instance();
        match content {
            Some(content) => {
                let seed = SeedGenerator::default()
                    .hash_time(TimeHash::Minute)
                    .hash(author)
                    .hash(content)
                    .finish();
                let mut rng = StdRng::seed_from_u64(seed);
                book.0.choose(&mut rng)
            }
            None => {
                let mut rng = rand::thread_rng();
                book.0.choose(&mut rng)
            }
        }
        .expect("BookOfAnswers should not be empty")
    }
}

impl Deref for BookOfAI {
    type Target = Inner;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

pub async fn craft_answer(
    question: &str,
    book_answer: &str,
) -> Result<String, Box<dyn std::error::Error>> {
    const SYSTEM_PROMPT: &str = r#"
You are enhancing short "Book of Answers" style responses.

Rules:
- Match the language and tone of the user's question.
- Expand the brief answer into a natural response that clearly leans toward a direction.
- The response should feel confident and emotionally intuitive, not neutral or overly philosophical.
- Avoid generic motivational advice.
- Do not explain both sides equally.
- If the original answer implies action, hesitation, warning, or encouragement, amplify that implication.
- Keep the mysterious "fortune answer" vibe, but make the meaning obvious.
- Keep it short: 1-2 sentences only.
- Never say you are uncertain unless the original answer strongly implies uncertainty.
"#;

    static OPENAI_CLIENT: LazyLock<Client<OpenAIConfig>> = LazyLock::new(|| Client::new());

    let user_prompt = format!("Question:\n{}\n\nBook answer:\n{}", question, book_answer);

    let request = CreateChatCompletionRequestArgs::default()
        .model("gpt-5-nano")
        .messages([
            ChatCompletionRequestSystemMessage::from(SYSTEM_PROMPT).into(),
            ChatCompletionRequestUserMessage::from(user_prompt).into(),
        ])
        .build()
        .unwrap();

    let response = OPENAI_CLIENT.chat().create(request).await.unwrap();
    let answer = response
        .choices
        .first()
        .and_then(|choice| choice.message.content.clone())
        .unwrap_or_default();

    Ok(answer)
}
