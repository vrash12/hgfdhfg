// components/SearchablePicker.tsx
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
  DeviceEventEmitter,
  FlatListProps,
  ModalProps,
  Platform,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import DropDownPicker, { ValueType } from 'react-native-dropdown-picker';
// NEW
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Item = { id: number; name?: string; seq?: number } & { [k: string]: any };
type ListMode = 'FLATLIST' | 'MODAL' | 'SCROLLVIEW';
type SafeFlatListProps = Omit<FlatListProps<any>, 'data' | 'renderItem' | 'keyExtractor'>;

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  items: Item[];
  value: number | undefined;
  onChange: (id: number) => void;
  onOpenChange?: (open: boolean) => void;
  zIndex?: number;
  maxHeight?: number;
  listMode?: ListMode;
  placeholder?: string;
  /** Kept for backwards compatibility but ignored */
  searchPlaceholder?: string;
  disabled?: boolean;

  modalProps?: Partial<ModalProps>;
  modalContentContainerStyle?: StyleProp<ViewStyle>;
  flatListProps?: SafeFlatListProps;
  scrollViewProps?: Partial<ScrollViewProps>;
  listProps?: Partial<SafeFlatListProps & ScrollViewProps>;
  extraBottomPadding?: number;
  containerStyle?: StyleProp<ViewStyle>;
}

export default function SearchablePicker({
  icon,
  label,
  items,
  value,
  onChange,
  onOpenChange,
  zIndex = 1,
  maxHeight = 520,
  listMode = 'MODAL',
  placeholder = '- Select -',
  // searchPlaceholder (ignored),
  disabled = false,

  modalProps,
  modalContentContainerStyle,
  flatListProps,
  scrollViewProps,
  listProps,
  extraBottomPadding = 0,
  containerStyle,
}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => { onOpenChange?.(open); }, [open, onOpenChange]);

  useEffect(() => {
    DeviceEventEmitter.emit('global_picker_open', { open });
    if (Platform.OS === 'android' && open) {
      (async () => {
        try {
          await NavigationBar.setBehaviorAsync('overlay-swipe');
          await NavigationBar.setBackgroundColorAsync('#00000000');
          await NavigationBar.setVisibilityAsync('hidden');
        } catch {}
      })();
    }
  }, [open]);
 const insets = useSafeAreaInsets();
  const safeTopPad = (Platform.OS === 'android' ? Math.max(insets.top, 24) : insets.top) + 8; // push header & X below status bar
  // ...
  // label fallback supports stop_name
  const formattedItems = useMemo(
    () =>
      items.map(i => ({
        label: i.name ?? (i as any).stop_name ?? '',
        value: i.id,
      })),
    [items]
  );

  const withBottomPadding = (styleFromCaller?: any) => {
    if (!extraBottomPadding) return styleFromCaller;
    return [{ paddingBottom: extraBottomPadding }, styleFromCaller].filter(Boolean);
  };

  const mergedFlatListProps: SafeFlatListProps | undefined =
    listMode === 'FLATLIST'
      ? {
          nestedScrollEnabled: true,
          keyboardShouldPersistTaps: 'handled',
          showsVerticalScrollIndicator: true,
          ...(listProps as SafeFlatListProps),
          ...flatListProps,
          contentContainerStyle: withBottomPadding(
            flatListProps?.contentContainerStyle ??
              (listProps as SafeFlatListProps | undefined)?.contentContainerStyle
          ),
        }
      : undefined;

  const mergedScrollViewProps: ScrollViewProps | undefined =
    listMode === 'SCROLLVIEW'
      ? {
          nestedScrollEnabled: true,
          keyboardShouldPersistTaps: 'handled',
          ...(listProps as Partial<ScrollViewProps>),
          ...scrollViewProps,
          contentContainerStyle: withBottomPadding(
            scrollViewProps?.contentContainerStyle ??
              (listProps as ScrollViewProps | undefined)?.contentContainerStyle
          ),
        }
      : undefined;

  const mergedModalProps: ModalProps | undefined =
    listMode === 'MODAL'
      ? {
          animationType: 'slide',
          presentationStyle: Platform.OS === 'ios' ? 'fullScreen' : undefined,
          statusBarTranslucent: false,   // ⬅️ don't draw under the status bar
          transparent: false,
          onRequestClose: () => setOpen(false),
          ...modalProps,
        }
      : undefined;

  const mergedModalContentContainerStyle =
    listMode === 'MODAL'
      ? [
          { flex: 1, backgroundColor: '#fff', paddingTop: safeTopPad }, // ⬅️ push content (incl. X) down
          withBottomPadding(modalContentContainerStyle),
        ]
      : undefined;


  const dz = zIndex ?? 1;

  return (
    <View style={[styles.container, { zIndex: dz, elevation: dz }, containerStyle]}>
      <View style={styles.labelRow}>
        <Ionicons name={icon} size={18} color="#2e7d32" />
        <Text style={styles.label}>{label}</Text>
      </View>

      <DropDownPicker
        open={open}
        value={value ?? null}
        items={formattedItems}
        setOpen={setOpen}
        onChangeValue={(val: ValueType | null) => { if (typeof val === 'number') onChange(val); }}
        setValue={(cb: any) => {
          const next = typeof cb === 'function' ? cb(value ?? null) : cb;
          if (typeof next === 'number') onChange(next);
        }}
        disabled={disabled}
        // 🔕 Search removed
        searchable={false}
        autoScroll
        dropDownDirection="BOTTOM"
        listItemContainerStyle={styles.itemContainer}
        placeholder={placeholder}
        listMode={listMode}
        closeOnBackPressed
        maxHeight={maxHeight}
        flatListProps={mergedFlatListProps as any}
        scrollViewProps={mergedScrollViewProps}
        modalProps={mergedModalProps}
        modalContentContainerStyle={mergedModalContentContainerStyle}
        modalTitle={listMode === 'MODAL' ? label : undefined}
        style={styles.pickerStyle}
        dropDownContainerStyle={[
          styles.dropDownContainer,
          { zIndex: dz + 1000, elevation: dz + 1000, borderRadius: 0 }, // edge-to-edge inside modal
        ]}
        placeholderStyle={styles.placeholder}
        listItemLabelStyle={styles.itemText}
        selectedItemLabelStyle={styles.selectedItemText}
        // keep stacks predictable when there are multiple pickers
        zIndex={dz}
        zIndexInverse={dz + 2000}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginLeft: 8 },

  pickerStyle: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
    borderRadius: 12,
    minHeight: 50,
  },
  dropDownContainer: {
    backgroundColor: '#ffffff',
    borderColor: '#e9ecef',
  },
  placeholder: { color: '#888', fontSize: 16 },
  itemText: { fontSize: 16, color: '#333' },
  selectedItemText: { fontSize: 16, fontWeight: '700', color: '#2e7d32' },

  // list rows on white
  itemContainer: { backgroundColor: '#fff' },
});
