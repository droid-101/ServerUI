#!/bin/bash

cd ../temp

if ! test -f "world.zip"
then
    echo "The world.zip does not exist"
    exit 1
fi

mv world.zip ..
rm -r *
mv ../world.zip .
unzip world.zip
rm world.zip
WORLD_FOLDER="$(ls)"
WORLD_NAME="$(ls | tr -d \'\")"
mv "$WORLD_FOLDER" "$WORLD_NAME"

if test -d "../worlds/${WORLD_NAME}"
then
    echo "The world ${WORLD_NAME} already exists"
    exit 1
fi

echo "Adding world ${WORLD_NAME}"
mv "$WORLD_NAME" "../worlds/${WORLD_NAME}"
