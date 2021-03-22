import subprocess

cpu_usage = 0

out = subprocess.check_output(['mpstat', '-P', 'ALL', '1', '1'])
out = out.decode("UTF-8")
out = out.split("\n")

for i in range(4, 8):
    stats = out[i]
    stats = stats.split()
    cpu_usage += float(stats[3])

cpu_usage = round(cpu_usage, 2)
print(str(cpu_usage))