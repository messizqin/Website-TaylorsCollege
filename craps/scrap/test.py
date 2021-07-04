with open('cos.txt') as f1:
	cos = f1.read().split('\n')

with open('ids.txt') as f2:
	ids = f2.read().split('\n')


js = {}
for ii, dd in enumerate(cos):
	js[dd] = ids[ii]

print(js)