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

export function displayErrorMessage(errorState: ErrorStateValues | undefined) {
	return errorState?.messages?.map((error) => error.message).join(", ");
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
