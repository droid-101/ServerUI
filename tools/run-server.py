import os
import sys

mem = sys.argv[1]

os.system("#!/bin/bash")
os.system("java -Xmx" + mem + " -Xmx" + mem + " -jar server.jar nogui")