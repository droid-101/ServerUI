#!/bin/bash

echo "=============== BEGINNING ARCHIVING ================"


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

zip -r "${WORLD}.deleted.zip" "$WORLD"
rm -rv "$WORLD"
mv "${WORLD}.deleted.zip" ../archive/

echo "=============== FINISHED ARCHIVING ================"
