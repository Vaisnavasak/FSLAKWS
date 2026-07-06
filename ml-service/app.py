from flask import Flask, request, jsonify
from flask_cors import CORS
import librosa
import numpy as np
from fastdtw import fastdtw
from scipy.spatial.distance import euclidean
from pydub import AudioSegment
import tempfile
import os
import uuid
import speech_recognition as sr

app = Flask(__name__)
CORS(app)

SR = 16000
N_MFCC = 13


def convert_to_wav(input_path, output_path):
    audio = AudioSegment.from_file(input_path)
    audio = audio.set_channels(1).set_frame_rate(SR)
    audio.export(output_path, format="wav")


def extract_mfcc(path):
    y, sr_rate = librosa.load(path, sr=SR)
    mfcc = librosa.feature.mfcc(y=y, sr=sr_rate, n_mfcc=N_MFCC)
    return mfcc.T


def resample_sequence(seq, target_len):
    """Resamples a (frames, features) sequence along the time axis to target_len frames."""
    orig_len = seq.shape[0]
    if orig_len == target_len:
        return seq
    orig_idx = np.linspace(0, 1, orig_len)
    target_idx = np.linspace(0, 1, target_len)
    resampled = np.zeros((target_len, seq.shape[1]))
    for col in range(seq.shape[1]):
        resampled[:, col] = np.interp(target_idx, orig_idx, seq[:, col])
    return resampled


def build_consolidated_template(keyword_mfccs):
    """Builds ONE template by averaging all 5 keyword MFCC sequences (time-aligned)."""
    target_len = int(np.median([s.shape[0] for s in keyword_mfccs]))
    aligned = [resample_sequence(s, target_len) for s in keyword_mfccs]
    consolidated = np.mean(aligned, axis=0)
    return consolidated


def transcribe_audio(path):
    """Transcribes WAV file using SpeechRecognition Google API."""
    recognizer = sr.Recognizer()
    try:
        with sr.AudioFile(path) as source:
            audio_data = recognizer.record(source)
        text = recognizer.recognize_google(audio_data)
        return text.strip().lower()
    except sr.UnknownValueError:
        return None
    except Exception as e:
        print(f"STT recognition error: {e}")
        return None


def verify_same_keyword(keyword_paths):
    """Checks if all 5 keyword audio clips recognize to the exact same word."""
    transcripts = []
    for i, path in enumerate(keyword_paths):
        word = transcribe_audio(path)
        print(f"Transcribed Sample #{i+1}: '{word}'")
        transcripts.append(word)
    
    if any(t is None for t in transcripts):
        return False, transcripts
        
    if len(set(transcripts)) != 1:
        return False, transcripts
        
    return True, transcripts[0]


def find_keyword_matches(keyword_mfccs, target_mfcc, hop_length=512):
    # Build single consolidated template
    template = build_consolidated_template(keyword_mfccs)
    tmpl_len = template.shape[0]
    n_frames = target_mfcc.shape[0]

    if n_frames <= tmpl_len:
        return []

    step = max(1, tmpl_len // 4)

    scores = []
    for start in range(0, n_frames - tmpl_len, step):
        window = target_mfcc[start:start + tmpl_len]
        best_dist = fastdtw(window, template, dist=euclidean)[0]
        norm_dist = best_dist / max(1, window.shape[0])
        scores.append((start, norm_dist))

    if not scores:
        return []

    dists = np.array([s[1] for s in scores])
    # Dynamic thresholding based on mean and standard deviation
    threshold = np.mean(dists) - 0.5 * np.std(dists)

    matches = []
    for start, dist in scores:
        if dist <= threshold:
            time_sec = (start * hop_length) / SR
            matches.append({"time": round(time_sec, 2), "score": round(float(dist), 3)})

    matches.sort(key=lambda m: m["time"])
    
    # Merge matches that occur within 1.0 second
    merged = []
    min_gap_sec = 0.5
    for m in matches:
        if merged and (m["time"] - merged[-1]["time"]) < min_gap_sec:
            if m["score"] < merged[-1]["score"]:
                merged[-1] = m
        else:
            merged.append(m)

    return merged


@app.route("/api/match", methods=["POST"])
def match_keyword():
    temp_dir = tempfile.mkdtemp()
    try:
        keyword_files = request.files.getlist("keywordSamples")
        target_file = request.files.get("targetAudio")

        if not keyword_files or not target_file:
            return jsonify({"error": "Missing keywordSamples or targetAudio"}), 400

        if len(keyword_files) != 5:
            return jsonify({"error": "Exactly 5 keyword samples are required for verification and template construction"}), 400

        keyword_paths = []
        for i, f in enumerate(keyword_files):
            raw_path = os.path.join(temp_dir, f"raw_keyword_{i}_{uuid.uuid4().hex}")
            f.save(raw_path)
            wav_path = os.path.join(temp_dir, f"keyword_{i}.wav")
            convert_to_wav(raw_path, wav_path)
            keyword_paths.append(wav_path)

        # 1. Verify keywords contain the same word
        is_valid, transcripts = verify_same_keyword(keyword_paths)
        if not is_valid:
            return jsonify({
                "error": "The 5 keyword audio samples do not contain the same word.",
                "transcripts": transcripts
            }), 400

        # 2. Extract features
        keyword_mfccs = [extract_mfcc(path) for path in keyword_paths]

        raw_target_path = os.path.join(temp_dir, f"raw_target_{uuid.uuid4().hex}")
        target_file.save(raw_target_path)
        target_wav_path = os.path.join(temp_dir, "target.wav")
        convert_to_wav(raw_target_path, target_wav_path)
        target_mfcc = extract_mfcc(target_wav_path)

        # 3. Find matches
        matches = find_keyword_matches(keyword_mfccs, target_mfcc)

        return jsonify({
            "keywordCount": len(keyword_files),
            "verifiedWord": transcripts,
            "matchesFound": len(matches),
            "timestamps": [
                {"startTime": str(m["time"]), "endTime": str(m["time"]), "score": str(m["score"]), "time": m["time"]}
                for m in matches
            ]
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        # Clean up temp files
        try:
            for root, dirs, files in os.walk(temp_dir, topdown=False):
                for name in files:
                    os.remove(os.path.join(root, name))
                for name in dirs:
                    os.rmdir(os.path.join(root, name))
            os.rmdir(temp_dir)
        except Exception:
            pass


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ML service is running"})


if __name__ == "__main__":
    app.run(port=5000, debug=True, use_reloader=False)