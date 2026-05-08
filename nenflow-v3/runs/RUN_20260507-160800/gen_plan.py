import os
PLAN_DIR = os.path.dirname(os.path.abspath(__file__))
template_path = os.path.join(PLAN_DIR, 'plan_template.md')
out_path1 = os.path.join(PLAN_DIR, 'ATT_2_PLAN.md')
out_path2 = os.path.join(PLAN_DIR, 'LATEST_PLAN.md')

with open(template_path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('{PIPE}', '|')
text = text.replace('{BT}', chr(96))

for path in [out_path1, out_path2]:
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)

print(f'Plan written: {len(text)} chars')
