import { Slot } from "@radix-ui/react-slot";
import {
	ComponentPropsWithRef,
	createContext,
	forwardRef,
	useContext,
	useEffect,
} from "react";
import { useOptionalExternalState } from "../hooks/useOptionalExternalState.js";
import { Pretty } from "../shared/types.js";

const TypeContext = createContext<"render" | "display">("display");
const HideClassContext = createContext("hidden");
const IsShowingContext = createContext(false);
const SetIsShowingContext = createContext<
	React.Dispatch<React.SetStateAction<boolean>>
>(() => {
	/* empty */
});
const IsUsingCondition = createContext(false);

export type RootProps = Pretty<
	{
		children: React.ReactNode;
	} & (
		| { type?: "display"; hideClass?: string }
		| { type: "render"; hideClass?: undefined }
	) &
		(
			| {
					externalState: [
						boolean,
						React.Dispatch<React.SetStateAction<boolean>>,
					];
					defaultShowState?: never;
					condition?: never;
			  }
			| {
					externalState?: null;
					defaultShowState?: boolean;
					condition?: never;
			  }
			| {
					defaultShowState?: never;
					externalState?: never;
					condition?: boolean;
			  }
		)
>;
export function Root({
	defaultShowState = false,
	externalState = null,
	condition,
	children,
	type = "display",
	hideClass = "hidden",
}: RootProps) {
	const [isShowingField, setIsShowingField] = useOptionalExternalState(
		externalState ?? defaultShowState,
	);
	useEffect(() => {
		if (condition !== undefined) {
			setIsShowingField(condition);
		}
	}, [condition, setIsShowingField]);
	if (condition !== undefined && externalState !== null) {
		throw new Error("You must not use the condition prop with externalState.");
	}
	return (
		<TypeContext.Provider value={type}>
			<HideClassContext.Provider value={hideClass}>
				<IsShowingContext.Provider value={isShowingField}>
					<SetIsShowingContext.Provider value={setIsShowingField}>
						<IsUsingCondition.Provider value={condition !== undefined}>
							{children}
						</IsUsingCondition.Provider>
					</SetIsShowingContext.Provider>
				</IsShowingContext.Provider>
			</HideClassContext.Provider>
		</TypeContext.Provider>
	);
}

export type TriggerProps = {
	asChild?: boolean;
	children?:
		| (({ isShowingField }: { isShowingField: boolean }) => React.ReactNode)
		| React.ReactNode;
} & Omit<ComponentPropsWithRef<"button">, "children">;
export const Trigger = forwardRef<HTMLButtonElement, TriggerProps>(
	function Trigger({ asChild, className, children, ...props }, forwardedRef) {
		const Comp = asChild ? Slot : "button";
		const isShowingField = useContext(IsShowingContext);
		const setIsShowingField = useContext(SetIsShowingContext);
		const isUsingCondition = useContext(IsUsingCondition);
		if (isUsingCondition) {
			throw new Error(
				"Rendering a trigger when using a condition will mean that the trigger does nothing. Either change the root to remove the condition or remove this trigger.",
			);
		}
		return (
			<Comp
				{...props}
				ref={forwardedRef}
				type="button"
				className={`group/conditional_input${className ? ` ${className}` : ""}`}
				onClick={() => setIsShowingField(!isShowingField)}
			>
				{typeof children === "function"
					? children({ isShowingField })
					: children}
			</Comp>
		);
	},
);

export type ContentProps = {
	asChild?: boolean;
	children?: React.ReactNode;
} & Omit<ComponentPropsWithRef<"div">, "children">;
export const TrueContent = forwardRef<HTMLDivElement, ContentProps>(
	function TrueContent({ asChild, children, ...divProps }, forwardedRef) {
		const Comp = asChild ? Slot : "div";
		const isShowingField = useContext(IsShowingContext);
		const conditionalType = useContext(TypeContext);
		const hideClass = useContext(HideClassContext);
		if (!isShowingField && conditionalType === "render") {
			return null;
		}
		return (
			<Comp
				{...divProps}
				className={`${
					!isShowingField && conditionalType === "display" ? hideClass : ""
				}${divProps.className ? ` ${divProps.className}` : ""}`}
				ref={forwardedRef}
			>
				{children}
			</Comp>
		);
	},
);
export const FalseContent = forwardRef<HTMLDivElement, ContentProps>(
	function FalseContent({ asChild, children, ...divProps }, forwardedRef) {
		const Comp = asChild ? Slot : "div";
		const isShowingField = useContext(IsShowingContext);
		const conditionalType = useContext(TypeContext);
		const hideClass = useContext(HideClassContext);
		if (isShowingField && conditionalType === "render") {
			return null;
		}
		return (
			<Comp
				{...divProps}
				className={`${
					isShowingField && conditionalType === "display" ? hideClass : ""
				}${divProps.className ? ` ${divProps.className}` : ""}`}
				ref={forwardedRef}
			>
				{children}
			</Comp>
		);
	},
);
