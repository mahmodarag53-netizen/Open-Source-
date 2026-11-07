#!/usr/bin/env python3
"""Generate scene voiceovers with Mahmoud's HeyGen voice clone.

Usage:  python3 tools/gen_voice.py [content/month-01.json] [--only ep01,ep02] [--model heygen-voice-1]

- One WAV per scene -> public/vo/<ep>/sNN.wav  (+ sNN.json with char timestamps)
- Resumable: existing scene files are skipped.
- Stops cleanly on the daily limit (429) and records progress in public/vo/_status.json.
- Pronunciation QA: Whisper transcribes each take back; if words are missing or garbled it retries once
  with a lower expressiveness_boost, keeping the clearer take.

The API key is injected by the session network proxy (or read from HEYGEN_API_KEY).
"""
import difflib, json, os, re, subprocess, sys, time, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE_ID = "2cd2b20e640f466bba3c4fb47f61827c"  # Mahmoud - Syrian Narrator
API = "https://api.heygen.com/v3/models/audio/tts"

# Pronunciation QA: Whisper transcribes the take back; below this word-match score we retry.
MIN_MATCH = 0.82
_whisper = None


def _model():
    global _whisper
    if _whisper is None:
        from faster_whisper import WhisperModel
        _whisper = WhisperModel("medium", device="cpu", compute_type="int8", cpu_threads=os.cpu_count() or 4)
    return _whisper


def norm(t):
    t = re.sub(r"[\u064B-\u0652\u0640]", "", t)  # tashkeel + tatweel
    t = re.sub("[إأآا]", "ا", t).replace("ة", "ه").replace("ى", "ي").replace("ؤ", "و").replace("ئ", "ي")
    t = re.sub(r"[^\w\s]", " ", t)
    return t.split()


def transcribe(path):
    import numpy as np
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    segs, _ = _model().transcribe(np.frombuffer(raw, np.float32), language="ar", beam_size=5, word_timestamps=True)
    words = [{"w": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)} for sg in segs for w in sg.words]
    return " ".join(w["w"] for w in words), words


class DailyLimit(Exception):
    pass


def post_tts(text, model, boost):
    body = {"model": model, "voice_id": VOICE_ID, "text": text, "language": "ar",
            "with_timestamps": True, "expressiveness_boost": boost}
    headers = {"Content-Type": "application/json", "X-Api-Key": os.environ.get("HEYGEN_API_KEY", "proxy-injected")}
    req = urllib.request.Request(API, data=json.dumps(body).encode(), headers=headers, method="POST")
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                return json.load(r)["data"]
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors="replace")
            if e.code == 429:
                wait = int(e.headers.get("Retry-After") or 0)
                if wait and wait <= 90 and attempt < 3:
                    time.sleep(wait)
                    continue
                raise DailyLimit(msg)
            if e.code >= 500 and attempt < 3:
                time.sleep(2 ** attempt * 2)
                continue
            raise RuntimeError(f"HTTP {e.code}: {msg}")


def qa(text, heard):
    """Word-level match between script and what Whisper heard; returns (score, missing_words)."""
    a, b = norm(text), norm(heard)
    sm = difflib.SequenceMatcher(None, a, b)
    score = sm.ratio()
    missing = [" ".join(a[i1:i2]) for op, i1, i2, j1, j2 in sm.get_opcodes() if op in ("delete", "replace")]
    return score, missing


def download(url, path):
    with urllib.request.urlopen(url, timeout=120) as r, open(path, "wb") as f:
        f.write(r.read())


def main():
    args = sys.argv[1:]
    content = next((a for a in args if a.endswith(".json")), os.path.join(ROOT, "content", "month-01.json"))
    only = None
    model = "heygen-voice-1-turbo-free"
    if "--only" in args:
        only = set(args[args.index("--only") + 1].split(","))
    if "--model" in args:
        model = args[args.index("--model") + 1]

    data = json.load(open(content, encoding="utf-8"))
    out_root = os.path.join(ROOT, "public", "vo")
    os.makedirs(out_root, exist_ok=True)
    status_path = os.path.join(out_root, "_status.json")
    status = json.load(open(status_path)) if os.path.exists(status_path) else {"flags": {}}
    made = 0
    try:
        for ep in data["episodes"]:
            if only and ep["id"] not in only:
                continue
            ep_dir = os.path.join(out_root, ep["id"])
            os.makedirs(ep_dir, exist_ok=True)
            for i, sc in enumerate(ep["scenes"], 1):
                wav = os.path.join(ep_dir, f"s{i:02d}.wav")
                meta = os.path.join(ep_dir, f"s{i:02d}.json")
                if os.path.exists(wav) and os.path.exists(meta):
                    continue
                text = sc.get("tts", sc["vo"])
                best = None
                tmp = wav + ".tmp.wav"
                for boost in (1.0, 0.6):
                    d = post_tts(text, model, boost)
                    download(d["audio_url"], tmp)
                    heard, words = transcribe(tmp)
                    score, missing = qa(text, heard)
                    take = {"data": d, "score": score, "missing": missing, "heard": heard, "words": words, "boost": boost}
                    if best is None or score > best["score"]:
                        if best:
                            os.remove(best["file"])
                        take["file"] = tmp.replace(".tmp", f".b{boost}")
                        os.replace(tmp, take["file"])
                        best = take
                    else:
                        os.remove(tmp)
                    if score >= MIN_MATCH:
                        break
                os.replace(best["file"], wav)
                subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", wav, "-b:a", "192k", wav[:-4] + ".mp3"], check=True)
                json.dump({"text": text, "model": model, "boost": best["boost"],
                           "duration": best["data"].get("duration"),
                           "match": round(best["score"], 3), "heard": best["heard"],
                           "missing": best["missing"], "words": best["words"],
                           "chars": best["data"].get("original_characters")},
                          open(meta, "w", encoding="utf-8"), ensure_ascii=False)
                best["bad"] = best["missing"] if best["score"] < MIN_MATCH else []
                key = f"{ep['id']}/s{i:02d}"
                if best["bad"]:
                    status["flags"][key] = best["bad"]
                else:
                    status["flags"].pop(key, None)
                made += 1
                print(f"✓ {key}  {best['data'].get('duration', 0):.1f}s  match={best['score']:.2f}  boost={best['boost']}  diff={best['missing']}", flush=True)
        status["state"] = "complete"
    except DailyLimit as e:
        status["state"] = "daily_limit"
        status["limit_message"] = str(e)[:300]
        print("⏸ وصلنا للحد اليومي — كمّل بكرا بنفس الأمر.", flush=True)
    status["last_run"] = time.strftime("%Y-%m-%d %H:%M:%S")
    status["made_last_run"] = made
    json.dump(status, open(status_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
