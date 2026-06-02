// @ts-nocheck
import React from 'react';
import { Text, View, Link } from '@react-pdf/renderer';
import { Project, Labels } from '@cv-generator/schema';
import { styles } from './Styles';

interface ProjectsBlockProps {
  title: string;
  data: Project[];
  labels?: Labels;
}

export const ProjectsBlock = ({ title, data, labels }: ProjectsBlockProps) => {
  const isValid = (str?: string) => str && str.trim() !== '' && str.trim().toUpperCase() !== 'N/A';
  const l = labels || { link: 'Link', dob: 'DOB', portfolio: 'Portfolio' };

  if (!data || data.length === 0) return null;
  return (
    <View>
      <View style={styles.sectionTitleContainer} wrap={false}><Text style={styles.sectionTitleText}>{title}</Text></View>
      {data.map((proj, i) => (
        <View key={i} style={styles.itemContainer} wrap={false}>
          <View style={styles.itemHeader}>
            <Text style={{ flex: 1, paddingRight: 10 }}>{proj.name} {proj.role ? `(${proj.role})` : '(Project)'}</Text>
            <Text style={{ flexShrink: 0 }}>{proj.startDate} - {proj.endDate}</Text>
          </View>
          {proj.links && proj.links.length > 0 ? (
            <View style={styles.itemSubHeader}>
              <Text>
                {proj.links.map((linkObj, index) => {
                  if (!isValid(linkObj.url)) return null;
                  const url = linkObj.url.startsWith('http') ? linkObj.url : `https://${linkObj.url}`;
                  const display = linkObj.name ? `${linkObj.name}: ` : '';
                  return (
                    <React.Fragment key={index}>
                      <Text>{display}</Text>
                      <Link src={url} style={styles.link}>{linkObj.url.replace(/^https?:\/\//, '')}</Link>
                      {index < proj.links!.length - 1 ? <Text>  •  </Text> : null}
                    </React.Fragment>
                  );
                })}
              </Text>
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
  );
};
