#! /usr/bin/python3

import os

from sys import argv
from os import path

def print_usage():
	print("Usage: {} <name>".format(path.basename(argv[0])))

if len(argv) != 2:
	print("Incorrect arguments")
	print_usage()
	print("Please specify who you are")
	exit(1)

name = str(argv[1])
email = ""
username = ""

if name == "kyle":
	email = "kylepinto@yahoo.ca"
	username = "bricktrooper"
elif name == "shane":
	email = "shanepinto18@yahoo.com"
	username = "droid-101"
else:
	print("You are not a valid user")
	exit(1)

os.system("git config --global user.email '{}'".format(email))
os.system("git config --global user.name '{}'".format(username))
os.system("git config --list")
