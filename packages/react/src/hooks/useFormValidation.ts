import type { ErrorStateValues } from "../shared/forms.js";
import type { Reducer } from "react";
import type { SomeZodObject, ZodTypeAny, z } from "zod";
import { useReducer, useEffect, useCallback, useMemo } from "react";
import { useHydrated } from "remix-utils/use-hydrated";
import { actionDataSchema } from "../shared/forms.js";

/**
 * A hook to simplify form validation
 * @param schema The schema to validate form fields against.
 * @param actionData The data returned from the action to detect server errors.
 * @returns An object containing multiple methods and variables to be used to build a form UI.
 */
export function useFormValidation<SchemaType extends SomeZodObject>(
	schema: SchemaType,
	actionData: unknown,
) {
	type ErrorState = Record<keyof SchemaType["shape"], ErrorStateValues>;
	type ReducerAction =
		| {
				type: "update_field";
				fieldName: string;
				fieldValue: unknown;
				customSchema?: ZodTypeAny;
		  }
		| {
				type: "reset";
				parsedActionData: z.SafeParseReturnType<
					z.input<typeof actionDataSchema>,
					z.output<typeof actionDataSchema>
				>;
		  };

	function reducer(prevState: ErrorState, action: ReducerAction) {
		if (action.type === "update_field") {
			if (!schema.keyof().safeParse(action.fieldName).success) {
				// eslint-disable-next-line no-restricted-syntax
				throw new Error(
					`${action.fieldName} is not a valid field name as defined in the form schema.`,
				);
			}
			let validation: z.SafeParseReturnType<unknown, unknown>;
			if (action.customSchema) {
				validation = action.customSchema.safeParse(action.fieldValue);
			} else {
				const fieldSchema = schema.shape[action.fieldName];
				if (!fieldSchema) {
					throw new Error(`Unable to find schema for ${action.fieldName}.`);
				}
				validation = fieldSchema.safeParse(action.fieldValue);
			}
			const newState = { ...prevState };
			newState[action.fieldName as keyof SchemaType["shape"]] =
				validation.success
					? {
							validity: "valid",
						}
					: {
							validity: "invalid",
							messages: validation.error.issues.map((issue) => ({
								message: issue.message,
								errorCode: issue.code,
							})),
						};
			return newState;
		} else if (action.type === "reset") {
			return initialiseFormErrorState(action.parsedActionData);
		}
		return prevState;
	}
	const actionDataParsed = actionDataSchema.safeParse(actionData);

	useEffect(() => {
		const actionDataParsed = actionDataSchema.safeParse(actionData);
		if (actionDataParsed.success) {
			setFormErrorState({ type: "reset", parsedActionData: actionDataParsed });
		}
	}, [actionData]);

	function initialiseFormErrorState(
		actionDataParsed: z.SafeParseReturnType<
			z.input<typeof actionDataSchema>,
			z.output<typeof actionDataSchema>
		>,
	) {
		if (actionDataParsed.success) {
			return Object.keys(schema.shape).reduce<Partial<ErrorState>>(
				(object, key) => {
					if (actionDataParsed.data.errors.fieldErrors[key]) {
						object[key as keyof SchemaType["shape"]] = {
							validity: "invalid",
							messages: actionDataParsed.data.errors.fieldErrors[key] as {
								message: string;
								errorCode: string;
							}[],
						};
					} else {
						object[key as keyof SchemaType["shape"]] = { validity: "valid" };
					}
					return object;
				},
				{},
			) as ErrorState;
		}
		return Object.keys(schema.shape).reduce<Partial<ErrorState>>(
			(object, key) => {
				object[key as keyof SchemaType["shape"]] = { validity: null };
				return object;
			},
			{},
		) as ErrorState;
	}
	const [formErrorState, setFormErrorState] = useReducer<
		Reducer<ErrorState, ReducerAction>,
		z.SafeParseReturnType<
			z.input<typeof actionDataSchema>,
			z.output<typeof actionDataSchema>
		>
	>(reducer, actionDataParsed, initialiseFormErrorState);
	return {
		/**
		 * Manually update the error state by submitting a new value to a field.
		 * @param fieldName The name of the field as defined in the schema.
		 * @param fieldValue The value of the field.
		 * @param customSchema An optional custom schema to validate the field against instead of the one defined in the main schema.
		 */
		setValidationState: useCallback(
			({
				fieldName,
				fieldValue,
				customSchema = undefined,
			}: {
				fieldName: string;
				fieldValue: unknown;
				customSchema?: ZodTypeAny;
			}) => {
				setFormErrorState({
					type: "update_field",
					fieldName,
					fieldValue,
					customSchema,
				});
			},
			[],
		),
		/**
		 * A helper function to make updating a text field on events easier
		 *
		 * @example <input type="text" onBlur={updateTextField} />
		 */
		updateTextField: useCallback(
			(
				event:
					| React.SyntheticEvent<HTMLInputElement>
					| React.SyntheticEvent<HTMLSelectElement>
					| React.SyntheticEvent<HTMLTextAreaElement>,
			) => {
				setFormErrorState({
					type: "update_field",
					fieldName: event.currentTarget.name,
					fieldValue: event.currentTarget.value,
				});
			},
			[],
		),
		/**
		 * A helper function to make updating a checkbox field on events easier
		 *
		 * @example <input type="checkbox" onChange={updateCheckboxField} />
		 */
		updateCheckboxField: useCallback(
			(event: React.ChangeEvent<HTMLInputElement>) => {
				setFormErrorState({
					type: "update_field",
					fieldName: event.target.name,
					fieldValue: event.target.checked ? event.target.value : "",
				});
			},
			[],
		),
		/**
		 * The error state object. It's a object that matches the main schema keys, with the error state as the value.
		 */
		validationErrors: formErrorState,
		/**
		 * A variable that determines whether a form has been submitted by the user or not. Useful for showing success messages on forms that don't trigger a navigation.
		 */
		wasSubmitted: useMemo(() => actionData !== undefined, [actionData]),
		/**
		 * A variable that determines whether a form contains any errors. These error can come from error state or from the server.
		 */
		hasErrors: useMemo(
			() =>
				Object.values(formErrorState).findIndex(
					(value) => value.validity === "invalid",
				) !== -1,
			[formErrorState],
		),
		/**
		 * A variable to determine when a form has been hydrated. This allows you to disable browser validation only once the JS validation is in place.
		 * @example <form noValidate={isHydrated}></form>
		 */
		isHydrated: useHydrated(),
		/**
		 * A function to reset the error state to neutral
		 */
		resetErrorState: useCallback(() => {
			setFormErrorState({
				type: "reset",
				parsedActionData: actionDataSchema.safeParse(null),
			});
		}, []),
	};
}
