# Awesome LLM Skills for Pi

Installed: 2026-05-11T17:02:57.509663+00:00

Source: https://github.com/Prat011/awesome-llm-skills

Source commit: `f417203aa4a4c17268653382512081d10eaada23`

## Invocation

Pi exposes these as native skill slash commands:

```text
/skill:<skill-name>
```

Examples:

```text
/skill:algorithmic-art create a generative p5.js piece about memory decay
/skill:artifacts-builder build an interactive dashboard and save it as HTML
/skill:brand-guidelines apply Anthropic-style colors to this artifact
/skill:webapp-testing test the local checkout flow
```

## Installed Skills

| Skill | Command | Source path | Description |
|---|---|---|---|
| `algorithmic-art` | `/skill:algorithmic-art` | `algorithmic-art` | Creating algorithmic art using p5.js with seeded randomness and interactive parameter exploration. Use this when users request creating art using code, generative art, algorithmic art, flow fields, or particle systems. Create original algorithmic art rather than copying existing artists' work to avoid copyright violations. |
| `artifacts-builder` | `/skill:artifacts-builder` | `artifacts-builder` | Suite of tools for creating elaborate, multi-component self-contained HTML artifacts for Pi/browser viewing using modern frontend web technologies (React, Tailwind CSS, shadcn/ui). Use for complex artifacts requiring state management, routing, or shadcn/ui components - not for simple single-file HTML/JSX artifacts. |
| `brand-guidelines` | `/skill:brand-guidelines` | `brand-guidelines` | Applies Anthropic's official brand colors and typography to any sort of artifact that may benefit from having Anthropic's look-and-feel. Use it when brand colors or style guidelines, visual formatting, or company design standards apply. |
| `canvas-design` | `/skill:canvas-design` | `canvas-design` | Create beautiful visual art in .png and .pdf documents using design philosophy. You should use this skill when the user asks to create a poster, piece of art, design, or other static piece. Create original visual designs, never copying existing artists' work to avoid copyright violations. |
| `changelog-generator` | `/skill:changelog-generator` | `changelog-generator` | Automatically creates user-facing changelogs from git commits by analyzing commit history, categorizing changes, and transforming technical commits into clear, customer-friendly release notes. Turns hours of manual changelog writing into minutes of automated generation. |
| `competitive-ads-extractor` | `/skill:competitive-ads-extractor` | `competitive-ads-extractor` | Extracts and analyzes competitors' ads from ad libraries (Facebook, LinkedIn, etc.) to understand what messaging, problems, and creative approaches are working. Helps inspire and improve your own ad campaigns. |
| `content-research-writer` | `/skill:content-research-writer` | `content-research-writer` | Assists in writing high-quality content by conducting research, adding citations, improving hooks, iterating on outlines, and providing real-time feedback on each section. Transforms your writing process from solo effort to collaborative partnership. |
| `docx` | `/skill:docx` | `document-skills/docx` | Comprehensive document creation, editing, and analysis with support for tracked changes, comments, formatting preservation, and text extraction. When the Pi agent needs to work with professional documents (.docx files) for: (1) Creating new documents, (2) Modifying or editing content, (3) Working with tracked changes, (4) Adding comments, or any other document tasks |
| `domain-name-brainstormer` | `/skill:domain-name-brainstormer` | `domain-name-brainstormer` | Generates creative domain name ideas for your project and checks availability across multiple TLDs (.com, .io, .dev, .ai, etc.). Saves hours of brainstorming and manual checking. |
| `file-organizer` | `/skill:file-organizer` | `file-organizer` | Intelligently organizes your files and folders across your computer by understanding context, finding duplicates, suggesting better structures, and automating cleanup tasks. Reduces cognitive load and keeps your digital workspace tidy without manual effort. |
| `image-enhancer` | `/skill:image-enhancer` | `image-enhancer` | Improves the quality of images, especially screenshots, by enhancing resolution, sharpness, and clarity. Perfect for preparing images for presentations, documentation, or social media posts. |
| `internal-comms` | `/skill:internal-comms` | `internal-comms` | A set of resources to help me write all kinds of internal communications, using the formats that my company likes to use. The Pi agent should use this skill whenever asked to write some sort of internal communications (status reports, leadership updates, 3P updates, company newsletters, FAQs, incident reports, project updates, etc.). |
| `invoice-organizer` | `/skill:invoice-organizer` | `invoice-organizer` | Automatically organizes invoices and receipts for tax preparation by reading messy files, extracting key information, renaming them consistently, and sorting them into logical folders. Turns hours of manual bookkeeping into minutes of automated organization. |
| `lead-research-assistant` | `/skill:lead-research-assistant` | `lead-research-assistant` | Identifies high-quality leads for your product or service by analyzing your business, searching for target companies, and providing actionable contact strategies. Perfect for sales, business development, and marketing professionals. |
| `mcp-builder` | `/skill:mcp-builder` | `mcp-builder` | Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. Use when building MCP servers to integrate external APIs or services, whether in Python (FastMCP) or Node/TypeScript (MCP SDK). |
| `meeting-insights-analyzer` | `/skill:meeting-insights-analyzer` | `meeting-insights-analyzer` | Analyzes meeting transcripts and recordings to uncover behavioral patterns, communication insights, and actionable feedback. Identifies when you avoid conflict, use filler words, dominate conversations, or miss opportunities to listen. Perfect for professionals seeking to improve their communication and leadership skills. |
| `notion-knowledge-capture` | `/skill:notion-knowledge-capture` | `notion-knowledge-capture` | Transforms conversations and discussions into structured documentation pages in Notion. Captures insights, decisions, and knowledge from chat context, formats appropriately, and saves to wikis or databases with proper organization and linking for easy discovery. |
| `notion-meeting-intelligence` | `/skill:notion-meeting-intelligence` | `notion-meeting-intelligence` | Prepares meeting materials by gathering context from Notion, enriching with Claude research, and creating both an internal pre-read and external agenda saved to Notion. Helps you arrive prepared with comprehensive background and structured meeting docs. |
| `notion-research-documentation` | `/skill:notion-research-documentation` | `notion-research-documentation` | Searches across your Notion workspace, synthesizes findings from multiple pages, and creates comprehensive research documentation saved as new Notion pages. Turns scattered information into structured reports with proper citations and actionable insights. |
| `notion-spec-to-implementation` | `/skill:notion-spec-to-implementation` | `notion-spec-to-implementation` | Turns product or tech specs into concrete Notion tasks that Pi can implement. Breaks down spec pages into detailed implementation plans with clear tasks, acceptance criteria, and progress tracking to guide development from requirements to completion. |
| `pdf` | `/skill:pdf` | `document-skills/pdf` | Comprehensive PDF manipulation toolkit for extracting text and tables, creating new PDFs, merging/splitting documents, and handling forms. When the Pi agent needs to fill in a PDF form or programmatically process, generate, or analyze PDF documents at scale. |
| `pptx` | `/skill:pptx` | `document-skills/pptx` | Presentation creation, editing, and analysis. When the Pi agent needs to work with presentations (.pptx files) for: (1) Creating new presentations, (2) Modifying or editing content, (3) Working with layouts, (4) Adding comments or speaker notes, or any other presentation tasks |
| `raffle-winner-picker` | `/skill:raffle-winner-picker` | `raffle-winner-picker` | Picks random winners from lists, spreadsheets, or Google Sheets for giveaways, raffles, and contests. Ensures fair, unbiased selection with transparency. |
| `resemble-detect` | `/skill:resemble-detect` | `resemble-detect` | Deepfake detection and media safety — detect AI-generated audio, images, video, and text, trace synthesis sources, apply watermarks, verify speaker identity, and analyze media intelligence using Resemble AI |
| `skill-creator` | `/skill:skill-creator` | `skill-creator` | Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations. |
| `slack-gif-creator` | `/skill:slack-gif-creator` | `slack-gif-creator` | Toolkit for creating animated GIFs optimized for Slack, with validators for size constraints and composable animation primitives. This skill applies when users request animated GIFs or emoji animations for Slack from descriptions like "make me a GIF for Slack of X doing Y". |
| `theme-factory` | `/skill:theme-factory` | `theme-factory` | Toolkit for styling artifacts with a theme. These artifacts can be slides, docs, reportings, HTML landing pages, etc. There are 10 pre-set themes with colors/fonts that you can apply to any artifact that has been creating, or can generate a new theme on-the-fly. |
| `video-downloader` | `/skill:video-downloader` | `video-downloader` | Downloads videos from YouTube and other platforms for offline viewing, editing, or archival. Handles various formats and quality options. |
| `webapp-testing` | `/skill:webapp-testing` | `webapp-testing` | Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs. |
| `xlsx` | `/skill:xlsx` | `document-skills/xlsx` | Comprehensive spreadsheet creation, editing, and analysis with support for formulas, formatting, data analysis, and visualization. When the Pi agent needs to work with spreadsheets (.xlsx, .xlsm, .csv, .tsv, etc) for: (1) Creating new spreadsheets with formulas and formatting, (2) Reading or analyzing data, (3) Modify existing spreadsheets while preserving formulas, (4) Data analysis and visualization in spreadsheets, or (5) Recalculating formulas |

## Skipped

| Name | Source path | Reason |
|---|---|---|
| `template-skill` | `template-skill` | template/example skill, not installed as a runtime skill |

## Skills Likely Requiring Extra Setup

These installed skills may require external CLIs, Python/Node packages, API credentials, a browser, MCP servers, or service accounts depending on how you use them:

- `notion-knowledge-capture`
- `notion-meeting-intelligence`
- `notion-research-documentation`
- `notion-spec-to-implementation`
- `resemble-detect`
- `video-downloader`
- `slack-gif-creator`
- `artifacts-builder`
- `webapp-testing`
- `docx`
- `pdf`
- `pptx`
- `xlsx`

## Notes

- Direct `/name` aliases were not installed. Use Pi-native `/skill:name`.
- Existing global skills were not overwritten.
- Each installed `SKILL.md` includes a Pi Harness Adaptation note.
- Run `/reload` or restart Pi to refresh discovered skills.
