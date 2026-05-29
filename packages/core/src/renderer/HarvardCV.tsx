import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToFile, Font, Link } from '@react-pdf/renderer';
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
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    marginBottom: 8,
    marginTop: 10,
  },
  itemContainer: {
    marginBottom: 6,
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
    textAlign: 'justify',
  },
  skillTitle: {
    fontWeight: 'bold',
  },
  link: {
    color: '#000',
    textDecoration: 'none',
  },
  skillsLegendTitle: {
    fontStyle: 'italic',
    fontWeight: 'bold',
    marginBottom: 2,
    fontSize: 9,
  },
  skillsLegendText: {
    fontStyle: 'italic',
    marginBottom: 6,
    fontSize: 9,
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
          {data.personal.dob && <Text>DOB: {data.personal.dob} | </Text>}
          <Text>{data.personal.location} | {data.personal.phone} | </Text>
          <Link src={`mailto:${data.personal.email}`} style={styles.link}>{data.personal.email}</Link>
        </View>
        <View style={styles.contactInfo}>
          {data.personal.portfolio && (
            <Text><Link src={data.personal.portfolio} style={styles.link}>Portfolio</Link>{(data.personal.links && data.personal.links.length > 0) ? ' | ' : ''}</Text>
          )}
          {data.personal.links && data.personal.links.map((link, i) => (
            <Text key={i}>
              <Link src={link.url} style={styles.link}>{link.name}</Link>
              {i < data.personal.links.length - 1 ? ' | ' : ''}
            </Text>
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
          <View>
            <Text style={styles.skillsLegendTitle}>SKILLS SUMMARY</Text>
            <Text style={styles.skillsLegendText}>* Rank Legends: 1- Beginner (start to learn); 2- Novice (theory only, no experience); 3- Competent (be able to do well); 4- Proficient (skilled and experienced); 5- Expert (high level of knowledge and experience)</Text>
          </View>
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
