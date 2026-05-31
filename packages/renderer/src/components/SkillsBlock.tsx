// @ts-nocheck
import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { SkillCategory } from '@cv-generator/schema';
import { styles } from './Styles';

interface SkillsBlockProps {
  title: string;
  data: SkillCategory[];
}

export const SkillsBlock = ({ title, data }: SkillsBlockProps) => {
  if (!data || data.length === 0) return null;
  return (
    <View>
      <View style={styles.sectionTitleContainer} wrap={false}><Text style={styles.sectionTitleText}>{title}</Text></View>
      {data.map((skill, i) => (
        <View key={i} style={styles.skillCategory} wrap={false}>
          <Text>
            <Text style={styles.skillTitle}>{skill.category}: </Text>
            <Text>{skill.items.join(', ')}</Text>
          </Text>
        </View>
      ))}
    </View>
  );
};
