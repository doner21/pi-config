
RPT = r'C:\Users\doner\.pi\agent\nenflow-v3\runs\RUN_20260516-031246\ATT_3_VERIFICATION.md'
with open(RPT, 'w') as f:
    f.write(open(r'C:\Users\doner\.pi\agent\nenflow-v3\runs\RUN_20260516-031246\_report_body.txt').read())
