#! /usr/bin/python3

import os
import shutil

from sys import argv
from os import path

def print_usage():
	print("Usage: {} <world.zip>".format(path.basename(argv[0])))

num_args = len(argv)

if num_args < 2:
	print("Please specify the new world zip file")
	print("The zip file should be placed under the temp folder")
	print_usage()
	exit(1)

if num_args > 2:
	print("Too many arguments")
	print_usage()
	exit(1)

print("================== SETTING WORLD ===================")

mcserver = os.getenv("MCSERVER")
temp = mcserver + "/temp/"
zip_file = str(argv[1])

os.chdir(temp)

if not path.isfile(zip_file):
	print("\"{}\" does not exist".format(zip_file))
	exit(1)

print("=============== ADDING WORLD ===============")

shutil.move(zip_file, "../")
os.system("rm -rf *")
shutil.move("../" + zip_file, ".")

os.system("unzip \"{}\"".format(zip_file))
os.remove(zip_file)

original = os.listdir()[0]
world = original.replace("\'", "")
world = world.replace("\"", "")
os.rename(original, world)

destination = mcserver + "/worlds/" + world

if path.exists(destination):
	print("The world \"{}\" already exists".format(world))
	os.system("rm -rf *")
	exit(1)

print("Adding world \"{}\"".format(world))
shutil.move(world, destination)
os.system("rm -rf *")

print("=============== ADDING COMPLETE ===============")
