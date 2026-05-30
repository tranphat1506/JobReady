import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { Activity } from '../../types/schema';
import { styles } from './Styles';

interface ActivitiesBlockProps {
  title: string;
  data: Activity[];
}

export const ActivitiesBlock = ({ title, data }: ActivitiesBlockProps) => {
  if (!data || data.length === 0) return null;
  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {data.map((act, i) => (
        <View key={i} style={styles.itemContainer} wrap={false}>
          <View style={styles.itemHeader}>
            <Text style={{ flex: 1, paddingRight: 10 }}>{act.organization}</Text>
            <Text style={{ flexShrink: 0 }}>{act.startDate} - {act.endDate}</Text>
          </View>
          <View style={styles.itemSubHeader}>
            <Text>{act.role}</Text>
          </View>
          {act.description ? act.description.map((desc, j) => (
            <View key={j} style={styles.bulletPoint}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>{desc}</Text>
            </View>
          )) : null}
        </View>
      ))}
    </View>
  );
};
