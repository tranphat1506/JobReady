import React from 'react';
import { Text, View, Link } from '@react-pdf/renderer';
import { PersonalInfo, Labels } from '../../types/schema';
import { styles } from './Styles';

interface HeaderProps {
  data: PersonalInfo;
  labels?: Labels;
}

export const Header = ({ data, labels }: HeaderProps) => {
  const isValid = (str?: string) => str && str.trim() !== '' && str.trim().toUpperCase() !== 'N/A';

  const l = labels || {
    dob: 'DOB',
    portfolio: 'Portfolio',
    link: 'Link'
  };

  const contactRow1: React.ReactNode[] = [
    isValid(data.location) ? <Text>{data.location}</Text> : null,
    isValid(data.phone) ? <Text>{data.phone}</Text> : null,
    isValid(data.email) ? <Text>{data.email}</Text> : null,
  ].filter(Boolean);

  const contactRow2: React.ReactNode[] = [
    isValid(data.dob) ? <Text>{l.dob}: {data.dob}</Text> : null,
  ].filter(Boolean);

  if (isValid(data.portfolio)) {
    const cleanUrl = data.portfolio!.replace(/^https?:\/\/(www\.)?/, '');
    const validUrl = data.portfolio!.startsWith('http') ? data.portfolio! : `https://${data.portfolio!}`;
    contactRow2.push(<Link src={validUrl} style={styles.link}>Portfolio: {cleanUrl}</Link>);
  }
  
  if (data.links) {
    data.links.forEach(link => {
      if (isValid(link.url) && isValid(link.name)) {
        const cleanUrl = link.url.replace(/^https?:\/\/(www\.)?/, '');
        const validUrl = link.url.startsWith('http') ? link.url : `https://${link.url}`;
        contactRow2.push(<Link src={validUrl} style={styles.link}>{link.name}: {cleanUrl}</Link>);
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

  return (
    <View style={styles.header}>
      <Text style={styles.name}>{data.fullName}</Text>
      {isValid(data.jobTitle) ? <Text style={{ fontSize: 12, marginBottom: 4 }}>{data.jobTitle}</Text> : null}
      {renderRow(contactRow1)}
      {renderRow(contactRow2)}
    </View>
  );
};
