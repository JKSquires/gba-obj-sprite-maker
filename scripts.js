let pal_256 = false;

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

function loadPaletteButtons() {
	let color_num;
	if (pal_256) {
		color_num = 256;
	} else {
		color_num = 16;
	}

	for (let col_index = 0; col_index < color_num; col_index++) {
		let col_button = document.createElement("button");
		col_button.id = "col_" + col_index;
		col_button.innerHTML = "0x" + col_index.toString(16);
		
		col_button.dataset.color = "7fff"; // parseInt("7fff", 16);
		
		palette_div.appendChild(col_button);
	}
}

loadPaletteButtons();
