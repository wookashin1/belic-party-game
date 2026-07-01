import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import '../locales/i18n';

export default function VotingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useTranslation();

  const allPlayers: string[] = JSON.parse(params.players as string);
  const impostors: string[] = JSON.parse(params.impostors as string);
  const mainWord = params.mainWord as string;

  const [alivePlayers, setAlivePlayers] = useState<string[]>(allPlayers);
  const [kickedImpostors, setKickedImpostors] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const remainingImpostors = impostors.filter(i => !kickedImpostors.includes(i));

  const selectPlayer = (name: string) => {
    setSelected(name === selected ? null : name);
  };

  const confirmKick = () => {
    if (!selected) return;

    const isImpostor = impostors.includes(selected);
    const kicked = selected;
    setSelected(null);

    if (isImpostor) {
      const newKickedImpostors = [...kickedImpostors, kicked];
      const newAlivePlayers = alivePlayers.filter(p => p !== kicked);
      setKickedImpostors(newKickedImpostors);
      setAlivePlayers(newAlivePlayers);

      const allFound = newKickedImpostors.length === impostors.length;

      Alert.alert(
        t('voting.correct'),
        `${t('voting.correctMsg', { name: kicked })}\n\n${allFound ? t('voting.allFound') : t('voting.keepGoing')}`,
        [{
          text: allFound ? t('voting.seeResults') : t('voting.continue'),
          onPress: () => {
            if (allFound) {
              router.push({
                pathname: '/end',
                params: {
                  result: 'players_win',
                  impostors: JSON.stringify(impostors),
                  mainWord,
                  players: JSON.stringify(allPlayers),
                },
              });
            }
          }
        }]
      );
    } else {
      const newAlivePlayers = alivePlayers.filter(p => p !== kicked);
      setAlivePlayers(newAlivePlayers);

      const remainingInnocents = newAlivePlayers.filter(p => !impostors.includes(p) || kickedImpostors.includes(p));
      const impostorWins = remainingImpostors.length >= remainingInnocents.length;

      Alert.alert(
        t('voting.wrong'),
        `${t('voting.wrongMsg', { name: kicked })}\n\n${impostorWins ? t('voting.impostorsWin') : t('voting.continues')}`,
        [{
          text: impostorWins ? t('voting.seeResults') : t('voting.continue'),
          onPress: () => {
            if (impostorWins) {
              router.push({
                pathname: '/end',
                params: {
                  result: 'impostors_win',
                  impostors: JSON.stringify(impostors),
                  mainWord,
                  players: JSON.stringify(allPlayers),
                },
              });
            }
          }
        }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>{t('voting.title')}</Text>
      <Text style={styles.subheading}>
        {t('voting.impostorsLeft', { count: remainingImpostors.length })}
      </Text>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {alivePlayers.map((name) => (
          <TouchableOpacity
            key={name}
            style={[styles.playerRow, selected === name && styles.playerRowSelected]}
            onPress={() => selectPlayer(name)}
            activeOpacity={0.7}
          >
            <Text style={[styles.playerName, selected === name && styles.playerNameSelected]}>
              {name}
            </Text>
            {selected === name && (
              <Text style={styles.selectedIndicator}>{t('voting.selected')}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {kickedImpostors.length > 0 && (
        <View style={styles.kickedSection}>
          <Text style={styles.kickedLabel}>{t('voting.kickedImpostors')}</Text>
          <View style={styles.kickedList}>
            {kickedImpostors.map((name) => (
              <View key={name} style={styles.kickedBadge}>
                <Text style={styles.kickedBadgeText}>{name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.kickBtn, !selected && styles.kickBtnDisabled]}
        onPress={confirmKick}
        disabled={!selected}
      >
        <Text style={styles.kickBtnText}>
          {selected ? t('voting.kick', { name: selected }) : t('voting.selectPlayer')}
        </Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', padding: 24 },
  heading: { fontSize: 28, fontWeight: '700', color: '#fff', marginTop: 16, marginBottom: 4 },
  subheading: { fontSize: 14, color: '#888', marginBottom: 24 },
  list: { flex: 1 },
  listContent: { gap: 10 },
  playerRow: {
    backgroundColor: '#1a1a1a', borderRadius: 14, paddingHorizontal: 20,
    paddingVertical: 18, borderWidth: 1, borderColor: '#2a2a2a',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  playerRowSelected: { backgroundColor: '#2a1a4a', borderColor: '#6c47ff' },
  playerName: { fontSize: 18, fontWeight: '600', color: '#fff' },
  playerNameSelected: { color: '#a98aff' },
  selectedIndicator: { fontSize: 13, color: '#6c47ff', fontWeight: '600' },
  kickedSection: { marginVertical: 16 },
  kickedLabel: {
    fontSize: 12, color: '#555', fontWeight: '600',
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8,
  },
  kickedList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kickedBadge: {
    backgroundColor: '#1a1a1a', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: '#333',
  },
  kickedBadgeText: { color: '#888', fontSize: 13 },
  kickBtn: { backgroundColor: '#c0392b', borderRadius: 30, paddingVertical: 18, alignItems: 'center', marginTop: 8 },
  kickBtnDisabled: { backgroundColor: '#2a2a2a' },
  kickBtnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});