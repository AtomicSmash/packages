import type { ErrorStateValues } from "../shared/forms.js";
import type { ComponentPropsWithRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import {
	createContext,
	forwardRef,
	useContext,
	useEffect,
	useId,
	useState,
} from "react";
import { combineErrorMessages } from "../shared/forms.js";

const FieldsetIdContext = createContext("");
const IdContext = createContext("");
const NameContext = createContext("");
const IsInAFieldsetContext = createContext(false);
const IsInAFieldContext = createContext(false);
const RequiredContext = createContext(false);
const HasHelpTextMessageContext = createContext(false);
const HasHelpTextMessageDispatchContext = createContext<
	React.Dispatch<React.SetStateAction<boolean>>
>(() => {
	/* empty */
});
const HasErrorMessageContext = createContext(false);
const HasErrorMessageDispatchContext = createContext<
	React.Dispatch<React.SetStateAction<boolean>>
>(() => {
	/* empty */
});
const HasHelpTextMessageInFieldsetContext = createContext(false);
const HasHelpTextMessageInFieldsetDispatchContext = createContext<
	React.Dispatch<React.SetStateAction<boolean>>
>(() => {
	/* empty */
});
const HasErrorMessageInFieldsetContext = createContext(false);
const HasErrorMessageInFieldsetDispatchContext = createContext<
	React.Dispatch<React.SetStateAction<boolean>>
>(() => {
	/* empty */
});
const ValidationStateContext = createContext<
	ErrorStateValues | ErrorStateValues[]
>({
	validity: null,
});
const LeadingIconsCountContext = createContext<number>(0);
const TrailingIconsCountContext = createContext<number>(0);
const LeadingIconsCountDispatchContext = createContext<
	React.Dispatch<React.SetStateAction<number>>
>(() => {
	/* empty */
});
const TrailingIconsCountDispatchContext = createContext<
	React.Dispatch<React.SetStateAction<number>>
>(() => {
	/* empty */
});

export function RequiredState({
	children,
}: {
	children: ({ isRequired }: { isRequired: boolean }) => React.ReactNode;
}) {
	const isRequired = useContext(RequiredContext);
	return <>{children({ isRequired })}</>;
}

export function ValidationState({
	children,
}: {
	children: ({
		validationState,
		validationSummary,
	}: {
		validationState: ErrorStateValues | ErrorStateValues[];
		validationSummary: "invalid" | "valid" | null;
	}) => React.ReactNode;
}) {
	const validationState = useContext(ValidationStateContext);
	return (
		<>
			{children({
				validationState,
				validationSummary: stateIsInvalid(validationState)
					? "invalid"
					: stateIsValid(validationState)
						? "valid"
						: null,
			})}
		</>
	);
}

export type FieldsetProps = {
	uniqueId?: string | undefined;
	isRequired?: boolean;
	validationState?: ErrorStateValues | ErrorStateValues[];
} & ComponentPropsWithRef<"fieldset">;

export const Fieldset = forwardRef<HTMLFieldSetElement, FieldsetProps>(
	function Fieldset(
		{
			uniqueId,
			isRequired = false,
			validationState = { validity: null },
			children,
			...fieldsetProps
		},
		forwardedRef,
	) {
		const generatedId = useId();
		const fieldsetId = uniqueId ?? generatedId;
		const [hasErrorMessageInFieldset, setHasErrorMessageInFieldset] =
			useState(false);
		const [hasHelpTextMessageInFieldset, setHasHelpTextMessageInFieldset] =
			useState(false);
		return (
			<IsInAFieldsetContext.Provider value={true}>
				<FieldsetIdContext.Provider value={fieldsetId}>
					<RequiredContext.Provider value={isRequired}>
						<HasErrorMessageInFieldsetContext.Provider
							value={hasErrorMessageInFieldset}
						>
							<HasHelpTextMessageInFieldsetContext.Provider
								value={hasHelpTextMessageInFieldset}
							>
								<HasErrorMessageInFieldsetDispatchContext.Provider
									value={setHasErrorMessageInFieldset}
								>
									<HasHelpTextMessageInFieldsetDispatchContext.Provider
										value={setHasHelpTextMessageInFieldset}
									>
										<ValidationStateContext.Provider value={validationState}>
											<fieldset
												id={fieldsetId}
												{...fieldsetProps}
												ref={forwardedRef}
											>
												{children}
											</fieldset>
										</ValidationStateContext.Provider>
									</HasHelpTextMessageInFieldsetDispatchContext.Provider>
								</HasErrorMessageInFieldsetDispatchContext.Provider>
							</HasHelpTextMessageInFieldsetContext.Provider>
						</HasErrorMessageInFieldsetContext.Provider>
					</RequiredContext.Provider>
				</FieldsetIdContext.Provider>
			</IsInAFieldsetContext.Provider>
		);
	},
);

export type LegendProps = {
	asChild?: boolean;
} & ComponentPropsWithRef<"legend">;

export const Legend = forwardRef<HTMLLegendElement, LegendProps>(
	function Legend({ asChild, children, ...legendProps }, forwardedRef) {
		const Comp = asChild ? Slot : "legend";
		const isInAFieldset = useContext(IsInAFieldsetContext);
		if (!isInAFieldset) {
			throw new Error("Legend must be used within a Fieldset component.");
		}
		return (
			<Comp {...legendProps} ref={forwardedRef}>
				{children}
			</Comp>
		);
	},
);

export type FieldProps = {
	name: string;
	uniqueId?: string | undefined;
	isRequired?: boolean;
	validationState?: ErrorStateValues | ErrorStateValues[];
} & ComponentPropsWithRef<"div">;

export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
	{
		uniqueId,
		name,
		isRequired,
		validationState = { validity: null },
		children,
		...divProps
	},
	forwardedRef,
) {
	const generatedId = useId();
	const id = uniqueId ?? generatedId;
	const [hasErrorMessage, setHasErrorMessage] = useState(false);
	const [hasHelpTextMessage, setHasHelpTextMessage] = useState(false);
	const isRequiredFromContext = useContext(RequiredContext);
	const [leadingIconsCount, setLeadingIconsCount] = useState<number>(0);
	const [trailingIconsCount, setTrailingIconsCount] = useState<number>(0);

	return (
		<IsInAFieldContext.Provider value={true}>
			<IdContext.Provider value={id}>
				<NameContext.Provider value={name}>
					<RequiredContext.Provider value={isRequired ?? isRequiredFromContext}>
						<HasErrorMessageContext.Provider value={hasErrorMessage}>
							<HasHelpTextMessageContext.Provider value={hasHelpTextMessage}>
								<HasErrorMessageDispatchContext.Provider
									value={setHasErrorMessage}
								>
									<HasHelpTextMessageDispatchContext.Provider
										value={setHasHelpTextMessage}
									>
										<ValidationStateContext.Provider value={validationState}>
											<LeadingIconsCountDispatchContext.Provider
												value={setLeadingIconsCount}
											>
												<TrailingIconsCountDispatchContext.Provider
													value={setTrailingIconsCount}
												>
													<LeadingIconsCountContext.Provider
														value={leadingIconsCount}
													>
														<TrailingIconsCountContext.Provider
															value={trailingIconsCount}
														>
															<div
																{...divProps}
																data-field-id={id}
																ref={forwardedRef}
															>
																{children}
															</div>
														</TrailingIconsCountContext.Provider>
													</LeadingIconsCountContext.Provider>
												</TrailingIconsCountDispatchContext.Provider>
											</LeadingIconsCountDispatchContext.Provider>
										</ValidationStateContext.Provider>
									</HasHelpTextMessageDispatchContext.Provider>
								</HasErrorMessageDispatchContext.Provider>
							</HasHelpTextMessageContext.Provider>
						</HasErrorMessageContext.Provider>
					</RequiredContext.Provider>
				</NameContext.Provider>
			</IdContext.Provider>
		</IsInAFieldContext.Provider>
	);
});

export type LabelProps = {
	asChild?: boolean;
} & ComponentPropsWithRef<"label">;

export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
	{ asChild, children, ...labelProps },
	forwardedRef,
) {
	const Id = useContext(IdContext);
	const isInAField = useContext(IsInAFieldContext);
	if (!isInAField) {
		throw new Error("Label must be used within a Field component.");
	}
	const Comp = asChild ? Slot : "label";
	return (
		<Comp htmlFor={Id} id={`${Id}-label`} {...labelProps} ref={forwardedRef}>
			{children}
		</Comp>
	);
});

export type HelpTextProps = {
	asChild?: boolean;
} & ComponentPropsWithRef<"div">;

export const HelpText = forwardRef<HTMLDivElement, HelpTextProps>(
	function HelpText({ asChild, children, ...divProps }, forwardedRef) {
		const id = useContext(IdContext);
		const fieldsetId = useContext(FieldsetIdContext);
		const isInAFieldset = useContext(IsInAFieldsetContext);
		const isInAField = useContext(IsInAFieldContext);
		const Comp = asChild ? Slot : "div";
		const helpTextId = isInAField
			? `${id}-help-text`
			: `${fieldsetId}-help-text`;
		const setHasHelpTextMessage = useContext(HasHelpTextMessageDispatchContext);
		const setHasHelpTextInFieldsetMessage = useContext(
			HasHelpTextMessageInFieldsetDispatchContext,
		);
		useEffect(() => {
			if (isInAField) {
				setHasHelpTextMessage(true);
			} else {
				setHasHelpTextInFieldsetMessage(true);
			}
		}, [isInAField, setHasHelpTextInFieldsetMessage, setHasHelpTextMessage]);

		if (!isInAFieldset && !isInAField) {
			throw new Error(
				"HelpText must be used within a Field component or a Fieldset component.",
			);
		}
		return (
			<Comp id={helpTextId} {...divProps} ref={forwardedRef}>
				{children}
			</Comp>
		);
	},
);

export type ValidationErrorProps = (
	| {
			asChild: true;
			children: (errorString: string) => React.ReactNode;
	  }
	| {
			asChild?: false;
			children?: never;
	  }
) &
	Omit<ComponentPropsWithRef<"div">, "children">;

export const ValidationError = forwardRef<HTMLDivElement, ValidationErrorProps>(
	function ValidationError({ asChild, children, ...divProps }, forwardedRef) {
		const Id = useContext(IdContext);
		const fieldsetId = useContext(FieldsetIdContext);
		const isInAFieldset = useContext(IsInAFieldsetContext);
		const isInAField = useContext(IsInAFieldContext);
		const validationState = useContext(ValidationStateContext);
		const setHasErrorMessage = useContext(HasErrorMessageDispatchContext);
		const setHasErrorMessageInFieldset = useContext(
			HasErrorMessageInFieldsetDispatchContext,
		);
		const hasErrorMessage = Array.isArray(validationState)
			? validationState.some((state) => state.messages !== undefined)
			: validationState.messages !== undefined;
		const validationErrorId = isInAField
			? `${Id}-error`
			: `${fieldsetId}-error`;

		useEffect(() => {
			if (isInAField) {
				setHasErrorMessage(hasErrorMessage);
			} else {
				setHasErrorMessageInFieldset(hasErrorMessage);
			}
		}, [
			hasErrorMessage,
			isInAField,
			setHasErrorMessage,
			setHasErrorMessageInFieldset,
		]);
		if (!isInAFieldset && !isInAField) {
			throw new Error(
				"ValidationError must be used within a Field component or a Fieldset component.",
			);
		}

		if (hasErrorMessage) {
			const errorString = combineErrorMessages(validationState);
			if (asChild) {
				return (
					<Slot id={validationErrorId} {...divProps} ref={forwardedRef}>
						{children(errorString)}
					</Slot>
				);
			}
			return (
				<div id={validationErrorId} {...divProps} ref={forwardedRef}>
					{errorString}
				</div>
			);
		}
		return null;
	},
);

export type InputWrapperProps = {
	leadingIcons?: JSX.Element | undefined;
	trailingIcons?: JSX.Element | undefined;
} & ComponentPropsWithRef<"div">;

export const InputWrapper = forwardRef<HTMLDivElement, InputWrapperProps>(
	function InputWrapper(
		{ leadingIcons, trailingIcons, children, ...divProps },
		forwardedRef,
	) {
		const leadingIconsCount = useContext(LeadingIconsCountContext);
		const trailingIconsCount = useContext(TrailingIconsCountContext);
		const isInAField = useContext(IsInAFieldContext);
		if (!isInAField) {
			throw new Error("InputWrapper must be used within a Field component.");
		}
		return (
			<div
				{...divProps}
				ref={forwardedRef}
				style={
					{
						...{
							"--leadingIconsCount": leadingIconsCount,
							"--trailingIconsCount": trailingIconsCount,
							"--leading-icons-count": leadingIconsCount,
							"--trailing-icons-count": trailingIconsCount,
						},
						...divProps.style,
					} as React.CSSProperties
				}
			>
				{leadingIcons ?? null}
				{children}
				{trailingIcons ?? null}
			</div>
		);
	},
);

export type InputIconGroupProps = {
	icons?: JSX.Element[] | undefined;
	iconPosition: "leading" | "trailing";
} & Omit<ComponentPropsWithRef<"div">, "children">;

export const InputIconGroup = forwardRef<HTMLDivElement, InputIconGroupProps>(
	function InputIconGroup(
		{ icons = [], iconPosition, ...divProps },
		forwardedRef,
	) {
		const setLeadingIconsCount = useContext(LeadingIconsCountDispatchContext);
		const setTrailingIconsCount = useContext(TrailingIconsCountDispatchContext);
		const isInAField = useContext(IsInAFieldContext);
		if (!isInAField) {
			throw new Error("InputIconGroup must be used within a Field component.");
		}

		useEffect(() => {
			if (iconPosition === "leading") {
				setLeadingIconsCount(icons.length);
			} else {
				setTrailingIconsCount(icons.length);
			}
		}, [icons, iconPosition, setLeadingIconsCount, setTrailingIconsCount]);

		return icons.length > 0 ? (
			<div {...divProps} ref={forwardedRef}>
				{icons}
			</div>
		) : null;
	},
);

export type ControlProps = {
	asChild?: boolean;
} & ComponentPropsWithRef<"input">;

export const Control = forwardRef<HTMLInputElement, ControlProps>(
	function Control({ asChild, children, ...inputProps }, forwardedRef) {
		const id = useContext(IdContext);
		const fieldsetId = useContext(FieldsetIdContext);
		const name = useContext(NameContext);
		const isRequired = useContext(RequiredContext);
		const hasErrorMessage = useContext(HasErrorMessageContext);
		const hasHelpTextMessage = useContext(HasHelpTextMessageContext);
		const hasHelpTextMessageInFieldset = useContext(
			HasHelpTextMessageInFieldsetContext,
		);
		const hasErrorMessageInFieldset = useContext(
			HasErrorMessageInFieldsetContext,
		);
		const validationState = useContext(ValidationStateContext);
		const isInAField = useContext(IsInAFieldContext);
		if (!isInAField) {
			throw new Error("Control must be used within a Field component.");
		}
		const Comp = asChild ? Slot : "input";
		const describedBy = `${hasErrorMessage ? `${id}-error ` : ""}${
			hasHelpTextMessage ? `${id}-help-text ` : ""
		}${hasErrorMessageInFieldset ? `${fieldsetId}-error ` : ""}${
			hasHelpTextMessageInFieldset ? `${fieldsetId}-help-text` : ""
		}`.trim();
		return (
			<Comp
				id={id}
				required={isRequired}
				aria-invalid={stateIsInvalid(validationState)}
				aria-describedby={describedBy !== "" ? describedBy : undefined}
				aria-labelledby={`${id}-label`}
				name={name}
				{...inputProps}
				ref={forwardedRef}
			>
				{children}
			</Comp>
		);
	},
);

function stateIsInvalid(
	validationState: ErrorStateValues | ErrorStateValues[],
) {
	if (Array.isArray(validationState)) {
		return validationState.some((state) => state.validity === "invalid");
	}
	return validationState.validity === "invalid";
}

function stateIsValid(validationState: ErrorStateValues | ErrorStateValues[]) {
	if (Array.isArray(validationState)) {
		return validationState.every((state) => state.validity === "valid");
	}
	return validationState.validity === "valid";
}
