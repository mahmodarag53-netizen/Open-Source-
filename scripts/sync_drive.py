#!/usr/bin/env python3
"""Crawl the public Drive folders and write works.json (recursive, no API key)."""
import datetime, html, json, os, re, sys, urllib.request

ROOTS = [
    ("1wvwrs7ryTm5PdZeORaMOhRSr8jOHLjJY", "المشاريع الأساسية"),
    ("1jNqN_6zm58oaPiuoIuLl2rqIElXGoIoL", "الأعمال والفعاليات"),
    ("1uP9fm2NAKhlnx_VMLoGTXPhdTPYtVCw-", "مشاريع متنوعة"),
]
ENTRY = re.compile(
    r'<div class="flip-entry" id="entry-([^"]+)".*?<a href="([^"]+)".*?flip-entry-title">(.*?)</div>', re.S)
VIDEO = re.compile(r'\.(mp4|m4v|mov|webm|mkv)$', re.I)


def list_folder(fid):
    req = urllib.request.Request(
        f"https://drive.google.com/embeddedfolderview?id={fid}", headers={"User-Agent": "Mozilla/5.0"})
    page = urllib.request.urlopen(req, timeout=40).read().decode("utf-8", "replace")
    for eid, href, title in ENTRY.findall(page):
        yield eid, "/folders/" in html.unescape(href), html.unescape(title).strip()


def walk(fid, trail, out, seen):
    for eid, is_folder, title in list_folder(fid):
        if is_folder:
            walk(eid, trail + [title], out, seen)
        elif VIDEO.search(title) and eid not in seen:
            seen.add(eid)
            out.append({"id": eid, "title": VIDEO.sub("", title).strip(), "collection": trail[0],
                        "category": trail[1] if len(trail) > 1 else trail[0]})


def main():
    old = {}
    if os.path.exists("works.json"):
        old = {w["id"]: w.get("added") for w in json.load(open("works.json", encoding="utf-8"))}
    out, seen = [], set()
    for fid, name in ROOTS:          # أي خطأ شبكة يوقف المزامنة دون المساس بالملف الحالي
        walk(fid, [name], out, seen)
    if not out:
        sys.exit("no videos found, keeping existing works.json")
    now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    for w in out:                    # تاريخ الإضافة: يُسجَّل فقط للفيديوهات الجديدة بعد أول مزامنة
        w["added"] = old.get(w["id"]) if w["id"] in old else (now if old else None)
    json.dump(out, open("works.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{len(out)} videos", file=sys.stderr)


main()
