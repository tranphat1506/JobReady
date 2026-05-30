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
  const isValid = (str?: string) => str && str.trim() !== '' && str.trim().toUpperCase() !== 'N/A';

  const l = data.labels || {
    dob: 'DOB',
    portfolio: 'Portfolio',
    link: 'Link'
  };

  const contactRow1: React.ReactNode[] = [
    isValid(data.personal.location) ? <Text>{data.personal.location}</Text> : null,
    isValid(data.personal.phone) ? <Text>{data.personal.phone}</Text> : null,
    isValid(data.personal.email) ? <Link src={`mailto:${data.personal.email}`} style={styles.link}>{data.personal.email}</Link> : null,
  ].filter(Boolean);

  const contactRow2: React.ReactNode[] = [
    isValid(data.personal.dob) ? <Text>{l.dob}: {data.personal.dob}</Text> : null,
  ].filter(Boolean);

  if (isValid(data.personal.portfolio)) {
    const cleanUrl = data.personal.portfolio!.replace(/^https?:\/\/(www\.)?/, '');
    contactRow2.push(<Link src={data.personal.portfolio!} style={styles.link}>{l.portfolio}: {cleanUrl}</Link>);
  }
  
  if (data.personal.links) {
    data.personal.links.forEach(link => {
      if (isValid(link.url) && isValid(link.name)) {
        const cleanUrl = link.url.replace(/^https?:\/\/(www\.)?/, '');
        contactRow2.push(<Link src={link.url} style={styles.link}>{link.name}: {cleanUrl}</Link>);
      }
    });
  }

  const renderRow = (row: React.ReactNode[]) => {
    if (row.length === 0) return null;
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 3, fontSize: 10 }}>
        {row.map((item, i) => (
          <React.Fragment key={i}>
            {item}
            {i < row.length - 1 ? <Text style={{ marginHorizontal: 6 }}>•</Text> : null}
          </React.Fragment>
        ))}
      </View>
    );
  };

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
          {renderRow(contactRow1)}
          {renderRow(contactRow2)}
        </View>

        {/* Summary */}
        {data.summary ? (
          <View style={styles.summary}>
            <Text>{data.summary}</Text>
          </View>
        ) : null}

        {/* Education */}
        {data.education && data.education.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>{t.education}</Text>
            {data.education.map((edu, i) => (
              <View key={i} style={styles.itemContainer} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={{ textTransform: 'uppercase' }}>{edu.institution}</Text>
                  <Text>{edu.startDate} - {edu.endDate}</Text>
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
        ) : null}

        {/* Experience */}
        {data.experience && data.experience.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>{t.experience}</Text>
            {data.experience.map((exp, i) => (
              <View key={i} style={styles.itemContainer} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text>{exp.company}</Text>
                  <Text>{exp.startDate} - {exp.endDate}</Text>
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
        ) : null}

        {/* Projects */}
        {data.projects && data.projects.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>{t.projects}</Text>
            {data.projects.map((proj, i) => (
              <View key={i} style={styles.itemContainer} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text>{proj.name} {proj.role ? `(${proj.role})` : '(Project)'}</Text>
                  <Text>{proj.startDate} - {proj.endDate}</Text>
                </View>
                {isValid(proj.link) ? (
                  <View style={styles.itemSubHeader}>
                    <Text>{l.link}: <Link src={proj.link!} style={styles.link}>{proj.link!.replace(/^https?:\/\//, '')}</Link></Text>
                  </View>
                ) : null}
                {proj.description ? proj.description.map((desc, j) => (
                  <View key={j} style={styles.bulletPoint}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{desc}</Text>
                  </View>
                )) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Skills */}
        {data.skills && data.skills.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>{t.skills}</Text>
            {data.skills.map((skill, i) => (
              <View key={i} style={styles.skillCategory} wrap={false}>
                <Text>
                  <Text style={styles.skillTitle}>{skill.category}: </Text>
                  <Text>{skill.items.join(', ')}</Text>
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
};

export const generatePdfFile = async (data: CVSchema, filePath: string): Promise<void> => {
  await renderToFile(<HarvardCV data={data} />, filePath);
};
