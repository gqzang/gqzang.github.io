import os, re, time, datetime, pytz, contextlib as ctx, requests as req

docid = '1aSKOYuXU1s08DJU0FahGBNXbrAFlgJ_YJ9v3EwN50kU'
url = f'https://docs.google.com/document/d/{docid}/export?format=txt'
# bdir = '/var/sftp/uploads/Dolphin/'
bdir = './Dolphin/'
xtr = lambda x: eval(x.lower().replace('end', '9'*6).replace('-', '*3000+'))

while True:
    time.sleep(60)
    with ctx.suppress(Exception):
        tz, fmt = pytz.timezone('US/Eastern'), '%Y-%m-%d %H:%M:%S'
        msg = f'{datetime.datetime.now(tz=tz).strftime(fmt)}:\n'
        nu, lns = 0, req.get(url).content.decode('utf-8').split('\n')
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
                        ln = ln if u < v else f'{ln[0:a]}{k} = {tt[k]}</A>\n'
                        nu += 0 if u <= v else 1
                        if u < v:
                            msg += f'    {k} = {tt[k]} < {val}     Old\n'
                        del tt[k]
                ulns.append(ln)
        updated = True
        if os.path.exists(bdir + 'Adjusted.html'):
            with open(bdir + 'Adjusted.html', 'r') as fp:
                lns = fp.readlines()
                updated = not (lns == ulns)
        if updated:
            with open(bdir + 'Adjusted.html', 'w') as fp:
                fp.writelines(ulns)
            msg += '\n'.join([f'    {k} = {v}     Missing' for k, v in tt.items()])
            msg += f'\n    {nu} records are updated.\n\n'
            with open(bdir + 'Alogs.txt', 'a') as fp:
                fp.writelines(msg)
