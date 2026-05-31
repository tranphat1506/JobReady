// @ts-nocheck
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
      <View style={styles.sectionTitleContainer} wrap={false}><Text style={styles.sectionTitleText}>{title}</Text></View>
      <Text style={styles.summary}>{data.join(', ')}</Text>
    </View>
  );
};
