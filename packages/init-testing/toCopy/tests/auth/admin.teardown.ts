import { unlink } from "node:fs/promises";
import { test as teardown } from "@playwright/test";
import { storageState } from "./index.js";

teardown("Login as admin teardown", async () => {
	await unlink(storageState);
});
