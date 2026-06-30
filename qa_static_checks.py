from pathlib import Path
import re, zipfile, sys
root=Path('/mnt/data/erp_v94')
html=(root/'index.html').read_text(errors='ignore')
js=(root/'app.js').read_text(errors='ignore')
ids=re.findall(r'id=["\']([^"\']+)["\']', html)
dups=sorted({x for x in ids if ids.count(x)>1})
print('duplicate_ids', len(dups), dups[:10])
# onclick function names
onclicks=re.findall(r'onclick=["\']([^"\']+)["\']', html)
missing=[]
for oc in onclicks:
    m=re.match(r'\s*([A-Za-z_$][\w$]*)\s*\(', oc)
    if m:
        fn=m.group(1)
        if not re.search(r'(function\s+'+re.escape(fn)+r'\s*\(|window\.'+re.escape(fn)+r'\s*=|const\s+'+re.escape(fn)+r'\s*=|let\s+'+re.escape(fn)+r'\s*=|var\s+'+re.escape(fn)+r'\s*=)', js):
            missing.append(fn)
print('missing_onclick', sorted(set(missing)))
assert not dups
assert not missing
