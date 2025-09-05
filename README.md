# gba-obj-sprite-maker

A tool that allows you to create sprites and palettes in ARM Assembly for objects on the Game Boy Advance.

**Note on loading data that wasn't created with this tool:**

Labels must use a colon at the end. The data must be formatted with halfword directives. The data must be written in hexadecimal (little-endian) and use '0x'.

See [example.asm](example.asm) for an example palette and sprite. In this example, the *halfword directive* is `@DCW`, the *palette name* is `palette`, the *sprite name* is `sprite`, and the *size* is `8x8`.

