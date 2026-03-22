import type { PrimitiveType } from '../constants.js'

export const templateContents: Record<PrimitiveType, string> = {
  term: `---
type: term
name:
id:
context:
links: []
tags: []
---

<!-- One-paragraph definition. Unambiguous. -->
`,

  invariant: `---
type: invariant
name:
id:
context:
links: []
tags: []
---

**Condition:**

<!-- State the condition that must ALWAYS hold. -->

**Violation means:**

<!-- What goes wrong if this breaks? -->
`,

  rule: `---
type: rule
name:
id:
context:
links: []
tags: []
---

**Policy:**

<!-- State the business policy. -->

**Parameters:**

<!-- Configurable values and their defaults. -->

**On violation:**

<!-- What happens? -->
`,

  event: `---
type: event
name:
id:
context:
links: []
tags: []
---

<!-- Name must be past tense. -->

**Payload:**

<!-- What data does this event carry? -->

**Emitted by:**

<!-- Which Flow produces this event? -->
`,

  flow: `---
type: flow
name:
id:
context:
links: []
tags: []
---

**Trigger:**

<!-- What starts this flow? -->

**Inputs:**

**Steps:**

**Outputs:**

**Error paths:**
`,

  contract: `---
type: contract
name:
id:
context:
links: []
tags: []
---

**System:**

**Direction:** <!-- inbound | outbound | bidirectional -->

**We send:**

**We receive:**

**Failure modes:**
`,

  decision: `---
type: decision
name:
id:
context:
links: []
tags: []
---

**Context:**

**Decision:**

**Alternatives considered:**

**Consequences:**

**Supersedes:**
`,

  feature: `---
type: feature
name:
id:
context:
links: []
tags: []
---

**Summary:**

**Acceptance criteria:**

**Open questions:**
`,
}
