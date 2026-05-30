import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { styles } from './Styles';

interface SummaryBlockProps {
  title?: string;
  data: string;
}

export const SummaryBlock = ({ title, data }: SummaryBlockProps) => {
  if (!data) return null;
  return (
    <View style={styles.summary} wrap={false}>
      {title ? <View style={styles.sectionTitleContainer} wrap={false}><Text style={styles.sectionTitleText}>{title}</Text></View> : null}
      <Text>{data}</Text>
    </View>
  );
};
