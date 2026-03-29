---
name: Lore
tags: [core]
---

**Purpose:**

Lore is the living-spec CLI and seed format. It gives projects a graph of markdown primitives that an LLM can read before writing code.

**Owns:**

- The primitive meta-model and edge semantics
- The CLI commands that read and write `.spec/`
- The seed files copied by `lore init`

**Does Not Own:**

- Project-specific domain primitives created in downstream repositories
- The application behavior of host projects beyond what they choose to express in the spec

**Key Concepts:**

- [[lore.term:primitive]]
- [[lore.term:bounded-context]]
- [[lore.term:index]]
- [[lore.term:context-overview]]

**Key Flows:**

- [[lore.flow:init-spec]]
- [[lore.flow:add-primitive]]
- [[lore.flow:show-context-overview]]
- [[lore.flow:init-context-overview]]

**Boundaries:**

Downstream projects supply their own contexts and primitives. Lore defines the spec format and CLI behavior, but it does not define the host project's domain model.
