#! /usr/bin/python3
import contextlib as ctx

with ctx.suppress(Exception), open('./update.txt', 'r') as fp:
    lns = [x.replace('\n', '') for x in fp.readlines() if len(x) > 1]
tt = {lns[2*i]: lns[2*i+1] for i in range(int(len(lns)/2))}

with ctx.suppress(Exception), open('./dolphin.html', 'r') as fp:
    lns = fp.readlines()

ulns = []
for line in lns:
    if line.startswith('<DT><A HREF="') and line.endswith('</A>\n'):
        a, b = line.rfind('">') + 2, line.rfind('=')
        key = line[a:b].strip(' ')
        if key in tt:
            line = line[0:a] + key + ' = ' + tt[key] + '</A>\n'
    ulns.append(line)

with ctx.suppress(Exception), open('./updated.html', 'w') as fp:
    fp.writelines(ulns)
