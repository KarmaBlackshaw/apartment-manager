import React from 'react'
import { Text, View, Image, Pressable, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import Ionicons from '@expo/vector-icons/Ionicons'
import { colors } from '../../constants/theme'

interface CameraCaptureProps {
  label: string
  onCapture: () => void
  captured?: string
  hint?: string
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function CameraCapture({
  label,
  onCapture,
  captured,
  hint,
}: CameraCaptureProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 100 })
  }

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 })
  }

  return (
    <View>
      <AnimatedPressable
        onPress={onCapture}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.zone, animatedStyle]}
      >
        {captured != null ? (
          <Image
            source={{ uri: captured }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <>
            <Ionicons name="camera-outline" size={32} color={colors.primary} />
            <Text style={styles.label}>{label}</Text>
          </>
        )}
      </AnimatedPressable>

      {hint != null && (
        <Text style={styles.hint}>{hint}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  zone: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: 8,
    backgroundColor: colors.elevated,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 140,
    borderRadius: 8,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
  },
})
