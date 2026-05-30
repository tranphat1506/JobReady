import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { styles } from './Styles';

interface HobbiesBlockProps {
  title: string;
  data: string[];
}

export const HobbiesBlock = ({ title, data }: HobbiesBlockProps) => {
  if (!data || data.length === 0) return null;
  return (
    <View wrap={false}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.summary}>{data.join(', ')}</Text>
    </View>
  );
};
