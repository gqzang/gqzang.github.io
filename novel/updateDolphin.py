import os, re, contextlib as ctx, requests


def digit_v(rec):
    if '-' not in rec:
        return int(rec)
    chp, sec = rec.split('-')
    return int(chp) * 3000 + int(sec)


def comp_rec(v1, v2):
    if v1.lower() == 'end':
        return 1
    return digit_v(v1) - digit_v(v2)


ciphers = 'TLS13-CHACHA20-POLY1305-SHA256:TLS13-AES-128-GCM-SHA256:' \
          'TLS13-AES-256-GCM-SHA384:ECDHE:!COMPLEMENTOFDEFAULT'
url = 'https://docs.google.com/document/d/' \
      '1aSKOYuXU1s08DJU0FahGBNXbrAFlgJ_YJ9v3EwN50kU/export?format=txt'
tar_dir = os.path.dirname(os.path.abspath(__file__)) + '/Dolphin/'

with ctx.suppress(Exception):
    requests.packages.urllib3.util.ssl_.DEFAULT_CIPHERS = ciphers
    lns = requests.get(url).content.decode('utf-8').split('\n')
    a, b = [i for i, x in enumerate(lns) if '~'*10 in x][0:2]
    lns = [x for x in [re.sub('[\r\t ]', '', x) for x in lns[a+1:b]] if x]
    tt = {lns[i]: lns[i+1] for i in range(0, len(lns), 2)}

bfs = sorted([f for f in os.listdir(tar_dir) if f.startswith('Book')])
nu = 0
with ctx.suppress(Exception), open(tar_dir + bfs[-1], 'r') as fp:
    ulns = []
    for line in fp.readlines():
        if line.startswith('<DT><A HREF="') and line.endswith('</A>\n'):
            a, b, c = line.rfind('">') + 2, line.rfind('='), line.rfind('<')
            key, val = line[a:b].strip(' '), line[b+1:c].strip(' ')
            if key in tt:
                r = comp_rec(tt[key], val)
                if r >= 0:
                    line = line[0:a] + key + ' = ' + tt[key] + '</A>\n'
                    nu += 1 if r > 0 else 0
                else:
                    print(key + ' = ' + tt[key] + ' < ' + val + '    old')
                del tt[key]
        ulns.append(line)

with ctx.suppress(Exception), open(tar_dir + 'updated.html', 'w') as fp:
    fp.writelines(ulns)

if tt:
    for k, v in tt.items():
        print(k + ' = ' + v + '       Missing')

print('\n' + str(nu) + ' records are updated.')
