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
Returns: (undefined) */
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
Returns: (undefined) */
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
Return: (undefined) */
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
