import os, re, contextlib as ctx

src = '/storage/emulated/0/Download/Misc Links.txt'
tar_dir = '/storage/emulated/0/qpython/scripts3/Dolphin/'

with ctx.suppress(Exception), open(src, 'r') as fp:
    lns = fp.readlines()
a, b = [i for i, x in enumerate(lns) if '~'*10 in x]
lns = [x for x in [re.sub('[\n\t ]', '', x) for x in lns[a+1:b]] if x]
tt = {lns[i]: lns[i+1] for i in range(0, len(lns), 2)}

bfs = sorted([f for f in os.listdir(tar_dir) if f.startswith('Book')])
with ctx.suppress(Exception), open(tar_dir + bfs[-1], 'r') as fp:
    ulns = []
    for line in fp.readlines():
        if line.startswith('<DT><A HREF="') and line.endswith('</A>\n'):
            a, b = line.rfind('">') + 2, line.rfind('=')
            key = line[a:b].strip(' ')
            if key in tt:
                line = line[0:a] + key + ' = ' + tt[key] + '</A>\n'
        ulns.append(line)

with ctx.suppress(Exception), open(tar_dir + 'updated.html', 'w') as fp:
    fp.writelines(ulns)
