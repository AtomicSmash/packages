import { render, screen } from "@testing-library/react";
import { ComponentPropsWithRef } from "react";
import { expect, it, describe } from "vitest";
import * as FormFields from "./FormFields";

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

describe("Tests for the Form Fields components", () => {
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
		expect(input).toHaveAttribute("type", "text");
		expect(input).toHaveAttribute("aria-invalid", "false");
		expect(input).toHaveAttribute(
			"aria-describedby",
			`${fieldId}-help-text ${fieldsetId}-help-text`,
		);
		expect(input).toHaveAttribute("aria-labelledby", `${fieldId}-label`);
		expect(input).toHaveAttribute("aria-invalid", "false");
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
});
