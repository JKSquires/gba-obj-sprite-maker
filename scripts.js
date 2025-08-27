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

function savePaletteDialog() {
	palette_dialog.close();
}

function colorButtonFunc(col_num) {
	if (edit_palette) {
		console.log("Edit " + col_num);
		palette_dialog.showModal();
	} else {
		console.log("Use " + col_num);
	}
}

function loadPaletteButtons() {
	let col_num;
	if (pal_256) {
		col_num = 256;
	} else {
		col_num = 16;
	}

	for (let col_index = 0; col_index < col_num; col_index++) {
		let col_button = document.createElement("button");
		col_button.id = "col_" + col_index;
		col_button.innerHTML = "0x" + col_index.toString(16);
		col_button.onclick = () => colorButtonFunc(col_index);
		
		col_button.dataset.color = "7fff"; // parseInt("7fff", 16);
		
		palette_div.appendChild(col_button);
	}
}

function toggleEditPalette() {
	edit_palette = !edit_palette

	if (edit_palette) {
		palette_mode.innerHTML = "Palette Mode: Edit";
	} else {
		palette_mode.innerHTML = "Palette Mode: Use";
	}
}

loadPaletteButtons();
