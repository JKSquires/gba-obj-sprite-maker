/* Converts 15-bit color values to 24-bit color values.
Parameters:
- col_15b (integer): 15-bit color value (BGR)
Return: (integer)
  24-bit color value (RGB) */
function col15bToCol24b(col_15b) {
	let r = (col_15b & 0x1F) << 3;
	let g = ((col_15b & 0x3E0) >> 5) << 3;
	let b = ((col_15b & 0x7C00) >> 10) << 3;

	return (r << 16) | (g << 8) | b;
}

/* Converts 24-bit color values to 15-bit color values.
Parameters:
- col_24b (integer): 24-bit color value (RGB)
Return: (integer)
  15-bit color value (BGR) */
function col24bToCol15b(col_24b) {
	let b = (col_24b & 0xFF) >> 3;
	let g = ((col_24b & 0xFF00) >> 8) >> 3;
	let r = ((col_24b & 0xFF0000) >> 16) >> 3;

	return (b << 10) | (g << 5) | r;
}

/* Checks if the halfword directive entry has text, and if not, asks the user if it should continue.
Globals used:
- halfword_dir
Side-Effects:
- Show continue dialog
Returns: (boolean)
  true if halfword directive entry has text or user wants to continue; false otherwise */
function checkHalfwordDirective() {
	if (halfword_dir.value == "") {
		return confirm("Halfword/16-bit constant directive is empty!\nContinue?");
	}

	return true;
}

/* Checks if the word directive entry has text, and if not, asks the user if it should continue.
Globals used:
- word_dir
Side-Effects:
- Show continue dialog
Returns: (boolean)
  true if word directive entry has text or user wants to continue; false otherwise */
function checkWordDirective() {
	if (word_dir.value == "") {
		return confirm("Halfword/16-bit constant directive is empty!\nContinue?");
	}

	return true;
}
