#!/usr/bin/env node

import { execSync, exec } from "node:child_process";

execSync("[ $EUID = 0 ]");
execSync("mkdir -p pkgsrc/.packit-compatible");

const input = process.argv[2];
if (!input) throw Error("No input file specified");

const pkgdir = "/usr/share/c2pkt/archlinux",
	exSync = (cmd) => execSync(cmd).toString().trim(),
	att = (id) => exSync(`${pkgdir}/catr "${id}"`),
	arrt = (id) =>
		exSync(`${pkgdir}/catr "${id}" | sed -r 's/[><]*=/ /g'`)
			.split(/\r?\n/)
			.map((pkg) => {
				const info = pkg.split(" ");
				return {
					id: info[0],
					version: info[1] ?? "",
				};
			});

execSync(`tar -C pkgsrc/ -xaf ${input}`);
const arch = att("arch"),
	meta = {
		id: att("pkgname"),
		description: att("pkgdesc"),
		version: att("pkgver"),
		arch: arch == "any" ? "all" : arch,
		packit_ver: exSync("packit --version"),
	},
	src = {
		url: att("url"),
		author: att("packager"),
		license: att("license"),
		builddate: att("builddate"),
	},
	arch_compat = {
		id: meta.id,
		version: meta.version,
		depend: arrt("depend"),
		opt_depend: arrt("optdepend"),
		provides: arrt("provides"),
	};
src.sourcecode = src.url;

exec(`[ -e pkgsrc/opt ] && ${pkgdir}/remap ${meta.id}/${meta.arch}/${meta.version}`, (e, o, i) => undefined);

exec(`rm -rf pkgsrc/.BUILDINFO pkgsrc/.PKGINFO pkgsrc/.MTREE`, (e, o, i) => undefined);
exec(`[ -e pkgsrc/.INSTALL ] && mv pkgsrc/.INSTALL pkgsrc/.install`, (e, o, i) => undefined);

execSync(`echo '${JSON.stringify(meta)}'>./pkgsrc/.packit`);
execSync(`echo '${JSON.stringify(src)}'>./pkgsrc/.source`);
execSync(`echo '${JSON.stringify(arch_compat)}'>./pkgsrc/.packit-compatible/archlinux.json`);
execSync("cd pkgsrc && find . | grep -E '^\\./(s?bin|lib(32|64)?|etc|usr|var)' | sed 's|\\./||g'>.files; cd ..");

// console.info("Writing out", `${dist_info.id}-${dist_info.version}.pkt.sfs`);
exSync(`mksquashfs pkgsrc/ ${meta.id}-${meta.version}.pkt.sfs -comp zstd -Xcompression-level 22 -b 1M -no-duplicates -no-recovery -always-use-fragments`);

exec(`rm -rf pkgsrc/`, (e, o, i) => undefined);
