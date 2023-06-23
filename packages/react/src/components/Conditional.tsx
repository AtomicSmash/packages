import { Slot } from "@radix-ui/react-slot";
import {
	ComponentPropsWithRef,
	createContext,
	forwardRef,
	useContext,
	useEffect,
} from "react";
import { twMerge } from "tailwind-merge";
import { useOptionalExternalState } from "../hooks/useOptionalExternalState";
import { Pretty } from "../shared/types";

const TypeContext = createContext<"render" | "display">("display");
const HideClassContext = createContext("hidden");
const IsShowingContext = createContext(false);
const SetIsShowingContext = createContext<
	React.Dispatch<React.SetStateAction<boolean>>
	// eslint-disable-next-line @typescript-eslint/no-empty-function
>(() => {});

export type RootProps = Pretty<
	{
		type?: "render" | "display";
		hideClass?: string;
		children: React.ReactNode;
	} & (
		| {
				defaultShowState?: boolean;
				externalState?:
					| [boolean, React.Dispatch<React.SetStateAction<boolean>>]
					| null;
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
		externalState === null ? defaultShowState : externalState,
	);
	useEffect(() => {
		if (condition !== undefined) {
			setIsShowingField(condition);
		}
	}, [condition]);
	return (
		<TypeContext.Provider value={type}>
			<HideClassContext.Provider value={hideClass}>
				<IsShowingContext.Provider value={isShowingField}>
					<SetIsShowingContext.Provider value={setIsShowingField}>
						{children}
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
	function Trigger({ asChild, className, children }, forwardedRef) {
		const Comp = asChild ? Slot : "button";
		const isShowingField = useContext(IsShowingContext);
		const setIsShowingField = useContext(SetIsShowingContext);
		return (
			<Comp
				ref={forwardedRef}
				type="button"
				className={twMerge("group/conditional_input", className)}
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
				className={twMerge(
					!isShowingField && conditionalType === "display" ? hideClass : "",
					divProps.className,
				)}
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
				className={twMerge(
					isShowingField && conditionalType === "display" ? hideClass : "",
					divProps.className,
				)}
				ref={forwardedRef}
			>
				{children}
			</Comp>
		);
	},
);
