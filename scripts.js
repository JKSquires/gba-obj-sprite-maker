let pal_col_sel = document.getElementById("pal_col_sel");
let pal_col_id = document.getElementById("pal_col_id");
let pal_col_picker = document.getElementById("pal_col_picker");
let pal_col_code = document.getElementById("pal_col_code");
let pal_col_code_bin = document.getElementById("pal_col_code_bin");
let pal_name = document.getElementById("pal_name");
let palette_data = document.getElementById("palette_data");
let palette_div = document.getElementById("palette_div");
let palette_dialog = document.getElementById("palette_dialog");
let sprite_name = document.getElementById("sprite_name");
let sprite_grid = document.getElementById("sprite_grid");
let sprite_size = document.getElementById("sprite_size");
let color_conv_box = document.getElementById("color_conv_box");
let halfword_dir = document.getElementById("halfword_dir");
let word_dir = document.getElementById("word_dir");
let bin_prefix = document.getElementById("bin_prefix");
let hex_prefix = document.getElementById("hex_prefix");
let load_pal = document.getElementById("load_pal");
let load_sprite = document.getElementById("load_sprite");
let grid_scale = document.getElementById("grid_scale");
let num_color_checkbox = document.getElementById("num_color_checkbox");
let edit_palette_checkbox = document.getElementById("edit_palette_checkbox");
let use_word_checkbox = document.getElementById("use_word_checkbox");
let use_bin_checkbox = document.getElementById("use_bin_checkbox");
let word_dir_area = document.getElementById("word_dir_area");
let bin_sel_area = document.getElementById("bin_sel_area");

let pal_col = 16; // might be used in the future to support 256 color palettes again
let edit_palette = false; // denotes if the user can edit the palette
let use_word = false; // denotes if sprite data will be formatted in words when importing/exporting
let use_bin = false; // denotes if palette data will be formatted in binary when importing/exporting
let selected_color = "0"; // specifies the index of the color in the palette in hexadecimal

let dim; // sprite dimensions
let pixel_grid; // grid of color indexes in palette for each pixel

let is_mouse_down = false; // denotes if the mouse is considered clicked

document.onmousedown = () => {
	is_mouse_down = true;
};
document.onmouseup = () => {
	is_mouse_down = false;
};

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

/* Updates text color of a button to contrast button background color.
Parameters:
- button (HTMLElement): Intended to be a palette editor button
Side-Effects:
- Updates `button` text color 
Return: (void) */
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
Return: (void) */
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
Return: (void) */
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

/* Allows the user to edit or use a palette color.
Parameters:
- col_num (string): Hexadecimal index for the color in the palette
Globals Used:
- edit_palette
- color_conv_box
- pal_col_picker
- pal_col_code
- pal_col_code_bin
- pal_col_id
- palette_dialog
Side-Effects:
- Clears `color_conv_box` value
- Updates `pal_col_picker` value
- Updates `pal_col_code` value
- Updates `pal_col_code_bin` value
- Updates `pal_col_id` text
- Opens `palette_dialog`
- Calls `updatePaletteColorSelection` function 
Return: (void) */
function colorButtonFunc(col_num) {
	if (edit_palette) {
		let button = document.getElementById("col_" + col_num);

		color_conv_box.value = "";
		pal_col_picker.value = '#' + button.dataset.color24b;
		pal_col_code.value = button.dataset.color15b;
		pal_col_code_bin.value = parseInt(pal_col_code.value, 16).toString(2).padStart(16, '0');

		pal_col_id.innerText = col_num;

		palette_dialog.showModal();
	} else {
		updatePaletteColorSelection(col_num);
	}
}

/* Loads palette color buttons into the palette editor
Globals Used:
- palette_div
- pal_col
Side-Effects:
- Modifies `palette_div` inner HTML
  - Creates new HTML button elements
- Calls `updateColorButtonTextColor` and `updatePaletteColorSelecton` functions
Return: (void) */
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

/* Saves palette and/or sprite data to a file.
Parameters:
- selection (integer)
  - 0b_1: download palette data; 0b1_: dowload sprite data
- file_name (string)
Globals Used:
- pal_name
- use_bin
- pal_col
- halfword_dir
- word_dir
- bin_prefix
- hex_prefix
- sprite_name
- dim
- pixel_grid
Preconditions:
- The `updateGridSize` function should be run at least once before using this function
Side-Effects:
- Downloads a file
Returns: (void) */
function saveData(selection, file_name) {
	let text = "";
	if (selection & 1) {
		let palette_data = "";

		text += pal_name.value + ":\n";

		if (use_bin) {
			for (let col_num = 0; col_num < pal_col; col_num++) {
				palette_data += halfword_dir.value + ' ' + bin_prefix.value + parseInt(document.getElementById("col_0x" + col_num.toString(16)).dataset.color15b, 16).toString(2).padStart(16, '0') + '\n';
			}
		} else {
			for (let col_num = 0; col_num < pal_col; col_num++) {
				palette_data += halfword_dir.value + ' ' + hex_prefix.value + document.getElementById("col_0x" + col_num.toString(16)).dataset.color15b + '\n';
			}
		}

		text += palette_data;
	}
	if (selection & 2) {
		let sprite_data = "";

		text += sprite_name.value + ":\n";

		for (let row_sec = 0; row_sec < dim[1]; row_sec += 8) {
			for (let col_sec = 0; col_sec < dim[0]; col_sec += 8) {
				for (let row = row_sec; row < row_sec + 8; row++) {
					sprite_data += use_word ? 
						word_dir.value + " " + hex_prefix.value + // use word directive
						pixel_grid[row][col_sec + 7].substring(2) +
						pixel_grid[row][col_sec + 6].substring(2) +
						pixel_grid[row][col_sec + 5].substring(2) +
						pixel_grid[row][col_sec + 4].substring(2) +
						pixel_grid[row][col_sec + 3].substring(2) +
						pixel_grid[row][col_sec + 2].substring(2) +
						pixel_grid[row][col_sec + 1].substring(2) +
						pixel_grid[row][col_sec].substring(2) + '\n'
						: halfword_dir.value + " " + hex_prefix.value + // use halfword directive
						pixel_grid[row][col_sec + 3].substring(2) +
						pixel_grid[row][col_sec + 2].substring(2) +
						pixel_grid[row][col_sec + 1].substring(2) +
						pixel_grid[row][col_sec].substring(2) + ", " + hex_prefix.value +
						pixel_grid[row][col_sec + 7].substring(2) +
						pixel_grid[row][col_sec + 6].substring(2) +
						pixel_grid[row][col_sec + 5].substring(2) +
						pixel_grid[row][col_sec + 4].substring(2) + '\n';
				}
			}
		}

		text += sprite_data;
	}
	
	console.log("Downloading:\n" + text);

	let data_url = "data:application/asm;charset=utf-8," + encodeURIComponent(text);
	let link = document.createElement("a");
	link.href = data_url;
	link.download = file_name;

	link.click();
}

/* Checks if the halfword directive entry has text.
Globals used:
- halfword_dir
Side-Effects:
- Show alert
Returns: (boolean)
  true if halfword directive entry has text; false if empty */
function checkHalfwordDirective() {
	if (halfword_dir.value == "") {
		alert("Halfword Directive is empty!");

		return false;
	}

	return true;
}

/* Checks if the word directive entry has text.
Globals used:
- word_dir
Side-Effects:
- Show alert
Returns: (boolean)
  true if word directive entry has text; false if empty */
function checkWordDirective() {
	if (word_dir.value == "") {
		alert("Word Directive is empty!");

		return false;
	}

	return true;
}

/* Loads uploaded palette data to the palette editor.
Globals used:
- load_pal
- pal_name
- pal_col
- halfword_dir
- use_bin
- bin_prefix
- hex_prefix
Preconditions:
- The `updateNumColorPalette` function should be run at least once before using this function
Side-Effects:
- Calls `checkHalfwordDirective`, `updateColorButtonTextColor`, `updateSpriteGrid`, and `updatePaletteColorSelection` functions
- Displays debug logs in console
- Updates palette buttons to loaded palette data
- Shows alert
Returns: (void) */
async function loadPalData() {
	checkHalfwordDirective();

	let file = load_pal.files[0];

	if (file) {
		let text = (await file.text()).replaceAll(":", ":\n").replaceAll('\t', '').replaceAll(' ', '').replaceAll('\r', '').split('\n');

		let found = false;

		for (let line_num = 0; line_num < text.length; line_num++) {
			let line = text[line_num];
			console.log("Searching for palette `" + pal_name.value + "` label in line: " + line);

			if (line.length >= pal_name.value.length + 1) {
				if (line.substring(0, pal_name.value.length + 2) == pal_name.value + ':') {
					console.log("Found Palette Label");

					found = true;

					let color_lines = 0;

					for (let color_line_num = 0; color_lines < pal_col && color_line_num < text.length - line_num - 1; color_line_num++) {
						line = text[color_line_num + line_num + 1];
						console.log("Parsing line for color: " + line);
						line = line.split(';')[0];

						if (line.length > halfword_dir.value.length && line.substring(0, halfword_dir.value.length) == halfword_dir.value) {
							let color = line.substring(halfword_dir.value.length);
							let button_color;
							
							if (use_bin) {
								color = color.replaceAll(bin_prefix.value, "");

								button_color = col15bToCol24b(parseInt(color, 2)).toString(16).padStart(6, '0');
							
								console.log("Color found: 15b: " + hex_prefix.value + color + "; 24b: " + hex_prefix.value + button_color);
							} else {
								color = color.replaceAll(hex_prefix.value, "");

								button_color = col15bToCol24b(parseInt(color, 16)).toString(16).padStart(6, '0');
							
								console.log("Color found: 15b: " + bin_prefix.value + color + "; 24b: " + hex_prefix.value + button_color);
							}

							let button = document.getElementById("col_0x" + color_lines.toString(16));

							button.dataset.color15b = use_bin ? parseInt(color, 2).toString(16).padStart(4, '0') : color.padStart(4, '0');
							button.dataset.color24b = button_color;
							button.style.backgroundColor = '#' + button_color;

							updateColorButtonTextColor(button);

							color_lines++;
							console.log(color_lines, pal_col);
						}
					}
					break;
				}
			}
		}

		updateSpriteGrid();
		updatePaletteColorSelection("0x0");

		if (!found) {
			alert("Could not find palette label `" + pal_name.value + "` in file");
		}
	}
}

/* Loads uploaded sprite data to the sprite grid.
Globals Used:
- use_word
- load_sprite
- word_dir
- sprite_name
- dim
- pixel_grid
Preconditions:
- The `updateGridSize` function should be run at least once before using this function
Side-Effects:
- Calls `checkWordDirective`, `checkHalfwordDirective`, and `updateSpriteGrid` functions
- Displays debug logs in console
- Updates `pixel_grid` with loaded sprite data
- Show alert
Return: (void) */
async function loadSpriteData() {
	if (use_word) {
		checkWordDirective();
	} else {
		checkHalfwordDirective();
	}

	let file = load_sprite.files[0];

	if (file) {
		let text = (await file.text()).replaceAll(":", ":\n").replaceAll('\t', '').replaceAll(' ', '').replaceAll('\r', '').replaceAll(',', '').split('\n');

		let found = false;

		for (let line_num = 0; line_num < text.length; line_num++) {
			let line = text[line_num];
			console.log("Searching for sprite `" + sprite_name.value + "` label in line: " + line);

			if (line.length >= sprite_name.value.length + 1) {
				if (line.substring(0, sprite_name.value.length + 2) == sprite_name.value + ':') {
					console.log("Found Sprite Label");

					found = true;

					let sections = dim[0] * dim[1] / 8;
					let write_section = [0, 0];

					let pixel_lines = 0;

					for (let pixel_line_num = 0; pixel_lines < sections && pixel_line_num < text.length - line_num - 1; pixel_line_num++) {
						line = text[pixel_line_num + line_num + 1];
						console.log("Parsing line for pixel data: " + line);
						line = line.split(';')[0];

						if (use_word) {
							if (word_dir.value != "" && line.length > word_dir.value.length && line.substring(0, word_dir.value.length) == word_dir.value) {
								pixel_lines++;

								let pixel_data = line.split(hex_prefix.value)[1];
								
								console.log("Pixel data found: " + hex_prefix.value + pixel_data);

								for (let nibble_index = 0; nibble_index < 8; nibble_index++) {
									pixel_grid[write_section[1]][write_section[0] + nibble_index] = "0x" + pixel_data.charAt(7 - nibble_index);
								}
								
								write_section[1]++;
								if (write_section[1] % 8 == 0) {
									if (write_section[0] + 8 - dim[0] >= 0) {
										write_section[0] = 0;
									} else {
										write_section[0] += 8;
										write_section[1] -= 8;
									}
								}
							}
						} else {
							if (halfword_dir.value != "" && line.length > halfword_dir.value.length && line.substring(0, halfword_dir.value.length) == halfword_dir.value) {
								pixel_lines++;

								let row_data = line.split(hex_prefix.value);
								
								let ordered_row_pixel_data = row_data[2] + row_data[1]

								console.log("Pixel data found: " + hex_prefix.value + ordered_row_pixel_data);

								for (let nibble_index = 0; nibble_index < 8; nibble_index++) {
									pixel_grid[write_section[1]][write_section[0] + nibble_index] = "0x" + ordered_row_pixel_data.charAt(7 - nibble_index);
								}
								
								write_section[1]++;
								if (write_section[1] % 8 == 0) {
									if (write_section[0] + 8 - dim[0] >= 0) {
										write_section[0] = 0;
									} else {
										write_section[0] += 8;
										write_section[1] -= 8;
									}
								}
							}
						}
					}
					break;
				}
			}
		}

		updateSpriteGrid();

		if (!found) {
			alert("Could not find sprite label `" + sprite_name.value + "` in file");
		}
	}
}

/* Updates a single pixel in the sprite grid to the currently selected color.
Parameters:
- x (integer): x-coordinate of the pixel
- y (integer): y-coordinate of the pixel
Globals Used:
- pixel_grid
- selected_color
Side-Effects:
- Updates `pixel_grid`
- Updates corresponding sprite grid pixel background color and title
Return: (void)*/
function updateSpritePixel(x, y) {
	pixel_grid[y][x] = selected_color;

	let pixel = document.getElementById("grid_" + x + ',' + y);
	
	pixel.style.backgroundColor = '#' + document.getElementById("col_" + pixel_grid[y][x]).dataset.color24b;
	pixel.title = "(" + x + ", " + y + "): " + pixel_grid[y][x];
}

/* Updates sprite grid pixel when mouse is clicked
Parameters:
- x (integer): x-coordinate of the pixel
- y (integer): y-coordinate of the pixel
Globals Used:
- is_mouse_down
Side-Effects:
- Calls updateSpritePixel` function`
Return: (void)*/
function dragUpdateSpritePixel(x, y) {
	if (is_mouse_down) {
		updateSpritePixel(x, y);
	}
}

/* Updates the whole sprite grid.
Globals Used:
- dim
- pixel_grid
- grid_scale
- sprite_grid
Side-Effects:
- Calls `updateGridSize` function
- Updates `sprite_grid` inner HTML
Return: (void) */
function updateSpriteGrid() {
	if (!dim || !pixel_grid) {
		updateGridSize();
	}

	let scale = 1 + 10 * grid_scale.value;

	let grid = "";
	for (let row = 0; row < dim[1]; row++) {
		grid += "<tr>";
		for (let col = 0; col < dim[0]; col++) {
			grid += "<td style='width:" + scale + "px;height:" + scale + "px;background-color:#" + document.getElementById("col_" + pixel_grid[row][col]).dataset.color24b + ";' " +
				"title='(" + col + ", " + row + "): " + pixel_grid[row][col] + "' " +
				"onmousedown='updateSpritePixel(" + col + ',' + row + ");' " +
				"onmouseenter='dragUpdateSpritePixel(" + col + ',' + row + ");' " +
				"id='grid_" + col + ',' + row + "'>" + "</td>";
		}
		grid += "</tr>";
	}

	sprite_grid.innerHTML = grid;
}

/* Updates the sprite grid dimentions.
Globals Used:
- sprite_size
- pixel_grid
- dim
Side-Effects:
- Updates `dim`
- Updates `pixel_grid`
- Calls `updateSpriteGrid` function
Return: (void) */
function updateGridSize() {
	dim = sprite_size.value.split('x');

	pixel_grid = new Array(dim[1]);

	for (let row = 0; row < dim[1]; row++) {
		pixel_grid[row] = new Array(dim[0]);

		for (let col = 0; col < dim[0]; col++) {
			pixel_grid[row][col] = "0x0";
		}
	}

	updateSpriteGrid();
}

/* Update the number of colors in the palette.
Globals Used:
- pal_col
- num_color_checkbox
Side-Effect:
- Updates `pal_col`
- Calls `loadPaletteButtons` and `updateGridSize` functions
Return: (void) */
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
Return: (void) */
function btn15bTo24b() {
	let val = col15bToCol24b(parseInt(color_conv_box.value, 16));
	color_conv_box.value = val.toString(16).padStart(6, '0');
}

/* Convert and store 24-bit color value to 15-bit color value.
Globals Used:
- color_conv_box
Side-Effects:
- Updates `color_conv_box` value
Return: (void) */
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
- Updates `pal_col_code` and `pal_col_code_bin` values
Return: (void) */
function selPalColByPicker() {
	let val = col24bToCol15b(parseInt(pal_col_picker.value.substring(1), 16));
	pal_col_code.value = val.toString(16).padStart(4, '0');
	pal_col_code_bin.value = val.toString(2).padStart(16, '0');
}

/* Update palette mode.
Globals Used:
- edit_palette
- edit_palette_checkbox
Side-Effects:
- Updates `edit_palette`
Return: (void) */
function updateEditPalette() {
	edit_palette = edit_palette_checkbox.checked;
}

/* Update color picker to color code input.
Globals Used:
- pal_col_code
- pal_col_picker
Side-Effects:
- Updates `pal_col_picker` value
Return: (void) */
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
Return: (void) */
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
Return: (void) */
function updateBinPalColPicker() {
	pal_col_code.value = parseInt(pal_col_code_bin.value, 2).toString(16).padStart(4, '0');
	updatePalColPicker();
}

/* Update sprite data save mode.
Globals Used:
- use_word
- use_word_checkbox
- word_dir_area
Side-Effects:
- Updates `use_word`
- Updates `word_dir_area` style
Return: (void) */
function updateSpriteDataFormat() {
	use_word = use_word_checkbox.checked;

	word_dir_area.style.display = use_word ? "block" : "none";
}

/* Update palette data save mode.
Globals Used:
- use_bin
- use_bin_checkbox
- bin_sel_area
Side-Effects:
- Updates `use_bin`
- Updates `bin_dir_area` style
Return: (void) */
function updatePaletteDataFormat() {
	use_bin = use_bin_checkbox.checked;

	bin_sel_area.style.display = use_bin ? "block" : "none";
}

updateEditPalette();
updateNumColorPalette();
updatePalColPicker();
updateSpriteDataFormat();
updatePaletteDataFormat();
