#! /usr/bin/python3
import os, re, contextlib as ctx

with ctx.suppress(Exception), open('./update.txt', 'r') as fp:
    lns = [re.sub('[\n ]','', x) for x in fp.readlines() if len(x) > 1]
tt = {lns[2*i]: lns[2*i+1] for i in range(int(len(lns)/2))}

bfiles = [f for f in os.listdir('./Dolphin') if f.startswith('bookmark')]
bfiles.sort()
with ctx.suppress(Exception), open('./Dolphin/' + bfiles[-1], 'r') as fp:
    lns = fp.readlines()

ulns = []
for line in lns:
    if line.startswith('<DT><A HREF="') and line.endswith('</A>\n'):
        a, b = line.rfind('">') + 2, line.rfind('=')
        key = line[a:b].strip(' ')
        if key in tt:
            line = line[0:a] + key + ' = ' + tt[key] + '</A>\n'
    ulns.append(line)

with ctx.suppress(Exception), open('./Dolphin/updated.html', 'w') as fp:
    fp.writelines(ulns)
