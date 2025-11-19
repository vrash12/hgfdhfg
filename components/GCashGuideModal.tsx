// components/GCashGuideModal.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // <-- ADD
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';

const { width, height } = Dimensions.get('window');

type Step = {
  key: string;
  title: string;
  body: string;
  image: any;
  color: string;
  icon: string;
};

const STEPS: Step[] = [
  { key: '1', title: 'Open GCash', body: 'Enter your MPIN to log in.', image: require('../assets/gcash/1.jpg'), color: '#10b981', icon: 'phone-portrait-outline' },
  { key: '2', title: 'Go to QR', body: 'On Home, tap the QR button at the bottom.', image: require('../assets/gcash/2.jpg'), color: '#3b82f6', icon: 'qr-code-outline' },
  { key: '3', title: 'Scan the QR', body: 'Point your camera to the bus/PAO QR or Upload QR from gallery.', image: require('../assets/gcash/3.jpg'), color: '#8b5cf6', icon: 'camera-outline' },
  { key: '4', title: 'Enter Amount', body: 'The fare is automatically assigned. Message is optional.', image: require('../assets/gcash/4.jpg'), color: '#f59e0b', icon: 'card-outline' },
  { key: '5', title: 'Review Details', body: 'Check recipient + amount. Tick the confirm box and tap Send.', image: require('../assets/gcash/5.jpg'), color: '#ef4444', icon: 'checkmark-circle-outline' },
  { key: '6', title: 'Payment Success', body: 'A reference number will appear — this is your proof of payment. Show this in the PAO.', image: require('../assets/gcash/6.jpg'), color: '#06d6a0', icon: 'checkmark-done-outline' },
];

export default function GCashGuideModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (index + 1) / STEPS.length,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [index, progressAnim]);

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(0);
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems?.length && viewableItems[0].index != null) {
        setIndex(viewableItems[0].index!);
      }
    },
    []
  );
  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 60 }).current;

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(bounceAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const goPrev = () => {
    if (index > 0) {
      animateButton();
      listRef.current?.scrollToIndex({ index: index - 1, animated: true });
    }
  };

  const goNext = () => {
    if (index < STEPS.length - 1) {
      animateButton();
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    }
  };

  const handleClose = () => {
    animateButton();
    setTimeout(() => onClose(), 150);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <Animated.View
        style={[
          styles.safe,
          {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [height, 0],
                }),
              },
            ],
          },
        ]}
      >
        <SafeAreaView style={styles.safeContent}>
          <StatusBar barStyle="light-content" />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <View style={[styles.iconContainer, { backgroundColor: STEPS[index].color }]}>
                  <Ionicons name={STEPS[index].icon as any} size={20} color="#ffffff" />
                </View>
                <View>
                  <Text style={styles.headerTitle}>GCash Payment Guide</Text>
                  <Text style={styles.headerSubtitle}>Step {index + 1} of {STEPS.length}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <Animated.View
                  style={[
                    styles.progressBar,
                    {
                      width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                      backgroundColor: STEPS[index].color,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Content */}
          <Animated.View style={[styles.carouselBox, { transform: [{ scale: slideAnim }], opacity: slideAnim }]}>
            <FlatList
              ref={listRef}
              data={STEPS}
              keyExtractor={(s) => s.key}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              removeClippedSubviews={false}
              style={styles.carousel}
              contentContainerStyle={{ flexGrow: 1 }}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewConfig}
              renderItem={({ item, index: itemIndex }) => (
                <View style={[styles.slide, { width }]}>
                  <View style={styles.imageContainer}>
                    <View style={[styles.imageWrap, styles.shadowBox]}>
                      <Image source={item.image} resizeMode="contain" style={styles.image} />
                      {/* Gradient overlay (replaces invalid `background: linear-gradient`) */}
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.12)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.imageOverlay}
                        pointerEvents="none"
                      />
                    </View>
                  </View>

                  <View style={[styles.caption, { borderTopColor: item.color }]}>
                    <View style={styles.captionHeader}>
                      <View style={[styles.stepBadge, { backgroundColor: item.color }]}>
                        <Text style={styles.stepNo}>{item.key}</Text>
                      </View>
                      <View style={styles.captionContent}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.body}>{item.body}</Text>
                      </View>
                    </View>

                
                
                  </View>
                </View>
              )}
            />

            {/* Dots */}
            <View style={styles.dots}>
              {STEPS.map((step, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.dot,
                    i === index && [styles.dotActive, { backgroundColor: step.color }],
                    { transform: [{ scale: i === index ? 1.2 : 1 }] },
                  ]}
                />
              ))}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity onPress={goPrev} disabled={index === 0} style={[styles.navBtn, index === 0 && styles.navBtnDisabled]}>
                <Ionicons name="chevron-back" size={18} color={index === 0 ? '#94a3b8' : STEPS[index].color} />
                <Text style={[styles.navTxt, index === 0 && styles.navTxtDisabled]}>Back</Text>
              </TouchableOpacity>

              {index < STEPS.length - 1 ? (
                <Animated.View style={{ transform: [{ scale: bounceAnim }], flex: 1 }}>
                  <TouchableOpacity onPress={goNext} style={[styles.primaryBtn, { backgroundColor: STEPS[index].color }]}>
                    <Text style={styles.primaryTxt}>Next Step</Text>
                    <Ionicons name="chevron-forward" size={18} color="#ffffff" />
                  </TouchableOpacity>
                </Animated.View>
              ) : (
                <Animated.View style={{ transform: [{ scale: bounceAnim }], flex: 1 }}>
                  <TouchableOpacity onPress={handleClose} style={[styles.primaryBtn, styles.doneBtn]}>
                    <Ionicons name="checkmark-done" size={18} color="#ffffff" />
                    <Text style={styles.primaryTxt}>Got it!</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </Animated.View>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  safeContent: { flex: 1, backgroundColor: '#0f4cc4' },

  header: { paddingTop: 8, paddingBottom: 12, paddingHorizontal: 16 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconContainer: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  headerTitle: { color: '#fff', fontWeight: '800', fontSize: 18, marginBottom: 2 },
  headerSubtitle: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, fontWeight: '600' },
  closeBtn: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.1)' },

  progressContainer: { paddingHorizontal: 4 },
  progressTrack: { height: 6, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 3, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },

  carouselBox: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden', marginTop: 8 },
  carousel: { flex: 1, backgroundColor: '#fff' },

  slide: { height: '100%', paddingTop: 20 },
  imageContainer: { flex: 1, paddingHorizontal: 20 },
  imageWrap: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 16, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  shadowBox: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 8 },
  image: { width: '90%', height: '90%', borderRadius: 12 },
  imageOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '20%' }, // gradient view (styled via LinearGradient)

  caption: { paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 3, backgroundColor: '#fff' },
  captionHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  stepNo: { color: '#fff', fontWeight: '800', fontSize: 16 },
  captionContent: { flex: 1 },
  title: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 4, lineHeight: 24 },
  body: { fontSize: 14, color: '#4b5563', lineHeight: 20 },

  tipContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, padding: 12, backgroundColor: '#fef3c7', borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#f59e0b' },
  tipText: { fontSize: 12, color: '#92400e', fontWeight: '600', flex: 1 },

  dots: { height: 32, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e2e8f0' }, // removed 'transition'
  dotActive: { width: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },

  footer: { backgroundColor: '#fff', padding: 20, paddingBottom: 24, flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  navBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' },
  navBtnDisabled: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' },
  navTxt: { fontWeight: '700', fontSize: 14, marginLeft: 4 },
  navTxtDisabled: { color: '#94a3b8' },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  doneBtn: { backgroundColor: '#06d6a0' },
  primaryTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
