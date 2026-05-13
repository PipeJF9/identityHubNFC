import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar, Image, ScrollView
} from 'react-native';
import NfcManager, { NfcTech} from 'react-native-nfc-manager';

// ============================================================
//  📐  TIPOS Y CONFIGURACIÓN
// ============================================================
interface VIPMember {
  uid: string;
  name: string;
  age: number;
  credentialType: 'PREMIUM VIP' | 'GOLD MEMBER' | 'OWNER';
  photo: string | number; // URL, Base64 o recurso local (require)
  signature: string; // Hash criptográfico simulado
}

const AUTHORIZED_MEMBERS: Record<string, VIPMember> = {
  '7387C6D3': {
    uid: '7387C6D3',
    name: 'Emmanuel Gazmey Santiago (Anuel AA)',
    age: 33,
    credentialType: 'PREMIUM VIP',
    photo: require('./img/anuelAA.png'),
    signature: 'sha256:88eff86576...92f',
  },
  // La tarjeta B (43837CC6) no está aquí, por lo tanto será denegada.
};

// ============================================================
//  🔌  LOGICA DE VALIDACIÓN CRIPTOGRÁFICA
// ============================================================
const validateCryptographicAccess = (uid: string): boolean => {
  // En un entorno real, aquí se verificaría la firma digital 
  // almacenada en la memoria NDEF de la tarjeta contra una llave pública.
  return !!AUTHORIZED_MEMBERS[uid];
};

export default function App() {
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'denied'>('idle');
  const [activeMember, setActiveMember] = useState<VIPMember | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Animaciones
  const statusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    NfcManager.start().catch(err => console.warn('NFC no soportado', err));
  }, []);

  const triggerAnimation = () => {
    statusAnim.setValue(0);
    Animated.spring(statusAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  async function startScan() {
    setIsScanning(true);
    setScanStatus('idle');
    try {
      await NfcManager.requestTechnology([NfcTech.NfcA]);
      const tag = await NfcManager.getTag();
      const uid = tag?.id?.toUpperCase().replace(/:/g, '') || '';

      if (validateCryptographicAccess(uid)) {
        setActiveMember(AUTHORIZED_MEMBERS[uid]);
        setScanStatus('success');
      } else {
        setActiveMember(null);
        setScanStatus('denied');
      }
      triggerAnimation();
    } catch (ex) {
      console.warn(ex);
    } finally {
      NfcManager.cancelTechnologyRequest().catch(() => {});
      setIsScanning(false);
    }
  }

  return (
    <View style={[styles.container, styles[scanStatus]]}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Eclipse Social Club</Text>
        <Text style={styles.headerSub}>Control de Acceso VIP</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {scanStatus === 'idle' && (
          <View style={styles.idleBox}>
            <View style={styles.logo} />
            <Text style={styles.instructionText}>Acerque la credencial NFC del socio para validar ingreso</Text>
          </View>
        )}

        {scanStatus === 'success' && activeMember && (
          <Animated.View style={[styles.card, { opacity: statusAnim, transform: [{ scale: statusAnim }] }]}>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ ACCESO AUTORIZADO</Text>
            </View>
            <Image
              source={typeof activeMember.photo === 'string' ? { uri: activeMember.photo } : activeMember.photo}
              style={styles.photo}
            />
            <Text style={styles.memberName}>{activeMember.name}</Text>
            <Text style={styles.memberAge}>{activeMember.age} AÑOS</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>TIPO:</Text>
              <Text style={styles.value}>{activeMember.credentialType}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>FIRMA:</Text>
              <Text style={styles.signatureText}>{activeMember.signature.substring(0, 20)}...</Text>
            </View>
          </Animated.View>
        )}

        {scanStatus === 'denied' && (
          <Animated.View style={[styles.card, styles.cardDenied, { opacity: statusAnim }]}>
            <View style={styles.deniedLogo}><Text style={styles.deniedLogoText}>!</Text></View>
            <Text style={styles.deniedTitle}>ACCESO DENEGADO</Text>
            <Text style={styles.deniedSub}>Credencial no registrada o firma criptográfica inválida.</Text>
          </Animated.View>
        )}
      </ScrollView>

      <TouchableOpacity 
        style={[styles.scanBtn, isScanning && styles.btnDisabled]} 
        onPress={startScan}
        disabled={isScanning}
      >
        <Text style={styles.scanBtnText}>{isScanning ? 'BUSCANDO...' : 'INICIAR ESCANEO'}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================
//  💅  ESTILOS (UI DARK MODE / DISCO)
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  idle: { backgroundColor: '#000' },
  success: { backgroundColor: '#070405' },
  denied: { backgroundColor: '#0b0000' },
  header: { marginTop: 60, alignItems: 'center' },
  headerTitle: { color: '#C71F1F', fontSize: 30, fontWeight: '900', letterSpacing: 3 },
  headerSub: { color: '#BBB', fontSize: 12, marginTop: 6, fontWeight: '600' },
  content: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  idleBox: { alignItems: 'center' },
  logo: {
    width: 120, height: 120, borderRadius: 60, marginBottom: 20,
    borderWidth: 4, borderColor: '#C71F1F', backgroundColor: '#120000'
  },
  bigIcon: { fontSize: 80, marginBottom: 20 },
  instructionText: { color: '#DDD', textAlign: 'center', fontSize: 16, lineHeight: 24, maxWidth: 420 },
  card: {
    backgroundColor: '#0b0b0b', width: '100%', borderRadius: 20, padding: 25,
    alignItems: 'center', borderWidth: 1, borderColor: '#330000',
    shadowColor: '#C71F1F', shadowOpacity: 0.18, shadowRadius: 18, elevation: 8
  },
  cardDenied: { borderColor: '#C71F1F', shadowColor: '#C71F1F' },
  verifiedBadge: { backgroundColor: '#C71F1F22', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 10, marginBottom: 15 },
  verifiedText: { color: '#FFC9C9', fontWeight: '800', fontSize: 12 },
  photo: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#222', marginBottom: 15 },
  memberName: { color: '#FFF', fontSize: 30, fontWeight: '900', letterSpacing: 1 },
  memberAge: { color: '#C71F1F', fontSize: 16, marginBottom: 18, fontWeight: '700' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 10 },
  label: { color: '#999', fontWeight: '700', width: '30%' },
  value: { color: '#FFF', fontWeight: '800', width: '70%', textAlign: 'right' },
  signatureText: { color: '#666', fontSize: 10 },
  deniedTitle: { color: '#C71F1F', fontSize: 22, fontWeight: '900' },
  deniedSub: { color: '#BBB', textAlign: 'center', marginTop: 10 },
  deniedLogo: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#3a0000', borderWidth: 2, borderColor: '#C71F1F', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  deniedLogoText: { color: '#C71F1F', fontSize: 32, fontWeight: '900' },
  scanBtn: {
    backgroundColor: '#C71F1F', margin: 30, padding: 18, borderRadius: 14, alignItems: 'center'
  },
  btnDisabled: { backgroundColor: '#330000' },
  scanBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 }
});