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
import { useOptionalExternalState } from "../hooks/useOptionalExternalState";
import { displayErrorMessage } from "../shared/forms";

const IdContext = createContext("");
const NameContext = createContext("");
const RequiredContext = createContext(false);
const HasErrorMessageContext = createContext(false);
const HasErrorMessageDispatchContext = createContext<
	React.Dispatch<React.SetStateAction<boolean>>
	// eslint-disable-next-line @typescript-eslint/no-empty-function
>(() => {});
const ValidationStateContext = createContext<
	ErrorStateValues | ErrorStateValues[]
>({
	validity: null,
});
const ControlClassNameContext = createContext("");

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
		return (
			<IdContext.Provider value={id}>
				<RequiredContext.Provider value={isRequired}>
					<HasErrorMessageContext.Provider value={hasErrorMessage}>
						<HasErrorMessageDispatchContext.Provider value={setHasErrorMessage}>
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
						</HasErrorMessageDispatchContext.Provider>
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
	function Legend({ asChild, className, children }, forwardedRef) {
		const Comp = asChild ? Slot : "legend";
		return (
			<Comp className={twMerge(`p-0 mb-5`, className)} ref={forwardedRef}>
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
		isRequired = false,
		validationState = { validity: null },
		children,
		...divProps
	},
	forwardedRef,
) {
	const generatedId = useId();
	const id = uniqueId !== undefined ? uniqueId : generatedId;
	const [hasErrorMessage, setHasErrorMessage] = useState(false);

	return (
		<IdContext.Provider value={id}>
			<NameContext.Provider value={name}>
				<RequiredContext.Provider value={isRequired}>
					<HasErrorMessageContext.Provider value={hasErrorMessage}>
						<HasErrorMessageDispatchContext.Provider value={setHasErrorMessage}>
							<ValidationStateContext.Provider value={validationState}>
								<div
									{...divProps}
									className={twMerge("group/form_field", divProps.className)}
									ref={forwardedRef}
								>
									{children}
								</div>
							</ValidationStateContext.Provider>
						</HasErrorMessageDispatchContext.Provider>
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
		{ asChild, className, requiredClassName, optionalClassName },
		forwardedRef,
	) {
		const isRequired = useContext(RequiredContext);
		const Comp = asChild ? Slot : "span";
		if (isRequired) {
			return (
				<Comp
					className={twMerge(className, requiredClassName)}
					ref={forwardedRef}
				>
					(required)
				</Comp>
			);
		}
		return (
			<Comp
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
	leadingIcons?: JSX.Element[] | undefined;
	trailingIcons?: JSX.Element[] | undefined;
	validIcon: JSX.Element;
	invalidIcon: JSX.Element;
} & ComponentPropsWithRef<"div">;
export const InputWrapper = forwardRef<HTMLDivElement, InputWrapperProps>(
	function InputWrapper(
		{
			leadingIcons = [],
			trailingIcons = [],
			children,
			className,
			validIcon,
			invalidIcon,
			...divProps
		},
		forwardedRef,
	) {
		const validationState = useContext(ValidationStateContext);

		if (stateIsInvalid(validationState)) {
			trailingIcons = [...trailingIcons, invalidIcon];
		} else if (stateIsValid(validationState)) {
			trailingIcons = [...trailingIcons, validIcon];
		}
		return (
			<div
				{...divProps}
				ref={forwardedRef}
				style={
					{
						...{
							"--inputPadding": "0.875rem",
							"--iconGap": "0.5rem",
							"--leadingIconsCount": leadingIcons.length,
							"--trailingIconsCount": trailingIcons.length,
							"--leadingIconsStartOffset": "0px", // calc functions must have units for zeros
							"--trailingIconsStartOffset": "0px", // calc functions must have units for zeros
							"--leadingIconsEndOffset": "0px", // calc functions must have units for zeros
							"--trailingIconsEndOffset": "0px", // calc functions must have units for zeros
						},
						...divProps.style,
					} as React.CSSProperties
				}
				className={`field__input-wrapper relative${
					leadingIcons.length > 0
						? " field__input-wrapper--has-leading-icon"
						: ""
				}${
					trailingIcons.length > 0
						? " field__input-wrapper--has-trailing-icon"
						: ""
				}`}
			>
				{leadingIcons.length > 0 ? (
					<div className="field__icon absolute top-1/2 -translate-y-1/2 h-6 flex items-center gap-[--iconGap] field__icon--leading left-[calc(var(--inputPadding)+var(--leadingIconsStartOffset))]">
						{leadingIcons}
					</div>
				) : null}
				<ControlClassNameContext.Provider
					value={twMerge(
						"p-[--inputPadding] pl-[calc(var(--inputPadding)_+_var(--leadingIconsStartOffset)_+_var(--leadingIconsEndOffset)_+_((var(--iconSize)_+_var(--iconGap))_*_var(--leadingIconsCount)))] pr-[calc(var(--inputPadding)_+_var(--trailingIconsStartOffset)+_var(--trailingIconsEndOffset)_+_((var(--iconSize)_+_var(--iconGap))_*_var(--trailingIconsCount)))]",
						className,
					)}
				>
					{children}
				</ControlClassNameContext.Provider>
				{trailingIcons.length > 0 ? (
					<div className="field__icon absolute top-1/2 -translate-y-1/2 h-6 flex items-center gap-[--iconGap] field__icon--trailing right-[calc(var(--inputPadding)+var(--trailingIconsEndOffset))] peer-[.select-wrapper]:right-[calc(var(--inputPadding)_+_1.5rem)]">
						{trailingIcons}
					</div>
				) : null}
			</div>
		);
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
		const validationState = useContext(ValidationStateContext);
		const controlClassName = useContext(ControlClassNameContext);
		const Comp = asChild ? Slot : "input";
		return (
			<Comp
				id={id}
				required={isRequired}
				aria-invalid={stateIsInvalid(validationState)}
				aria-describedby={`${
					hasErrorMessage ? `${id}-error ` : ""
				}${id}-help-text`}
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

const ConditionalIsShowingContext = createContext(false);
const ConditionalSetIsShowingContext = createContext<
	React.Dispatch<React.SetStateAction<boolean>>
	// eslint-disable-next-line @typescript-eslint/no-empty-function
>(() => {});

export type ConditionalProps = {
	defaultShowState?: boolean;
	externalState?:
		| [boolean, React.Dispatch<React.SetStateAction<boolean>>]
		| null;
	children: React.ReactNode;
};
export const Conditional = forwardRef<HTMLElement, ConditionalProps>(
	function Conditional(
		{ defaultShowState = false, externalState = null, children },
		forwardedRef,
	) {
		const [isShowingField, setIsShowingField] = useOptionalExternalState(
			externalState === null ? defaultShowState : externalState,
		);
		return (
			<ConditionalIsShowingContext.Provider value={isShowingField}>
				<ConditionalSetIsShowingContext.Provider value={setIsShowingField}>
					{children}
				</ConditionalSetIsShowingContext.Provider>
			</ConditionalIsShowingContext.Provider>
		);
	},
);

export type ConditionalTriggerProps = {
	asChild?: boolean;
	children?:
		| (({ isShowingField }: { isShowingField: boolean }) => React.ReactNode)
		| React.ReactNode;
} & Omit<ComponentPropsWithRef<"button">, "children">;
export const ConditionalTrigger = forwardRef<
	HTMLButtonElement,
	ConditionalTriggerProps
>(function ConditionalTrigger({ asChild, className, children }, forwardedRef) {
	const Comp = asChild ? Slot : "button";
	const isShowingField = useContext(ConditionalIsShowingContext);
	const setIsShowingField = useContext(ConditionalSetIsShowingContext);
	return (
		<Comp
			ref={forwardedRef}
			type="button"
			className={twMerge("group/conditional_input", className)}
			onClick={() => setIsShowingField(!isShowingField)}
		>
			{typeof children === "function" ? children({ isShowingField }) : children}
		</Comp>
	);
});

export type ConditionalContentProps = {
	asChild?: boolean;
	children?:
		| (({ isShowingField }: { isShowingField: boolean }) => React.ReactNode)
		| React.ReactNode;
} & Omit<ComponentPropsWithRef<"div">, "children">;
export const ConditionalContent = forwardRef<
	HTMLDivElement,
	ConditionalContentProps
>(function ConditionalContent({ asChild, className, children }, forwardedRef) {
	const Comp = asChild ? Slot : "div";
	const isShowingField = useContext(ConditionalIsShowingContext);
	return (
		<Comp
			ref={forwardedRef}
			className={twMerge(isShowingField ? "show" : "hidden", className)}
		>
			{typeof children === "function" ? children({ isShowingField }) : children}
		</Comp>
	);
});

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
