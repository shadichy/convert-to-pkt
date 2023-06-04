#!/bin/sh
PKG=$1
for dir in bin sbin lib lib32 lib64 etc usr var; do
  if [ ! -d pkgsrc/$dir ]; then
    continue
  fi
  while read -r file; do
    if [ -h "$file" ]; then
      filelink=$(readlink "$file")
      case $filelink in
      /opt*)
        rm -rf "$file"
        ln -s "/run/extos/packages/${PKG}${filelink}" "$file"
        ;;
      esac
    elif [ -f "$file" ] && file "$file" | grep ' text ' && grep /opt "$file"; then
      sed -i -E "s|/opt|/run/extos/packages/${PKG}/opt|g" "$file"
    fi
  done < <(find pkgsrc/$dir/)
done
