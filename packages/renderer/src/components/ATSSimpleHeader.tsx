// @ts-nocheck
import React from 'react';
import { Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { PersonalInfo, Labels } from '@cv-generator/schema';

interface HeaderProps {
  data: PersonalInfo;
  labels?: Labels;
}

const localStyles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    marginRight: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    objectFit: 'contain',
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 5,
    lineHeight: 1.2,
  },
  jobTitle: {
    fontSize: 13,
    color: '#555555',
    marginBottom: 5,
    lineHeight: 1.2,
  },
  contactsGrid: {
    fontSize: 10,
    lineHeight: 1.3,
  },
  contactRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  contactLabel: {
    width: 80,
    fontWeight: 'bold',
  },
  contactValue: {
    flex: 1,
  }
});

export const ATSSimpleHeader = ({ data, labels }: HeaderProps) => {
  const isValid = (str?: string) => str && str.trim() !== '' && str.trim().toUpperCase() !== 'N/A';

  const l = labels || {
    dob: 'Ngày sinh',
    portfolio: 'Website',
    link: 'Link',
    phone: 'Số điện thoại',
    email: 'Email',
    location: 'Địa chỉ'
  };

  const contactItems: { label: string; value: string }[] = [];
  if (isValid(data.dob)) contactItems.push({ label: l.dob || 'Ngày sinh', value: data.dob! });
  if (isValid(data.gender)) contactItems.push({ label: 'Giới tính', value: data.gender! });
  if (isValid(data.phone)) contactItems.push({ label: l.phone || 'Số điện thoại', value: data.phone! });
  if (isValid(data.email)) contactItems.push({ label: l.email || 'Email', value: data.email! });
  if (isValid(data.portfolio)) {
    const cleanUrl = data.portfolio!.replace(/^https?:\/\/(www\.)?/, '');
    contactItems.push({ label: 'Portfolio', value: cleanUrl });
  }
  if (isValid(data.location)) contactItems.push({ label: l.location || 'Địa chỉ', value: data.location! });

  if (data.links) {
    data.links.forEach(link => {
      if (isValid(link.url) && isValid(link.name)) {
        const cleanUrl = link.url.replace(/^https?:\/\/(www\.)?/, '');
        contactItems.push({ label: link.name, value: cleanUrl });
      }
    });
  }

  let avatarSrc = data.avatar;
  if (!isValid(avatarSrc)) {
    avatarSrc = 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';
  }

  return (
    <View style={localStyles.headerContainer}>
      <View style={localStyles.avatarContainer}>
        <Image src={avatarSrc!} style={localStyles.avatar} />
      </View>

      <View style={localStyles.infoContainer}>
        <Text style={localStyles.fullName}>
          {data.fullName || 'YOUR NAME'}
        </Text>
        
        {isValid(data.jobTitle) ? (
          <Text style={localStyles.jobTitle}>
            {data.jobTitle}
          </Text>
        ) : <View style={{ marginBottom: 5 }} />}

        <View style={localStyles.contactsGrid}>
          {contactItems.map((item, i) => (
            <View key={i} style={localStyles.contactRow}>
              <Text style={localStyles.contactLabel}>{item.label}:</Text>
              <Text style={localStyles.contactValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

