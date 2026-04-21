// app/AeonikText.tsx
import { useFonts } from 'expo-font';
import React from 'react';
import { Text, TextProps } from 'react-native';

export function useAeonikFonts() {
  const [loaded] = useFonts({
    'Aeonik-Regular': require('../assets/fonts/AeonikTRIAL-Regular.otf'),
    'Aeonik-Bold': require('../assets/fonts/AeonikTRIAL-Bold.otf'),
    'Aeonik-Light': require('../assets/fonts/AeonikTRIAL-Light.otf'),
    'Aeonik-RegularItalic': require('../assets/fonts/AeonikTRIAL-RegularItalic.otf'),
    'Aeonik-BoldItalic': require('../assets/fonts/AeonikTRIAL-BoldItalic.otf'),
    'Aeonik-LightItalic': require('../assets/fonts/AeonikTRIAL-LightItalic.otf'),
  });

  return loaded;
}

type Weight = 'regular' | 'bold' | 'light';

type AeonikTextProps = TextProps & {
  weight?: Weight;
  italic?: boolean;
};

/**
 * Usage:
 * <AeonikText weight="bold" style={{ fontSize: 32 }}>Sign In</AeonikText>
 */
export const AeonikText: React.FC<AeonikTextProps> = ({
  weight = 'regular',
  italic = false,
  style,
  children,
  ...rest
}) => {
  let fontFamily = 'Aeonik-Regular';

  if (weight === 'bold' && italic) fontFamily = 'Aeonik-BoldItalic';
  else if (weight === 'bold') fontFamily = 'Aeonik-Bold';
  else if (weight === 'light' && italic) fontFamily = 'Aeonik-LightItalic';
  else if (weight === 'light') fontFamily = 'Aeonik-Light';
  else if (italic) fontFamily = 'Aeonik-RegularItalic';

  return (
    <Text {...rest} style={[{ fontFamily }, style]}>
      {children}
    </Text>
  );
};
