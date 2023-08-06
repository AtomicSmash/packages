# Atomic Smash React

The @atomicsmash/react package was created to share components, hooks and other helpers between different react projects. This package should only contain items relevant to React, anything more globally useful should be packaged separately.

## Forms:

First, import the Forms group from the package.

```ts
import { Forms } from "@atomicsmash/react";
```

Now you can use the following building blocks to build accessible forms:

### `useFormValidation()`

This React Hook simplifies form validation that works best when combined with Remix and the Form components from this package, however they are not required.

It accepts 2 required parameters.

- `schema`: This is a Zod schema that programatically dictates what fields a form accepts, and what format the values must be in to be valid.
- `actionData`: This takes in any data object, but if it matches the following output type, it accepts it as a server error response and uses that as an initial output:

```ts
{
  errors: {
    formErrors: {
      message: string;
      errorCode: string;
    }[];
    fieldErrors: Record<string, {message: string;errorCode: string;}[]>
  },
  values: Record<string, string|boolean>
}
```

Return value:

The hook returns an object with some helpful state variables and methods.

- `setValidationState`: Update the error state by submitting a new value to a field. This lets you immediately update the user with errors onBlur or onChange as required.

- `updateTextField`: A shorthand for setValidationState that can be directly used as the onBlur/onChange prop on text based fields (including textarea’s and select’s)

- `updateCheckboxField`: A shorthand for setValidationState that can be directly used as the onChange prop on checkbox inputs.

- `validationErrors`: This is the error state object, it’s what you’ll use to display errors on your form fields. The object will have properties for each field (taken from the provided schema) and the value will be one of the ErrorStateValues.

- `wasSubmitted`: A variable that determines whether a form has been submitted by the user or not. Useful for showing success messages on forms that don't trigger a navigation.

- `hasErrors`: A variable that determines whether a form contains any errors. These error can come from error state or from the server.

- `isHydrated`: A variable to determine when a form has been hydrated. This allows you to disable browser validation only once the JS validation is in place.

ErrorStateValues:

The validation state returns one of three possible values:

```ts
{
	// This means the field value is invalid, and it provides some error messages to display context to a user.
	validity: "invalid";
	messages: {
		message: string;
		errorCode: string;
	}
	[];
}
{
	// this means the field value is valid
	validity: "valid";
}
{
	// This is the initial state, so you don't show errors for empty field the first time a user loads the page.
	validity: null;
}
```

Example usage:

```ts
import { Forms } from "@atomicsmash/react";
import { z } from "zod";

const formValidationSchema = z.object({
  emailAddress: z.string().email();
});
const actionData = undefined;
const { setValidationState, updateTextField, updateCheckboxField, validationErrors, wasSubmitted, hasErrors, isHydrated } = Forms.useFormValidation(formValidationSchema, actionData);
```

### Components:

This contains a bunch of components for building accessible form fields and fieldsets. It’s recommended you import these components once in your project, add styles/classnames and then re-export them for any project usage.

> **Field**:
>
> This is the main wrapper around a single form field. It forces you to set a name that is passed to the control. This is also where you would say if a field is required, pass it some validation state (matching what is returned from useFormValidation()) and optionally give it a unique id. If you don’t give it an Id, one that’s guaranteed to be unique will be generated.

> **Label**:
>
> This sets the label for the field and automatically links it to the control.

> **HelpText**:
>
> This allows you to set a piece of helper text for the user and it automatically links it to the control.

> **ValidationError**:
>
> This component automatically displays your error messages as defined in the validationState on the Field component. It also automatically hides the error if the field is valid. If it’s present, it’s automatically linked to the control.

> **InputWrapper**:
>
> This component allows you to set leading and trailing icons for a control using InputIconGroup and it automatically counts the icons and adds that count as CSS variables to allow for automatic styling.

> **InputIconGroup**:
>
> This group allows you to set a group of icons, and mark it as leading or trailing for the counter in InputWrapper.

> **Control**:
>
> This component renders the actual input / textarea / select that’s used to collect a users input. It automatically collects information from the other components around it and adds it to the input.

> **Fieldset**:
>
> This acts similar to the Field component but works for a group of fields. It can also be useful for adding single checkboxes. HelpText and ValidationError can be used in the Fieldset context, and they will be passed to each Field in the set.

> **Legend**:
>
> This allows you to add a Legend component to a Fieldset which gives the fieldset an accessible name.

> **RequiredState**:
>
> This component allows you to create a custom component which knows if a field is required or not. One common use case for this would be adding a LabelSuffix component which automatically adds (required) at the end of a label if it’s required.

> **ValidationState**:
>
> This component allows you to create a custom component which knows the current validation state. One common use case for this would be adding a style to a label or form input if the field has an error.

### Examples:

For this, there are so many possible permutations, so for the more examples, check out the automated tests for this package. Here's a basic example:

```tsx
import * as FormField from "@atomicsmash/react";
const LabelSuffix = forwardRef<HTMLSpanElement, Omit<ComponentPropsWithRef<"span">, "children">>(function LabelSuffix(props,forwardedRef) {
	return (
		<Forms.Components.RequiredState>
		{({isRequired}) => {
			if (isRequired) {
				return <>
							{" "}
							<span
								aria-hidden // We don't have to announce the label for screen readers because the input will announce it instead.
								{...props}
								ref={forwardedRef}
							>
								(required)
							</span>
						</>;
			}
			return (
					<>
						{" "}
						<span
							aria-hidden // We don't have to announce the label for screen readers because the input will announce it instead.
							{...props}
							ref={forwardedRef}
						>
							(optional)
						</span>
					</>
				);
		}}
		</Forms.Components.RequiredState>
	)
})
function ContactForm() {
	const actionData = getServerResponse(); // in Remix, this would be useActionData.
	const { validationErrors, updateTextField, isHydrated } =
		Forms.useFormValidation(formValidationSchema, actionData);
	return (
		<form method="post" noValidate={isHydrated}>
			<FormField.Field
				isRequired={true}
				name="subject"
				validationState={validationErrors.subject}
			>
				<FormField.Label>
					Subject <LabelSuffix />
				</FormField.Label>
				<FormField.ValidationError />
				<FormField.InputWrapper>
					<FormField.Control type="text" onBlur={updateTextField} />
				</FormField.InputWrapper>
			</FormField.Field>
			<FormField.Field
				isRequired={true}
				name="message"
				validationState={validationErrors.message}
			>
				<FormField.Label>
					Message <LabelSuffix />
				</FormField.Label>
				<FormField.ValidationError />
				<FormField.InputWrapper>
					<FormField.Control asChild>
						<textarea onBlur={updateTextField} />
					</FormField.Control>
				</FormField.InputWrapper>
			</FormField.Field>
		</form>
	)
}
const formValidationSchema = z.object({
	subject: z.string().trim().min(1, { "Subject is required" }),
	message: z.string().trim().min(1, { "Message is required" }),
});
```

## Conditional:

First, import the Conditional group from the package.

```ts
import { Conditional } from "@atomicsmash/react";
```

Now you are able to add conditional rendering to your components.

### Root:

There’s multiple ways to set up the conditionals, but they all start with this root. Every root accepts the following properties:

- `type`: This lets you choose between the conditional removing the content from the DOM (”render”) or just visually hiding the content (”display”). Defaults to “display”

- `hideClass`: This lets you set the className used when hiding content using the ”display” type. Defaults to ”hidden” and is ignored if type is ”render”.

- `defaultShowState`: This sets whether you want the conditional to initially show its content or not. This is ignored if externalState or condition are set.

- `externalState`: This allows you to pass state from outside the component for the component to use. This allows you to lift the state to a parent component as needed.

- `condition`: This allows you to set a condition that must be met to show the conditional.

> Note: You cannot set both condition and externalState at the same time, if you do, the component will throw an error.

### Trigger:

This lets you render a button to switch whether the conditional is showing or not showing. If this is used when condition is set on Root then it wont do anything, so it will throw an error.

### TrueContent:

This is the content that is rendered/shown if the conditional is true/showing and removed/hidden when the conditional is false.

### FalseContent:

This is the content that is rendered/shown if the conditional is false/not showing and removed/hidden when the conditional is true.

#### Examples:

For this, there are too many permutations to show everything here, so for other examples, check out the automated tests for this package.

```ts
import { Conditional } from "@atomicsmash/react";

<Conditional.Root>
	<Conditional.Trigger>Press me.</Conditional.Trigger>
	<Conditional.TrueContent>
		This content will show if the conditional is true.
	</Conditional.TrueContent>
	<Conditional.FalseContent>
		This content will show if the conditional is false.
	</Conditional.FalseContent>
</Conditional.Root>;
```

## Miscellaneous:

### `useOptionalExternalState()`

This hook can be used in the same way as useState however it’s designed to accept an optional externalState parameter. This means you can use it when building a component to allow the component to control its own state, or for you to pass in your own useState from the parent component if you need to lift the state higher in the component tree.

The hook accepts 1 parameter, either an external state tuple as returned from useState OR the initial state for useState.

Examples:

```tsx
function ChildComponent({
	externalState = null,
	defaultShowState = false,
}: {
	externalState:
		| [boolean, React.Dispatch<React.SetStateAction<boolean>>]
		| null;
	defaultShowState: boolean;
}) {
	const [isShowingText, setIsShowingText] = useOptionalExternalState(
		externalState ?? defaultShowState,
	);
	if (isShowingText) {
		return <p>This is shown</p>;
	}
	return null;
}
function ParentComponent() {
	const externalState = useState(true);
	return <ChildComponent externalState={externalState} />; // returns <p>This is shown</p>
}
function ParentComponent2() {
	return <ChildComponent defaultShowState={true} />; // returns <p>This is shown</p>
}
```
