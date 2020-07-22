#!/bin/bash

cd ../temp
rm -r *

for SRC in ../worlds/*
do
    cp -R "$SRC" .
    WORLD=`ls`
    echo "Backing up" $WORLD

    i=0
    NAME="$WORLD"

    while test -f "../backups/${WORLD}.zip"
    do
        echo "World name will be edited for backup"
        i=$((i+1))
        WORLD="${NAME} (${i})"
        echo $WORLD
    done

    zip -r "${WORLD}.zip" "$NAME"
    mv "${WORLD}.zip" ../backups/
    echo `ls ../backups`
    rm -r *
done
