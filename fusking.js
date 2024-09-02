// fusking.js

function fuskingFlagTest() {
	console.log('Fusking script reporting back.');
}

function fuskUrls({
	prefix,
	suffix,
	beginRange,
	endRange,
	hex
}) {
	console.log('Fusking image url...');
	const urls = [];
	const start = hex ? parseInt(beginRange, 16) : parseInt(beginRange, 10);
	const end = hex ? parseInt(endRange, 16) : parseInt(endRange, 10);
	const beginLength = beginRange.length;
	const isHexUpperCase = /[A-F]/.test(beginRange) || /[A-F]/.test(endRange); // Check if hex is uppercase

	if ((!isNaN(beginRange) && !isNaN(endRange)) || (hex && isValidHex(beginRange) && isValidHex(endRange))) {
		for (let i = start; i <= end; i++) {
			let number;

			if (hex) {
				number = i.toString(16); // Convert to hex
				number = isHexUpperCase ? number.toUpperCase() : number.toLowerCase(); // Match case
			} else {
				number = i.toString(); // Convert to decimal
			}

			// Pad the number with leading zeroes if necessary
			number = number.padStart(beginLength, '0');

			const url = prefix + number + suffix;
			urls.push(url);
		}
	}

	// Function to check if a value is a valid hex number
	function isValidHex(value) {
		// Remove leading/trailing whitespace and check if value matches hex format
		const trimmedValue = value.trim();
		return /^[0-9A-Fa-f]+$/.test(trimmedValue) || trimmedValue === '';
	}

	// Function to compare hex values
	function validateAndCompareRanges() {
		// Convert the values to decimal based on whether hex is selected
		const beginDecimal = hex ? parseInt(beginRange, 16) : Number(beginRange);
		const endDecimal = hex ? parseInt(endRange, 16) : Number(endRange);

		// Return true if beginDecimal is greater than endDecimal, else return false
		return beginDecimal > endDecimal;
	}

	function failureMessage() {
		console.log("Array is empty.");

		if (beginRange.trim() === "" && endRange.trim() === "") {
			return "The beginning and ending values are empty. Please try again.";
		} else if (beginRange.trim() === "") {
			return "The beginning value is empty. Please try again.";
		} else if (endRange.trim() === "") {
			return "The ending value is empty. Please try again.";
		} else if (hex && !isValidHex(beginRange) && !isValidHex(endRange)) {
			return "The beginning and ending values you entered are non-numerical. Please try again.";
		} else if (hex && !isValidHex(beginRange)) {
			return "The beginning value you entered is non-numerical. Please try again.";
		} else if (hex && !isValidHex(endRange)) {
			return "The ending value you entered is non-numerical. Please try again.";
		} else if (validateAndCompareRanges()) {
			return "The beginning value you entered is larger than the ending value. Please try again.";
		} else if (isNaN(beginRange) && isNaN(endRange)) {
			return "The beginning and ending values you entered are non-numerical. Please try again.";
		} else if (isNaN(beginRange)) {
			return "The beginning value you entered is non-numerical. Please try again.";
		} else if (isNaN(endRange)) {
			return "The ending value you entered is non-numerical. Please try again.";
		} else {
			return "Something went wrong with creating a list of image addresses, but we're not sure what. Please check your input values and try again.";
		}
	}

	// After the loop, check if the array is empty
	if (urls.length === 0) {
		return failureMessage();
	}

	return urls;
}
