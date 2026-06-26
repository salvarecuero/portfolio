// Cross-origin stub child page for the embed-contract E2E tests (ADR 0004).
//
// Served from a DISTINCT origin (a separate port) from the portfolio preview, so the parent's
// exact-origin postMessage validation in embedController is genuinely exercised rather than
// bypassed. It implements the child half of the handshake: it posts `portfolio:ready` until the
// parent answers `portfolio:ack`, and it can emit `portfolio:scroll-escape` on a test cue.
//
// Behavior is driven by query params so one page covers every scenario:
//   ready=0   never sends ready (forces the parent's fallback-to-media ceiling)
//   delay=<ms> wait this long before starting the ready loop (forces the delayed spinner)
//   (default) sends ready immediately until acked
import { createServer } from "node:http";

const PORT = Number(process.env.STUB_PORT ?? 4399);

const PAGE = /* html */ `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Embed stub child</title>
  </head>
  <body>
    <main id="stub-child">stub child</main>
    <script>
      (function () {
        // Mirrors PROTOCOL_VERSION in src/scripts/embedLifecycle.ts and the embed contract
        // (ADR 0004). Bump in lockstep, or the parent silently rejects every handshake.
        var V = 1;
        var q = new URLSearchParams(location.search);
        var sendsReady = q.get("ready") !== "0";
        var delay = parseInt(q.get("delay") || "0", 10);
        var acked = false;
        var timer = 0;

        function startReady() {
          if (!sendsReady) return;
          timer = setInterval(function () {
            if (acked) {
              clearInterval(timer);
              return;
            }
            // targetOrigin "*" is safe for a test stub: the parent's security is its own
            // origin + source validation of THIS message, not our targetOrigin choice.
            parent.postMessage({ type: "portfolio:ready", v: V }, "*");
          }, 100);
        }

        window.addEventListener("message", function (e) {
          var d = e.data || {};
          if (d.type === "portfolio:ack" && d.v === V) {
            acked = true;
            if (timer) clearInterval(timer);
          }
          // Test cue: re-emit a scroll-escape to the parent on demand so the spec controls
          // exactly when the bounce/allow decision runs (deterministic, no real wheel needed).
          if (d.type === "test:emit-escape") {
            parent.postMessage(
              {
                type: "portfolio:scroll-escape",
                v: V,
                deltaY: typeof d.deltaY === "number" ? d.deltaY : -120,
              },
              "*",
            );
          }
        });

        if (delay > 0) setTimeout(startReady, delay);
        else startReady();
      })();
    </script>
  </body>
</html>`;

const server = createServer((_req, res) => {
  // Any path serves the child page; the spec encodes scenario via the query string.
  res.writeHead(200, {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(PAGE);
});

server.listen(PORT, () => {
  // Stdout line Playwright's webServer waits on (it polls the url, but logging helps debugging).
  console.log(`embed stub child listening on http://localhost:${PORT}`);
});
