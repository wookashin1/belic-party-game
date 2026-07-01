import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import wordsEn from '../data/words_en_final.json';
import wordsSr from '../data/words_sr_final.json';
import '../locales/i18n';

type Phase = 'waiting' | 'revealed' | 'done';

export default function RevealScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t, i18n } = useTranslation();

  const players: string[] = JSON.parse(params.players as string);
  const impostorCount = Number(params.impostors);
  const difficulty = params.difficulty as 'easy' | 'medium' | 'hard';
  const mode = params.mode as 'synonym' | 'category';

  const { assignments, mainWord } = useMemo(() => {
    const wordsData = i18n.language === 'sr' ? wordsSr : wordsEn;
    const picked = wordsData[Math.floor(Math.random() * wordsData.length)];
    const impostorWord = mode === 'category' ? picked.category : picked[difficulty];
    const shuffled = [...players.map((_, i) => i)].sort(() => Math.random() - 0.5);
    const impostorIndices = new Set(shuffled.slice(0, impostorCount));
    const assignments = players.map((name, i) => {
      const isImpostor = impostorIndices.has(i);
      return { name, word: isImpostor ? impostorWord : picked.word, isImpostor };
    });
    return { assignments, mainWord: picked.word };
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('waiting');

  const current = assignments[currentIndex];
  const isLast = currentIndex === assignments.length - 1;

  const handlePress = () => {
    if (phase === 'waiting') setPhase('revealed');
    else if (phase === 'revealed') setPhase('done');
  };

  const handleNext = () => {
    if (isLast) {
      router.push({
        pathname: '/voting',
        params: {
          players: JSON.stringify(players),
          impostors: JSON.stringify(assignments.filter(a => a.isImpostor).map(a => a.name)),
          mainWord,
        },
      });
    } else {
      setCurrentIndex(currentIndex + 1);
      setPhase('waiting');
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.dotsRow}>
        {assignments.map((_, i) => (
          <View key={i} style={[
            styles.dot,
            i < currentIndex && styles.dotDone,
            i === currentIndex && styles.dotActive,
          ]} />
        ))}
      </View>

      <Text style={styles.playerLabel}>
        {phase === 'waiting' ? t('reveal.yourTurn', { name: current.name }) : current.name}
      </Text>

      <TouchableOpacity
        style={[
          styles.bigBtn,
          phase === 'revealed' && current.isImpostor && styles.bigBtnImpostor,
          phase === 'revealed' && !current.isImpostor && styles.bigBtnPlayer,
          phase === 'done' && styles.bigBtnDone,
        ]}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        {phase === 'waiting' && (
          <Text style={styles.bigBtnText}>{t('reveal.tapReveal')}</Text>
        )}
        {phase === 'revealed' && (
          <View style={styles.revealedContent}>
            <Text style={styles.roleLabel}>
              {current.isImpostor ? t('reveal.impostor') : t('reveal.player')}
            </Text>
            <Text style={styles.wordText}>{current.word}</Text>
            <Text style={styles.tapToHide}>{t('reveal.tapHide')}</Text>
          </View>
        )}
        {phase === 'done' && (
          <Text style={styles.bigBtnText}>{t('reveal.hidden')}</Text>
        )}
      </TouchableOpacity>

      {phase === 'waiting' && (
        <Text style={styles.hint}>{t('reveal.makeSure', { name: current.name })}</Text>
      )}
      {phase === 'revealed' && (
        <Text style={styles.hint}>{t('reveal.remember')}</Text>
      )}

      {phase === 'done' && (
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextText}>
            {isLast ? t('reveal.startGame') : t('reveal.next', { name: assignments[currentIndex + 1].name })}
          </Text>
        </TouchableOpacity>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', alignItems: 'center', justifyContent: 'center', padding: 24 },
  dotsRow: { flexDirection: 'row', gap: 8, position: 'absolute', top: 60 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2a2a2a' },
  dotActive: { backgroundColor: '#6c47ff', width: 20 },
  dotDone: { backgroundColor: '#444' },
  playerLabel: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 40, position: 'absolute', top: 120 },
  bigBtn: { width: 260, height: 260, borderRadius: 130, backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' },
  bigBtnImpostor: { backgroundColor: '#c0392b', borderColor: '#c0392b' },
  bigBtnPlayer: { backgroundColor: '#1a6b3c', borderColor: '#1a6b3c' },
  bigBtnDone: { backgroundColor: '#1a1a1a', borderColor: '#444' },
  bigBtnText: { color: '#888', fontSize: 18, fontWeight: '600' },
  revealedContent: { alignItems: 'center', gap: 8 },
  roleLabel: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  wordText: { fontSize: 36, fontWeight: '800', color: '#fff', textAlign: 'center' },
  tapToHide: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 8 },
  hint: { color: '#444', fontSize: 14, textAlign: 'center', position: 'absolute', bottom: 120, paddingHorizontal: 40 },
  nextBtn: { position: 'absolute', bottom: 50, backgroundColor: '#6c47ff', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30 },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});