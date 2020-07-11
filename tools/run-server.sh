#!/bin/bash

if [[ $# -lt 1 ]]
then
    echo "Please specify an amount of RAM to run the server with"
    exit 1
fi

echo "Running server with ${1} of RAM"
echo "Loading server..."

cd ../../server
java -Xmx${1} -Xmx${1} -jar server.jar nogui
