#!/usr/bin/env python3
import gzip
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

LOG_GLOB = "/var/log/caddy-access*"
SEED_PATH = Path("/opt/cxy-blog/pageview-seed.json")
OUTPUT_PATH = Path("/var/www/cxy-blog/pageviews.json")
POST_PATH_RE = re.compile(r"^/posts/[^/]+/(?:index\.html)?$")


def open_log(path):
    with path.open("rb") as raw:
        magic = raw.read(2)
    if magic == b"\x1f\x8b":
        return gzip.open(path, "rt", encoding="utf-8", errors="ignore")
    return path.open("r", encoding="utf-8", errors="ignore")


def normalize_path(uri):
    path = urlsplit(uri).path
    if path.endswith("/index.html"):
        path = path[:-10]
    if not path.endswith("/"):
        path += "/"
    return path


def load_seed():
    if not SEED_PATH.exists():
        return {}
    with SEED_PATH.open("r", encoding="utf-8") as file:
        data = json.load(file)
    return {normalize_path(path): int(count) for path, count in data.items()}


def iter_log_paths():
    return sorted(Path("/var/log").glob("caddy-access*"))


def count_log_views():
    counts = {}
    for path in iter_log_paths():
        if not path.is_file():
            continue
        with open_log(path) as file:
            for line in file:
                try:
                    record = json.loads(line)
                except json.JSONDecodeError:
                    continue

                status = int(record.get("status") or 0)
                request = record.get("request") or {}
                method = request.get("method")
                uri = request.get("uri") or ""
                if method != "GET" or status >= 400:
                    continue

                page_path = normalize_path(uri)
                if not POST_PATH_RE.match(page_path):
                    continue

                counts[page_path] = counts.get(page_path, 0) + 1
    return counts


def main():
    seed = load_seed()
    log_counts = count_log_views()
    pages = dict(seed)
    for path, count in log_counts.items():
        pages[path] = pages.get(path, 0) + count

    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "pages": dict(sorted(pages.items())),
    }
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = OUTPUT_PATH.with_suffix(".json.tmp")
    with tmp_path.open("w", encoding="utf-8") as file:
        json.dump(payload, file, ensure_ascii=False, separators=(",", ":"))
        file.write("\n")
    tmp_path.replace(OUTPUT_PATH)


if __name__ == "__main__":
    main()
