import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { Reference } from '../../types/schema';
import { styles } from './Styles';

interface ReferencesBlockProps {
  title: string;
  data: Reference[];
}

export const ReferencesBlock = ({ title, data }: ReferencesBlockProps) => {
  if (!data || data.length === 0) return null;
  return (
    <View>
      <View style={styles.sectionTitleContainer} wrap={false}><Text style={styles.sectionTitleText}>{title}</Text></View>
      {data.map((ref, i) => (
        <View key={i} style={styles.itemContainer} wrap={false}>
          <Text style={{ fontWeight: 'bold' }}>{ref.name}</Text>
          <Text style={{ fontStyle: 'italic' }}>{ref.position} at {ref.company}</Text>
          <Text>{ref.contactInfo}</Text>
        </View>
      ))}
    </View>
  );
};
