---
"@atomicsmash/blocks-helpers": patch
---

Remove deprecated tag from source: "meta". JSDoc rules meant this would mark source as deprecated, not the value, which is not correct. Meta is still deprecated and should be avoided.
