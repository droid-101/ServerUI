#/bin/bash

EMAIL=""
USERNAME=""

if [[ $# -lt 1 ]]
then
	echo "Please specify who you are"
	exit 1
fi

if [[ $# -gt 1 ]]
then
	echo "ERROR: Too many names"
	exit 1
fi

if [[ $1 == "kyle" ]]
then
	EMAIL="kylepinto@yahoo.ca"
	USERNAME="bricktrooper"
elif [[ $1 == "shane" ]]
then
	EMAIL="shanepinto18@yahoo.com"
	USERNAME="droid-101"
else
	echo "ERROR: You are not a valid user"
	exit 1
fi

git config --global user.email $EMAIL
git config --global user.name $USERNAME
git config --list
