#!/usr/bin/env python
## -*- coding: utf-8 -*-
import os
from mako import exceptions
from mako.lookup import TemplateLookup
import tornado.ioloop
import tornado.web
from tornado import httpclient
import sys

root = os.path.dirname(__file__)
template_root = os.path.join(root)
blacklist_templates = ('layouts',)
template_lookup = TemplateLookup(input_encoding='utf-8',
                                 output_encoding='utf-8',
                                 encoding_errors='replace',
                                 directories=[template_root])

def render_template(filename):
    if os.path.isdir(os.path.join(template_root, filename)):
        filename = os.path.join(filename, 'index.html')
    else:
        filename = '%s' % filename
    if any(filename.lstrip('/').startswith(p) for p in blacklist_templates):
        raise httpclient.HTTPError(404)
    try:
        return template_lookup.get_template(filename).render()
    except exceptions.TopLevelLookupException:
        raise httpclient.HTTPError(404)

def render_bin(filename):
    #print(filename + " in BIN")
    filename = os.path.join(filename)
    f = open(filename, 'rb')

    return f.read()

class DefaultHandler(tornado.web.RequestHandler):
    def get_error_html(self, status_code, exception, **kwargs):
        if hasattr(exception, 'code'):
            self.set_status(exception.code)
            if exception.code == 500:
                return exceptions.html_error_template().render()
            return render_template(str(exception.code))
        return exceptions.html_error_template().render()

class MainHandler(DefaultHandler):
    def get(self, filename):
        print(filename)
        if filename.startswith('sounds'):
            self.write(render_bin(filename))
        else:
            self.write(render_template(filename))

application = tornado.web.Application([
    (r'^/(.*)$', MainHandler),
], debug=True, static_path=os.path.join(root, 'static'))

if __name__ == '__main__':
    port = 80
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    application.listen(port)
    tornado.ioloop.IOLoop.instance().start()
