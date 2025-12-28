#!/bin/bash

if [ ! $cachepath ]; then
  exit 1
fi
if [ ! $backuppath ]; then
  exit 1
fi
if [ ! $filename ]; then
  exit 1
fi
if [ ! $serverpath ]; then
  exit 1
fi

if [ -d $cachepath ]; then
  exit 2
fi
if [ ! -f "$backuppath/$filename.tar.gz" ]; then
  exit 3
fi

if [ ! -d $serverpath ]; then
    mkdir -p $serverpath
fi

rm -rf $serverpath/*
tar -xzf "$backuppath/$filename.tar.gz" -C "$serverpath"
rm -rf $cachepath

exit 0