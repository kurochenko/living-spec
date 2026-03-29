---
type: decision
name: Testable Primitives
id: testable-primitives
links:
  - edge: depends-on
    target: 'term:primitive-type'
tags:
  - core
---

**Context:** Not all [[term:primitive-type]]s produce testable behavior. Tests should be derived from the spec, not invented separately, but only some types have assertions to verify.

**Decision:** Four types are testable, four are not.

Testable:
- **Invariant** → unit test. Condition holds; violation path produces the declared outcome.
- **Rule** → unit test. Default behavior correct; each parameter boundary tested.
- **Flow** → happy path test (one assertion per step) + one test per declared error path.
- **Contract** → integration/contract test. Shape matches declaration; failure modes handled.

Not testable (no dedicated tests):
- **Term** — a definition, nothing to execute.
- **Decision** — rationale, tested implicitly through code it shaped.
- **Event** — tested through the Flow that emits it and the Flow triggered by it.
- **Feature** — a rollup, fully covered by testing its constituent primitives.

**Alternatives considered:**
- Test everything including terms and decisions — generates meaningless tests that assert definitions haven't changed, adds noise
- Test only flows — misses invariant violations and contract shape drift
- Let each team decide — inconsistent coverage, gaps appear at integration time

**Consequences:** When implementing a feature, the LLM collects its invariants, rules, flows, and contracts from the graph. Each one maps to concrete test cases. Terms, decisions, events, and features are skipped. Test files reference the primitive id they verify so traceability is maintained.
