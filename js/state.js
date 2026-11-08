const bin_prefix = document.getElementById("bin_prefix");
const bin_sel_area = document.getElementById("bin_sel_area");
const color_conv_box = document.getElementById("color_conv_box");
const edit_palette_checkbox = document.getElementById("edit_palette_checkbox");
const grid_scale = document.getElementById("grid_scale");
const halfword_dir = document.getElementById("halfword_dir");
const hex_prefix = document.getElementById("hex_prefix");
const load_pal = document.getElementById("load_pal");
const load_sprite = document.getElementById("load_sprite");
const num_color_checkbox = document.getElementById("num_color_checkbox");
const pal_col_code = document.getElementById("pal_col_code");
const pal_col_code_bin = document.getElementById("pal_col_code_bin");
const pal_col_id = document.getElementById("pal_col_id");
const pal_col_picker = document.getElementById("pal_col_picker");
const pal_col_sel = document.getElementById("pal_col_sel");
const pal_col_swp_1 = document.getElementById("pal_col_swp_1");
const pal_name = document.getElementById("pal_name");
const palette_data = document.getElementById("palette_data");
const palette_dialog = document.getElementById("palette_dialog");
const palette_div = document.getElementById("palette_div");
const pixel_gap_checkbox = document.getElementById("pixel_gap_checkbox");
const rot_sprite_90 = document.getElementById("rot_sprite_90");
const rot_sprite_n90 = document.getElementById("rot_sprite_n90");
const sprite_grid = document.getElementById("sprite_grid");
const sprite_name = document.getElementById("sprite_name");
const sprite_pixel_table = document.getElementById("sprite_pixel_table");
const sprite_size = document.getElementById("sprite_size");
const swap_col_checkbox = document.getElementById("swap_col_checkbox");
const use_bin_checkbox = document.getElementById("use_bin_checkbox");
const use_word_checkbox = document.getElementById("use_word_checkbox");
const word_dir = document.getElementById("word_dir");
const word_dir_area = document.getElementById("word_dir_area");

let pal_col; // signifies how many colors are in the palette being used
let edit_palette; // denotes if the user is in edit-palette mode
let use_word; // denotes if sprite data will be formatted in words when importing/exporting
let use_bin; // denotes if palette data will be formatted in binary when importing/exporting
let pixel_gaps; // denotes if there should be gaps and outlines between the pixels in the editor
let selected_color; // specifies the index of the color in the palette in hexadecimal

let dim; // sprite dimensions
let pixel_grid; // grid of color indexes in palette for each pixel

let select_swap_color; // selects which palette swap color is being selected (0: none)
let swap_colors; // array to contain colors in palette to be swapped

/* Update palette mode.
Globals Used:
- edit_palette
- edit_palette_checkbox
Side-Effects:
- Updates `edit_palette`
Return: (undefined) */
function updateEditPalette() {
	edit_palette = edit_palette_checkbox.checked;
}

/* Update sprite data save mode.
Globals Used:
- use_word
- use_word_checkbox
- word_dir_area
Side-Effects:
- Updates `use_word`
- Updates `word_dir_area` style
Return: (undefined) */
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
Return: (undefined) */
function updatePaletteDataFormat() {
	use_bin = use_bin_checkbox.checked;

	bin_sel_area.style.display = use_bin ? "block" : "none";
}

/* Allows the user to edit or use a palette color.
Parameters:
- col_num (string): Hexadecimal index for the color in the palette
- force_edit (boolean): Force edit mode
Globals Used:
- edit_palette
- color_conv_box
- pal_col_picker
- pal_col_code
- pal_col_code_bin
- pal_col_id
- palette_dialog
- swap_col_checkbox
- select_swap_color
- swap_colors
- selected_color
- pixel_grid
- pal_col_swp_1
Side-Effects:
- Clears `color_conv_box` value
- Updates `pal_col_picker` value
- Updates `pal_col_code` value
- Updates `pal_col_code_bin` value
- Updates `pal_col_id` text
- Opens `palette_dialog`
- Calls `updatePaletteColorSelection` function 
- Calls `updateSpriteGrid` function
- Updates `swap_col_checkbox` checked state
- Updates `pixel_grid` values
- Updates palette button styles
- Updates `pal_col_swp_1` styles and text
- Updates `swap_colors` values
Return: (boolean)
  Always returns false  */
function colorButtonFunc(col_num, force_edit) {
	if (select_swap_color != 0) {
		let button = document.getElementById("col_" + col_num);

		swap_colors[select_swap_color - 1] = {
			col_num,
			color15b: button.dataset.color15b,
			color24b: button.dataset.color24b,
			text_color: button.style.color,
		};

		if (select_swap_color == 2) {
			let pal_col_button_1 = document.getElementById("col_" + swap_colors[0].col_num);
			let pal_col_button_2 = document.getElementById("col_" + swap_colors[1].col_num);

			pal_col_button_1.style.backgroundColor = "#" + swap_colors[1].color24b;
			pal_col_button_1.style.color = swap_colors[1].text_color;
			pal_col_button_1.dataset.color15b = swap_colors[1].color15b;
			pal_col_button_1.dataset.color24b = swap_colors[1].color24b;

			pal_col_button_2.style.backgroundColor = "#" + swap_colors[0].color24b;
			pal_col_button_2.style.color = swap_colors[0].text_color;
			pal_col_button_2.dataset.color15b = swap_colors[0].color15b;
			pal_col_button_2.dataset.color24b = swap_colors[0].color24b;

			for (let row = 0; row < pixel_grid.length; row++) {
				for (let col = 0; col < pixel_grid[0].length; col++) {
					if (pixel_grid[row][col] == swap_colors[0].col_num) {
						pixel_grid[row][col] = swap_colors[1].col_num;
					} else if (pixel_grid[row][col] == swap_colors[1].col_num) {
						pixel_grid[row][col] = swap_colors[0].col_num;
					}
				}
			}

			swap_col_checkbox.checked = false;

			swap_colors = [null, null];

			pal_col_swp_1.innerText = "--";
			pal_col_swp_1.style.backgroundColor = "#fff";
			pal_col_swp_1.style.color = "#000";

			select_swap_color = 0;

			updateSpriteGrid();
			updatePaletteColorSelection(selected_color);
		} else {
			pal_col_swp_1.innerText = swap_colors[0].col_num + ": " + swap_colors[0].color15b;
			pal_col_swp_1.style.color = swap_colors[0].text_color;
			pal_col_swp_1.style.backgroundColor = "#" + swap_colors[0].color24b;

			select_swap_color = 2;
		}
	} else if (edit_palette || force_edit) {
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

	return false;
}
