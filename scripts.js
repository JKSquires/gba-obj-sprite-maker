let pal_256 = false;
let edit_palette = false;

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

	pal_col_sel.innerHTML = col_num;
	pal_col_sel.style.backgroundColor = '#' + button.dataset.color24b;
	pal_col_sel.style.color = button.style.color;
}

function savePaletteDialog() {
	let col_num = pal_col_id.innerHTML;
	let button = document.getElementById("col_" + col_num);
	let color = pal_col_picker.value.substring(1);

	button.style.backgroundColor = '#' + color;
	button.dataset.color15b = col24bToCol15b(parseInt(color, 16)).toString(16).padStart(4, '0');
	button.dataset.color24b = color;
	updateColorButtonTextColor(button);

	updatePaletteColorSelection(col_num);

	palette_dialog.close();
}

function colorButtonFunc(col_num) {
	if (edit_palette) {
		console.log("Edit " + col_num);
		
		let button = document.getElementById("col_" + col_num);

		color_conv_box.value = "";
		pal_col_picker.value = '#' + button.dataset.color24b;
		pal_col_code.value = button.dataset.color15b;

		pal_col_id.innerHTML = col_num;

		palette_dialog.showModal();
	} else {
		console.log("Use " + col_num);
		
		updatePaletteColorSelection(col_num);
	}
}

function loadPaletteButtons() {
	let col_num = pal_256 ? 256 : 16;

	palette_div.innerHTML = "";

	for (let col_index = 0; col_index < col_num; col_index++) {
		let hex_index = "0x" + col_index.toString(16);
		let col_button = document.createElement("button");

		col_button.className = "pal_col_btn";
		col_button.id = "col_" + hex_index;
		col_button.innerHTML = hex_index;
		col_button.style.backgroundColor = "#000";
		
		col_button.dataset.color15b = "0000";
		col_button.dataset.color24b = "000000";
		
		col_button.onclick = () => colorButtonFunc(hex_index);

		updateColorButtonTextColor(col_button);

		palette_div.appendChild(col_button);
	}
	
	updatePaletteColorSelection("0x0");
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

function updateNumColorPalette() {
	pal_256 = num_color_checkbox.checked;
	loadPaletteButtons();
}

function updatePalColPicker() {
	let val = col15bToCol24b(parseInt(pal_col_code.value, 16));
	pal_col_picker.value = '#' + val.toString(16).padStart(6, '0');
}

updateEditPalette();
updateNumColorPalette();
updatePalColPicker();
