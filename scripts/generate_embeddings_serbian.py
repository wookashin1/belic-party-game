import json
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Multilingual model — supports Serbian
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

with open('data/words_sr_candidates.json', 'r', encoding='utf-8') as f:
    words = json.load(f)

print(f"Loaded {len(words)} words")

def pick_for_band(word_emb, candidates, embeddings_dict, low, high):
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
    candidates = w['candidates']
    category = w['category']
    print(f"\nProcessing: {word}")

    # Embed the main word + all candidates
    all_to_embed = [word] + candidates
    embeddings = model.encode(all_to_embed)
    emb_dict = {s: embeddings[i] for i, s in enumerate(all_to_embed)}
    word_emb = emb_dict[word]

    # Compute all similarities
    sims = []
    for c in candidates:
        sim = float(cosine_similarity([word_emb], [emb_dict[c]])[0][0])
        sims.append((c, round(sim, 4)))
    sims.sort(key=lambda x: -x[1])
    print(f"  Similarities: {sims}")

    # Pick one per difficulty band
    easy_syn,   easy_sim   = pick_for_band(word_emb, candidates, emb_dict, 0.70, 1.00)
    medium_syn, medium_sim = pick_for_band(word_emb, candidates, emb_dict, 0.45, 0.69)
    hard_syn,   hard_sim   = pick_for_band(word_emb, candidates, emb_dict, 0.00, 0.44)

    # Fallback if a band is empty
    if not easy_syn   and sims: easy_syn,   easy_sim   = sims[0]
    if not medium_syn and sims: medium_syn, medium_sim = sims[len(sims)//2]
    if not hard_syn   and sims: hard_syn,   hard_sim   = sims[-1]

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

with open('data/words_sr_final.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"\nDone! Saved {len(results)} words to data/words_sr_final.json")

missing = [w for w in results if not w['easy'] or not w['medium'] or not w['hard']]
if missing:
    print(f"\nWords missing bands: {[w['word'] for w in missing]}")
    print("Add more candidates for these words in words_sr_candidates.json")