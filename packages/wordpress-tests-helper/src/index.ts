import type { Page } from "@playwright/test";
import { readFile, writeFile, unlink } from "node:fs/promises";
import { expect } from "@playwright/test";

type SupportedWPVersions = "6.6" | "6.7" | "6.8";

export class WordPressAdminInteraction {
	readonly page: Page;
	readonly persistLocation: string;
	readonly WPVersion: SupportedWPVersions;
	initialised = false;
	blockEditorWelcomeDismissed = false;
	postTypeInfo:
		| Record<string, { type: string; viewPostText: string; addNewURL: string }>
		| undefined = undefined;
	posts: {
		friendlyId: string;
		postId: string;
		type: string;
		editURL: string;
		frontendURL?: string;
	}[] = [];

	constructor(
		page: Page,
		persistLocation: string,
		WPVersion: SupportedWPVersions | "latest" = "latest",
	) {
		this.page = page;
		this.persistLocation = persistLocation;
		this.WPVersion = WPVersion === "latest" ? "6.8" : WPVersion;
	}

	/**
	 * Compare WP versions for compatibility.
	 *
	 * @param versionToCompare The version to compare the set WP version with.
	 *
	 * @returns -1 if current wp version is older, 0 if the versions match, 1 if the current wp version is newer.
	 */
	compareVersion(versionToCompare: SupportedWPVersions) {
		const [currentMajor, currentMinor] = this.WPVersion.split(".").map(Number);
		const [compareMajor, compareMinor] = versionToCompare
			.split(".")
			.map(Number);

		if (currentMajor === undefined || currentMinor === undefined) {
			throw new Error("Invalid current WP version.");
		}
		if (compareMajor === undefined || compareMinor === undefined) {
			throw new Error("Invalid compared WP version.");
		}

		if (
			compareMajor > currentMajor ||
			(compareMajor === currentMajor && compareMinor > currentMinor)
		) {
			return -1;
		}
		if (
			compareMajor < currentMajor ||
			(compareMajor === currentMajor && compareMinor < currentMinor)
		) {
			return 1;
		}
		return 0;
	}

	versionIsHigherThan(versionToCompare: SupportedWPVersions) {
		return this.compareVersion(versionToCompare) === 1;
	}

	versionIsLowerThan(versionToCompare: SupportedWPVersions) {
		return this.compareVersion(versionToCompare) === -1;
	}

	static async getDataFromFile(persistLocation: string) {
		return await readFile(persistLocation, { encoding: "utf8" })
			.then((result) => {
				return JSON.parse(result) as unknown;
			})
			.then((json: unknown) => {
				if (
					typeof json === "object" &&
					json !== null &&
					"blockEditorWelcomeDismissed" in json &&
					typeof json.blockEditorWelcomeDismissed === "boolean" &&
					"posts" in json &&
					Array.isArray(json.posts)
				) {
					// Passed basic validation
					return json as {
						blockEditorWelcomeDismissed: boolean;
						posts: {
							friendlyId: string;
							postId: string;
							type: string;
							editURL: string;
							frontendURL: string;
						}[];
					};
				}
				return null;
			})
			.catch(() => {
				return null;
			});
	}

	async init() {
		const json = await WordPressAdminInteraction.getDataFromFile(
			this.persistLocation,
		);
		if (json) {
			this.blockEditorWelcomeDismissed = json.blockEditorWelcomeDismissed;
			this.posts = json.posts;
		}
		if (!this.blockEditorWelcomeDismissed) {
			await this.page.goto("/wp/wp-admin/post-new.php?post_type=page");
			await this.dismissWelcomeGuide();
		}
		this.initialised = true;
	}

	async dismissWelcomeGuide() {
		const welcomeDialog = this.page.getByRole("dialog", {
			name: this.versionIsHigherThan("6.7")
				? "Welcome to the editor"
				: "Welcome to the block editor",
			exact: true,
		});
		if (await welcomeDialog.isVisible()) {
			await welcomeDialog
				.getByRole("button", { name: "Close", exact: true })
				.click();
			await expect(welcomeDialog).toHaveCount(0);
		} else {
			this.blockEditorWelcomeDismissed = true;
		}
	}

	async switchEditorMode(mode: "visual" | "code") {
		if (!this.initialised) {
			throw new Error("You must initialise the helper first with init()");
		}
		// Don't try to set this ahead of time. This class can be called multiple times, so reloading the page
		// may be the mode switches due to another untraceable action. Always do a check to establish what the
		// correct editor mode is, or switch the mode explicitly.
		const isVisualEditorMode = !(await this.page
			.getByRole("button", { name: "Exit code editor", exact: true })
			.isVisible());

		await this.page
			.getByRole("button", { name: "Options", exact: true })
			.click();

		const modeSwitchKeyboardShortcut =
			process.platform === "darwin" ? "⇧⌥⌘M" : "Ctrl+Shift+Alt+M";
		if (mode === "visual" && !isVisualEditorMode) {
			await this.page
				.getByRole("menuitemradio", {
					name: `Visual editor ${modeSwitchKeyboardShortcut}`,
					exact: true,
				})
				.click();
		} else if (mode === "code" && isVisualEditorMode) {
			await this.page
				.getByRole("menuitemradio", {
					name: `Code editor ${modeSwitchKeyboardShortcut}`,
					exact: true,
				})
				.click();
		}

		await this.page
			.getByRole("button", { name: "Options", exact: true })
			.click();
	}

	async doPageOpenChecks() {
		if (!this.blockEditorWelcomeDismissed) {
			await this.dismissWelcomeGuide();
		}
		await this.switchEditorMode("code");
	}

	async createPostsViaBlocksEditor(
		postsToAdd: {
			postIdentifier: string;
			title: string;
			postType?: string;
			options?: {
				makeTitleUnique?: boolean;
				markTitleAsGenerated?: boolean;
				hasFrontEnd?: boolean;
			};
		}[],
	) {
		if (!this.initialised) {
			throw new Error("You must initialise the helper first with init()");
		}

		for (const postToAdd of postsToAdd) {
			postToAdd.postType = postToAdd.postType ?? "post";
			postToAdd.options = {
				...{
					makeTitleUnique: true,
					markTitleAsGenerated: true,
					hasFrontEnd: true,
				},
				...postToAdd.options,
			};

			const { postIdentifier, title, postType, options } = postToAdd;

			const postInfo: Partial<(typeof this.posts)[number]> = {
				friendlyId: postIdentifier,
				type: postType,
			};
			await this.page.goto(`/wp/wp-admin/post-new.php?post_type=${postType}`);
			await this.doPageOpenChecks();

			await this.page
				.getByLabel("Add title")
				.fill(
					`${options.markTitleAsGenerated ? "GENERATED " : ""}${title}${options.makeTitleUnique ? ` ${Math.floor(Math.random() * 99999999)}` : ""}`,
				);

			await this.page
				.getByRole("button", { name: "Publish", exact: true })
				.click();
			await this.page
				.getByLabel("Editor publish")
				.getByRole("button", { name: "Publish", exact: true })
				.click();

			await this.page.waitForURL(/\/wp\/wp-admin\/post\.php.*/);

			postInfo.editURL = this.page.url();
			const postIdFromURL = new URL(postInfo.editURL).searchParams.get("post");
			if (!postIdFromURL) {
				throw new Error("Unable to get the post id from the url");
			}
			postInfo.postId = postIdFromURL;

			if (options.hasFrontEnd) {
				await this.page
					.getByLabel("Editor publish")
					.getByRole("link", { name: /^View / })
					.click();

				await this.page.waitForURL(
					(url) => !url.toString().includes("wp/wp-admin"),
				);

				postInfo.frontendURL = this.page.url();
			}

			if (
				postInfo.friendlyId === undefined ||
				postInfo.type === undefined ||
				postInfo.editURL === undefined
			) {
				throw new Error("Failed when adding a new post.");
			}

			this.posts.push(postInfo as (typeof this.posts)[number]);
		}
		await writeFile(
			this.persistLocation,
			JSON.stringify({
				posts: this.posts,
				blockEditorWelcomeDismissed: this.blockEditorWelcomeDismissed,
			}),
		);
	}

	async addContentByFixture(
		postIdentifier: string,
		fixtures: string[],
		options?: { replace?: boolean; joinSeparator?: string },
	) {
		if (!this.initialised) {
			throw new Error("You must initialise the helper first with init()");
		}
		options = {
			...{ replace: false, joinSeparator: `\n` },
			...options,
		};
		const post = this.posts.find(
			({ friendlyId }) => friendlyId === postIdentifier,
		);
		if (!post) {
			throw new Error("Can't find the post with the post identifier");
		}
		await this.page.goto(post.editURL);
		await this.doPageOpenChecks();
		const contentTextBox = this.page.getByPlaceholder(
			"Start writing with text or HTML",
		);
		await contentTextBox.fill(
			[
				!options.replace ? await contentTextBox.inputValue() : undefined,
				...fixtures,
			]
				.filter((value) => !!value) // filter out empty string / undefined
				.join(options.joinSeparator),
		);

		await this.page
			.getByRole("button", { name: "Update", exact: true })
			.or(this.page.getByRole("button", { name: "Save", exact: true }))
			.click();

		await expect(
			this.page.getByTestId("snackbar").getByText(/updated./),
		).toBeVisible();
	}

	getPostId(postIdentifier: string) {
		const post = this.posts.find(
			({ friendlyId }) => friendlyId === postIdentifier,
		);
		if (!post) {
			throw new Error("Can't find the post with the post identifier");
		}
		return post.postId;
	}

	async cleanup() {
		if (!this.initialised) {
			throw new Error("You must initialise the helper first with init()");
		}
		for (const post of this.posts) {
			await this.page.goto(post.editURL);
			await this.doPageOpenChecks();

			if (await this.page.getByText("it is in the Trash").isVisible()) {
				continue;
			}

			const showSidebarButton = this.page.getByRole("button", {
				name: "Settings",
				exact: true,
			});

			if ((await showSidebarButton.getAttribute("aria-pressed")) === "false") {
				await showSidebarButton.click();
			}

			await this.page
				.getByRole("button", { name: "Actions", exact: true })
				.click();

			const moveToTrashText = this.versionIsLowerThan("6.7")
				? "Move to Trash"
				: "Move to trash";

			await this.page
				.getByRole("menuitem", { name: moveToTrashText, exact: true })
				.click();

			await this.page
				.getByRole("button", { name: "Trash", exact: true })
				.click();

			await expect(this.page.getByText("moved to the Trash.")).toBeVisible();
		}

		await unlink(this.persistLocation);
	}

	getPosts() {
		return this.posts;
	}

	/**
	 * Shorthand for getting the front end url from the persistent file.
	 * @param persistLocation The location of the persisted file.
	 * @param postIdentifier The post to get the front end url for.
	 */
	static async getFrontEndURL(persistLocation: string, postIdentifier: string) {
		const json =
			await WordPressAdminInteraction.getDataFromFile(persistLocation);
		const post = json?.posts.find(
			({ friendlyId }) => friendlyId === postIdentifier,
		);
		if (!post) {
			throw new Error(
				"Post doesn't exist. Be sure to create the post first with `createPostViaBlocksEditor`.",
			);
		}

		return post.frontendURL;
	}
}
