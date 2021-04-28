#! /usr/bin/python3

from subprocess import getoutput

def cpu_stats():
	output = getoutput("mpstat -P ALL 1 1")
	output = output.split("\n")

	cpu_usage = 0

	for i in range(4, 8):
		stats = output[i]
		stats = stats.split()
		cpu_usage += float(stats[3])

	return "{}%".format(round(cpu_usage, 2))

def ram_stats():
	output = getoutput("free -h --si | grep Mem")
	output = output.split()
	return "{}B".format(output[2])

def ip_address():
	return getoutput("dig +short myip.opendns.com @resolver1.opendns.com")

print("{} {} {}".format(cpu_stats(), ram_stats(), ip_address()))
