import type { ErrorStateValues } from "../shared/forms";
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
import { twMerge } from "tailwind-merge";
import { displayErrorMessage } from "../shared/forms";

export const IdContext = createContext("");
export const NameContext = createContext("");
export const RequiredContext = createContext(false);
export const HasHelpTextMessageContext = createContext(false);
export const HasHelpTextMessageDispatchContext = createContext<
	React.Dispatch<React.SetStateAction<boolean>>
	// eslint-disable-next-line @typescript-eslint/no-empty-function
>(() => {});
export const HasErrorMessageContext = createContext(false);
export const HasErrorMessageDispatchContext = createContext<
	React.Dispatch<React.SetStateAction<boolean>>
	// eslint-disable-next-line @typescript-eslint/no-empty-function
>(() => {});
export const ValidationStateContext = createContext<
	ErrorStateValues | ErrorStateValues[]
>({
	validity: null,
});
export const ControlClassNameContext = createContext("");
export const LeadingIconsCountContext = createContext<number>(0);
export const TrailingIconsCountContext = createContext<number>(0);
export const LeadingIconsCountDispatchContext = createContext<
	React.Dispatch<React.SetStateAction<number>>
	// eslint-disable-next-line @typescript-eslint/no-empty-function
>(() => {});
export const TrailingIconsCountDispatchContext = createContext<
	React.Dispatch<React.SetStateAction<number>>
	// eslint-disable-next-line @typescript-eslint/no-empty-function
>(() => {});

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
			className,
			children,
			...fieldsetProps
		},
		forwardedRef,
	) {
		const generatedId = useId();
		const id = uniqueId !== undefined ? uniqueId : generatedId;
		const [hasErrorMessage, setHasErrorMessage] = useState(false);
		const [hasHelpTextMessage, setHasHelpTextMessage] = useState(false);
		return (
			<IdContext.Provider value={id}>
				<RequiredContext.Provider value={isRequired}>
					<HasErrorMessageContext.Provider value={hasErrorMessage}>
						<HasHelpTextMessageContext.Provider value={hasHelpTextMessage}>
							<HasErrorMessageDispatchContext.Provider
								value={setHasErrorMessage}
							>
								<HasHelpTextMessageDispatchContext.Provider
									value={setHasHelpTextMessage}
								>
									<ValidationStateContext.Provider value={validationState}>
										<fieldset
											className={twMerge(
												`group/fieldset p-0 m-0 border-0`,
												className,
											)}
											id={id}
											{...fieldsetProps}
											ref={forwardedRef}
										>
											{children}
										</fieldset>
									</ValidationStateContext.Provider>
								</HasHelpTextMessageDispatchContext.Provider>
							</HasErrorMessageDispatchContext.Provider>
						</HasHelpTextMessageContext.Provider>
					</HasErrorMessageContext.Provider>
				</RequiredContext.Provider>
			</IdContext.Provider>
		);
	},
);

export type LegendProps = {
	asChild?: boolean;
} & ComponentPropsWithRef<"legend">;
export const Legend = forwardRef<HTMLLegendElement, LegendProps>(
	function Legend(
		{ asChild, className, children, ...legendProps },
		forwardedRef,
	) {
		const Comp = asChild ? Slot : "legend";
		return (
			<Comp
				{...legendProps}
				className={twMerge(`p-0 mb-5`, className)}
				ref={forwardedRef}
			>
				{children}
			</Comp>
		);
	},
);

export type FieldsetContentProps = {
	asChild?: boolean;
} & ComponentPropsWithRef<"div">;
export const FieldsetContent = forwardRef<HTMLDivElement, FieldsetContentProps>(
	function FieldsetContent(
		{ asChild, className, children, ...divProps },
		forwardedRef,
	) {
		const Comp = asChild ? Slot : "div";
		return (
			<Comp
				className={twMerge(`group/fieldset_content`, className)}
				{...divProps}
				ref={forwardedRef}
			>
				{children}
			</Comp>
		);
	},
);

export type FieldProps = {
	uniqueId?: string | undefined;
	name: string;
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
	const id = uniqueId !== undefined ? uniqueId : generatedId;
	const [hasErrorMessage, setHasErrorMessage] = useState(false);
	const [hasHelpTextMessage, setHasHelpTextMessage] = useState(false);
	const isRequiredFromContext = useContext(RequiredContext);
	const [leadingIconsCount, setLeadingIconsCount] = useState<number>(0);
	const [trailingIconsCount, setTrailingIconsCount] = useState<number>(0);

	return (
		<IdContext.Provider value={id}>
			<NameContext.Provider value={name}>
				<RequiredContext.Provider
					value={isRequired === undefined ? isRequiredFromContext : isRequired}
				>
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
															className={twMerge(
																"group/form_field",
																divProps.className,
															)}
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
	);
});

export type LabelProps = {
	asChild?: boolean;
} & ComponentPropsWithRef<"label">;
export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
	{ asChild, className, children, ...labelProps },
	forwardedRef,
) {
	const Id = useContext(IdContext);
	const Comp = asChild ? Slot : "label";
	return (
		<Comp
			htmlFor={Id}
			id={`${Id}-label`}
			className={twMerge("inline-block", className)}
			{...labelProps}
			ref={forwardedRef}
		>
			{children}
		</Comp>
	);
});

export type LabelSuffixProps = {
	asChild?: boolean;
	requiredClassName?: string;
	optionalClassName?: string;
} & Omit<ComponentPropsWithRef<"div">, "children">;
export const LabelSuffix = forwardRef<HTMLSpanElement, LabelSuffixProps>(
	function LabelSuffix(
		{ asChild, className, requiredClassName, optionalClassName, ...divProps },
		forwardedRef,
	) {
		const isRequired = useContext(RequiredContext);
		const Comp = asChild ? Slot : "span";
		if (isRequired) {
			return (
				<Comp
					{...divProps}
					className={twMerge(className, requiredClassName)}
					ref={forwardedRef}
				>
					(required)
				</Comp>
			);
		}
		return (
			<Comp
				{...divProps}
				className={twMerge(className, optionalClassName)}
				ref={forwardedRef}
			>
				(optional)
			</Comp>
		);
	},
);

export type HelpTextProps = {
	asChild?: boolean;
} & ComponentPropsWithRef<"div">;
export const HelpText = forwardRef<HTMLDivElement, HelpTextProps>(
	function HelpText({ asChild, children, ...divProps }, forwardedRef) {
		const Id = useContext(IdContext);
		const Comp = asChild ? Slot : "div";
		const setHasHelpTextMessage = useContext(HasHelpTextMessageDispatchContext);
		useEffect(() => {
			setHasHelpTextMessage(true);
		}, []);
		return (
			<Comp
				id={`${Id}-help-text`}
				{...divProps}
				className={twMerge("field__help-text", divProps.className)}
				ref={forwardedRef}
			>
				{children}
			</Comp>
		);
	},
);

export type ErrorProps = {
	render?: (divProps: ComponentPropsWithRef<"div">) => JSX.Element;
} & Omit<ComponentPropsWithRef<"div">, "children">;
export const Error = forwardRef<HTMLDivElement, ErrorProps>(function Error(
	{ render, ...divProps },
	forwardedRef,
) {
	const Id = useContext(IdContext);
	const validationState = useContext(ValidationStateContext);
	const setHasErrorMessage = useContext(HasErrorMessageDispatchContext);
	const hasErrorMessage = useContext(HasErrorMessageContext);
	const className = twMerge("field__error", divProps.className);

	useEffect(() => {
		if (Array.isArray(validationState)) {
			let hasFoundError = false;
			for (const state of validationState) {
				if (state.messages !== undefined) {
					hasFoundError = true;
					break;
				}
			}
			setHasErrorMessage(hasFoundError);
		} else {
			setHasErrorMessage(validationState.messages !== undefined);
		}
	}, [setHasErrorMessage, validationState]);

	if (hasErrorMessage) {
		let children;
		if (Array.isArray(validationState)) {
			const arrayMessages: (string | undefined)[] = [];
			for (const state of validationState) {
				arrayMessages.push(displayErrorMessage(state));
			}
			const allMessages = arrayMessages.filter(
				(message): message is string => message !== undefined,
			);
			children = allMessages.join(", ");
		} else {
			children = displayErrorMessage(validationState);
		}
		if (render) {
			return render({
				children,
				id: `${Id}-error`,
				className,
				...divProps,
			});
		}
		return (
			<div
				id={`${Id}-error`}
				{...divProps}
				className={className}
				ref={forwardedRef}
			>
				{children}
			</div>
		);
	}
	return null;
});

export type InputWrapperProps = {
	leadingIcons?: JSX.Element | undefined;
	trailingIcons?: JSX.Element | undefined;
} & ComponentPropsWithRef<"div">;
export const InputWrapper = forwardRef<HTMLDivElement, InputWrapperProps>(
	function InputWrapper(
		{ leadingIcons, trailingIcons, children, className, ...divProps },
		forwardedRef,
	) {
		const leadingIconsCount = useContext(LeadingIconsCountContext);
		const trailingIconsCount = useContext(TrailingIconsCountContext);
		return (
			<div
				{...divProps}
				ref={forwardedRef}
				style={
					{
						...{
							"--inputPadding": "0.875rem",
							"--borderWidth": "2px",
							"--iconGap": "0.5rem",
							"--leadingIconsCount": leadingIconsCount,
							"--trailingIconsCount": trailingIconsCount,
							"--leadingIconsStartOffset": "0px", // calc functions must have units for zeros
							"--trailingIconsStartOffset": "0px", // calc functions must have units for zeros
							"--leadingIconsEndOffset": "0px", // calc functions must have units for zeros
							"--trailingIconsEndOffset": "0px", // calc functions must have units for zeros
						},
						...divProps.style,
					} as React.CSSProperties
				}
				className={`field__input-wrapper relative${
					leadingIconsCount > 0 ? " field__input-wrapper--has-leading-icon" : ""
				}${
					trailingIconsCount > 0
						? " field__input-wrapper--has-trailing-icon"
						: ""
				}`}
			>
				{leadingIcons ?? null}
				<ControlClassNameContext.Provider
					value={twMerge(
						"p-[--inputPadding] pl-[calc(var(--inputPadding)_+_var(--leadingIconsStartOffset)_+_var(--leadingIconsEndOffset)_+_((var(--iconSize)_+_var(--iconGap))_*_var(--leadingIconsCount)))] pr-[calc(var(--inputPadding)_+_var(--trailingIconsStartOffset)+_var(--trailingIconsEndOffset)_+_((var(--iconSize)_+_var(--iconGap))_*_var(--trailingIconsCount)))]",
						className,
					)}
				>
					{children}
				</ControlClassNameContext.Provider>
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
		{ icons = [], iconPosition, className, ...divProps },
		forwardedRef,
	) {
		const setLeadingIconsCount = useContext(LeadingIconsCountDispatchContext);
		const setTrailingIconsCount = useContext(TrailingIconsCountDispatchContext);

		useEffect(() => {
			if (iconPosition === "leading") {
				setLeadingIconsCount(icons.length);
			} else {
				setTrailingIconsCount(icons.length);
			}
		}, [icons, iconPosition]);

		return icons.length > 0 ? (
			<div
				{...divProps}
				ref={forwardedRef}
				className={twMerge(
					`field__icon absolute h-[--iconSize] top-[calc(var(--inputPadding)+var(--borderWidth))] flex items-center gap-[--iconGap] field__icon--${iconPosition} ${
						iconPosition === "leading"
							? "left-[calc(var(--inputPadding)+var(--leadingIconsStartOffset))]"
							: "right-[calc(var(--inputPadding)+var(--trailingIconsEndOffset))]"
					}`,
					className,
				)}
			>
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
		const name = useContext(NameContext);
		const isRequired = useContext(RequiredContext);
		const hasErrorMessage = useContext(HasErrorMessageContext);
		const hasHelpTextMessage = useContext(HasHelpTextMessageContext);
		const validationState = useContext(ValidationStateContext);
		const controlClassName = useContext(ControlClassNameContext);
		const Comp = asChild ? Slot : "input";
		const describedBy = `${hasErrorMessage ? `${id}-error ` : ""}${
			hasHelpTextMessage ? `${id}-help-text` : ""
		}`;
		return (
			<Comp
				id={id}
				required={isRequired}
				aria-invalid={stateIsInvalid(validationState)}
				aria-describedby={describedBy !== "" ? describedBy : undefined}
				aria-labelledby={`${id}-label`}
				name={name}
				{...inputProps}
				className={twMerge(controlClassName, inputProps.className)}
				ref={forwardedRef}
			>
				{children}
			</Comp>
		);
	},
);

export function stateIsInvalid(
	validationState: ErrorStateValues | ErrorStateValues[],
) {
	if (Array.isArray(validationState)) {
		return validationState.some((state) => state.validity === "invalid");
	}
	return validationState.validity === "invalid";
}

export function stateIsValid(
	validationState: ErrorStateValues | ErrorStateValues[],
) {
	if (Array.isArray(validationState)) {
		return validationState.every((state) => state.validity === "valid");
	}
	return validationState.validity === "valid";
}
