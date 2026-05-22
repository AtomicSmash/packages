import type { Config } from "stylelint";
import baseConfig from "./base.js";

function createAllowedPropertyList(
	values: {
		property: string | RegExp;
		varInfo: { type: "custom" | "preset"; slug: string };
		shorthand?: 1 | 2 | 3 | 4;
		additionalAllowedValues?: (string | RegExp)[];
	}[],
) {
	const allowedPropertyList: Record<string, string[]> = {};
	for (const {
		property,
		varInfo,
		shorthand = 1,
		additionalAllowedValues = [],
	} of values) {
		const isRegexProperty = property instanceof RegExp;
		const possibleValues = [];
		const possibleVars = [
			...additionalAllowedValues.map((value) =>
				value instanceof RegExp ? value.toString() : value,
			),
			`(var\\([\\s]*--wp--${varInfo.type}--${varInfo.slug}--([a-z-0-9]+[\\s]*)\\))`,
		];
		if (isRegexProperty) {
			possibleVars.push(
				`(var\\([\\s]*--[a-z-0-9]*${property.toString().slice(1, -1)}[a-z-0-9]*[\\s]*\\))`,
			);
		} else if (property) {
			possibleVars.push(
				`(var\\([\\s]*--[a-z-0-9]*${property}[a-z-0-9]*[\\s]*\\))`,
			);
		}
		possibleValues.push(
			// For each shorthand value, allow one of the possible values followed by a space, or allow it to be blank
			`/^${shorthand > 1 ? `((${possibleVars.join("|")})[\\s]*){0,${(shorthand - 1).toString()}}` : ""}(${possibleVars.join("|")})$/`,
		);
		allowedPropertyList[property.toString()] = possibleValues;
		if (!isRegexProperty) {
			allowedPropertyList[`/--[a-z-0-9]*${property}[a-z-0-9]*/`] =
				possibleValues;
		}
	}
	return allowedPropertyList;
}

const rules = {
	"declaration-property-value-allowed-list": [
		createAllowedPropertyList([
			{
				property: /border((-top|-bottom)(-left|-right))?-radius/,
				varInfo: {
					type: "custom",
					slug: "radius",
				},
			},
			{
				property: "border-radius",
				varInfo: {
					type: "custom",
					slug: "radius",
				},
				shorthand: 4,
			},
			{
				property: "box-shadow",
				varInfo: {
					type: "preset",
					slug: "shadow",
				},
				additionalAllowedValues: ["none", "unset"],
			},
			{
				property: /color/,
				varInfo: {
					type: "preset",
					slug: "color",
				},
				additionalAllowedValues: ["inherit", "currentcolor"],
			},
			{
				property: "background-color",
				varInfo: {
					type: "preset",
					slug: "color",
				},
				additionalAllowedValues: ["transparent"],
			},
			{
				property: "font-family",
				varInfo: {
					type: "preset",
					slug: "font-family",
				},
				additionalAllowedValues: ["inherit"],
			},
			{
				property: "font-size",
				varInfo: {
					type: "preset",
					slug: "font-size",
				},
				additionalAllowedValues: ["inherit"],
			},
			{
				property: /(?<!scroll-)margin/,
				varInfo: {
					type: "preset",
					slug: "spacing",
				},
				shorthand: 4,
				additionalAllowedValues: ["auto", "var\\(--wp--style--block-gap\\)"],
			},
			{
				property: /padding/,
				varInfo: {
					type: "preset",
					slug: "spacing",
				},
				shorthand: 4,
			},
			{
				property: "z-index",
				varInfo: {
					type: "custom",
					slug: "z-index",
				},
			},
		]),
		{
			severity: "warning",
			message: (property: string, value: string) => {
				// Until updated, property and value will always return undefined.
				return `Most values for this type of property should be defined in theme.json. (declaration-property-value-allowed-list)`;
				// The following code is not complete, it has been left to show how this function could provide more helpful error
				// messages once an update to stylelint is possible.
				let message = `Invalid property provided for ${property}.`;
				let ruleKey;
				if (property.includes("color")) {
					ruleKey = "/color/";
				} else if (property.includes("margin")) {
					ruleKey = "/margin/";
				} else if (property.includes("padding")) {
					ruleKey = "/padding/";
				} else {
					ruleKey = property;
				}
				switch (ruleKey) {
					case "z-index": {
						message = `z-index must use one of the values specified in the theme.json file under \`settings.custom.z-index\`.`;
						break;
					}
					case "/color/": {
						message = `Colour values must use one of the values specified in the theme.json file under \`settings.color.palette\`.`;
						break;
					}
					case "/margin/": {
						message = `Margin values must use one of the values specified in the theme.json file under \`settings.spacing.spacingSizes\`.`;
						break;
					}
					case "/padding/": {
						message = `Padding values must use one of the values specified in the theme.json file under \`settings.spacing.spacingSizes\`.`;
						break;
					}
					case "font-size": {
						message = `Font size values must use one of the values specified in the theme.json file under \`settings.typography.fontSizes\`.`;
						break;
					}
					case "font-family": {
						message = `Font family values must use one of the values specified in the theme.json file under \`settings.typography.fontFamilies\`.`;
						break;
					}
				}
				return `${message} Value provided: ${value} (declaration-property-value-allowed-list)`;
			},
		},
	],
};

export default {
	...baseConfig,
	rules: {
		...baseConfig.rules,
		...rules,
	},
} satisfies Config;
