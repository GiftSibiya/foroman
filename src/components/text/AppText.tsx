import { COLORS, FONT_SIZE, FONT_WIDTH } from '@/constants/Constants';
import React from 'react'

interface AppTextProps {
  text: string;
  size: 'extraSmall' | 'small' | 'medium' | 'large' | 'extraLarge';
  color?: 'primary' | 'secondary' | 'background' | 'lightGrey' | 'Grey' | 'text' | 'white' | 'black' | 'transparent';
  weight?: 'medium' | 'large' | 'extraLarge';
  align?: 'left' | 'center' | 'right';
  onClick?: () => void
}

const AppText: React.FC<AppTextProps> = ({ text, size, color = 'black', weight, align }) => {
  return (
    <p style={{
      fontFamily: 'Poppins',
      fontSize: FONT_SIZE[size],
      color: COLORS[color],
      fontWeight: FONT_WIDTH[weight],
      textAlign: align
    }}>
      {text}
    </p>
  )
}

export default AppText