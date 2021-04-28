#! /usr/bin/python3

import os

from sys import argv
from os import path

def print_usage():
	print("Usage: {} <world>".format(path.basename(argv[0])))

num_args = len(argv)

if num_args < 2:
	print("Please specify a world name")
	print_usage()
	exit(1)

if num_args > 2:
	print("Only one argument is allowed")
	print_usage()
	exit(1)

print("================== SETTING WORLD ===================")

name = str(argv[1])
mcserver = os.getenv("MCSERVER")
world = mcserver + "/worlds/" + name
shortcut = mcserver + "/server/world"

if not path.isdir(world):
	print("\"{}\" does not exist".format(name))
	exit(1)

print("\"{}\" exists".format(name))

if path.exists(shortcut):
	os.remove(shortcut)

os.symlink(world, shortcut, target_is_directory=True)
print("Set world to \"{}\"".format(name))

print("================ WORLD HAS BEEN SET ================")
