import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { Experience } from '../../types/schema';
import { styles } from './Styles';

interface ExperienceBlockProps {
  title: string;
  data: Experience[];
}

export const ExperienceBlock = ({ title, data }: ExperienceBlockProps) => {
  if (!data || data.length === 0) return null;
  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {data.map((exp, i) => (
        <View key={i} style={styles.itemContainer} wrap={false}>
          <View style={styles.itemHeader}>
            <Text style={{ flex: 1, paddingRight: 10 }}>{exp.company}</Text>
            <Text style={{ flexShrink: 0 }}>{exp.startDate} - {exp.endDate}</Text>
          </View>
          <View style={styles.itemSubHeader}>
            <Text>{exp.position}</Text>
          </View>
          {exp.description ? exp.description.map((desc, j) => (
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
