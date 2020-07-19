#!/bin/bash

if [[ $# -lt 1 ]]
then
    echo "Please specify a world name"
    exit 1
fi

if [[ $# -gt 1 ]]
then
    echo "Only one argument is allowed"
    exit 1
fi

WORLDS_FOLDER="../worlds/"
WORLD=${WORLDS_FOLDER}${1}

if test -d "$WORLD"
then
    echo "${WORLD} exists"
    rm world
    ln -s "$WORLD" world
    echo "Setting world to ${WORLD}"
else
    echo "${WORLD} does not exist"
    exit 1
fi