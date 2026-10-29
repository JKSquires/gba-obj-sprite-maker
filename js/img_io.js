/* Builds and downloads a 16-bit bitmap image file
Parameters:
- depth (integer): either 16 or 24 denoting color depth
Globals Used:
- dim
- pixel_grid
- sprite_name
Side-Effects:
- Downloads a file
Return: (undefined) */
function saveBMP(depth) {
	if (depth == 15) {
		depth = 16;
	}
	if (depth != 16 && depth != 24) {
		console.error("Color depth should be either 16 or 24 for saving BMP file");
		return;
	}
	const file_size = 54 + dim[0] * dim[1] * (depth == 16 ? 2 : 3);

	let bmp_data = new Uint8Array(file_size);

	/* Write 16-bit (halfword) to BMP data in little-endian at a given index.
	Parameters:
	- i (integer): the index in the array to write to
	- halfword (integer): the 16-bit value to write
	Side-Effects:
	- Updates values in `bmp_data`
	Return: (undefined) */
	function writeH(i, halfword) {
		bmp_data[i] = halfword & 0xFF;
		bmp_data[i + 1] = (halfword & 0xFF00) >> 8;
	}

	/* Write 3 bytes to BMP data in little-endian at a given index.
	Parameters:
	- i (integer): the index in the array to write to
	- data (integer): the 24-bit value to write
	Side-Effects:
	- Updates values in `bmp_data`
	Return: (undefined) */
	function write3B(i, data) {
		bmp_data[i] = data & 0xFF;
		bmp_data[i + 1] = (data & 0xFF00) >> 8;
		bmp_data[i + 2] = (data & 0xFF0000) >> 16;
	}

	/* Write 32-bit (word) to BMP data in little-endian at a given index.
	Parameters:
	- i (integer): the index in the array to write to
	- word (integer): the 32-bit value to write
	Side-Effects:
	- Updates values in `bmp_data`
	Return: (undefined) */
	function writeW(i, word) {
		bmp_data[i] = word & 0xFF;
		bmp_data[i + 1] = (word & 0xFF00) >> 8;
		bmp_data[i + 2] = (word & 0xFF0000) >> 16;
		bmp_data[i + 3] = (word & 0xFF000000) >> 24;
	}

	let img_dim = dim.map((d) => parseInt(d));

	// header
	writeH(0, 0x4D42); // signature
	writeW(2, file_size); // file size
	bmp_data[10] = 0x36; // color data offset

	// info header
	bmp_data[14] = 0x28; // info header size
	writeW(18, img_dim[0]); // image width
	writeW(22, img_dim[1]); // image height
	bmp_data[26] = 1; // number of planes
	bmp_data[28] = depth; // bits per pixel

	// color data
	let color_data_i = 0x36;
	if (depth == 16) {
		for (let y = img_dim[1] - 1; y >= 0; y--) {
			for (let x = 0; x < img_dim[0]; x++) {
				const color_bgr = parseInt(document.getElementById("col_" + pixel_grid[y][x]).dataset.color15b, 16);
				const color_rgb = ((color_bgr & 0b0000000000011111) << 10) | (color_bgr & 0b0000001111100000) | ((color_bgr & 0b0111110000000000) >> 10);

				writeH(color_data_i, color_rgb);

				color_data_i += 2;
			}
		}
	} else if (depth == 24) {
		for (let y = img_dim[1] - 1; y >= 0; y--) {
			for (let x = 0; x < img_dim[0]; x++) {
				const color_rgb = parseInt(document.getElementById("col_" + pixel_grid[y][x]).dataset.color24b, 16);

				write3B(color_data_i, color_rgb);

				color_data_i += 3;
			}
		}
	}

	// download BMP file
	const data_url = URL.createObjectURL(new Blob([bmp_data]));
	const link = document.createElement("a");
	link.href = data_url;
	link.download = sprite_name.value + "-" + depth + "b.bmp";

	link.click();
	URL.revokeObjectURL(data_url);
}
