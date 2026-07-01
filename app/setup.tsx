import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert, KeyboardAvoidingView, Platform,
    ScrollView, StyleSheet, Text,
    TextInput, TouchableOpacity, View
} from 'react-native';
import '../locales/i18n';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 12;

export default function SetupScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState<string[]>([]);
  const [impostors, setImpostors] = useState(1);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [mode, setMode] = useState<'synonym' | 'category'>('synonym');

  const addPlayer = () => {
    const name = playerName.trim();
    if (!name) return;
    if (players.length >= MAX_PLAYERS) {
      Alert.alert(t('setup.maxPlayers'), t('setup.maxPlayersMsg', { count: MAX_PLAYERS }));
      return;
    }
    if (players.includes(name)) {
      Alert.alert(t('setup.duplicate'), t('setup.duplicateMsg'));
      return;
    }
    setPlayers([...players, name]);
    setPlayerName('');
  };

  const removePlayer = (index: number) => {
    const updated = players.filter((_, i) => i !== index);
    setPlayers(updated);
    if (impostors > Math.floor(updated.length / 2)) setImpostors(1);
  };

  const startGame = () => {
    if (players.length < MIN_PLAYERS) {
      Alert.alert(t('setup.notEnough'), t('setup.notEnoughMsg', { count: MIN_PLAYERS }));
      return;
    }
    router.push({
      pathname: '/reveal',
      params: { players: JSON.stringify(players), impostors, difficulty, mode },
    });
  };

  const canStart = players.length >= MIN_PLAYERS;
  const maxImpostors = Math.max(1, Math.floor(players.length / 2));
  const remaining = MIN_PLAYERS - players.length;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Text style={styles.heading}>{t('setup.title')}</Text>

        <Text style={styles.label}>{t('setup.players')} {players.length}/{MAX_PLAYERS}</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={t('setup.enterName')}
            placeholderTextColor="#555"
            value={playerName}
            onChangeText={setPlayerName}
            onSubmitEditing={addPlayer}
            returnKeyType="done"
            maxLength={20}
          />
          <TouchableOpacity
            style={[styles.addBtn, !playerName.trim() && styles.addBtnDisabled]}
            onPress={addPlayer}
            disabled={!playerName.trim()}
          >
            <Text style={styles.addBtnText}>{t('setup.add')}</Text>
          </TouchableOpacity>
        </View>

        {players.length > 0 && (
          <View style={styles.playerList}>
            {players.map((name, index) => (
              <View key={index} style={styles.playerRow}>
                <Text style={styles.playerIndex}>{index + 1}</Text>
                <Text style={styles.playerName}>{name}</Text>
                <TouchableOpacity onPress={() => removePlayer(index)} style={styles.removeBtn}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {players.length === 0 && (
          <Text style={styles.emptyHint}>{t('setup.notEnoughMsg', { count: MIN_PLAYERS })}</Text>
        )}

        <Text style={styles.label}>{t('setup.impostors')}</Text>
        <View style={styles.optionRow}>
          {[1, 2].map((n) => (
            <TouchableOpacity
              key={n}
              style={[styles.optionBtn, impostors === n && styles.optionBtnActive, n > maxImpostors && styles.optionBtnLocked]}
              onPress={() => n <= maxImpostors && setImpostors(n)}
              disabled={n > maxImpostors}
            >
              <Text style={[styles.optionText, impostors === n && styles.optionTextActive, n > maxImpostors && styles.optionTextLocked]}>
                {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t('setup.difficulty')}</Text>
        <View style={styles.optionRow}>
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.optionBtn, difficulty === d && styles.optionBtnActive]}
              onPress={() => setDifficulty(d)}
            >
              <Text style={[styles.optionText, difficulty === d && styles.optionTextActive]}>
                {t(`setup.${d}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t('setup.mode')}</Text>
        <View style={styles.optionRow}>
          {(['synonym', 'category'] as const).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.optionBtn, mode === m && styles.optionBtnActive]}
              onPress={() => setMode(m)}
            >
              <Text style={[styles.optionText, mode === m && styles.optionTextActive]}>
                {t(`setup.${m}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
          onPress={startGame}
          disabled={!canStart}
        >
          <Text style={styles.startText}>
            {canStart ? t('setup.start') : t('setup.addMore', { count: remaining })}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  content: { padding: 24, paddingBottom: 60 },
  heading: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 32, marginTop: 48 },
  label: { fontSize: 13, fontWeight: '600', color: '#888', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, marginTop: 24 },
  inputRow: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#fff', borderWidth: 1, borderColor: '#2a2a2a' },
  addBtn: { backgroundColor: '#6c47ff', borderRadius: 12, paddingHorizontal: 20, justifyContent: 'center' },
  addBtnDisabled: { backgroundColor: '#2a2a2a' },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  playerList: { marginTop: 12, gap: 8 },
  playerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#2a2a2a' },
  playerIndex: { color: '#555', fontSize: 13, width: 24, fontWeight: '600' },
  playerName: { flex: 1, color: '#fff', fontSize: 16 },
  removeBtn: { padding: 4 },
  removeBtnText: { color: '#555', fontSize: 14 },
  emptyHint: { color: '#444', fontSize: 14, marginTop: 12, textAlign: 'center', paddingVertical: 20 },
  optionRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
  optionBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#2a2a2a', backgroundColor: '#1a1a1a' },
  optionBtnActive: { backgroundColor: '#6c47ff', borderColor: '#6c47ff' },
  optionBtnLocked: { opacity: 0.3 },
  optionText: { color: '#888', fontWeight: '600', fontSize: 14 },
  optionTextActive: { color: '#fff' },
  optionTextLocked: { color: '#444' },
  startBtn: { backgroundColor: '#6c47ff', borderRadius: 30, paddingVertical: 18, alignItems: 'center', marginTop: 40 },
  startBtnDisabled: { backgroundColor: '#2a2a2a' },
  startText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});