#!/bin/bash

SD_BACKUP=/mnt/sdcard/minecraft/backups

echo "=============== BACKUP STARTING ==============="

cd ../temp
rm -rv *

for SRC in ../worlds/*
do
    WORLD=`basename "$SRC"`
    echo "Backing up" $WORLD
    zip -r "${WORLD}.latest.zip" "$SRC"

    cp -v "${WORLD}.latest.zip" ../backups/
    rm -rvf ../backups/"${WORLD}.zip"
    mv -v ../backups/"${WORLD}.latest.zip" ../backups/"${WORLD}.zip"
    echo "Saved ${WORLD} to SSD"

    if cat /proc/mounts | grep /dev/mmcblk0p1 > /dev/null
    then
        echo "SD Card has been mounted"
        echo "Backup to SD Card will begin"

        cp -v "${WORLD}.latest.zip" "$SD_BACKUP"
        rm -rvf "${SD_BACKUP}/${WORLD}.zip"
        mv -v "${SD_BACKUP}/${WORLD}.latest.zip" "${SD_BACKUP}/${WORLD}.zip"
        echo "Saved "${WORLD}" to SD Card"
    else
        echo "SD Card is not mounted"
        echo "Backup to SD Card will not occur"
    fi

    rm -rv *
done

echo "=============== BACKUP COMPLETE ================"
