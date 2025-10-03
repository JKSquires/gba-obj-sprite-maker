# gba-obj-sprite-maker

A tool that allows you to create sprites and palettes in ARM Assembly for objects on the Game Boy Advance.

---

**Note: this tool was created with making sprites and palette data in the forefront, so loading data from external sources is not completely supported!**

If you really want to do it, here's a rough explanation of the format:

Labels must use a colon at the end. The data must be formatted with halfword (16-bit) or word (32-bit) directives. Sprite data must be written in hexadecimal (little-endian) and use '0x' or '$' prefixes, but palette data can be either binary (using `0b` or `%` prefixes) or hexadecimal (using `0x` or `$` prefixes). With sprite data, the halfwords need to be in pairs (e.g. `@DCW 0x3210, 0x7654`) and words need to be singular (e.g. `@DCD 0x76543210`), and palette data must use single halfwords (e.g. `@DCW 0x3210` or `@DCW %0b011001000010000`). Data must be padded with zeros.

See [example1.asm](examples/example1.asm) for a simple example palette and sprite. In this example, the *halfword directive* is `@DCW`, the *hexadecimal prefix* is '0x', the *palette name* is `palette`, the *sprite name* is `sprite`, and the *size* is `8x8`.

See [example2.asm](examples/example2.asm) for a more complicated example palette and sprite. In this example, the *halfword directive* is `@DCW`, the *word directive* is `@DCD`, the *hexadecimal prefix* is '0x', the *binary prefix* is '%', the *palette name* is `palette`, the *sprite name* is `sprite`, and the *size* is `16x16`.


