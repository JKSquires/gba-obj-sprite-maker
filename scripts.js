let pal_col = 16;
let edit_palette = false;
let selected_color = "0";
let dim;
let pixel_grid;

function col15bToCol24b(col_15b) {
	const scale = 8.22581;

	let r = (col_15b & 0x1F) * scale;
	let g = ((col_15b & 0x3E0) >> 5) * scale;
	let b = ((col_15b & 0x7C00) >> 10) * scale;

	return (r << 16) | (g << 8) | b;
}

function col24bToCol15b(col_24b) {
	const scale = 0.121569;

	let b = (col_24b & 0xFF) * scale;
	let g = ((col_24b & 0xFF00) >> 8) * scale;
	let r = ((col_24b & 0xFF0000) >> 16) * scale;

	return (b << 10) | (g << 5) | r;
}

function updateColorButtonTextColor(button) {
	let r = parseInt(button.dataset.color24b.substring(0,2));
	let g = parseInt(button.dataset.color24b.substring(2,4));
	let b = parseInt(button.dataset.color24b.substring(4,6));
	
	let lum = 0.3 * r + 0.6 * g + 0.1 * b;

	button.style.color = lum < 0x7F ? "#fff" : "#000";
}

function updatePaletteColorSelection(col_num) {
	let button = document.getElementById("col_" + col_num);

	selected_color = col_num;

	pal_col_sel.innerText = col_num + ": 0x" + button.dataset.color15b;
	pal_col_sel.style.backgroundColor = '#' + button.dataset.color24b;
	pal_col_sel.style.color = button.style.color;
}

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

function colorButtonFunc(col_num) {
	if (edit_palette) {
		console.log("Edit " + col_num);
		
		let button = document.getElementById("col_" + col_num);

		color_conv_box.value = "";
		pal_col_picker.value = '#' + button.dataset.color24b;
		pal_col_code.value = button.dataset.color15b;

		pal_col_id.innerText = col_num;

		palette_dialog.showModal();
	} else {
		console.log("Use " + col_num);
		
		updatePaletteColorSelection(col_num);
	}
}

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

function saveData(selection, file_name) { // selections: 0b_1: palette; 0b1_: sprite
	let text = "";
	if (selection & 1) {
		let palette_data = "";

		text += pal_name.value + ":\n";

		for (let col_num = 0; col_num < pal_col; col_num++) {
			palette_data += word_dir.value + " 0x" + document.getElementById("col_0x" + col_num.toString(16)).dataset.color15b + '\n';
		}

		text += palette_data;
	}
	if (selection & 2) {
		let sprite_data = "";

		text += sprite_name.value + ":\n";

		for (let row_sec = 0; row_sec < dim[1]; row_sec += 8) {
			for (let col_sec = 0; col_sec < dim[0]; col_sec += 8) {
				for (let row = row_sec; row < row_sec + 8; row++) {
					sprite_data += word_dir.value + " 0x" +
						pixel_grid[row][col_sec + 3].substring(2) +
						pixel_grid[row][col_sec + 2].substring(2) +
						pixel_grid[row][col_sec + 1].substring(2) +
						pixel_grid[row][col_sec].substring(2) + ", 0x" +
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

async function loadPalData() {
	let file = load_pal.files[0];

	if (file) {
		let text = (await file.text()).split('\n');

		let found = false;

		for (let line_num = 0; line_num < text.length; line_num++) {
			let line = text[line_num].replaceAll('\r', '');
			console.log("Searching for palette `" + pal_name.value + "` label in line: " + line);

			if (line.length >= pal_name.value.length + 1) {
				if (line.substring(0, pal_name.value.length + 2) == pal_name.value + ':') {
					console.log("Found Palette Label");

					found = true;

					for (let color_line_num = 0; color_line_num < pal_col && color_line_num < text.length - line_num; color_line_num++) {
						// if there are random new lines or comment lines, or really anything other than palette data, this logic doesn't work with the data well. `color_line_num < pal_col` too.
						line = text[color_line_num + line_num + 1].replaceAll('\r', '');
						console.log("Parsing line for color: " + line);
						line = line.split(';')[0];

						if (line.length < word_dir.value.length) {
							break;
						}
						if (line.substring(0, word_dir.value.length) != word_dir.value) {
							break;
						}

						let color = line.substring(word_dir.value.length).replaceAll(' ', '').replaceAll('\t', '');
						color = color.replaceAll("0x", "");

						let button = document.getElementById("col_0x" + color_line_num.toString(16));
						let button_color = col15bToCol24b(parseInt(color, 16)).toString(16).padStart(6, '0');

						button.dataset.color15b = color;
						button.dataset.color24b = button_color;
						button.style.backgroundColor = '#' + button_color;

						updateColorButtonTextColor(button);
						
						console.log("Color found: 15b: 0x" + color + "; 24b: 0x" + button_color);
					}
					break;
				}
			}
		}

		if (!found) {
			alert("Could not find palette label `" + pal_name.value + "` in file");
		}
	}
}

async function loadSpriteData() {
	let file = load_sprite.files[0];

	if (file) {
		let text = (await file.text()).split('\n');

		let found = false;

		for (let line_num = 0; line_num < text.length; line_num++) {
			let line = text[line_num].replaceAll('\r', '');
			console.log("Searching for sprite `" + sprite_name.value + "` label in line: " + line);

			if (line.length >= sprite_name.value.length + 1) {
				if (line.substring(0, pal_name.value.length + 2) == sprite_name.value + ':') {
					console.log("Found Sprite Label");

					found = true;

					let sections = dim[0] * dim[1] / 8;

					for (let pixel_line_num = 0; pixel_line_num < sections && pixel_line_num < text.length - line_num; pixel_line_num++) {
						// see comment in loadPalData() in similar location
						line = text[pixel_line_num + line_num + 1].replaceAll('\r', '');
						console.log("Parsing line for pixel data: " + line);
						line = line.split(';')[0];

						if (line.length < word_dir.value.length) {
							break;
						}
						if (line.substring(0, word_dir.value.length) != word_dir.value) {
							break;
						}

						let row_data = line.replaceAll(' ', '').replaceAll('\t', '').replaceAll(',', '').split("0x");
						
						let ordered_row_pixel_data = row_data[2] + row_data[1]
						console.log("Pixel data found: 0x" + ordered_row_pixel_data);
					}
					break;
				}
			}
		}

		if (!found) {
			alert("Could not find sprite label `" + sprite_name.value + "` in file");
		}
	}
}

function updateSpritePixel(x, y) {
	console.log(x, y);

	pixel_grid[y][x] = selected_color;

	let pixel = document.getElementById("grid_" + x + ',' + y);
	
	pixel.style.backgroundColor = '#' + document.getElementById("col_" + pixel_grid[y][x]).dataset.color24b;
	pixel.title = "(" + x + ", " + y + "): " + pixel_grid[y][x];
}

function updateSpriteGrid() {
	if (!dim || !pixel_grid) {
		return;
	}

	let scale = 1 + 10 * grid_scale.value;

	let grid = "";
	for (let row = 0; row < dim[1]; row++) {
		grid += "<tr>";
		for (let col = 0; col < dim[0]; col++) {
			grid += "<td style='width:" + scale + "px;height:" + scale + "px;background-color:#" + document.getElementById("col_" + pixel_grid[row][col]).dataset.color24b + ";' " +
				"title='(" + col + ", " + row + "): 0x0' " +
				"onclick='updateSpritePixel(" + col + ',' + row + ");' " +
				"id='grid_" + col + ',' + row + "'>" + "</td>";
		}
		grid += "</tr>";
	}

	sprite_grid.innerHTML = grid;
}

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

function updateNumColorPalette() {
	pal_col = num_color_checkbox.checked ? 256 : 16;

	loadPaletteButtons();
	updateGridSize();
}

function btn15bTo24b() {
	let val = col15bToCol24b(parseInt(color_conv_box.value, 16));
	color_conv_box.value = val.toString(16).padStart(6, '0');
}

function btn24bTo15b() {
	let val = col24bToCol15b(parseInt(color_conv_box.value, 16));
	color_conv_box.value = val.toString(16).padStart(4, '0');
}

function selPalColByPicker() {
	let val = col24bToCol15b(parseInt(pal_col_picker.value.substring(1), 16));
	pal_col_code.value = val.toString(16).padStart(4, '0');
}

function updateEditPalette() {
	edit_palette = edit_palette_checkbox.checked;
}

function updatePalColPicker() {
	let val = col15bToCol24b(parseInt(pal_col_code.value, 16));
	pal_col_picker.value = '#' + val.toString(16).padStart(6, '0');
}

updateEditPalette();
updateNumColorPalette();
updatePalColPicker();
