import {
	escapeAllCharacters,
	unslash,
	replaceAllUnescaped,
	searchFirstUnescaped,
} from "./utils.js";
export class DatePHP extends Date {
	/**
	 * Return a string representation of a provided date object.
	 * @param format The format to output it as.
	 * @returns The date string.
	 */
	public format(format: string) {
		if (format === "") {
			return "";
		}
		const day = this.getDay();
		const days = [
			escapeAllCharacters("Sunday"),
			escapeAllCharacters("Monday"),
			escapeAllCharacters("Tuesday"),
			escapeAllCharacters("Wednesday"),
			escapeAllCharacters("Thursday"),
			escapeAllCharacters("Friday"),
			escapeAllCharacters("Saturday"),
		];
		const date = this.getDate();
		const month = this.getMonth();
		const months = [
			escapeAllCharacters("January"),
			escapeAllCharacters("February"),
			escapeAllCharacters("March"),
			escapeAllCharacters("April"),
			escapeAllCharacters("May"),
			escapeAllCharacters("June"),
			escapeAllCharacters("July"),
			escapeAllCharacters("August"),
			escapeAllCharacters("September"),
			escapeAllCharacters("October"),
			escapeAllCharacters("November"),
			escapeAllCharacters("December"),
		];
		const year = this.getFullYear();
		const hours = this.getHours();
		const minutes = this.getMinutes();
		const seconds = this.getSeconds();
		const milliseconds = this.getMilliseconds();
		const timezoneMinutesOffset = this.getTimezoneOffset();

		// Replace date shortcuts
		// "c" references ISO-8601 but doesn't include milliseconds, so we can't use .toISOString()
		format = replaceAllUnescaped(format, "c", "Y-m-d\\TH:i:sp");
		format = replaceAllUnescaped(format, "r", "D, d M Y H:i:s O");

		// Day
		format = replaceAllUnescaped(format, "d", date.toString().padStart(2, "0"));
		format = replaceAllUnescaped(format, "D", days[day].slice(0, 6));
		format = replaceAllUnescaped(format, "j", date.toString());
		format = replaceAllUnescaped(format, "l", days[day]);

		format = replaceAllUnescaped(format, "N", (day === 0 ? 7 : day).toString());
		if (date % 10 === 1 && date !== 11) {
			format = replaceAllUnescaped(format, "S", escapeAllCharacters("st"));
		} else if (date % 10 === 2 && date !== 12) {
			format = replaceAllUnescaped(format, "S", escapeAllCharacters("nd"));
		} else if (date % 10 === 3 && date !== 13) {
			format = replaceAllUnescaped(format, "S", escapeAllCharacters("rd"));
		} else {
			format = replaceAllUnescaped(format, "S", escapeAllCharacters("th"));
		}
		format = replaceAllUnescaped(format, "w", day.toString());
		let dayOfTheYear = date;
		for (let $i = month; $i > 0; $i--) {
			const lastDayOfPreviousMonth = new Date(year, $i, 0);
			const daysInPreviousMonth = lastDayOfPreviousMonth.getDate();
			dayOfTheYear = dayOfTheYear + daysInPreviousMonth;
		}
		format = replaceAllUnescaped(format, "z", (dayOfTheYear - 1).toString());
		// Week
		if (searchFirstUnescaped(format, "W") !== -1) {
			console.warn(
				"The W character is currently not supported. It has not been substituted or removed.",
			);
		}
		// Month
		format = replaceAllUnescaped(format, "F", months[month]);
		format = replaceAllUnescaped(
			format,
			"m",
			(month + 1).toString().padStart(2, "0"),
		);
		format = replaceAllUnescaped(format, "M", months[month].slice(0, 6));
		format = replaceAllUnescaped(format, "n", (month + 1).toString());
		format = replaceAllUnescaped(
			format,
			"t",
			new Date(year, month + 1, 0).getDate().toString(),
		);
		// Year
		if (new Date(year, 2, 0).getDate() === 29) {
			format = replaceAllUnescaped(format, "L", (1).toString());
		} else {
			format = replaceAllUnescaped(format, "L", (0).toString());
		}
		if (searchFirstUnescaped(format, "o") !== -1) {
			console.warn(
				"The o character is currently not supported. It has not been substituted or removed.",
			);
		}
		format = replaceAllUnescaped(format, "Y", year.toString());
		format = replaceAllUnescaped(format, "y", year.toString().slice(-2));
		// Time
		let smallHours = hours;
		let meridiem = "am";
		if (hours > 12) {
			smallHours = hours - 12;
			meridiem = "pm";
		}
		format = replaceAllUnescaped(format, "a", escapeAllCharacters(meridiem));
		format = replaceAllUnescaped(
			format,
			"A",
			escapeAllCharacters(meridiem.toUpperCase()),
		);
		format = replaceAllUnescaped(format, "g", smallHours.toString());
		format = replaceAllUnescaped(format, "G", hours.toString());
		format = replaceAllUnescaped(
			format,
			"h",
			smallHours.toString().padStart(2, "0"),
		);
		format = replaceAllUnescaped(
			format,
			"H",
			hours.toString().padStart(2, "0"),
		);
		format = replaceAllUnescaped(
			format,
			"i",
			minutes.toString().padStart(2, "0"),
		);
		format = replaceAllUnescaped(
			format,
			"s",
			seconds.toString().padStart(2, "0"),
		);
		format = replaceAllUnescaped(
			format,
			"v",
			milliseconds.toString().padStart(3, "0"),
		);
		if (searchFirstUnescaped(format, "B") !== -1) {
			console.warn(
				"The B character is currently not supported. It has not been substituted or removed.",
			);
		}
		if (searchFirstUnescaped(format, "u") !== -1) {
			console.warn(
				"The u character is not supported because of JS Date limitations. It has not been substituted or removed.",
			);
		}
		// Timezone
		if (timezoneMinutesOffset === 0) {
			format = replaceAllUnescaped(format, "O", "+0000");
			format = replaceAllUnescaped(format, "P", "+00:00");
			format = replaceAllUnescaped(format, "p", "Z");
		} else {
			const remainderMinutes = timezoneMinutesOffset % 60;
			const exactHourLength = (timezoneMinutesOffset - remainderMinutes) / 60;

			format = replaceAllUnescaped(
				format,
				"O",
				`${timezoneMinutesOffset < 0 ? "+" : "-"}${Math.abs(exactHourLength)
					.toString()
					.padStart(2, "0")}${remainderMinutes.toString().padStart(2, "0")}`,
			);
			format = replaceAllUnescaped(
				format,
				"P",
				`${timezoneMinutesOffset < 0 ? "+" : "-"}${Math.abs(exactHourLength)
					.toString()
					.padStart(2, "0")}:${remainderMinutes.toString().padStart(2, "0")}`,
			);
			format = replaceAllUnescaped(
				format,
				"p",
				`${timezoneMinutesOffset < 0 ? "+" : "-"}${Math.abs(exactHourLength)
					.toString()
					.padStart(2, "0")}:${remainderMinutes.toString().padStart(2, "0")}`,
			);
		}

		if (searchFirstUnescaped(format, "e") !== -1) {
			console.warn(
				"The e character is currently not supported. It has not been substituted or removed.",
			);
		}
		if (searchFirstUnescaped(format, "I") !== -1) {
			console.warn(
				"The I character is currently not supported. It has not been substituted or removed.",
			);
		}
		if (searchFirstUnescaped(format, "T") !== -1) {
			console.warn(
				"The T character is currently not supported. It has not been substituted or removed.",
			);
		}
		if (searchFirstUnescaped(format, "Z") !== -1) {
			console.warn(
				"The Z character is currently not supported. It has not been substituted or removed.",
			);
		}
		format = replaceAllUnescaped(
			format,
			"U",
			(this.valueOf() / 1000).toString(),
		);
		return unslash(format);
	}

	static parseString(
		dateString: string,
		formatString: "Y-m-d\\TH:i:s.vp" | "ISO-8601",
	) {
		if (formatString !== "Y-m-d\\TH:i:s.vp" && formatString !== "ISO-8601") {
			console.error(
				"parseDateUsingPHPDateFormat: Currently only ISO-8601 is supported.",
			);
			return new DatePHP();
		}

		const yearString = dateString.substring(0, 4);
		const monthString = dateString.substring(5, 7);
		const dayString = dateString.substring(8, 10);
		const hoursString = dateString.substring(11, 13);
		const minutesString = dateString.substring(14, 16);
		const secondsString = dateString.substring(17, 19);
		const millisecondsString = dateString.substring(20, 23);
		const timezoneString = dateString.substring(23);
		let offsetMinutes;
		if (timezoneString === "Z" || timezoneString === "z") {
			offsetMinutes = 0;
		} else {
			// Split timezone string into hours and minutes no matter if there's a colon or not.
			// Take the first 3 characters of the timezone to get the hour offset
			const timezoneOffsetHours = timezoneString.substring(0, 3);
			// Take the last 2 characters of the timezone to get the minutes to the same offset as above
			const timezoneOffsetMins = timezoneString.slice(-2);
			offsetMinutes =
				Number(timezoneOffsetHours) * 60 + Number(timezoneOffsetMins);
		}
		const year = Number(yearString);
		const month = Number(monthString) - 1;
		const day = Number(dayString);
		const hours = Number(hoursString);
		const minutes = Number(minutesString) - offsetMinutes;
		const seconds = Number(secondsString);
		const milliseconds = Number(millisecondsString);

		return new DatePHP(
			Date.UTC(year, month, day, hours, minutes, seconds, milliseconds),
		);
	}
}
