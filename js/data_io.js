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
	if (!checkHalfwordDirective()) return;
	if (use_word) {
		if (!checkWordDirective()) return;
	}

	let text = "";
	if (selection & 1) {
		let palette_data = "";

		text += pal_name.value + ":\n";

		if (use_bin) {
			for (let col_num = 0; col_num < pal_col; col_num++) {
				palette_data += halfword_dir.value + ' ' + bin_prefix.value + parseInt(document.getElementById("col_0x" + col_num.toString(16).toUpperCase()).dataset.color15b, 16).toString(2).padStart(16, '0') + '\n';
			}
		} else {
			for (let col_num = 0; col_num < pal_col; col_num++) {
				palette_data += halfword_dir.value + ' ' + hex_prefix.value + document.getElementById("col_0x" + col_num.toString(16).toUpperCase()).dataset.color15b + '\n';
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
					function getPixelPalIndex(col_sec_offset) {
						return pixel_grid[row][col_sec + col_sec_offset].substring(2);
					}
					let block;
					if (pal_col == 16) {
						if (use_word) {
							block = [
								" " + hex_prefix.value,
								getPixelPalIndex(7),
								getPixelPalIndex(6),
								getPixelPalIndex(5),
								getPixelPalIndex(4),
								getPixelPalIndex(3),
								getPixelPalIndex(2),
								getPixelPalIndex(1),
								getPixelPalIndex(0),
							];
						} else {
							block = [
								" " + hex_prefix.value,
								getPixelPalIndex(3),
								getPixelPalIndex(2),
								getPixelPalIndex(1),
								getPixelPalIndex(0),
								", " + hex_prefix.value,
								getPixelPalIndex(7),
								getPixelPalIndex(6),
								getPixelPalIndex(5),
								getPixelPalIndex(4),
							];
						}
					} else if (pal_col == 256) {
						function getPixelPalIndex256(col_sec_offset) {
							return getPixelPalIndex(col_sec_offset).padStart(2, '0');
						}
						if (use_word) {
							block = [
								" " + hex_prefix.value,
								getPixelPalIndex256(3),
								getPixelPalIndex256(2),
								getPixelPalIndex256(1),
								getPixelPalIndex256(0),
								", " + hex_prefix.value +
								getPixelPalIndex256(7),
								getPixelPalIndex256(6),
								getPixelPalIndex256(5),
								getPixelPalIndex256(4),
							];
						} else {
							block = [
								" " + hex_prefix.value,
								getPixelPalIndex256(1),
								getPixelPalIndex256(0),
								", " + hex_prefix.value,
								getPixelPalIndex256(3),
								getPixelPalIndex256(2),
								", " + hex_prefix.value,
								getPixelPalIndex256(5),
								getPixelPalIndex256(4),
								", " + hex_prefix.value,
								getPixelPalIndex256(7),
								getPixelPalIndex256(6),
							];
						}
					}
					sprite_data += (use_word ? word_dir : halfword_dir).value + block.join("") + '\n';
				}
			}
		}

		text += sprite_data;
	}
	
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
	if (!checkHalfwordDirective()) return;

	let file = load_pal.files[0];

	if (file) {
		let text = (await file.text()).replaceAll(":", ":\n").replaceAll('\t', '').replaceAll(' ', '').replaceAll('\r', '').split('\n');

		let found = false;

		for (let line_num = 0; line_num < text.length; line_num++) {
			let line = text[line_num];

			if (line.length >= pal_name.value.length + 1) {
				if (line.substring(0, pal_name.value.length + 2) == pal_name.value + ':') {
					found = true;

					let color_lines = 0;

					for (let color_line_num = 0; color_lines < pal_col && color_line_num < text.length - line_num - 1; color_line_num++) {
						line = text[color_line_num + line_num + 1];
						line = line.split(';')[0];

						if (line.length > halfword_dir.value.length && line.substring(0, halfword_dir.value.length) == halfword_dir.value) {
							let color = line.substring(halfword_dir.value.length);
							let button_color;
							
							if (use_bin) {
								color = color.replaceAll(bin_prefix.value, "");

								button_color = col15bToCol24b(parseInt(color, 2)).toString(16).padStart(6, '0');
							} else {
								color = color.replaceAll(hex_prefix.value, "");

								button_color = col15bToCol24b(parseInt(color, 16)).toString(16).padStart(6, '0');
							}

							let button = document.getElementById("col_0x" + color_lines.toString(16).toUpperCase());

							button.dataset.color15b = use_bin ? parseInt(color, 2).toString(16).padStart(4, '0') : color.padStart(4, '0');
							button.dataset.color24b = button_color;
							button.style.backgroundColor = '#' + button_color;

							updateColorButtonTextColor(button);

							color_lines++;
						}
					}
					break;
				}
			}
		}

		updateSpriteGrid();
		updatePaletteColorSelection("0x0");

		if (!found) {
			alert("Could not find palette label `" + pal_name.value + ":` in file");
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
- pal_col
Preconditions:
- The `updateGridSize` function should be run at least once before using this function
Side-Effects:
- Calls `checkWordDirective`, `checkHalfwordDirective`, and `updateSpriteGrid` functions
- Displays debug logs in console
- Updates `pixel_grid` with loaded sprite data
- Show alert
Return: (undefined) */
async function loadSpriteData() {
	if (!checkHalfwordDirective()) return;
	if (use_word) {
		if (!checkWordDirective()) return;
	}

	let file = load_sprite.files[0];

	if (file) {
		let text = (await file.text()).replaceAll(":", ":\n").replaceAll('\t', '').replaceAll(' ', '').replaceAll('\r', '').replaceAll(',', '').split('\n');

		let found = false;

		for (let line_num = 0; line_num < text.length; line_num++) {
			let line = text[line_num];

			if (line.length >= sprite_name.value.length + 1) {
				if (line.substring(0, sprite_name.value.length + 2) == sprite_name.value + ':') {
					found = true;

					let sections = dim[0] * dim[1] / 8;
					let write_section = [0, 0];

					let pixel_lines = 0;

					let attempt_16_when_256 = false;

					for (let pixel_line_num = 0; pixel_lines < sections && pixel_line_num < text.length - line_num - 1; pixel_line_num++) {
						line = text[pixel_line_num + line_num + 1];
						line = line.split(';')[0];

						if (use_word) {
							if (word_dir.value != "" && line.length > word_dir.value.length && line.substring(0, word_dir.value.length) == word_dir.value) {
								pixel_lines++;

								let row_data = line.split(hex_prefix.value);

								if (pal_col == 256) {
									if (row_data.length < 3 && !attempt_16_when_256) {
										attempt_16_when_256 = confirm("Sprite data appears to be for a 16-color palette. Attempt to load?");
										if (!attempt_16_when_256) {
											return;
										}
									}

									const ordered_row_pixel_data = row_data[2] + row_data[1];

									for (let nibble_index = 0; nibble_index < 16; nibble_index += 2) {
										let palette_index = ordered_row_pixel_data.charAt(14 - nibble_index) + ordered_row_pixel_data.charAt(15 - nibble_index);
										if (palette_index.charAt(0) == '0') {
											palette_index = palette_index.charAt(1);
										}
										pixel_grid[write_section[1]][write_section[0] + (nibble_index / 2)] = "0x" + palette_index;
									}
								}
								if (pal_col == 16 || attempt_16_when_256) {
									const pixel_data = line.split(hex_prefix.value)[1];

									for (let nibble_index = 0; nibble_index < 8; nibble_index++) {
										pixel_grid[write_section[1]][write_section[0] + nibble_index] = "0x" + pixel_data.charAt(7 - nibble_index);
									}
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

								const row_data = line.split(hex_prefix.value);
								
								if (pal_col == 256) {
									if (row_data.length < 5 && !attempt_16_when_256) {
										attempt_16_when_256 = confirm("Sprite data appears to be for a 16-color palette. Attempt to load?");
										if (!attempt_16_when_256) {
											return;
										}
									}

									const ordered_row_pixel_data = row_data[4] + row_data[3] + row_data[2] + row_data[1];

									for (let nibble_index = 0; nibble_index < 16; nibble_index += 2) {
										let palette_index = ordered_row_pixel_data.charAt(14 - nibble_index) + ordered_row_pixel_data.charAt(15 - nibble_index);
										if (palette_index.charAt(0) == '0') {
											palette_index = palette_index.charAt(1);
										}
										pixel_grid[write_section[1]][write_section[0] + (nibble_index / 2)] = "0x" + palette_index;
									}
								}
								if (pal_col == 16 || attempt_16_when_256) {
									const ordered_row_pixel_data = row_data[2] + row_data[1];

									for (let nibble_index = 0; nibble_index < 8; nibble_index++) {
										pixel_grid[write_section[1]][write_section[0] + nibble_index] = "0x" + ordered_row_pixel_data.charAt(7 - nibble_index);
									}
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
			alert("Could not find sprite label `" + sprite_name.value + ":` in file");
		}
	}
}
