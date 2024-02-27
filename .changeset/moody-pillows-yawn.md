---
"@atomicsmash/cli": major
---

Change the source files location

This change changes the input folder to look for root files as normal, and any direct child folders as blocks instead of having a "blocks" folder. This was changed to better integrate blocks folders into theme src folders cleanly. To update your code, Move your root files into your current blocks folder, then change the command input folder to that blocks folder.
