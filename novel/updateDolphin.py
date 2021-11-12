import os, re, contextlib as ctx, requests

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
with ctx.suppress(Exception), open(tar_dir + bfs[-1], 'r') as fp:
    ulns = []
    for line in fp.readlines():
        if line.startswith('<DT><A HREF="') and line.endswith('</A>\n'):
            a, b = line.rfind('">') + 2, line.rfind('=')
            key = line[a:b].strip(' ')
            if key in tt:
                line = line[0:a] + key + ' = ' + tt[key] + '</A>\n'
                del tt[key]
        ulns.append(line)

with ctx.suppress(Exception), open(tar_dir + 'updated.html', 'w') as fp:
    fp.writelines(ulns)

txt = '<meta http-equiv="Content-Type" content="text/html;charset=UTF-8"><html>\n'
sp = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
if tt:
    for k, v in tt.items():
        txt += k + ' = ' + v + sp + 'Missing\n'
url = 'https://gz-gae.appspot.com/upload-gcb'
fn = 'novel/odd.html'
x = requests.post(url, data={'filename':fn, 'text':txt})
pass
