// components/DailyForgeLogo.tsx
import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';

interface DailyForgeLogoProps {
  size?: number;
}

export const DailyForgeLogo: React.FC<DailyForgeLogoProps> = ({ size = 100 }) => {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
        <Defs>
          {/* Growth gradient - green to vibrant orange */}
          <LinearGradient id="growthGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <Stop offset="0%" stopColor="#10B981" stopOpacity="1" />
            <Stop offset="30%" stopColor="#F59E0B" stopOpacity="1" />
            <Stop offset="70%" stopColor="#FF6B35" stopOpacity="1" />
            <Stop offset="100%" stopColor="#E85D04" stopOpacity="1" />
          </LinearGradient>
          
          {/* Energy gradient */}
          <LinearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF6B35" stopOpacity="1" />
            <Stop offset="100%" stopColor="#E85D04" stopOpacity="1" />
          </LinearGradient>

          {/* Wellness gradient */}
          <LinearGradient id="wellnessGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#34D399" stopOpacity="1" />
            <Stop offset="100%" stopColor="#10B981" stopOpacity="1" />
          </LinearGradient>

          {/* Heart gradient */}
          <LinearGradient id="heartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FF6B35" stopOpacity="1" />
            <Stop offset="100%" stopColor="#DC2F02" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Background glow circles */}
        <Circle cx="60" cy="60" r="55" fill="#FFF7ED" opacity="0.5" />
        <Circle cx="60" cy="60" r="45" fill="#FFEDD5" opacity="0.4" />

        {/* Central growth symbol - sprouting plant/flame hybrid */}
        
        {/* Root/Foundation */}
        <Path
          d="M55 85 Q55 80 60 80 Q65 80 65 85"
          stroke="#10B981"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* Main stem with growth rings */}
        <Path
          d="M60 80 L60 45"
          stroke="url(#growthGradient)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Growth rings on stem */}
        <Circle cx="60" cy="70" r="2.5" fill="#F59E0B" opacity="0.6" />
        <Circle cx="60" cy="60" r="3" fill="#FF6B35" opacity="0.6" />
        <Circle cx="60" cy="50" r="2.5" fill="#E85D04" opacity="0.6" />

        {/* Left branch - represents consistency */}
        <Path
          d="M60 65 Q50 60 45 55"
          stroke="url(#growthGradient)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Left leaf/flame - Health */}
        <Path
          d="M45 55 Q40 50 42 45 Q44 48 46 50 Q45 47 46 43 Q48 46 49 49 Q48 46 49 42 Q50 45 51 48 Q49 50 47 52 Q45 54 45 55 Z"
          fill="url(#wellnessGradient)"
        />

        {/* Right branch - represents discipline */}
        <Path
          d="M60 65 Q70 60 75 55"
          stroke="url(#growthGradient)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Right leaf/flame - Strength */}
        <Path
          d="M75 55 Q80 50 78 45 Q76 48 74 50 Q75 47 74 43 Q72 46 71 49 Q72 46 71 42 Q70 45 69 48 Q71 50 73 52 Q75 54 75 55 Z"
          fill="url(#energyGradient)"
        />

        {/* Center top - main growth point (flame shape) */}
        <Path
          d="M60 45 Q58 38 59 32 Q60 35 62 38 Q61 34 62 28 Q63 32 65 36 Q64 31 65 25 Q66 30 67 35 Q66 32 67 27 Q68 32 68 37 Q66 40 64 43 Q62 45 60 45 Z"
          fill="url(#energyGradient)"
        />

        {/* Inner flame highlight */}
        <Path
          d="M60 45 Q59 40 60 35 Q61 38 62 40 Q61 37 62 33 Q63 36 64 39 Q63 37 64 34 Q65 37 65 40 Q64 42 62 43 Q60 44 60 45 Z"
          fill="#FFB703"
          opacity="0.8"
        />

        {/* Health heart symbol integrated at base */}
        <Path
          d="M55 76 Q55 73 57 72 Q59 71 60 73 Q61 71 63 72 Q65 73 65 76 Q65 79 60 83 Q55 79 55 76 Z"
          fill="url(#heartGradient)"
          opacity="0.9"
        />

        {/* Progress dots/checkmarks in circular pattern */}
        <G opacity="0.8">
          {/* Top right */}
          <Circle cx="75" cy="40" r="3" fill="#10B981" />
          <Path
            d="M73.5 40 L74.5 41 L76.5 39"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right */}
          <Circle cx="80" cy="55" r="3" fill="#F59E0B" />
          <Path
            d="M78.5 55 L79.5 56 L81.5 54"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Bottom right */}
          <Circle cx="72" cy="70" r="2.5" fill="#FF6B35" />
          <Path
            d="M70.8 70 L71.5 70.7 L73.2 69"
            stroke="#FFFFFF"
            strokeWidth="1.3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Top left */}
          <Circle cx="45" cy="40" r="3" fill="#10B981" />
          <Path
            d="M43.5 40 L44.5 41 L46.5 39"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Left */}
          <Circle cx="40" cy="55" r="3" fill="#F59E0B" />
          <Path
            d="M38.5 55 L39.5 56 L41.5 54"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Bottom left */}
          <Circle cx="48" cy="70" r="2.5" fill="#FF6B35" />
          <Path
            d="M46.8 70 L47.5 70.7 L49.2 69"
            stroke="#FFFFFF"
            strokeWidth="1.3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>

        {/* Energy particles/sparkles */}
        <Circle cx="52" cy="48" r="1.5" fill="#FFB703" opacity="0.7" />
        <Circle cx="68" cy="48" r="1.5" fill="#FFB703" opacity="0.7" />
        <Circle cx="50" cy="58" r="1.2" fill="#10B981" opacity="0.6" />
        <Circle cx="70" cy="58" r="1.2" fill="#10B981" opacity="0.6" />
        <Circle cx="55" cy="35" r="1" fill="#FF6B35" opacity="0.5" />
        <Circle cx="65" cy="35" r="1" fill="#FF6B35" opacity="0.5" />

        {/* Vitality rays */}
        <Path
          d="M60 25 L60 20"
          stroke="#FFB703"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />
        <Path
          d="M72 30 L76 26"
          stroke="#FF6B35"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
        <Path
          d="M48 30 L44 26"
          stroke="#FF6B35"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
      </Svg>
    </View>
  );
};