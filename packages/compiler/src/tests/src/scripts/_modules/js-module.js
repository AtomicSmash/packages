/**
 * Test function
 * @param {string|undefined} extraMessage
 */
export function outputMessage(extraMessage = undefined) {
	console.log(`Hello this is a console log. ${extraMessage ?? ""}`);
}
