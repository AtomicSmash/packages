import { Faker } from "@faker-js/faker";

type DataTypeToUse = "valid" | "invalid" | boolean;
export function handleTextInput({
	field,
	optional,
	which,
	visibleOnly,
	...dataTypes
}: {
	field: string;
	valid: string[];
	invalid: string[];
	faker?: (faker: Faker) => string;
	optional?: boolean;
	which?: "all" | "first";
	visibleOnly?: boolean;
}) {
	return async function fillTextInput({
		page,
		dataTypeToUse,
	}: {
		page: string;
		dataTypeToUse?: DataTypeToUse | "faker";
	}) {
		if (typeof dataTypeToUse === "boolean" || dataTypeToUse === undefined) {
			console.error(
				"Using a boolean value for data type is deprecated and will be removed in a future version.",
			);
			console.error(
				`To migrate your function, replace ${
					dataTypeToUse === undefined ? "undefined" : dataTypeToUse.toString()
				} with (${dataTypeToUse === false ? `"invalid"` : `"valid"`})`,
			);
			dataTypeToUse = dataTypeToUse === false ? "invalid" : "valid";
		}
		const inputFieldElements = await new Promise<HTMLInputElement[]>(
			(resolve) => {
				resolve(Array.from(document.querySelectorAll<HTMLInputElement>(field)));
			},
		)
			.then((elements) => {
				if (visibleOnly !== false) {
					return Array.from(elements).filter(
						(element) => element.offsetParent !== null,
					);
				}
				return Array.from(elements);
			})
			.then((elements) => {
				if (which === "first") {
					return elements.slice(0, 1);
				}
				return elements;
			});
		for (const inputFieldElement of inputFieldElements) {
			if (!inputFieldElement) {
				if (optional) {
					continue;
				}
				throw new Error(
					`Can't find the input with the selector ${field} for ${page}. Make sure the dev tools data object matches the page html.`,
				);
			}
			if (dataTypeToUse === "faker") {
				if (dataTypes.faker === undefined) {
					throw new Error(
						"You need to add a faker property to the input handler, or we don't know what value to generate.",
					);
				}
				inputFieldElement.value = "Getting random value...";
				// Faker is a large package, so we only want to get it dynamically as needed.
				const { faker } = await import(
					// @ts-expect-error - Can't get type info from CDN URL
					"https://cdn.skypack.dev/@faker-js/faker@v8.0.2"
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Can't get type info from CDN URL
				).then((module) => ({ faker: module.fakerEN_GB as Faker }));
				inputFieldElement.value = dataTypes.faker(faker);
			} else {
				inputFieldElement.value = dataTypes[dataTypeToUse][
					Math.floor(Math.random() * dataTypes[dataTypeToUse].length)
				] as string;
			}
			// trigger error validation by focusing and blurring the input
			inputFieldElement.focus();
			inputFieldElement.blur();
			// Wait a single tick before moving to the next field
			await new Promise((r) => setTimeout(r, 1));
		}
	};
}
export function handleSwitchInput({
	field,
	optional,
	which,
	visibleOnly,
	...dataTypes
}: {
	field: string;
	valid: boolean;
	invalid: boolean | undefined;
	optional?: boolean;
	which?: "all" | "first";
	visibleOnly?: boolean;
}) {
	return async function fillSwitchInput({
		page,
		dataTypeToUse,
	}: {
		page: string;
		dataTypeToUse?: DataTypeToUse;
	}) {
		if (typeof dataTypeToUse === "boolean" || dataTypeToUse === undefined) {
			console.error(
				"Using a boolean value for data type is deprecated and will be removed in a future version.",
			);
			console.error(
				`To migrate your function, replace ${
					dataTypeToUse === undefined ? "undefined" : dataTypeToUse.toString()
				} with (${dataTypeToUse === false ? `"invalid"` : `"valid"`})`,
			);
			dataTypeToUse = dataTypeToUse === false ? "invalid" : "valid";
		}
		const switchElements = await new Promise<HTMLButtonElement[]>((resolve) => {
			resolve(Array.from(document.querySelectorAll<HTMLButtonElement>(field)));
		})
			.then((elements) => {
				if (visibleOnly) {
					return Array.from(elements).filter(
						(element) => element.offsetParent !== null,
					);
				}
				return Array.from(elements);
			})
			.then((elements) => {
				if (which === "first") {
					return elements.slice(0, 1);
				}
				return elements;
			});
		for (const switchElement of switchElements) {
			if (!switchElement) {
				if (optional) {
					continue;
				}
				throw new Error(
					`Can't find the button with the selector ${field} for ${page}. Make sure the dev tools data object matches the page html.`,
				);
			}

			if (
				(dataTypeToUse === "valid" &&
					dataTypes[dataTypeToUse] &&
					switchElement.dataset.state === "unchecked") ||
				(dataTypeToUse === "valid" &&
					!dataTypes[dataTypeToUse] &&
					switchElement.dataset.state === "checked") ||
				(dataTypeToUse === "invalid" &&
					dataTypes[dataTypeToUse] === false &&
					switchElement.dataset.state === "checked") ||
				(dataTypeToUse === "invalid" &&
					dataTypes[dataTypeToUse] === true &&
					switchElement.dataset.state === "unchecked")
			) {
				switchElement.click();
			}
			// toggle twice to trigger validation
			setTimeout(() => {
				switchElement.click();
				setTimeout(() => {
					switchElement.click();
				}, 1);
			}, 1);
			// Wait a single tick before moving to the next field
			await new Promise((r) => setTimeout(r, 1));
		}
	};
}
export function handleSelectInput({
	field,
	isMultiple,
	optional,
	which,
	visibleOnly,
	...dataTypes
}: {
	field: string;
	isMultiple: boolean;
	valid: string[];
	invalid: string[];
	optional?: boolean;
	which?: "all" | "first";
	visibleOnly?: boolean;
}) {
	return async function fillSelectInput({
		page,
		dataTypeToUse,
	}: {
		page: string;
		dataTypeToUse?: DataTypeToUse;
	}) {
		if (typeof dataTypeToUse === "boolean" || dataTypeToUse === undefined) {
			console.error(
				"Using a boolean value for data type is deprecated and will be removed in a future version.",
			);
			console.error(
				`To migrate your function, replace ${
					dataTypeToUse === undefined ? "undefined" : dataTypeToUse.toString()
				} with (${dataTypeToUse === false ? `"invalid"` : `"valid"`})`,
			);
			dataTypeToUse = dataTypeToUse === false ? "invalid" : "valid";
		}
		const selectFieldElements = await new Promise<HTMLSelectElement[]>(
			(resolve) => {
				resolve(
					Array.from(document.querySelectorAll<HTMLSelectElement>(field)),
				);
			},
		)
			.then((elements) => {
				if (visibleOnly) {
					return Array.from(elements).filter(
						(element) => element.offsetParent !== null,
					);
				}
				return Array.from(elements);
			})
			.then((elements) => {
				if (which === "first") {
					return elements.slice(0, 1);
				}
				return elements;
			});
		for (const selectFieldElement of selectFieldElements) {
			if (!selectFieldElement) {
				if (optional) {
					continue;
				}
				throw new Error(
					`Can't find the select input with the selector ${field} for ${page}. Make sure the dev tools data object matches the page html.`,
				);
			}
			const options = selectFieldElement.getElementsByTagName("option");
			if (isMultiple) {
				for (const option of options) {
					if (dataTypes[dataTypeToUse].includes(option.value)) {
						option.selected = true;
					} else {
						option.selected = false;
					}
				}
			} else {
				const value = dataTypes[dataTypeToUse][
					Math.floor(Math.random() * dataTypes[dataTypeToUse].length)
				] as string;
				selectFieldElement.value = value;
				for (const option of options) {
					if (option.value.toString() === value) {
						option.selected = true;
					} else {
						option.selected = false;
					}
				}
			}
			// trigger error validation by focusing and blurring the input
			selectFieldElement.focus();
			selectFieldElement.blur();
			// Wait a single tick before moving to the next field
			await new Promise((r) => setTimeout(r, 1));
		}
	};
}

export function constructFillPageForm(
	pageFormData: Record<
		string,
		{
			beforeAll?: () => void;
			inputs: (
				| ReturnType<typeof handleTextInput>
				| ReturnType<typeof handleSwitchInput>
				| ReturnType<typeof handleSelectInput>
			)[];
			afterAll?: () => void;
		}
	>,
) {
	async function fillPageForm(
		page: string | undefined,
		dataTypeToUse: "valid" | true,
		useFakerWherePossible?: true,
	): Promise<void>;
	async function fillPageForm(
		page: string | undefined,
		dataTypeToUse?: "invalid" | false,
		useFakerWherePossible?: never,
	): Promise<void>;
	async function fillPageForm(
		page: string | undefined,
		dataTypeToUse?: DataTypeToUse,
		useFakerWherePossible?: true,
	): Promise<void> {
		if (typeof dataTypeToUse === "boolean" || dataTypeToUse === undefined) {
			console.error(
				"Using a boolean value for data type is deprecated and will be removed in a future version.",
			);
			console.error(
				`To migrate your function, replace ${
					dataTypeToUse === undefined ? "undefined" : dataTypeToUse.toString()
				} with (${dataTypeToUse === false ? `"invalid"` : `"valid"`})`,
			);
			dataTypeToUse = dataTypeToUse === false ? "invalid" : "valid";
		}
		if (page === undefined) {
			throw new Error(
				"Unable to find a match for the current page. Either there is no form elements to fill, or the page hasn't been added to the dev tools data array.",
			);
		}
		const singlePageFormData = pageFormData[page];
		if (singlePageFormData === undefined) {
			throw new Error(
				"Unable to find a match for the current page. Either there is no form elements to fill, or the page hasn't been added to the dev tools data array.",
			);
		}
		const beforeAll = singlePageFormData.beforeAll;
		if (beforeAll) {
			beforeAll();
		}
		for (const input of singlePageFormData.inputs) {
			if (input.name === "fillTextInput") {
				await (input as ReturnType<typeof handleTextInput>)({
					page,
					dataTypeToUse:
						useFakerWherePossible === true ? "faker" : dataTypeToUse,
				});
			} else {
				await input({
					page,
					dataTypeToUse,
				});
			}
		}
		const afterAll = singlePageFormData.afterAll;
		if (afterAll) {
			afterAll();
		}
	}
	return fillPageForm;
}
