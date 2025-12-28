#!/bin/bash

if [ ! $cachepath ]; then
    exit 1;
fi
if [ ! $backuppath ]; then
    exit 1;
fi
if [ ! $backupname ]; then
    exit 1;
fi
if [ ! $serverpath ]; then
    exit 1;
fi

if [ -d $cachepath ]; then
    exit 2;
fi
if [ ! -d $serverpath ]; then
    exit 3;
fi

mkdir $cachepath
cp -r $serverpath/* $cachepath
tar -czf "$backuppath/$backupname.tar.gz" -C "$cachepath" .
rm -rf $cachepath

exit 0
