export function outputMessage(extraMessage?: string) {
	console.log(`Hello this is a console log. ${extraMessage ?? ""}`);
}
