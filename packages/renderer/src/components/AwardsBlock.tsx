// @ts-nocheck
import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { Award } from '@cv-generator/schema';
import { styles } from './Styles';

interface AwardsBlockProps {
  title: string;
  data: Award[];
}

export const AwardsBlock = ({ title, data }: AwardsBlockProps) => {
  if (!data || data.length === 0) return null;
  return (
    <View>
      <View style={styles.sectionTitleContainer} wrap={false}><Text style={styles.sectionTitleText}>{title}</Text></View>
      {data.map((award, i) => (
        <View key={i} style={styles.itemContainer} wrap={false}>
          <View style={styles.itemHeader}>
            <Text style={{ textTransform: 'uppercase', flex: 1, paddingRight: 10 }}>{award.title}</Text>
            {award.date ? <Text style={{ flexShrink: 0 }}>{award.date}</Text> : null}
          </View>
          {award.issuer ? (
            <View style={styles.itemSubHeader}>
              <Text>{award.issuer}</Text>
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
};
