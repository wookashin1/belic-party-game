import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import '../locales/i18n';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  const switchLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setCurrentLang(lang);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.gameName}>Belic</Text>
      <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>

      <View style={styles.langRow}>
        <TouchableOpacity
          style={[styles.langBtn, currentLang === 'en' && styles.langActive]}
          onPress={() => switchLanguage('en')}
        >
          <Text style={[styles.langText, currentLang === 'en' && styles.langTextActive]}>
            EN
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.langBtn, currentLang === 'sr' && styles.langActive]}
          onPress={() => switchLanguage('sr')}
        >
          <Text style={[styles.langText, currentLang === 'sr' && styles.langTextActive]}>
            SR
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.startBtn}
        onPress={() => router.push('/setup')}
      >
        <Text style={styles.startText}>{t('welcome.start')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  gameName: {
    fontSize: 48,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 24,
  },
  langRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  langBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  langActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  langText: {
    color: '#888',
    fontWeight: '600',
  },
  langTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  startBtn: {
    backgroundColor: '#6c47ff',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 8,
  },
  startText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});