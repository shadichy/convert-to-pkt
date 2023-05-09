#!/usr/bin/env bash
grep -E "^$1" "pkgsrc/.PKGINFO" | awk -F" = " '{print $2}'
