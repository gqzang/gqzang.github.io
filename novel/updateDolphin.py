import os, re, contextlib, requests

ciphers = 'TLS13-CHACHA20-POLY1305-SHA256:TLS13-AES-128-GCM-SHA256:' \
          'TLS13-AES-256-GCM-SHA384:ECDHE:!COMPLEMENTOFDEFAULT'
docid = '1aSKOYuXU1s08DJU0FahGBNXbrAFlgJ_YJ9v3EwN50kU'
url = f'https://docs.google.com/document/d/{docid}/export?format=txt'
bdir = os.path.dirname(os.path.abspath(__file__)) + '/Dolphin/'
xtr = lambda x: eval(x.lower().replace('end', '9'*6).replace('-', '*3000+'))

with contextlib.suppress(Exception):
    requests.packages.urllib3.util.ssl_.DEFAULT_CIPHERS = ciphers
    lns = requests.get(url).content.decode('utf-8').split('\n')
    a, b = [i for i, x in enumerate(lns) if '~'*10 in x][0:2]
    lns = [x for x in [re.sub('[\r\t ]', '', x) for x in lns[a+1:b]] if x]
    ulns, nu, tt = [], 0, {lns[i]: lns[i+1] for i in range(0, len(lns), 2)}
    with open(bdir + max([f for f in os.listdir(bdir)]), 'r') as fp:
        for ln in fp.readlines():
            if ln.startswith('<DT><A HREF="') and ln.endswith('</A>\n'):
                a, b, c = ln.rfind('">'), ln.rfind('='), ln.rfind('</')
                k, val = ln[a+2:b].strip(' '), ln[b+1:c].strip(' ')
                if k in tt:
                    u, v = xtr(tt[k]), xtr(val)
                    ln = ln if u < v else f'{ln[0:a+2]}{k} = {tt[k]}</A>\n'
                    nu += 1 if u > v else 0
                    if u < v:
                        print(f'{k} = {tt[k]} < {val}     old')
                    del tt[k]
            ulns.append(ln)
    with open(bdir + 'Adjusted.html', 'w') as fp:
        fp.writelines(ulns)
    print('\n'.join([f'{k} = {v}     Missing' for k, v in tt.items()]))
    print(f'\n{nu} records are updated.')
