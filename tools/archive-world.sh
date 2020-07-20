#!/bin/bash

if [[ $# -ne 1 ]]
then
    echo "Please specify the name of the world"
    exit 1
fi

cd ../worlds
WORLD="$1"
i=0

if ! test -d "$WORLD"
then
    echo "The world ${WORLD} does not exist"
    exit 1
fi

while test -d "../archive/${WORLD}"
do
    echo "World name will be edited in order to archived"
    i=$((i+1))
    WORLD="${1} (${i})"
    echo $WORLD
done

mv "$1" ../archive/"$WORLD"
