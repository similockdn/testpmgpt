from pathlib import Path
import re, sys, zipfile, subprocess, tempfile, os
root=Path('.')
html=(root/'index.html').read_text(errors='ignore')
js=(root/'app.js').read_text(errors='ignore')
# duplicate ids
ids=re.findall(r'id=["\']([^"\']+)["\']', html)
dups=sorted({x for x in ids if ids.count(x)>1})
# onclick funcs
calls=set(re.findall(r'on(?:click|change|input|focus)=["\'][^"\']*?\b([A-Za-z_$][\w$]*)\s*\(', html))
# ignore builtins/DOM methods and imported callbacks indirectly defined
ignore={'alert','confirm','prompt','print','setTimeout','clearTimeout','window','document','click','getElementById'}
missing=[]
for fn in sorted(calls-ignore):
    if re.search(rf'\bfunction\s+{re.escape(fn)}\s*\(', js): continue
    if re.search(rf'\b(?:window\.)?{re.escape(fn)}\s*=\s*(?:async\s*)?\(?', js): continue
    if re.search(rf'\bconst\s+{re.escape(fn)}\s*=', js): continue
    if re.search(rf'\blet\s+{re.escape(fn)}\s*=', js): continue
    missing.append(fn)
print('duplicate_ids=', dups)
print('missing_on_handlers=', missing[:20], 'count', len(missing))
if dups or missing:
    sys.exit(1)
