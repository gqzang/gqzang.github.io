import os, re, time, datetime, pytz, contextlib as ctx, requests as req

docid = '1aSKOYuXU1s08DJU0FahGBNXbrAFlgJ_YJ9v3EwN50kU'
url = f'https://docs.google.com/document/d/{docid}/export?format=txt'
bdir = '/var/sftp/uploads/Dolphin/' if 1 else './Dolphin/'
xtr = lambda x: eval(x.lower().replace('end', '9'*6).replace('-', '*3000+'))

while not time.sleep(60):
    with ctx.suppress(Exception):
        msg, nu, lns = '', 0, req.get(url).content.decode('utf-8').split('\n')
        a, b = [i for i, x in enumerate(lns) if '~'*10 in x][0:2]
        lns = [x for x in [re.sub('[\r\t ]', '', x) for x in lns[a+1:b]] if x]
        ulns, tt = [], {lns[i]: lns[i+1] for i in range(0, len(lns), 2)}
        with open(bdir + max(os.listdir(bdir)), 'r') as fp:
            for ln in fp.readlines():
                if ln.startswith('<DT><A HREF="') and ln.endswith('</A>\n'):
                    a, b, c = ln.rfind('">') + 2, ln.rfind('='), ln.rfind('</')
                    k, val = ln[a:b].strip(' '), ln[b+1:c].strip(' ')
                    if k in tt:
                        u, v = xtr(tt[k]), xtr(val)
                        if u > v:
                            ln, nu = f'{ln[0:a]}{k} = {tt[k]}</A>\n', nu + 1
                            msg += f'    {k} = {tt[k]} > {val}\n'
                        if u < v:
                            msg += f'    {k} = {tt[k]} < {val}    Old\n'
                        del tt[k]
                ulns.append(ln)
        changed, fn = True, bdir + 'Adjusted.html'
        with ctx.suppress(Exception), open(fn, 'r') as fp:
            changed = (fp.readlines() != ulns)
        if changed:
            with open(fn, 'w') as fp:
                fp.writelines(ulns)
            msg += ''.join([f'    {k} = {v}    Missing\n' for k, v in tt.items()])
            msg += f'  {nu} records are updated.\n\n'
            with open(bdir + 'Alogs.txt', 'a') as fp:
                tz, fmt = pytz.timezone('US/Eastern'), '%Y-%m-%d %H:%M:%S'
                fp.write(f'{datetime.datetime.now(tz=tz).strftime(fmt)}:\n{msg}')
