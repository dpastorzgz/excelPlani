<!--
Template: technology-rules/context.md
Framework version: 1.6
Last updated: 2026-09-18
Instructions: Copy to technology-rules/[your-technology]/context.md and fill in.
-->

# Technology Context — {{technology_name}}

> This file provides the agent with essential background knowledge about this technology
> before starting any task. It is loaded alongside `rules.md`.

---

## What is {{technology_name}}?

_Provide a concise description (2–4 sentences) of what this technology is, its primary purpose,
and the ecosystem it belongs to._

---

## Core Concepts

_List the 5–10 most important concepts an agent must understand to work with this technology._

1. **[Concept 1]** — Brief explanation
2. **[Concept 2]** — Brief explanation
3. **[Concept 3]** — Brief explanation
4. **[Concept 4]** — Brief explanation
5. **[Concept 5]** — Brief explanation

---

## Platform / Environment

| Property | Value |
|----------|-------|
| Runtime environment | e.g., JVM, Browser, Cloud Platform |
| Execution model | e.g., Serverless, Request-response, Event-driven |
| Deployment unit | e.g., Package, Container, Metadata |
| Primary CLI tool | e.g., `sf`, `npm`, `python` |

---

## Key Constraints and Limitations

_List the most important platform constraints an agent must be aware of to avoid generating
invalid or inefficient code._

- **[Constraint 1]**: Description (e.g., governor limits, rate limits, memory limits)
- **[Constraint 2]**: Description
- **[Constraint 3]**: Description

---

## Common Pitfalls

_List recurring mistakes to avoid._

- ❌ **[Pitfall 1]**: Why it's wrong and what to do instead
- ❌ **[Pitfall 2]**: Why it's wrong and what to do instead

---

## Integration Points

_Describe how this technology typically integrates with other systems or platforms._

- **Inbound**: How external systems call into this technology
- **Outbound**: How this technology calls external systems
- **Authentication**: Standard auth mechanisms used

---

## Toolchain Overview

| Tool | Purpose | When to use |
|------|---------|-------------|
| [tool] | [purpose] | [when] |

---

## Glossary

| Term | Definition |
|------|-----------|
| [Term] | [Definition] |
