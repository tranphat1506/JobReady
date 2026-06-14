// @ts-nocheck
import React from 'react';
import { Text, View, Link, StyleSheet } from '@react-pdf/renderer';
import { PersonalInfo, Labels } from '@cv-generator/schema';

interface HeaderProps {
  data: PersonalInfo;
  labels?: Labels;
}

const localStyles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 5,
    lineHeight: 1.2,
  },
  jobTitle: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
    lineHeight: 1.2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 3,
    fontSize: 10,
  },
  separator: {
    marginHorizontal: 6,
  },
  link: {
    color: '#000',
    textDecoration: 'none',
  }
});

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
    contactRow2.push(<Link src={validUrl} style={localStyles.link}>Portfolio: {cleanUrl}</Link>);
  }

  if (data.links) {
    data.links.forEach(link => {
      if (isValid(link.url) && isValid(link.name)) {
        const cleanUrl = link.url.replace(/^https?:\/\/(www\.)?/, '');
        const validUrl = link.url.startsWith('http') ? link.url : `https://${link.url}`;
        contactRow2.push(<Link src={validUrl} style={localStyles.link}>{link.name}: {cleanUrl}</Link>);
      }
    });
  }

  const renderRow = (row: React.ReactNode[]) => {
    if (row.length === 0) return null;
    return (
      <View style={localStyles.row}>
        {row.map((item, i) => {
          const isLast = i === row.length - 1;
          const keyedItem = React.isValidElement(item) ? React.cloneElement(item as React.ReactElement, { key: `item-${i}` }) : item;
          return isLast ? [keyedItem] : [keyedItem, <Text key={`sep-${i}`} style={localStyles.separator}>•</Text>];
        })}
      </View>
    );
  };

  return (
    <View style={localStyles.headerContainer}>
      <Text style={localStyles.name}>{data.fullName || 'YOUR NAME'}</Text>
      
      {isValid(data.jobTitle) ? (
        <Text style={localStyles.jobTitle}>{data.jobTitle}</Text>
      ) : <View style={{ marginBottom: 4 }} />}
      
      {renderRow(contactRow1)}
      {renderRow(contactRow2)}
    </View>
  );
};
