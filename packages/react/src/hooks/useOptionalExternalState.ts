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
