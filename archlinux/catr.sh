#!/bin/sh
grep -E "^$1" "pkgsrc/.PKGINFO" | awk -F" = " '{print $2}'
