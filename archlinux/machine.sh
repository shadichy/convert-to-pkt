#!/usr/bin/env bash

case "$1" in
i?86) : "x86" ;;
mips | mips64) : "mips" ;;
mipsel | mips64el) : "mipsel" ;;
arm* | aarch*) : "arm" ;;
*) : "$1" ;;
esac
base=$_

case "$1" in
*64*) : "64" ;;
*) : "32" ;;
esac
bit=$_

echo "$base $bit"
