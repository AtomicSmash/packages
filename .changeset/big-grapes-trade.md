---
"@atomicsmash/wordpress-tests-helper": patch
---

Remove user prefs check because it's flaky. Instead just check each time if is dismissed, and when it is already dismissed on page load, stop checking.
