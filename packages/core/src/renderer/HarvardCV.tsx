import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToFile, Font } from '@react-pdf/renderer';
import { CVSchema } from '../types/schema';
import * as path from 'path';

// Đăng ký font Tinos từ local asset thay vì tải từ mạng
// __dirname trong thư mục dist/renderer sẽ lùi lại 2 cấp để vào thư mục assets
const fontPath = path.resolve(__dirname, '../../assets/fonts/Tinos');

Font.register({
  family: 'Tinos',
  fonts: [
    { src: path.join(fontPath, 'Tinos-Regular.ttf') },
    { src: path.join(fontPath, 'Tinos-Bold.ttf'), fontWeight: 'bold' },
    { src: path.join(fontPath, 'Tinos-Italic.ttf'), fontStyle: 'italic' },
    { src: path.join(fontPath, 'Tinos-BoldItalic.ttf'), fontWeight: 'bold', fontStyle: 'italic' }
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: '1in',
    fontFamily: 'Tinos',
    fontSize: 11,
    lineHeight: 1.3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 15,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  contactInfo: {
    fontSize: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 2,
    marginBottom: 8,
    marginTop: 15,
  },
  itemContainer: {
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontWeight: 'bold',
  },
  itemSubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontStyle: 'italic',
    marginBottom: 3,
  },
  bulletPoint: {
    flexDirection: 'row',
    paddingLeft: 10,
    marginBottom: 2,
  },
  bulletText: {
    flex: 1,
  },
  bulletDot: {
    width: 10,
  },
  summary: {
    marginBottom: 10,
    textAlign: 'justify',
  },
  skillCategory: {
    marginBottom: 4,
    textAlign: 'justify',
  },
  skillTitle: {
    fontWeight: 'bold',
  }
});

interface HarvardCVProps {
  data: CVSchema;
}

export const HarvardCV = ({ data }: HarvardCVProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header Info */}
      <View style={styles.header}>
        <Text style={styles.name}>{data.personal.fullName}</Text>
        <View style={styles.contactInfo}>
          <Text>{data.personal.location} | {data.personal.phone} | {data.personal.email}</Text>
        </View>
        <View style={styles.contactInfo}>
          {data.personal.links && data.personal.links.map((link, i) => (
            <Text key={i}>{link.name}: {link.url}</Text>
          ))}
        </View>
      </View>

      {/* Summary */}
      {data.summary && (
        <View style={styles.summary}>
          <Text>{data.summary}</Text>
        </View>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Education</Text>
          {data.education.map((edu, i) => (
            <View key={i} style={styles.itemContainer}>
              <View style={styles.itemHeader}>
                <Text>{edu.institution}</Text>
                <Text>{edu.startDate} - {edu.endDate}</Text>
              </View>
              <View style={styles.itemSubHeader}>
                <Text>{edu.degree}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Experience</Text>
          {data.experience.map((exp, i) => (
            <View key={i} style={styles.itemContainer}>
              <View style={styles.itemHeader}>
                <Text>{exp.company}</Text>
                <Text>{exp.startDate} - {exp.endDate}</Text>
              </View>
              <View style={styles.itemSubHeader}>
                <Text>{exp.position}</Text>
              </View>
              {exp.description && exp.description.map((desc, j) => (
                <View key={j} style={styles.bulletPoint}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{desc}</Text>
               </View>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Skills</Text>
          {data.skills.map((skill, i) => (
             <View key={i} style={styles.skillCategory}>
               <Text>
                 <Text style={styles.skillTitle}>{skill.category}: </Text>
                 <Text>{skill.items.join(', ')}</Text>
               </Text>
             </View>
          ))}
        </View>
      )}
    </Page>
  </Document>
);

export const generatePdfFile = async (data: CVSchema, filePath: string): Promise<void> => {
  await renderToFile(<HarvardCV data={data} />, filePath);
};
