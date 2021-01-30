#!/bin/bash

cpu_stats()
{
    echo `python3 ../repo/tools/cpu-stats.py`
}

ram_stats()
{
    local RAM=`free -h --si | grep Mem`

    i=0
    for value in $RAM
    do
        i=$((i+1))
        if [[ $i -eq 3 ]]
        then
            echo "$value"
            return;
        fi
    done
}

ip()
{
    echo `dig +short myip.opendns.com @resolver1.opendns.com`
}

echo "`cpu_stats`% `ram_stats`B" `ip`