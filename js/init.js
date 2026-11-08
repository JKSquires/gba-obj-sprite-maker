pal_col = 16;
edit_palette = false;
use_word = use_word_checkbox.checked;
use_bin = use_bin_checkbox.checked;
pixel_gaps = pixel_gap_checkbox.checked;
selected_color = "0";
select_swap_color = 0;
swap_colors = [null, null];


swap_col_checkbox.checked = false;


updateEditPalette();
updateNumColorPalette();
updatePalColPicker();
updateSpriteDataFormat();
updatePaletteDataFormat();
updatePixelGaps();
