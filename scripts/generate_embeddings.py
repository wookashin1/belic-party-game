import json
import time
import requests
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

model = SentenceTransformer('all-MiniLM-L6-v2')

with open('data/words_en.json', 'r') as f:
    words = json.load(f)

print(f"Loaded {len(words)} words")

def get_synonyms(word, max_results=20):
    try:
        url = f"https://api.datamuse.com/words?rel_syn={word}&max={max_results}"
        response = requests.get(url, timeout=5)
        data = response.json()

        url2 = f"https://api.datamuse.com/words?ml={word}&max={max_results}"
        response2 = requests.get(url2, timeout=5)
        data2 = response2.json()

        all_words = [item['word'] for item in data] + [item['word'] for item in data2]
        seen = set()
        unique = []
        for w in all_words:
            if w not in seen and w != word:
                seen.add(w)
                unique.append(w)
        return unique[:30]
    except Exception as e:
        return []

def pick_for_candidate(word_emb, candidates, embeddings_dict, low, high):
    best = None
    best_sim = -1
    best_distance = float('inf')
    mid = (low + high) / 2

    for candidate in candidates:
        if candidate not in embeddings_dict:
            continue
        sim = float(cosine_similarity([word_emb], [embeddings_dict[candidate]])[0][0])
        if low <= sim <= high:
            distance = abs(sim - mid)
            if distance < best_distance:
                best = candidate
                best_sim = sim
                best_distance = distance

    return best, round(best_sim, 4) if best else None

results = []

for w in words:
    word = w['word']
    category = w['category']
    print(f"\nProcessing: {word}")

    # Get synonyms from API
    candidates = get_synonyms(word)
    print(f"  Got {len(candidates)} candidates: {candidates[:10]}...")

    if not candidates:
        print(f"  Skipping {word} — no candidates found")
        continue

    
    all_to_embed = [word] + candidates
    embeddings = model.encode(all_to_embed)
    emb_dict = {s: embeddings[i] for i, s in enumerate(all_to_embed)}
    word_emb = emb_dict[word]

    sims = []
    for c in candidates:
        sim = float(cosine_similarity([word_emb], [emb_dict[c]])[0][0])
        sims.append((c, round(sim, 4)))
    sims.sort(key=lambda x: -x[1])
    print(f"  Similarity range: {sims[-1][1]:.3f} → {sims[0][1]:.3f}")

    easy_syn,   easy_sim   = pick_for_candidate(word_emb, candidates, emb_dict, 0.70, 1.00)
    medium_syn, medium_sim = pick_for_candidate(word_emb, candidates, emb_dict, 0.45, 0.69)
    hard_syn,   hard_sim   = pick_for_candidate(word_emb, candidates, emb_dict, 0.00, 0.44)

    
    all_sims = sims
    if not easy_syn   and all_sims:
        easy_syn,   easy_sim   = all_sims[0]
    if not medium_syn and len(all_sims) > 1:
        medium_syn, medium_sim = all_sims[len(all_sims)//2]
    if not hard_syn   and all_sims:
        hard_syn,   hard_sim   = all_sims[-1]

    print(f"  Easy:   {easy_syn} ({easy_sim})")
    print(f"  Medium: {medium_syn} ({medium_sim})")
    print(f"  Hard:   {hard_syn} ({hard_sim})")

    results.append({
        "word":       word,
        "category":   category,
        "easy":       easy_syn,
        "easy_sim":   easy_sim,
        "medium":     medium_syn,
        "medium_sim": medium_sim,
        "hard":       hard_syn,
        "hard_sim":   hard_sim,
    })

    time.sleep(0.3)

with open('data/words_en_final.json', 'w') as f:
    json.dump(results, f, indent=2)

print(f"\nDone! Saved {len(results)} words to data/words_en_final.json")