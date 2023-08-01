import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, describe, it } from "vitest";
import * as Conditional from "./Conditional";

const defaultCSS = `.hidden { display: none };`;

const consoleError = console.error;
describe("Tests for the Conditional components", () => {
	beforeAll(() => {
		console.error = (message: string) => {
			if (message.includes("Consider adding an error boundary")) {
				return;
			}
			return message;
		};
	});
	afterAll(() => {
		console.error = consoleError;
	});
	it("works with defaults", async () => {
		const user = userEvent.setup();
		render(
			<>
				<style>{defaultCSS}</style>
				<Conditional.Root>
					<Conditional.Trigger>Press me.</Conditional.Trigger>
					<Conditional.TrueContent>
						<div>This content will show if the conditional is true.</div>
					</Conditional.TrueContent>
					<Conditional.FalseContent>
						<div>This content will show if the conditional is false.</div>
					</Conditional.FalseContent>
				</Conditional.Root>
			</>,
		);
		const button = screen.getByText("Press me.");
		expect(button).toBeInTheDocument();
		expect(button).toBeVisible();

		const TrueContent = screen.getByText(
			"This content will show if the conditional is true.",
		);
		const FalseContent = screen.getByText(
			"This content will show if the conditional is false.",
		);
		expect(TrueContent).toBeInTheDocument();
		expect(TrueContent).not.toBeVisible();
		expect(FalseContent).toBeInTheDocument();
		expect(FalseContent).toBeVisible();

		await user.click(button);

		expect(TrueContent).toBeInTheDocument();
		expect(TrueContent).toBeVisible();
		expect(FalseContent).toBeInTheDocument();
		expect(FalseContent).not.toBeVisible();
	});
	it("works with type display", async () => {
		const user = userEvent.setup();
		render(
			<>
				<style>{defaultCSS}</style>
				<Conditional.Root type="display">
					<Conditional.Trigger>Press me.</Conditional.Trigger>
					<Conditional.TrueContent>
						<div>This content will show if the conditional is true.</div>
					</Conditional.TrueContent>
					<Conditional.FalseContent>
						<div>This content will show if the conditional is false.</div>
					</Conditional.FalseContent>
				</Conditional.Root>
			</>,
		);
		const button = screen.getByText("Press me.");
		expect(button).toBeInTheDocument();
		expect(button).toBeVisible();

		const TrueContent = screen.getByText(
			"This content will show if the conditional is true.",
		);
		const FalseContent = screen.getByText(
			"This content will show if the conditional is false.",
		);
		expect(TrueContent).toBeInTheDocument();
		expect(TrueContent).not.toBeVisible();
		expect(FalseContent).toBeInTheDocument();
		expect(FalseContent).toBeVisible();

		await user.click(button);

		expect(TrueContent).toBeInTheDocument();
		expect(TrueContent).toBeVisible();
		expect(FalseContent).toBeInTheDocument();
		expect(FalseContent).not.toBeVisible();
	});
	it("works with type render", async () => {
		const user = userEvent.setup();
		render(
			<>
				<style>{defaultCSS}</style>
				<Conditional.Root type="render">
					<Conditional.Trigger>Press me.</Conditional.Trigger>
					<Conditional.TrueContent>
						<div>This content will show if the conditional is true.</div>
					</Conditional.TrueContent>
					<Conditional.FalseContent>
						<div>This content will show if the conditional is false.</div>
					</Conditional.FalseContent>
				</Conditional.Root>
			</>,
		);
		const button = screen.getByText("Press me.");
		expect(button).toBeInTheDocument();
		expect(button).toBeVisible();

		const TrueContent = screen.queryByText(
			"This content will show if the conditional is true.",
		);
		const FalseContent = screen.queryByText(
			"This content will show if the conditional is false.",
		);
		expect(TrueContent).not.toBeInTheDocument();
		expect(FalseContent).toBeInTheDocument();
		expect(FalseContent).toBeVisible();

		await user.click(button);

		const TrueContent2 = screen.queryByText(
			"This content will show if the conditional is true.",
		);
		const FalseContent2 = screen.queryByText(
			"This content will show if the conditional is false.",
		);

		expect(TrueContent2).toBeInTheDocument();
		expect(TrueContent2).toBeVisible();
		expect(FalseContent2).not.toBeInTheDocument();
	});
	it("works with defaultShowState true", async () => {
		const user = userEvent.setup();
		render(
			<>
				<style>{defaultCSS}</style>
				<Conditional.Root defaultShowState={true}>
					<Conditional.Trigger>Press me.</Conditional.Trigger>
					<Conditional.TrueContent>
						<div>This content will show if the conditional is true.</div>
					</Conditional.TrueContent>
					<Conditional.FalseContent>
						<div>This content will show if the conditional is false.</div>
					</Conditional.FalseContent>
				</Conditional.Root>
			</>,
		);
		const button = screen.getByText("Press me.");
		expect(button).toBeInTheDocument();
		expect(button).toBeVisible();

		const TrueContent = screen.getByText(
			"This content will show if the conditional is true.",
		);
		const FalseContent = screen.getByText(
			"This content will show if the conditional is false.",
		);
		expect(TrueContent).toBeInTheDocument();
		expect(TrueContent).toBeVisible();
		expect(FalseContent).toBeInTheDocument();
		expect(FalseContent).not.toBeVisible();

		await user.click(button);

		expect(TrueContent).toBeInTheDocument();
		expect(TrueContent).not.toBeVisible();
		expect(FalseContent).toBeInTheDocument();
		expect(FalseContent).toBeVisible();
	});
	it("works with different hideClass", async () => {
		const user = userEvent.setup();
		render(
			<>
				<style>{`.hide-this-please { display: none };`}</style>
				<Conditional.Root hideClass="hide-this-please">
					<Conditional.Trigger>Press me.</Conditional.Trigger>
					<Conditional.TrueContent>
						<div>This content will show if the conditional is true.</div>
					</Conditional.TrueContent>
					<Conditional.FalseContent>
						<div>This content will show if the conditional is false.</div>
					</Conditional.FalseContent>
				</Conditional.Root>
			</>,
		);
		const button = screen.getByText("Press me.");
		expect(button).toBeInTheDocument();
		expect(button).toBeVisible();

		const TrueContent = screen.getByText(
			"This content will show if the conditional is true.",
		);
		const FalseContent = screen.getByText(
			"This content will show if the conditional is false.",
		);
		expect(TrueContent).toBeInTheDocument();
		expect(TrueContent).not.toBeVisible();
		expect(FalseContent).toBeInTheDocument();
		expect(FalseContent).toBeVisible();

		await user.click(button);

		expect(TrueContent).toBeInTheDocument();
		expect(TrueContent).toBeVisible();
		expect(FalseContent).toBeInTheDocument();
		expect(FalseContent).not.toBeVisible();
	});
	it("works with externalState", async () => {
		const user = userEvent.setup();
		function ConditionalWrapper() {
			const externalState = useState(false);
			const [shouldShowConditional, setShouldShowConditional] = externalState;

			return (
				<>
					<style>{defaultCSS}</style>
					<button
						onClick={() => setShouldShowConditional(!shouldShowConditional)}
					>
						Press me.
					</button>
					<Conditional.Root externalState={externalState}>
						<Conditional.TrueContent>
							<div>This content will show if the conditional is true.</div>
						</Conditional.TrueContent>
						<Conditional.FalseContent>
							<div>This content will show if the conditional is false.</div>
						</Conditional.FalseContent>
					</Conditional.Root>
				</>
			);
		}
		render(<ConditionalWrapper />);
		const button = screen.getByText("Press me.");
		expect(button).toBeInTheDocument();
		expect(button).toBeVisible();

		const TrueContent = screen.getByText(
			"This content will show if the conditional is true.",
		);
		const FalseContent = screen.getByText(
			"This content will show if the conditional is false.",
		);
		expect(TrueContent).toBeInTheDocument();
		expect(TrueContent).not.toBeVisible();
		expect(FalseContent).toBeInTheDocument();
		expect(FalseContent).toBeVisible();

		await user.click(button);

		expect(TrueContent).toBeInTheDocument();
		expect(TrueContent).toBeVisible();
		expect(FalseContent).toBeInTheDocument();
		expect(FalseContent).not.toBeVisible();
	});
	it("works with separate conditional", async () => {
		const user = userEvent.setup();
		function ConditionalWrapper() {
			const externalState = useState<"yes" | "no">("no");
			const [shouldShowConditional, setShouldShowConditional] = externalState;

			return (
				<>
					<style>{defaultCSS}</style>
					<button
						onClick={() =>
							setShouldShowConditional(
								shouldShowConditional === "yes" ? "no" : "yes",
							)
						}
					>
						Press me.
					</button>
					<Conditional.Root condition={shouldShowConditional === "yes"}>
						<Conditional.TrueContent>
							<div>This content will show if the conditional is true.</div>
						</Conditional.TrueContent>
						<Conditional.FalseContent>
							<div>This content will show if the conditional is false.</div>
						</Conditional.FalseContent>
					</Conditional.Root>
				</>
			);
		}
		render(<ConditionalWrapper />);
		const button = screen.getByText("Press me.");
		expect(button).toBeInTheDocument();
		expect(button).toBeVisible();

		const TrueContent = screen.getByText(
			"This content will show if the conditional is true.",
		);
		const FalseContent = screen.getByText(
			"This content will show if the conditional is false.",
		);
		expect(TrueContent).toBeInTheDocument();
		expect(TrueContent).not.toBeVisible();
		expect(FalseContent).toBeInTheDocument();
		expect(FalseContent).toBeVisible();

		await user.click(button);

		expect(TrueContent).toBeInTheDocument();
		expect(TrueContent).toBeVisible();
		expect(FalseContent).toBeInTheDocument();
		expect(FalseContent).not.toBeVisible();
	});
	it("throws an error if providing conditional with externalState", () => {
		function ConditionalWrapper() {
			const externalState = useState(false);
			const [shouldShowConditional, setShouldShowConditional] = externalState;

			return (
				<>
					<style>{defaultCSS}</style>
					<button
						onClick={() => setShouldShowConditional(!shouldShowConditional)}
					>
						Press me.
					</button>
					{/*
						We're testing if condition and externalState are used together if it throws an error. 
						Typescript will usually prevent this, but people using the component with vanilla JS wont get the same warning 
						@ts-expect-error */}
					<Conditional.Root
						condition={shouldShowConditional}
						externalState={externalState}
					>
						<Conditional.TrueContent>
							<div>This content will show if the conditional is true.</div>
						</Conditional.TrueContent>
						<Conditional.FalseContent>
							<div>This content will show if the conditional is false.</div>
						</Conditional.FalseContent>
					</Conditional.Root>
				</>
			);
		}
		expect(() => render(<ConditionalWrapper />)).toThrow(
			"You must not use the condition prop with externalState.",
		);
	});
	it("throws an error if rendering a trigger when condition prop is used in root", () => {
		expect(() =>
			render(
				<Conditional.Root condition={typeof "test" === "string"}>
					<Conditional.Trigger>Some trigger button</Conditional.Trigger>
				</Conditional.Root>,
			),
		).toThrow(
			"Rendering a trigger when using a condition will mean that the trigger does nothing. Either change the root to remove the condition or remove this trigger.",
		);
	});
});
