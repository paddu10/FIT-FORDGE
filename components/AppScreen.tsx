import React from 'react';
import { View, StyleSheet, ImageBackground, ImageSourcePropType, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export type AppScreenProps = {
  children: React.ReactNode;
  bgImage?: ImageSourcePropType;
  bgGradient?: boolean;
  hideBottomSafe?: boolean;
  scrollable?: boolean;
  contentContainerStyle?: object;
};

export function AppScreen({ 
  children, 
  bgImage, 
  bgGradient = false, 
  hideBottomSafe = false,
  scrollable = false,
  contentContainerStyle
}: AppScreenProps) {
  const insets = useSafeAreaInsets();

  const containerStyle = [
    styles.container,
    {
      paddingTop: insets.top,
      paddingBottom: hideBottomSafe ? 0 : insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }
  ];

  let content = (
    <View style={containerStyle}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scrollable ? (
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={contentContainerStyle}
          >
            {children}
          </ScrollView>
        ) : (
          children
        )}
      </KeyboardAvoidingView>
    </View>
  );

  if (bgImage) {
    return (
      <ImageBackground source={bgImage} style={styles.bgWrapper} resizeMode="cover">
        {bgGradient && (
          <LinearGradient
            colors={['rgba(8,9,12,0.4)', 'rgba(8,9,12,0.85)', 'rgba(8,9,12,1)']}
            style={StyleSheet.absoluteFill}
          />
        )}
        {content}
      </ImageBackground>
    );
  }

  return <View style={styles.bgWrapper}>{content}</View>;
}

const styles = StyleSheet.create({
  bgWrapper: {
    flex: 1,
    backgroundColor: '#08090C',
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  }
});
