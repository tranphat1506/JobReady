import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { Education } from '../../types/schema';
import { styles } from './Styles';

interface EducationBlockProps {
  title: string;
  data: Education[];
}

export const EducationBlock = ({ title, data }: EducationBlockProps) => {
  if (!data || data.length === 0) return null;
  return (
    <View>
      <View style={styles.sectionTitleContainer} wrap={false}><Text style={styles.sectionTitleText}>{title}</Text></View>
      {data.map((edu, i) => (
        <View key={i} style={styles.itemContainer} wrap={false}>
          <View style={styles.itemHeader}>
            <Text style={{ textTransform: 'uppercase', flex: 1, paddingRight: 10 }}>{edu.institution}</Text>
            <Text style={{ flexShrink: 0 }}>{edu.startDate} - {edu.endDate}</Text>
          </View>
          <View style={styles.itemSubHeader}>
            <Text style={{ textTransform: 'uppercase' }}>{edu.degree}</Text>
          </View>
          {edu.description ? edu.description.map((desc, j) => (
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
