---
"@atomicsmash/blocks-helpers": major
---

fix onSelect property of MediaReplaceFlow to allow for a single image when multiple property is not used. This will be a breaking change anywhere the multiple property is not used – you will need to handle a single image instead of an array.
