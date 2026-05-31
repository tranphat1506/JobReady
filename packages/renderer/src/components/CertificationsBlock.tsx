// @ts-nocheck
import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { Certification } from '@cv-generator/schema';
import { styles } from './Styles';

interface CertificationsBlockProps {
  title: string;
  data: Certification[];
}

export const CertificationsBlock = ({ title, data }: CertificationsBlockProps) => {
  if (!data || data.length === 0) return null;
  return (
    <View>
      <View style={styles.sectionTitleContainer} wrap={false}><Text style={styles.sectionTitleText}>{title}</Text></View>
      {data.map((cert, i) => (
        <View key={i} style={styles.itemContainer} wrap={false}>
          <View style={styles.itemHeader}>
            <Text style={{ textTransform: 'uppercase', flex: 1, paddingRight: 10 }}>{cert.name}</Text>
            {cert.date ? <Text style={{ flexShrink: 0 }}>{cert.date}</Text> : null}
          </View>
          {cert.issuer ? (
            <View style={styles.itemSubHeader}>
              <Text>{cert.issuer}</Text>
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
};
