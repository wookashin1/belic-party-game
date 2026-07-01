import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    SafeAreaView, ScrollView, StyleSheet,
    Text, TouchableOpacity, View
} from 'react-native';
import '../locales/i18n';

export default function EndScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useTranslation();

  const result = params.result as 'players_win' | 'impostors_win';
  const impostors: string[] = JSON.parse(params.impostors as string);
  const mainWord = params.mainWord as string;
  const players: string[] = JSON.parse(params.players as string);
  const innocents = players.filter(p => !impostors.includes(p));
  const playersWin = result === 'players_win';

  useEffect(() => {
    if (playersWin) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        <View style={[styles.resultBanner, playersWin ? styles.bannerWin : styles.bannerLose]}>
          <Text style={styles.resultTitle}>
            {playersWin ? t('end.playersWin') : t('end.impostorsWin')}
          </Text>
          <Text style={styles.resultSubtitle}>
            {playersWin ? t('end.playersWinSub') : t('end.impostorsWinSub')}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>{t('end.theWordWas')}</Text>
          <Text style={styles.mainWord}>{mainWord}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            {impostors.length === 1 ? t('end.impostor') : t('end.impostors')}
          </Text>
          {impostors.map((name) => (
            <View key={name} style={styles.playerRow}>
              <Text style={styles.playerName}>{name}</Text>
              <View style={styles.impostorBadge}>
                <Text style={styles.impostorBadgeText}>{t('end.impostorBadge')}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>{t('end.innocents')}</Text>
          {innocents.map((name) => (
            <View key={name} style={styles.playerRow}>
              <Text style={styles.playerName}>{name}</Text>
              <View style={styles.innocentBadge}>
                <Text style={styles.innocentBadgeText}>{t('end.innocentBadge')}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.playAgainBtn} onPress={() => router.push('/setup')}>
          <Text style={styles.playAgainText}>{t('end.playAgain')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeBtn} onPress={() => router.push('/welcome')}>
          <Text style={styles.homeText}>{t('end.backHome')}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  content: { padding: 24, paddingBottom: 60, gap: 16 },
  resultBanner: { borderRadius: 20, padding: 32, alignItems: 'center', gap: 8, marginTop: 16 },
  bannerWin: { backgroundColor: '#0d2b1a', borderWidth: 1, borderColor: '#1a6b3c' },
  bannerLose: { backgroundColor: '#2b0d0d', borderWidth: 1, borderColor: '#6b1a1a' },
  resultEmoji: { fontSize: 56 },
  resultTitle: { fontSize: 32, fontWeight: '800', color: '#fff' },
  resultSubtitle: { fontSize: 15, color: '#888', textAlign: 'center' },
  card: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#2a2a2a', gap: 12 },
  cardLabel: { fontSize: 12, fontWeight: '600', color: '#555', letterSpacing: 1, textTransform: 'uppercase' },
  mainWord: { fontSize: 36, fontWeight: '800', color: '#fff' },
  playerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roleEmoji: { fontSize: 20 },
  playerName: { flex: 1, fontSize: 17, fontWeight: '600', color: '#fff' },
  impostorBadge: { backgroundColor: '#2b0d0d', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: '#6b1a1a' },
  impostorBadgeText: { color: '#c0392b', fontSize: 12, fontWeight: '600' },
  innocentBadge: { backgroundColor: '#0d2b1a', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: '#1a6b3c' },
  innocentBadgeText: { color: '#27ae60', fontSize: 12, fontWeight: '600' },
  playAgainBtn: { backgroundColor: '#6c47ff', borderRadius: 30, paddingVertical: 18, alignItems: 'center', marginTop: 8 },
  playAgainText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  homeBtn: { backgroundColor: '#1a1a1a', borderRadius: 30, paddingVertical: 18, alignItems: 'center', borderWidth: 1, borderColor: '#2a2a2a' },
  homeText: { color: '#888', fontSize: 17, fontWeight: '600' },
});