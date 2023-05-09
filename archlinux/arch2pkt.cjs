#!/usr/bin/env node

const { execSync, exec } = require("child_process");
const { writeFileSync, readdirSync } = require("fs");
const { defaultPackages } = require("/packit-compatible/archlinux.json");

execSync("[ $EUID = 0 ]");
execSync("mkdir -p pkgsrc/");

const db = [],
	pkg = [],
	exSync = (cmd) => execSync(cmd).toString().trim(),
	internal_deps = defaultPackages.map(({ id }) => id),
	external_deps = [],
	arch_info = {};

for (const file of readdirSync("./input_packages")) {
	if (file.includes(".pkg.tar")) {
		// console.log(file);
		// break;
		execSync(`tar -C pkgsrc/ -xaf input_packages/${file}`);
		pkg.push(exSync(`./catr.sh "pkgname"`));
		db.push({
			ver: exSync(`./catr.sh "pkgver"`),
			arch: exSync(`./catr.sh "arch"`),
			desc: exSync(`./catr.sh "pkgdesc"`),
			url: exSync(`./catr.sh "url"`),
			author: exSync(`./catr.sh "packager"`),
			license: exSync(`./catr.sh "license"`),
			builddate: exSync(`./catr.sh "builddate"`),
			deps: exSync(`./catr.sh "depend" | sed -r 's/[><]*=.*$//g'`).split(/\r?\n/),
		});
	}
}

exec(`rm -rf pkgsrc/.*`, (e, o, i) => undefined);

db.forEach((packit) => {
	for (let i = 0; i < packit.deps.length; i++) {
		if (!pkg.includes(packit.deps[i])) {
			if (!internal_deps.includes(packit.deps[i])) external_deps.push(packit.deps[i]);
			packit.deps.splice(i, 1);
			i--;
		}
	}
	if (packit.deps.length == 0) packit.level = 0;
	if (packit.arch != "any") {
		let pkg_arch = exSync(`./machine.sh ${packit.arch}`).split(" ");
		pkg_arch[1] = parseInt(pkg_arch[1]);
		if (!arch_info.arch || arch_info.alterarch[1] < pkg_arch[1]) {
			arch_info.arch = packit.arch;
			arch_info.alterarch = pkg_arch;
		} else if (pkg_arch[0] != arch_info.alterarch[0]) throw new Error("Package architecture does not match");
	}
});

delete arch_info.alterarch;

var max_level = [0, 0];

function leveling(packit) {
	if (typeof packit.level == "number") return;
	let max = 0;
	for (const p of packit.deps) {
		const i = pkg.indexOf(p);
		if (typeof db[i].level != "number") leveling(db[i]);
		if (db[i].level + 1 > max) max = db[i].level + 1;
	}
	packit.level = max;
	if (packit.deps.length > max_level[0] && packit.level > max_level[1]) max_level = [packit.deps.length, packit.level];
}

db.forEach((packit) => leveling(packit));

const dist_info = {
	id: pkg[max_level[0]],
	description: db[max_level[0]].desc,
	arch: arch_info.arch,
	version: db[max_level[0]].ver,
	packit_ver: "^" + exSync(`packit --version`),
	dependencies: [] //external_deps.map((deps) => ({ id: deps, version: "" })),
};
writeFileSync("./pkgsrc/.packit", JSON.stringify(dist_info));
writeFileSync(
	"./pkgsrc/.source",
	JSON.stringify({
		url: db[max_level[0]].url,
		license: db[max_level[0]].license,
		author: db[max_level[0]].author,
		sourcecode: db[max_level[0]].url,
		builddate: db[max_level[0]].builddate,
	})
);
exSync(`mksquashfs pkgsrc/ ${dist_info.id}-${dist_info.version}.pkt.sfs -comp zstd -Xcompression-level 22 -b 1M -no-duplicates -no-recovery -always-use-fragments`);

exec(`rm -rf pkgsrc/`, (e, o, i) => undefined);
