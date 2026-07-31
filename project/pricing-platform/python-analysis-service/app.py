from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import time


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/health":
            self.reply({"code": 0, "message": "OK", "data": {"status": "UP"}, "traceId": "health"})
            return
        self.send_error(404)

    def do_POST(self):
        if self.path != "/api/v1/analyze":
            self.send_error(404)
            return
        length = int(self.headers.get("Content-Length", "0"))
        payload = json.loads(self.rfile.read(length) or b"{}")
        trace_id = self.headers.get("X-Trace-Id", f"trace-python-{int(time.time())}")
        base_price = int(payload.get("basePriceCents", 0))
        score = 88 if base_price < 100000 else 76
        self.reply({
            "code": 0,
            "message": "OK",
            "data": {
                "sku": payload.get("sku", "UNKNOWN"),
                "trend": "STABLE",
                "volatility": 0.07,
                "priceScore": score
            },
            "traceId": trace_id
        })

    def reply(self, body):
        raw = json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)


if __name__ == "__main__":
    print("python-analysis-service started on http://localhost:8082")
    HTTPServer(("localhost", 8082), Handler).serve_forever()
