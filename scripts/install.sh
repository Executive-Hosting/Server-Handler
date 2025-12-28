#!/bin/bash

if [ ! $serverpath ]; then
    exit 1;
fi
if [ ! $serverlink ]; then
    exit 1;
fi

if [ -d "$serverpath" ]; then
    exit 2;
fi

mkdir -p "$serverpath"
wget -O $serverpath/server.zip --user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0" $serverlink
unzip $serverpath/server.zip -d $serverpath
rm $serverpath/server.zip

exit 0
