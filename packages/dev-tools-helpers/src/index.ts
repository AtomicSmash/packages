export function handleTextInput({
	field,
	valid,
	invalid,
	optional,
	which,
	visibleOnly,
}: {
	field: string;
	valid: string[];
	invalid: string[];
	optional?: boolean;
	which?: "all" | "first";
	visibleOnly?: boolean;
}) {
	return async function ({
		page,
		useValidData,
	}: {
		page: string;
		useValidData: boolean;
	}) {
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
			const valueOptions = useValidData ? valid : invalid;
			inputFieldElement.value =
				valueOptions[Math.floor(Math.random() * valueOptions.length)];
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
	valid,
	invalid,
	optional,
	which,
	visibleOnly,
}: {
	field: string;
	valid: boolean;
	invalid: boolean | undefined;
	optional?: boolean;
	which?: "all" | "first";
	visibleOnly?: boolean;
}) {
	return async function ({
		page,
		useValidData,
	}: {
		page: string;
		useValidData: boolean;
	}) {
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
				(useValidData &&
					valid &&
					switchElement.dataset.state === "unchecked") ||
				(useValidData && !valid && switchElement.dataset.state === "checked") ||
				(!useValidData &&
					invalid === false &&
					switchElement.dataset.state === "checked") ||
				(!useValidData &&
					invalid === true &&
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
	valid,
	invalid,
	optional,
	which,
	visibleOnly,
}: {
	field: string;
	isMultiple: boolean;
	valid: string[];
	invalid: string[];
	optional?: boolean;
	which?: "all" | "first";
	visibleOnly?: boolean;
}) {
	return async function ({
		page,
		useValidData,
	}: {
		page: string;
		useValidData: boolean;
	}) {
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
			const valueOptions = useValidData ? valid : invalid;
			const options = selectFieldElement.getElementsByTagName("option");
			if (isMultiple) {
				for (const option of options) {
					if (valueOptions.includes(option.value)) {
						option.selected = true;
					} else {
						option.selected = false;
					}
				}
			} else {
				const value =
					valueOptions[Math.floor(Math.random() * valueOptions.length)];
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
	return async function fillPageForm(
		page: string | undefined,
		useValidData = true,
	) {
		try {
			if (page === undefined || pageFormData[page] === undefined) {
				throw new Error(
					"Unable to find a match for the current page. Either there is no form elements to fill, or the page hasn't been added to the dev tools data array.",
				);
			}
			const beforeAll = pageFormData[page].beforeAll;
			if (beforeAll) {
				beforeAll();
			}
			for (const input of pageFormData[page].inputs) {
				await input({ page, useValidData });
			}
			const afterAll = pageFormData[page].afterAll;
			if (afterAll) {
				afterAll();
			}
		} catch (error) {
			const devToolsErrorElement = document.getElementById("devToolsError");
			if (!devToolsErrorElement) {
				console.error(
					"Can't find the devToolsErrorElement to output an error to.",
				);
				return;
			}
			if (error instanceof Error) {
				devToolsErrorElement.innerHTML = error.message;
			} else if (typeof error === "string") {
				devToolsErrorElement.innerHTML = error;
			}
		}
	};
}
