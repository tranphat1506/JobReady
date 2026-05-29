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
  }
});

interface HarvardCVProps {
  data: CVSchema;
}

export const HarvardCV = ({ data }: HarvardCVProps) => {
  const contactInfo1 = [
    data.personal.dob ? `DOB: ${data.personal.dob}` : null,
    data.personal.location,
    data.personal.phone,
  ].filter(Boolean);

  const linkItems: React.ReactNode[] = [];
  if (data.personal.portfolio) {
    linkItems.push(<Link src={data.personal.portfolio} style={styles.link}>Portfolio</Link>);
  }
  if (data.personal.links) {
    data.personal.links.forEach(link => {
      if (link.url && link.name) {
        linkItems.push(<Link src={link.url} style={styles.link}>{link.name}</Link>);
      }
    });
  }

  // Safe fallback for section titles
  const t = data.sectionTitles || {
    summary: 'Summary',
    experience: 'Experience',
    projects: 'Projects',
    education: 'Education',
    skills: 'Skills'
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Info */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.personal.fullName}</Text>
          <View style={styles.contactInfo}>
            <Text>
              {contactInfo1.join(' | ')}
              {contactInfo1.length > 0 && data.personal.email ? ' | ' : ''}
              {data.personal.email ? <Link src={`mailto:${data.personal.email}`} style={styles.link}>{data.personal.email}</Link> : null}
            </Text>
          </View>
          {linkItems.length > 0 && (
            <View style={styles.contactInfo}>
              <Text>
                {linkItems.map((item, i) => (
                  <React.Fragment key={i}>
                    {item}
                    {i < linkItems.length - 1 ? ' | ' : ''}
                  </React.Fragment>
                ))}
              </Text>
            </View>
          )}
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
            <Text style={styles.sectionTitle}>{t.education}</Text>
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
            <Text style={styles.sectionTitle}>{t.experience}</Text>
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

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>{t.projects}</Text>
            {data.projects.map((proj, i) => (
              <View key={i} style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                  <Text>{proj.name} {proj.role ? `(${proj.role})` : '(Project)'}</Text>
                  <Text>{proj.startDate} - {proj.endDate}</Text>
                </View>
                {proj.link && (
                  <View style={styles.itemSubHeader}>
                    <Text>Link: <Link src={proj.link} style={styles.link}>{proj.link.replace(/^https?:\/\//, '')}</Link></Text>
                  </View>
                )}
                {proj.description && proj.description.map((desc, j) => (
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
            <Text style={styles.sectionTitle}>{t.skills}</Text>
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
};

export const generatePdfFile = async (data: CVSchema, filePath: string): Promise<void> => {
  await renderToFile(<HarvardCV data={data} />, filePath);
};
