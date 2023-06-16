import type { ErrorStateValues } from "../shared/forms";
import type { Reducer } from "react";
import type { SomeZodObject, ZodTypeAny, z } from "zod";
import { useReducer, useEffect, useCallback, useMemo } from "react";
import { useHydrated } from "remix-utils";
import { actionDataSchema } from "../shared/forms";

export function useFormValidation<SchemaType extends SomeZodObject>(
	schema: SchemaType,
	actionData: unknown,
) {
	type ErrorState = Record<keyof SchemaType["shape"], ErrorStateValues>;
	type ReducerAction =
		| {
				type: "update_field";
				fieldName: string;
				fieldValue: string;
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
				validation = schema.shape[action.fieldName].safeParse(
					action.fieldValue,
				);
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
							messages: actionDataParsed.data.errors.fieldErrors[key],
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
		setValidationState: useCallback(
			({
				fieldName,
				fieldValue,
				customSchema = undefined,
			}: {
				fieldName: string;
				fieldValue: string;
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
		updateTextField: useCallback(
			(
				event:
					| React.FocusEvent<HTMLInputElement, Element>
					| React.FocusEvent<HTMLSelectElement, Element>
					| React.FocusEvent<HTMLTextAreaElement, Element>,
			) => {
				setFormErrorState({
					type: "update_field",
					fieldName: event.target.name,
					fieldValue: event.target.value,
				});
			},
			[],
		),
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
		validationErrors: formErrorState,
		wasSubmitted: useMemo(() => actionData !== undefined, [actionData]),
		hasErrors: useMemo(
			() =>
				Object.values(formErrorState).findIndex(
					(value) => value.validity === "invalid",
				) !== -1,
			[formErrorState],
		),
		isHydrated: useHydrated(),
	};
}
