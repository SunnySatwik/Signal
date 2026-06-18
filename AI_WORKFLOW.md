# AI Workflow

This document transparently outlines how artificial intelligence tools were used to assist in the development of Signal, an AI-powered Financial Behavior Intelligence Platform.

## Tools Used

The following AI tools were utilized throughout this project:

* **ChatGPT**: Used for project planning, architecture discussions, debugging support, testing strategy, and documentation refinement.
* **Claude**: Used for generating synthetic transaction datasets and validating different behavioral analysis scenarios.
* **Google AI Studio**: Used to rapidly prototype and generate the initial frontend interface, including dashboard layouts, component structures, and UI refinements.

## How AI Was Used

AI tools were leveraged as interactive assistants across several development phases:
* **Architecture planning**: Explored database design alternatives and system communication schemas.
* **Frontend prototyping**: Generated boilerplate layouts using Framer Motion and custom CSS properties.
* **Backend scaffolding**: Created initial FastAPI route handlers, schemas, and database utility shells.
* **Debugging**: Analyzed stack traces, fixed React re-rendering loops, and resolved TypeScript type mismatches.
* **Documentation improvements**: Refined README files and draft code documentation.
* **Test dataset generation**: Created JSON transaction sets representing specific spending personas.

## Human Decisions

While AI accelerated the coding process, all fundamental architectural and logical decisions were made manually:
* **Hybrid Architecture**: Conceived and built the separation between the deterministic, rule-based python engine and the LLM narrative generator.
* **Behavioral Signal Definitions**: Designed the logical boundaries and merchant-matching criteria for behavioral patterns.
* **Scoring Calibration**: Calibrated the Financial Discipline Score math to realistically penalize high-risk spending while remaining healthy for low-risk users.
* **Dashboard Simplification**: Simplified the post-analysis dashboard UX to reduce cognitive load by removing confidence metrics.
* **Feature Prioritization**: Decided which financial indicators were relevant to highlight.
* **Testing Strategy**: Defined the edge-cases, validation points, and manual verification protocols.
* **Final UX Decisions**: Polished layouts, typography, charts, and dark theme consistency.

## Example AI-Assisted Tasks

* **Generating initial component structures**: Creating baseline templates for UI cards and Recharts integration.
* **Improving Gemini prompts**: Engineering instructions to ensure structured markdown output without conversational filler.
* **Refining fallback report generation**: Structuring the deterministic backup report text when Gemini API keys are missing or rate-limited.
* **Creating synthetic datasets**: Developing mock transaction JSONs specifically containing subscription creep and late-night Swiggy orders.

## Development Philosophy

AI was treated as an engineering productivity tool to minimize boilerplate and research syntax, rather than as a replacement for software engineering design, validation, or critical thinking. Every AI suggestion was thoroughly reviewed, adapted, and tested. The final implementation, component integration, system debugging, and submission preparation were performed entirely manually.

## Relevant AI Conversations

The following conversation link is included as an example of AI-assisted dataset generation used during testing:

* Claude Conversation: https://claude.ai/share/b3ac25da-949c-4322-ab68-dc3360e46681

This conversation was used to generate synthetic transaction datasets representing different spending profiles (e.g., healthy users, subscription-heavy users, and weekend spenders) for validation and testing purposes.

All application architecture, implementation, debugging, integration, scoring calibration, UI refinement, and documentation work were performed separately as part of the development process.
