#! /usr/bin/python3

import os
import shutil

from sys import argv
from os import path

def print_usage():
	print("Usage: {} <world>".format(path.basename(argv[0])))

if len(argv) != 2:
    print("Incorrect arguments")
    print("Please specify the name of the world to delete")
    print("The world will be moved to the archive/ folder")
    print_usage()
    exit(1)

mcserver = os.getenv("MCSERVER")
worlds = mcserver + "/worlds/"
temp = mcserver + "/temp/"

os.chdir(worlds)

world = str(argv[1])

if not path.isdir(world):
    print("The world '{}' does not exist".format(world))
    exit(1)

print("=============== BEGINNING ARCHIVING ================")

deleted = "{}.deleted.zip".format(world)

os.system("zip -r '{}' '{}'".format(deleted, world))
shutil.rmtree(world)

destination = mcserver + "/archive/" + deleted
shutil.move(deleted, destination)

print("=============== FINISHED ARCHIVING ================")
