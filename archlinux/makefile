DESTDIR=/

BIN=\
	dist/arch2pkt \

SCRIPTS=\
	dist/catr \
	dist/remap \

all: install

prepare:
	rm -rf dist
	mkdir -p $(DESTDIR)/usr/bin
	mkdir -p $(DESTDIR)/usr/share/c2pkt/archlinux

build: prepare
	npm rollup -c rollup.config.js --bundleConfigAsCjs
	./minifier/minifier.sh -sh /bin/sh -o dist/catr catr.sh
	./minifier/minifier.sh -sh /bin/sh -o dist/remap remap.sh

install: build
	install -dm0755 $(DESTDIR)/usr/bin
	install -m0755 ${BIN} $(DESTDIR)/usr/bin

	install -dm0755 $(DESTDIR)/usr/share/c2pkt/archlinux
	install -m0755 ${SCRIPTS} $(DESTDIR)/usr/share/c2pkt/archlinux
	rm -rf dist
