import terser from "@rollup/plugin-terser";

export default {
	input: "./arch2pkt-single.mjs",
	plugins: [terser()],
	output: {
		file: "./dist/arch2pkt",
		banner: "#!/bin/node",
		format: "cjs",
		name: "arch2pkt-single",
		exports: "none",
		sourcemap: false,
	},
};
