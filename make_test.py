f = open('web/puzz1.html')
w = open('web/test.html','w')

html = {
    'css' : '<link rel="stylesheet" href="static/qunit.css">\n',
    'body' : """<div id="qunit"></div>
<div id="qunit-fixture"></div>
<script src="static/qunit.js"></script>
<script src="static/tests.js"></script>
"""
}

for line in f.readlines():
    if line.find("</head>") >= 0:
        w.write(html['css'])
    w.write(line)
    if line.find("<body") >= 0:
        w.write(html['body'])
        
f.close()
w.close()
