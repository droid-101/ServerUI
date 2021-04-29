#! /usr/bin/python3

import os
import shutil

from subprocess import getoutput
from os import path

MCSERVER = os.getenv("MCSERVER")
WORLDS = MCSERVER + "/worlds/"
TEMP = MCSERVER + "/temp/"
BACKUPS = MCSERVER + "/backups/"

SDCARD = "/dev/mmcblk0p1"
SDCARD_BACKUPS = "/mnt/sdcard/minecraft/backups/"

def mounted(device):
    mounts = getoutput("cat /proc/mounts")
    mounts = mounts.split('\n')
    for mount in mounts:
        tokens = mount.split()
        if device in tokens:
            return True
    return False

def get_worlds():
    output = getoutput("ls '{}'".format(WORLDS))   # using ls to avoid hidden files
    return output.split('\n')

def backup(src_dir, src_file, dest_dir, dest_file):
    os.system("cp -v '{}' '{}'".format(src_dir + src_file, dest_dir + src_file))
    os.system("rm -rvf '{}'".format(dest_dir + dest_file))
    os.system("mv -v '{}' '{}'".format(dest_dir + src_file, dest_dir + dest_file))

print("=============== BACKUP STARTING ===============")

os.chdir(TEMP)
os.system("rm -rvf *")

for world in get_worlds():
    print("Backing up '{}'".format(world))

    source = WORLDS + world
    current = world + ".zip"
    latest = world + ".latest.zip"

    os.system("zip -r '{}' '{}'".format(latest, source))

    backup(TEMP, latest, BACKUPS, current)
    print("Backed up '{}' to SSD at '{}'".format(world, BACKUPS))

    if mounted(SDCARD):
        print("SD Card has been mounted")
        print("Backup to SD Card will begin")
        backup(TEMP, latest, SDCARD_BACKUPS, current)
        print("Backed up '{}' to SD Card at '{}'".format(world, SDCARD_BACKUPS))
    else:
        print("SD Card is not mounted")
        print("Backup to SD Card will not occur")

    os.system("rm -rf *")

print("=============== BACKUP COMPLETE ================")
