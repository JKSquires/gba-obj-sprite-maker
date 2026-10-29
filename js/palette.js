/* Updates text color of a button to contrast button background color.
Parameters:
- button (HTMLElement): Intended to be a palette editor button
Side-Effects:
- Updates `button` text color 
Return: (undefined) */
function updateColorButtonTextColor(button) {
	let r = parseInt(button.dataset.color24b.substring(0,2), 16);
	let g = parseInt(button.dataset.color24b.substring(2,4), 16);
	let b = parseInt(button.dataset.color24b.substring(4,6), 16);
	
	let lum = 0.3 * r + 0.6 * g + 0.1 * b;

	button.style.color = lum < 0x7F ? "#fff" : "#000";
}

/* Updates the visual display for what color in the palette is selected.
Parameters:
- col_num (string): Hexadecimal index for the color in the palette
Globals Used:
- selected_color
- pal_col_sel
Preconditions:
- The `loadPaletteButtons` function should be run at least once before using this function
Side-Effects:
- Updates `selected_color`
- Updates `pal_col_sel` text, text color, and background color 
Return: (undefined) */
function updatePaletteColorSelection(col_num) {
	let button = document.getElementById("col_" + col_num);

	selected_color = col_num;

	pal_col_sel.innerText = col_num + ": 0x" + button.dataset.color15b;
	pal_col_sel.style.backgroundColor = '#' + button.dataset.color24b;
	pal_col_sel.style.color = button.style.color;
}

/* Handles saving and closing the palette color edit dialog. 
Globals Used:
- pal_col_id
- pal_col_picker
- palette_dialog
Side-Effects:
- Update `button` background color, 15-bit color data, and 24-bit color data
- Calls `updateColorButtonTextColor`, `updatePaletteColorSelection`, and `updateSpriteGrid` functions
- Closes `palette_dialog` HTML element 
Return: (undefined) */
function savePaletteDialog() {
	let col_num = pal_col_id.innerText;
	let button = document.getElementById("col_" + col_num);
	let color = pal_col_picker.value.substring(1);

	button.style.backgroundColor = '#' + color;
	button.dataset.color15b = col24bToCol15b(parseInt(color, 16)).toString(16).padStart(4, '0');
	button.dataset.color24b = color;
	updateColorButtonTextColor(button);

	updatePaletteColorSelection(col_num);
	
	updateSpriteGrid();

	palette_dialog.close();
}

/* Loads palette color buttons into the palette editor
Globals Used:
- palette_div
- pal_col
Side-Effects:
- Modifies `palette_div` inner HTML
  - Creates new HTML button elements
- Calls `updateColorButtonTextColor` and `updatePaletteColorSelecton` functions
Return: (undefined) */
function loadPaletteButtons() {
	palette_div.innerHTML = "";

	for (let col_index = 0; col_index < pal_col; col_index++) {
		let hex_index = "0x" + col_index.toString(16);
		let col_button = document.createElement("button");

		col_button.className = "pal_col_btn";
		col_button.id = "col_" + hex_index;
		col_button.innerText = hex_index;
		col_button.style.backgroundColor = "#000";
		
		col_button.dataset.color15b = "0000";
		col_button.dataset.color24b = "000000";
		
		col_button.onclick = () => colorButtonFunc(hex_index);

		updateColorButtonTextColor(col_button);

		palette_div.appendChild(col_button);
	}
	
	updatePaletteColorSelection("0x0");
}

/* Update the number of colors in the palette.
Globals Used:
- pal_col
- num_color_checkbox
Side-Effect:
- Updates `pal_col`
- Calls `loadPaletteButtons` and `updateGridSize` functions
Return: (undefined) */
function updateNumColorPalette() {
	pal_col = num_color_checkbox.checked ? 256 : 16;

	loadPaletteButtons();
	updateGridSize();
}

/* Convert and store 15-bit color value to 24-bit color value.
Globals Used:
- color_conv_box
Side-Effects:
- Updates `color_conv_box` value
Return: (undefined) */
function btn15bTo24b() {
	let val = col15bToCol24b(parseInt(color_conv_box.value, 16));
	color_conv_box.value = val.toString(16).padStart(6, '0');
}

/* Convert and store 24-bit color value to 15-bit color value.
Globals Used:
- color_conv_box
Side-Effects:
- Updates `color_conv_box` value
Return: (undefined) */
function btn24bTo15b() {
	let val = col24bToCol15b(parseInt(color_conv_box.value, 16));
	color_conv_box.value = val.toString(16).padStart(4, '0');
}

/* Store color value from color picker to be used in the palette.
Globals Used:
- pal_col_picker
- pal_col_code
- pal_col_code_bin
Side-Effects:
- Updates `pal_col_picker`, `pal_col_code`, and `pal_col_code_bin` values
Return: (undefined) */
function selPalColByPicker() {
	let val = col24bToCol15b(parseInt(pal_col_picker.value.substring(1), 16));
	pal_col_picker.value = "#" + col15bToCol24b(val).toString(16).padStart(6, "0");
	pal_col_code.value = val.toString(16).padStart(4, '0');
	pal_col_code_bin.value = val.toString(2).padStart(16, '0');
}

/* Update color picker to color code input.
Globals Used:
- pal_col_code
- pal_col_picker
Side-Effects:
- Updates `pal_col_picker` value
Return: (undefined) */
function updatePalColPicker() {
	let val = col15bToCol24b(parseInt(pal_col_code.value, 16));

	pal_col_picker.value = '#' + val.toString(16).padStart(6, '0');
}

/* Update color picker and binary color code input to hexadecimal color code input.
Globals Used:
- pal_col_code_bin
- pal_col_code
Side-Effects:
- Updates `pal_col_code_bin` value
- Calls `updatePalCalPicker`
Return: (undefined) */
function updateHexPalColPicker() {
	pal_col_code_bin.value = parseInt(pal_col_code.value, 16).toString(2).padStart(16, '0');
	updatePalColPicker();
}

/* Update color picker and hexadecimal color code input to binary color code input.
Globals Used:
- pal_col_code
- pal_col_code_bin
Side-Effects:
- Updates `pal_col_code` value
- Calls `updatePalCalPicker`
Return: (undefined) */
function updateBinPalColPicker() {
	pal_col_code.value = parseInt(pal_col_code_bin.value, 2).toString(16).padStart(4, '0');
	updatePalColPicker();
}
