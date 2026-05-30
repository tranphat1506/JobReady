import React from 'react';
import { Text, View, Image } from '@react-pdf/renderer';
import { PersonalInfo, Labels } from '../../types/schema';
import { styles } from './Styles';

interface HeaderProps {
  data: PersonalInfo;
  labels?: Labels;
}

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

  const contactItems = [];
  if (isValid(data.dob)) contactItems.push({ label: l.dob || 'Ngày sinh', value: data.dob });
  if (isValid(data.gender)) contactItems.push({ label: 'Giới tính', value: data.gender });
  if (isValid(data.phone)) contactItems.push({ label: l.phone || 'Số điện thoại', value: data.phone });
  if (isValid(data.email)) contactItems.push({ label: l.email || 'Email', value: <Text>{data.email}</Text> });
  if (isValid(data.portfolio)) {
    const cleanUrl = data.portfolio!.replace(/^https?:\/\/(www\.)?/, '');
    contactItems.push({ label: l.portfolio || 'Website', value: <Text>{cleanUrl}</Text> });
  }
  if (isValid(data.location)) contactItems.push({ label: l.location || 'Địa chỉ', value: data.location });

  if (data.links) {
    data.links.forEach(link => {
      if (isValid(link.url) && isValid(link.name)) {
        const cleanUrl = link.url.replace(/^https?:\/\/(www\.)?/, '');
        contactItems.push({ label: link.name, value: <Text>{cleanUrl}</Text> });
      }
    });
  }

  // Fallback to a reliable public URL placeholder
  let avatarSrc = data.avatar;
  if (!isValid(avatarSrc)) {
    avatarSrc = 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';
  }

  return (
    <View style={{ flexDirection: 'row', marginBottom: 20, alignItems: 'center' }}>
      {/* Left side: Avatar */}
      <View style={{ width: 100, marginRight: 20 }}>
        <Image
          src={avatarSrc!}
          style={{ width: 100, height: 100, objectFit: 'contain' }}
        />
      </View>

      {/* Right side: Info */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', textTransform: 'uppercase' }}>
          {data.fullName}
        </Text>
        {isValid(data.jobTitle) ? (
          <Text style={{ fontSize: 13, color: '#555', marginBottom: 5 }}>
            {data.jobTitle}
          </Text>
        ) : <View style={{ marginBottom: 5 }} />}

        {/* Contact info grid - 2 columns or lines */}
        <View style={{ fontSize: 10, lineHeight: 1.3 }}>
          {contactItems.map((item, i) => (
            <View key={i} style={{ flexDirection: 'row' }}>
              <Text style={{ width: 80, fontWeight: 'bold' }}>{item.label}:</Text>
              <Text style={{ flex: 1 }}>{item.value as any}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
