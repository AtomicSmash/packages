import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";

const isExternalStateTuple = <State>(
	externalOrInitialState:
		| [State, Dispatch<SetStateAction<State>>]
		| State
		| (() => State),
): externalOrInitialState is [State, Dispatch<SetStateAction<State>>] =>
	Array.isArray(externalOrInitialState) &&
	externalOrInitialState.length === 2 &&
	typeof externalOrInitialState[1] === "function";

/**
 * This hook allows you to set up a useState that optionally accepts an external state to use instead.
 *
 * This means you can use it when building a component to allow the component to control its own state,
 * or for you to pass in your own useState from the parent component if you need to lift the state
 * higher in the component tree.
 * @param externalOrInitialState This parameter can be passed either a state tuple as returned by useState OR the default value to be used by the internal useState.
 * @returns The external state tuple if passed in via parameter, otherwise a state tuple as returned by useState.
 * @example
 * ```
 * function ChildComponent({
 *   externalState = null,
 *   defaultShowState = false,
 * }: {
 *   externalState:
 *     | [boolean, React.Dispatch<React.SetStateAction<boolean>>]
 *     | null;
 *   defaultShowState: boolean;
 * }) {
 *   const [isShowingText, setIsShowingText] = useOptionalExternalState(
 *     externalState ?? defaultShowState
 *   );
 *   if (isShowingText) {
 *     return <p>This is shown</p>;
 *   }
 *   return null;
 * }
 * function ParentComponent() {
 *   const externalState = useState(true);
 *   return <ChildComponent externalState={externalState} />; // returns <p>This is shown</p>
 * }
 * function ParentComponent2() {
 *   return <ChildComponent defaultShowState={true} />; // returns <p>This is shown</p>
 * }
 * ```
 */
export function useOptionalExternalState<State = undefined>(
	externalOrInitialState:
		| [State, Dispatch<SetStateAction<State>>]
		| State
		| (() => State),
): [State, Dispatch<SetStateAction<State>>] {
	// @ts-expect-error externalOrInitialState contains an extra type, but if that's the case, we don't return internalState, so this is fine.
	const internalState = useState<State>(externalOrInitialState);
	if (isExternalStateTuple(externalOrInitialState)) {
		return externalOrInitialState;
	}
	return internalState;
}
