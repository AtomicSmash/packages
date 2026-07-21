export function escapeAllCharacters(string: string) {
	const array = string.split("");
	return `\\${array.join("\\")}`;
}
export function unslash(string: string) {
	const array = string.split(`\\\\`);
	let newString = "";
	let index = 0;
	for (let piece of array) {
		while (piece.search(new RegExp("[\\\\]")) !== -1) {
			piece = piece.replace("\\", "");
		}
		newString = `${newString}${index > 0 ? "\\" : ""}${piece}`;
		index++;
	}
	return newString;
}
/**
 * This function replaced all phrases in the search value with the replace value, unless the searched value has been escaped.
 * @param string The full string.
 * @param searchValue The value to search.
 * @param replaceValue The value to replace the searched value with.
 * @returns The string after all changes are made.
 */
export function replaceAllUnescaped(
	string: string,
	searchValue: string,
	replaceValue: string,
) {
	let newString = "";
	let index = 0;
	const splitString = string.split("\\\\"); // Split by any escaped backslashes.
	for (let stringPiece of splitString) {
		let tempString = "";
		let lastIndex = stringPiece.lastIndexOf(searchValue);
		if (lastIndex === -1) {
			newString = `${newString}${index > 0 ? "\\\\" : ""}${stringPiece}`;
		} else {
			while (lastIndex !== -1) {
				if (string.charAt(lastIndex - 1) !== `\\`) {
					tempString =
						stringPiece.slice(lastIndex).replace(searchValue, replaceValue) +
						tempString;
				} else {
					tempString = stringPiece.slice(lastIndex) + tempString;
				}
				stringPiece = stringPiece.slice(0, lastIndex);
				lastIndex = stringPiece.lastIndexOf(searchValue);
			}
			newString = `${newString}${stringPiece}${
				index > 0 ? "\\\\" : ""
			}${tempString}`;
		}
		index++;
	}
	return newString;
}
/**
 * This function searches a provided string for the first occurrence of the search value that isn't escaped and returns its index in the string, or -1 if no occurrence was found.
 * @param string The string to search.
 * @param searchValue The value to search for in the string.
 * @returns The index of the occurrence, or -1 if none found.
 */
export function searchFirstUnescaped(
	string: string,
	searchValue: string,
): number {
	const splitString = string.split("\\\\");
	let position = 0;
	let index = 0;
	for (let stringPiece of splitString) {
		if (index > 0) {
			position = position + 2;
		}
		index++;
		let lastIndex = stringPiece.lastIndexOf(searchValue);
		if (lastIndex === 0) {
			return position;
		}
		while (lastIndex !== -1) {
			if (string.charAt(lastIndex - 1) !== `\\`) {
				return position + lastIndex;
			}
			stringPiece = stringPiece.slice(0, lastIndex);
			lastIndex = stringPiece.lastIndexOf(searchValue);
		}
		position = position + stringPiece.length;
	}
	return -1;
}
