# App Action — FAQ Sidekick Intent

This extension registers app action intents with Sidekick (`admin.app.intent.link`) that let merchants create and edit FAQ entries through a conversational workflow.

## How it works

1. The extension registers intents for `application/faq` with `create` and `edit` actions
2. When Sidekick invokes the intent, the merchant is navigated to the FAQ page in the app-home extension (`/faq` for both — the edit flow passes the FAQ GID via intent data)
3. The form is pre-populated from the intent's input data (e.g., question and answer extracted from the merchant's conversation with Sidekick)
4. Sidekick can call the `update_faq` tool to update form fields while the merchant is reviewing

## Key files

- `shopify.extension.toml` — Extension configuration with the `admin.app.intent.link` target
- `intent-schema.json` — Schema for the intent input (question, answer, visibility)
- `tools.json` — Declares the `update_faq` tool for Sidekick
- `instructions.md` — Guides Sidekick on when and how to use the tool

The intent navigates to the existing FAQ page in `extensions/app-home/src/pages/FaqPage.jsx`, which handles reading the intent data and registering the tool handler.

## Tools

- **`update_faq`** — Updates the question, answer, or visibility of the FAQ currently being created or edited

## Get started

After your extension is deployed and installed in a development store, ask Sidekick something like:
- "Add an FAQ about our return policy"
- "Edit the return policy FAQ to mention 60-day returns"
