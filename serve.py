from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit
import webbrowser
ROOT = Path(__file__).resolve().parent
class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def do_GET(self):
        path = urlsplit(self.path).path
        if path == '/drive':
            self.path = '/index.html'
        elif path.startswith('/api/') or path.startswith('/_vercel/'):
            self.send_response(204)
            self.end_headers()
            return
        super().do_GET()
    def do_POST(self):
        self.send_response(204)
        self.end_headers()
if __name__ == '__main__':
    server = ThreadingHTTPServer(('127.0.0.1', 8766), Handler)
    print('Open http://127.0.0.1:8766 ; Ctrl+C to stop', flush=True)
    webbrowser.open('http://127.0.0.1:8766')
    server.serve_forever()
