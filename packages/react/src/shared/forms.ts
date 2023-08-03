import { z } from "zod";

export type ErrorStateValues =
	| {
			validity: "invalid";
			messages: { message: string; errorCode: string }[];
	  }
	| {
			validity: "valid";
			messages?: never;
	  }
	| {
			validity: null;
			messages?: never;
	  };

export function combineErrorMessages(
	validationState: ErrorStateValues | ErrorStateValues[],
): string {
	const collectedErrorMessages = new Set<string>();
	if (Array.isArray(validationState)) {
		for (const state of validationState) {
			if (state.messages) {
				for (const message of state.messages) {
					collectedErrorMessages.add(message.message);
				}
			}
		}
	} else {
		if (validationState.messages) {
			for (const message of validationState.messages) {
				collectedErrorMessages.add(message.message);
			}
		}
	}
	return [...collectedErrorMessages]
		.map((message, index, array) => {
			if (index === array.length - 1) {
				return message;
			}
			if (message.endsWith(".")) {
				return message.slice(0, -1);
			}
			return message;
		})
		.join(", ");
}
export const actionDataSchema = z.object({
	errors: z.object({
		formErrors: z.array(
			z.object({
				message: z.string(),
				errorCode: z.string(),
			}),
		),
		fieldErrors: z.record(
			z.string(),
			z.array(z.object({ message: z.string(), errorCode: z.string() })),
		),
	}),
	values: z.record(z.union([z.string(), z.boolean()])),
});
