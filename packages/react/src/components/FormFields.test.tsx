import { Forms } from "@atomicsmash/react";
import { render, screen } from "@testing-library/react";
import { ComponentPropsWithRef } from "react";
import { expect, it, describe } from "vitest";

const FormFields = Forms.Components;
const combineErrorMessages = Forms.combineErrorMessages;

function LabelSuffix(spanProps: ComponentPropsWithRef<"span">) {
	return (
		<FormFields.RequiredState>
			{({ isRequired }) => {
				if (isRequired) {
					return (
						<>
							{" "}
							<span {...spanProps} className="required-classes">
								(required)
							</span>
						</>
					);
				}
				return (
					<>
						{" "}
						<span {...spanProps} className="optional-classes">
							(optional)
						</span>
					</>
				);
			}}
		</FormFields.RequiredState>
	);
}

function TestSVG() {
	return (
		<svg
			width="25"
			height="24"
			viewBox="0 0 25 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M24.7071 12.7071C25.0976 12.3166 25.0976 11.6834 24.7071 11.2929L18.3431 4.92893C17.9526 4.53841 17.3195 4.53841 16.9289 4.92893C16.5384 5.31946 16.5384 5.95262 16.9289 6.34315L22.5858 12L16.9289 17.6569C16.5384 18.0474 16.5384 18.6805 16.9289 19.0711C17.3195 19.4616 17.9526 19.4616 18.3431 19.0711L24.7071 12.7071ZM0 13H24V11H0V13Z"
				fill="currentColor"
			/>
		</svg>
	);
}
const consoleError = console.error;
describe("Tests for the Form Fields components", () => {
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
	it("allows custom data attributes on all components", () => {
		render(
			<FormFields.Fieldset data-testid="fieldset">
				<FormFields.Legend data-testid="legend">Test legend</FormFields.Legend>
				<FormFields.Field
					data-testid="field"
					name="testName"
					validationState={{
						validity: "invalid",
						messages: [{ message: "test error", errorCode: "test_error" }],
					}}
				>
					<FormFields.Label data-testid="label">
						Some label <LabelSuffix data-testid="labelSuffix" />
					</FormFields.Label>
					<FormFields.HelpText data-testid="helpTextMessage">
						Some help text for a field.
					</FormFields.HelpText>
					<FormFields.ValidationError data-testid="errorMessage" />
					<FormFields.InputWrapper
						data-testid="inputWrapper"
						leadingIcons={
							<FormFields.InputIconGroup
								data-testid="inputIconGroup"
								icons={[<div key="false-icon">false icon</div>]}
								iconPosition="leading"
							/>
						}
					>
						<FormFields.Control type="text" data-testid="input" />
					</FormFields.InputWrapper>
				</FormFields.Field>
			</FormFields.Fieldset>,
		);
		expect(screen.getByTestId("fieldset")).toBeInTheDocument();
		expect(screen.getByTestId("legend")).toBeInTheDocument();
		expect(screen.getByTestId("field")).toBeInTheDocument();
		expect(screen.getByTestId("label")).toBeInTheDocument();
		expect(screen.getByTestId("labelSuffix")).toBeInTheDocument();
		expect(screen.getByTestId("helpTextMessage")).toBeInTheDocument();
		expect(screen.getByTestId("errorMessage")).toBeInTheDocument();
		expect(screen.getByTestId("inputWrapper")).toBeInTheDocument();
		expect(screen.getByTestId("inputIconGroup")).toBeInTheDocument();
		expect(screen.getByTestId("input")).toBeInTheDocument();
	});
	it("checks default values", () => {
		render(
			<>
				<FormFields.Fieldset data-testid="fieldset">
					<FormFields.Legend data-testid="legend">
						<LabelSuffix data-testid="labelSuffixInFieldset" />
					</FormFields.Legend>
					<FormFields.HelpText data-testid="helpTextMessageInFieldset">
						Some help text for a field.
					</FormFields.HelpText>
					<FormFields.ValidationError data-testid="errorMessageInFieldsetShouldNotExist" />
					<FormFields.Field data-testid="field" name="testName">
						<FormFields.Label data-testid="label">
							<LabelSuffix data-testid="labelSuffix" />
						</FormFields.Label>
						<FormFields.HelpText data-testid="helpTextMessage">
							Some help text for a field.
						</FormFields.HelpText>
						<FormFields.ValidationError data-testid="errorMessageShouldNotExist" />
						<FormFields.InputWrapper data-testid="inputWrapper">
							<FormFields.Control data-testid="input" />
						</FormFields.InputWrapper>
					</FormFields.Field>
				</FormFields.Fieldset>
				{/* To check error ID */}
				<FormFields.Fieldset
					data-testid="fieldset2"
					validationState={{
						validity: "invalid",
						messages: [{ message: "An error.", errorCode: "test_error" }],
					}}
				>
					<FormFields.HelpText data-testid="helpTextMessageInFieldset2">
						Some help text for a field.
					</FormFields.HelpText>
					<FormFields.ValidationError data-testid="errorMessageInFieldset" />
					<FormFields.Field
						data-testid="field2"
						name="testName2"
						validationState={{
							validity: "invalid",
							messages: [{ message: "An error.", errorCode: "test_error" }],
						}}
					>
						<FormFields.HelpText data-testid="helpTextMessage2">
							Some help text for a field.
						</FormFields.HelpText>
						<FormFields.ValidationError data-testid="errorMessage" />
						<FormFields.Control data-testid="input2" />
					</FormFields.Field>
				</FormFields.Fieldset>
			</>,
		);
		const fieldset = screen.getByTestId("fieldset");
		expect(fieldset.tagName.toLowerCase()).toBe("fieldset");
		const fieldsetId = fieldset.id;
		expect(fieldsetId).not.toBe("");
		expect(fieldset).not.toHaveAttribute("class");

		const fieldsetLegend = screen.getByTestId("legend");
		expect(fieldsetLegend.tagName.toLowerCase()).toBe("legend");
		expect(fieldsetLegend).not.toHaveAttribute("class");

		const labelSuffixInFieldset = screen.getByTestId("labelSuffixInFieldset");
		// We don't check for element type and class here because the label suffix element is generated for testing
		// The exported component doesn't add any element or attributes, just a children prop with a variable.
		expect(labelSuffixInFieldset).toHaveTextContent(/optional/i);

		const fieldsetHelpText = screen.getByTestId("helpTextMessageInFieldset");
		expect(fieldsetHelpText).toHaveAttribute("id", `${fieldsetId}-help-text`);
		expect(fieldsetHelpText).not.toHaveAttribute("class");

		expect(
			screen.queryByTestId("errorMessageInFieldsetShouldNotExist"),
		).not.toBeInTheDocument();

		const field = screen.getByTestId("field");
		expect(field.tagName.toLowerCase()).toBe("div");
		const fieldId = field.getAttribute("data-field-id") ?? "";
		expect(fieldId).not.toBe("");
		expect(field).not.toHaveAttribute("class");

		const fieldLabel = screen.getByTestId("label");
		expect(fieldLabel.tagName.toLowerCase()).toBe("label");
		expect(fieldLabel).toHaveAttribute("for", fieldId);
		expect(fieldLabel).toHaveAttribute("id", `${fieldId}-label`);
		expect(fieldLabel).not.toHaveAttribute("class");

		const labelSuffix = screen.getByTestId("labelSuffix");
		expect(labelSuffix).toHaveTextContent(/optional/i);

		const fieldHelpText = screen.getByTestId("helpTextMessage");
		expect(fieldHelpText.tagName.toLowerCase()).toBe("div");
		expect(fieldHelpText).toHaveAttribute("id", `${fieldId}-help-text`);
		expect(fieldHelpText).not.toHaveAttribute("class");

		expect(
			screen.queryByTestId("errorMessageShouldNotExist"),
		).not.toBeInTheDocument();

		const inputWrapper = screen.getByTestId("inputWrapper");
		expect(inputWrapper.tagName.toLowerCase()).toBe("div");
		// TODO: enable this test when this issue is resolved:
		// https://github.com/testing-library/jest-dom/issues/280
		//
		// expect(inputWrapper).toHaveStyle({
		// 	"--leadingIconsCount": "0",
		// 	"--trailingIconsCount": "0",
		// });
		expect(inputWrapper).not.toHaveAttribute("class");

		const input = screen.getByTestId("input");
		expect(input.tagName.toLowerCase()).toBe("input");
		expect(input).toHaveAttribute("id", fieldId);
		expect(input).not.toBeRequired();
		expect(input).toHaveAttribute("aria-invalid", "false");
		expect(input).toHaveAttribute(
			"aria-describedby",
			`${fieldId}-help-text ${fieldsetId}-help-text`,
		);
		expect(input).toHaveAttribute("aria-labelledby", `${fieldId}-label`);
		expect(input).toHaveAttribute("name", "testName");
		expect(input).not.toHaveAttribute("class");

		expect(inputWrapper).toContainElement(input);

		const fieldset2 = screen.getByTestId("fieldset2");
		const fieldset2Id = fieldset2.id;
		expect(fieldset2Id).not.toBe("");

		const fieldsetError = screen.getByTestId("errorMessageInFieldset");
		expect(fieldsetError.tagName.toLowerCase()).toBe("div");
		expect(fieldsetError).toHaveAttribute("id", `${fieldset2Id}-error`);
		expect(fieldsetError).not.toHaveAttribute("class");

		const field2 = screen.getByTestId("field2");
		const field2Id = field2.getAttribute("data-field-id") ?? "";
		expect(field2Id).not.toBe("");

		const fieldError = screen.getByTestId("errorMessage");
		expect(fieldError.tagName.toLowerCase()).toBe("div");
		expect(fieldError).toHaveAttribute("id", `${field2Id}-error`);
		expect(fieldError).not.toHaveAttribute("class");

		const input2 = screen.getByTestId("input2");
		expect(input2).toHaveAttribute(
			"aria-describedby",
			`${field2Id}-error ${field2Id}-help-text ${fieldset2Id}-error ${fieldset2Id}-help-text`,
		);
	});
	it("allows users to set a custom id", () => {
		render(
			<FormFields.Fieldset data-testid="fieldset" uniqueId="test-id">
				<FormFields.Field
					name="test-name"
					data-testid="field"
					uniqueId="test-id-2"
				></FormFields.Field>
			</FormFields.Fieldset>,
		);
		expect(screen.getByTestId("fieldset").id).toBe("test-id");
		expect(screen.getByTestId("field")).toHaveAttribute(
			"data-field-id",
			"test-id-2",
		);
	});
	it("correctly sets required prop on input if set", () => {
		render(
			<>
				<FormFields.Fieldset isRequired={true}>
					<FormFields.Field name="test-name">
						<FormFields.RequiredState>
							{({ isRequired }) => {
								return (
									<div data-testid="RequiredState">
										{isRequired ? "yes" : "no"}
									</div>
								);
							}}
						</FormFields.RequiredState>
						<FormFields.Control data-testid="input" />
					</FormFields.Field>
				</FormFields.Fieldset>
				<FormFields.Field name="test-name" isRequired={true}>
					<FormFields.RequiredState>
						{({ isRequired }) => {
							return (
								<div data-testid="RequiredState2">
									{isRequired ? "yes" : "no"}
								</div>
							);
						}}
					</FormFields.RequiredState>
					<FormFields.Control data-testid="input2" />
				</FormFields.Field>
				<FormFields.Fieldset isRequired={false}>
					<FormFields.Field name="test-name">
						<FormFields.RequiredState>
							{({ isRequired }) => {
								return (
									<div data-testid="RequiredState3">
										{isRequired ? "yes" : "no"}
									</div>
								);
							}}
						</FormFields.RequiredState>
						<FormFields.Control data-testid="input3" />
					</FormFields.Field>
				</FormFields.Fieldset>
				<FormFields.Field name="test-name" isRequired={false}>
					<FormFields.RequiredState>
						{({ isRequired }) => {
							return (
								<div data-testid="RequiredState4">
									{isRequired ? "yes" : "no"}
								</div>
							);
						}}
					</FormFields.RequiredState>
					<FormFields.Control data-testid="input4" />
				</FormFields.Field>
			</>,
		);
		expect(screen.getByTestId("input")).toBeRequired();
		expect(screen.getByTestId("input2")).toBeRequired();
		expect(screen.getByTestId("input3")).not.toBeRequired();
		expect(screen.getByTestId("input4")).not.toBeRequired();
		expect(screen.getByTestId("RequiredState")).toHaveTextContent("yes");
		expect(screen.getByTestId("RequiredState2")).toHaveTextContent("yes");
		expect(screen.getByTestId("RequiredState3")).toHaveTextContent("no");
		expect(screen.getByTestId("RequiredState4")).toHaveTextContent("no");
	});
	it("correctly shows errors when the validationState prop is set", () => {
		render(
			<>
				<FormFields.Fieldset
					validationState={{
						validity: "invalid",
						messages: [{ message: "An error.", errorCode: "test_error" }],
					}}
				>
					<FormFields.ValidationState>
						{({ validationState, validationSummary }) => (
							<div
								data-testid="errorMessageManual"
								data-summary={validationSummary}
							>
								{combineErrorMessages(validationState)}
							</div>
						)}
					</FormFields.ValidationState>
					<FormFields.ValidationError data-testid="errorMessage" />
				</FormFields.Fieldset>
				<FormFields.Field
					name="testName"
					validationState={{
						validity: "invalid",
						messages: [{ message: "An error.", errorCode: "test_error" }],
					}}
				>
					<FormFields.ValidationState>
						{({ validationState, validationSummary }) => (
							<div
								data-testid="errorMessageManual2"
								data-summary={validationSummary}
							>
								{combineErrorMessages(validationState)}
							</div>
						)}
					</FormFields.ValidationState>
					<FormFields.ValidationError data-testid="errorMessage2" />
				</FormFields.Field>
				<FormFields.Fieldset
					validationState={[
						{
							validity: "invalid",
							messages: [{ message: "An error.", errorCode: "test_error" }],
						},
						{
							validity: "invalid",
							messages: [
								{ message: "Another error.", errorCode: "test_error" },
							],
						},
						{
							validity: "valid",
						},
					]}
				>
					<FormFields.ValidationState>
						{({ validationState, validationSummary }) => (
							<div
								data-testid="errorMessageManual3"
								data-summary={validationSummary}
							>
								{combineErrorMessages(validationState)}
							</div>
						)}
					</FormFields.ValidationState>
					<FormFields.ValidationError data-testid="errorMessage3" />
				</FormFields.Fieldset>
				<FormFields.Field
					name="testName"
					validationState={[
						{
							validity: "invalid",
							messages: [{ message: "An error.", errorCode: "test_error" }],
						},
						{
							validity: "invalid",
							messages: [
								{ message: "Another error.", errorCode: "test_error" },
							],
						},
						{
							validity: "valid",
						},
					]}
				>
					<FormFields.ValidationState>
						{({ validationState, validationSummary }) => (
							<div
								data-testid="errorMessageManual4"
								data-summary={validationSummary}
							>
								{combineErrorMessages(validationState)}
							</div>
						)}
					</FormFields.ValidationState>
					<FormFields.ValidationError data-testid="errorMessage4" />
				</FormFields.Field>
			</>,
		);
		expect(screen.getByTestId("errorMessage")).toHaveTextContent("An error.");
		expect(screen.getByTestId("errorMessageManual")).toHaveTextContent(
			"An error.",
		);
		expect(screen.getByTestId("errorMessage2")).toHaveTextContent("An error.");
		expect(screen.getByTestId("errorMessageManual2")).toHaveTextContent(
			"An error.",
		);
		expect(screen.getByTestId("errorMessage3")).toHaveTextContent(
			"An error, Another error.",
		);
		expect(screen.getByTestId("errorMessageManual3")).toHaveTextContent(
			"An error, Another error.",
		);
		expect(screen.getByTestId("errorMessage4")).toHaveTextContent(
			"An error, Another error.",
		);
		expect(screen.getByTestId("errorMessageManual4")).toHaveTextContent(
			"An error, Another error.",
		);
	});
	it("throws an error if rendering a legend outside of a fieldset component", () => {
		expect(() =>
			render(<FormFields.Legend>Test legend</FormFields.Legend>),
		).toThrow("Legend must be used within a Fieldset component.");
	});
	it("throws an error if rendering a label outside of a field component", () => {
		expect(() =>
			render(<FormFields.Label>Test label</FormFields.Label>),
		).toThrow("Label must be used within a Field component.");
	});
	it("throws an error if rendering a HelpText outside of a field or fieldset component", () => {
		expect(() =>
			render(<FormFields.HelpText>Test help text</FormFields.HelpText>),
		).toThrow(
			"HelpText must be used within a Field component or a Fieldset component.",
		);
	});
	it("throws an error if rendering a ValidationError outside of a field or fieldset component", () => {
		expect(() => render(<FormFields.ValidationError />)).toThrow(
			"ValidationError must be used within a Field component or a Fieldset component.",
		);
		expect(() =>
			render(
				<FormFields.Fieldset>
					<FormFields.ValidationError />
				</FormFields.Fieldset>,
			),
		).not.toThrow();
		expect(() =>
			render(
				<FormFields.Field name="test">
					<FormFields.ValidationError />
				</FormFields.Field>,
			),
		).not.toThrow();
	});
	it("correctly ignores duplicate error messages", () => {
		render(
			<FormFields.Field
				name="test"
				validationState={{
					validity: "invalid",
					messages: [
						{ message: "An error", errorCode: "code1" },
						{ message: "An error", errorCode: "code2" },
						{ message: "An error", errorCode: "code3" },
					],
				}}
			>
				<FormFields.ValidationError data-testid="errorMessage" />
			</FormFields.Field>,
		);
		const errorMessage = screen.getByTestId("errorMessage");
		expect(errorMessage).toHaveTextContent(/^An error$/);
	});
	it("correctly strips full stops when combining multiple error messages", () => {
		render(
			<FormFields.Field
				name="test"
				validationState={{
					validity: "invalid",
					messages: [
						{ message: "An error.", errorCode: "code1" },
						{ message: "Another error.", errorCode: "code2" },
						{ message: "A third error.", errorCode: "code3" },
					],
				}}
			>
				<FormFields.ValidationError data-testid="errorMessage" />
			</FormFields.Field>,
		);
		const errorMessage = screen.getByTestId("errorMessage");
		expect(errorMessage).toHaveTextContent(
			"An error, Another error, A third error.",
		);
	});
	it("throws an error if rendering a InputWrapper outside of a field component", () => {
		expect(() => render(<FormFields.InputWrapper />)).toThrow(
			"InputWrapper must be used within a Field component.",
		);
	});
	it("throws an error if rendering a InputIconGroup outside of a field component", () => {
		expect(() =>
			render(<FormFields.InputIconGroup iconPosition="leading" />),
		).toThrow("InputIconGroup must be used within a Field component.");
	});
	it("correctly counts and renders icons if set on input wrapper", () => {
		render(
			<FormFields.Field name="test-name">
				<FormFields.InputWrapper
					data-testid="inputWrapper"
					leadingIcons={
						<FormFields.InputIconGroup
							iconPosition="leading"
							data-testid="leadingIcons"
							icons={[<TestSVG key={"test-svg"} />]}
						/>
					}
					trailingIcons={
						<FormFields.InputIconGroup
							iconPosition="trailing"
							data-testid="trailingIcons"
							icons={[
								<TestSVG key={"test-svg"} />,
								<TestSVG key={"test-svg-2"} />,
							]}
						/>
					}
				></FormFields.InputWrapper>
			</FormFields.Field>,
		);
		const inputWrapper = screen.getByTestId("inputWrapper");
		expect(inputWrapper).toBeInTheDocument();
		// TODO: enable this test when this issue is resolved:
		// https://github.com/testing-library/jest-dom/issues/280
		//
		// expect(inputWrapper).toHaveStyle({
		// 	"--leadingIconsCount": "1",
		// 	"--trailingIconsCount": "2",
		// });
		expect(screen.getByTestId("leadingIcons")).toBeInTheDocument();
		expect(screen.getByTestId("trailingIcons")).toBeInTheDocument();
	});
	it("throws an error if rendering a Control outside of a field component", () => {
		expect(() => render(<FormFields.Control />)).toThrow(
			"Control must be used within a Field component.",
		);
	});
	it("correctly renders a control element", () => {
		render(
			<>
				<FormFields.Field name="test-name">
					<FormFields.Control data-testid="input" type="email" />
				</FormFields.Field>
				<FormFields.Field name="test-name-2">
					<FormFields.Control asChild>
						<textarea data-testid="textarea"></textarea>
					</FormFields.Control>
				</FormFields.Field>
			</>,
		);
		const emailInput = screen.getByTestId("input");
		expect(emailInput).toBeInTheDocument();
		expect(emailInput).toHaveAttribute("type", "email");
		const textarea = screen.getByTestId("textarea");
		expect(textarea).toBeInTheDocument();
		expect(textarea.tagName.toLowerCase()).toBe("textarea");
		expect(textarea).toHaveAttribute("aria-invalid", "false");
		expect(textarea).toHaveAttribute("name", "test-name-2");
	});
	it("correctly renders elements asChild", () => {
		render(
			<FormFields.Fieldset
				data-testid="fieldset"
				validationState={{
					validity: "invalid",
					messages: [{ message: "An error.", errorCode: "test_error" }],
				}}
			>
				<FormFields.Legend data-testid="legend" asChild>
					<div>
						Test legend <LabelSuffix data-testid="labelSuffixInFieldset" />
					</div>
				</FormFields.Legend>
				<FormFields.HelpText data-testid="helpTextMessageInFieldset">
					Some help text for a field.
				</FormFields.HelpText>
				<FormFields.ValidationError data-testid="errorMessageInFieldset" />
				<FormFields.Field
					data-testid="field"
					name="testName"
					validationState={{
						validity: "invalid",
						messages: [{ message: "An error.", errorCode: "test_error" }],
					}}
				>
					<FormFields.Label data-testid="label" asChild>
						<div>
							Test label <LabelSuffix data-testid="labelSuffix" />
						</div>
					</FormFields.Label>
					<FormFields.HelpText data-testid="helpTextMessage" asChild>
						<section>Some help text for a field.</section>
					</FormFields.HelpText>
					<FormFields.ValidationError data-testid="errorMessage" asChild>
						{(errorString) => <section>{errorString}</section>}
					</FormFields.ValidationError>
					<FormFields.InputWrapper data-testid="inputWrapper">
						<FormFields.Control data-testid="textarea" asChild>
							<textarea></textarea>
						</FormFields.Control>
					</FormFields.InputWrapper>
				</FormFields.Field>
			</FormFields.Fieldset>,
		);
		const legend = screen.getByTestId("legend");
		expect(legend.tagName.toLowerCase()).toBe("div");
		const label = screen.getByTestId("label");
		expect(label.tagName.toLowerCase()).toBe("div");
		const helpTextMessage = screen.getByTestId("helpTextMessage");
		expect(helpTextMessage.tagName.toLowerCase()).toBe("section");
		const errorMessage = screen.getByTestId("errorMessage");
		expect(errorMessage.tagName.toLowerCase()).toBe("section");
		const textarea = screen.getByTestId("textarea");
		expect(textarea.tagName.toLowerCase()).toBe("textarea");
	});
});
