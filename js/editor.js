/* Updates a single pixel in the sprite grid to the currently selected color.
Parameters:
- x (integer): x-coordinate of the pixel
- y (integer): y-coordinate of the pixel
- e (MouseEvent): the mouse event for the action
Globals Used:
- pixel_grid
- selected_color
Side-Effects:
- Updates `pixel_grid`
- Updates corresponding sprite grid pixel background color and title
Return: (undefined)*/
function updateSpritePixel(x, y, e) {
	if (e.buttons & 2) {
		pixel_grid[y][x] = "0x0";
	} else {
		pixel_grid[y][x] = selected_color;
	}

	let pixel = document.getElementById("grid_" + x + ',' + y);
	
	pixel.style.backgroundColor = '#' + document.getElementById("col_" + pixel_grid[y][x]).dataset.color24b;
	pixel.title = "(" + x + ", " + y + "): " + pixel_grid[y][x];
}

/* Updates sprite grid pixel when mouse is clicked
Parameters:
- x (integer): x-coordinate of the pixel
- y (integer): y-coordinate of the pixel
- e (MouseEvent): the mouse event for the action
Side-Effects:
- Calls updateSpritePixel` function`
Return: (undefined)*/
function dragUpdateSpritePixel(x, y, e) {
	if (e.buttons) {
		updateSpritePixel(x, y, e);
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
Return: (undefined) */
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
				"onmousedown='updateSpritePixel(" + col + ',' + row + ",event);' " +
				"onmouseenter='dragUpdateSpritePixel(" + col + ',' + row + ",event);' " +
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
Return: (undefined) */
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

/* Updates the gaps and outlines between pixels based on checkbox state
Globals Used:
- pixel_gaps
Side-Effects:
- Updates `pixel_gaps`
- Updates `sprite_pixel_table` style
- Updates CSS variable `--editor-pixel-border`
Return: (undefined) */
function updatePixelGaps() {
	pixel_gaps = pixel_gap_checkbox.checked;

	let border_width;
	if (pixel_gaps) {
		sprite_pixel_table.style.borderCollapse = "separate";
		border_width = "1px";
	} else {
		sprite_pixel_table.style.borderCollapse = "collapse";
		border_width = "0";
	}

	document.documentElement.style.setProperty("--editor-pixel-border", border_width);
}
