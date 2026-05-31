// @ts-nocheck
import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { ICoverLetterTemplate, CoverLetterTemplateConfig } from '../core/ICoverLetterTemplate';
import { CoverLetterSchema } from '@cv-generator/schema';
import { styles } from '../components/Styles';

export class StandardCoverLetterTemplate implements ICoverLetterTemplate {
  config: CoverLetterTemplateConfig = {
    id: 'standard-cover-letter',
    name: 'Standard Cover Letter'
  };

  render(data: CoverLetterSchema): React.ReactElement {
    const isValid = (str?: string) => str && str.trim() !== '' && str.trim().toUpperCase() !== 'N/A';

    return (
      <Document>
        <Page size="A4" style={{ ...styles.page, padding: 40, fontFamily: 'Tinos' }}>
          
          {/* Header - Sender Info */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 5 }}>
              {data.personal.fullName}
            </Text>
            {isValid(data.personal.jobTitle) && (
              <Text style={{ fontSize: 12, color: '#555', marginBottom: 5 }}>{data.personal.jobTitle}</Text>
            )}
            <View style={{ fontSize: 10, color: '#333', lineHeight: 1.5 }}>
              {isValid(data.personal.phone) && <Text>{data.personal.phone}</Text>}
              {isValid(data.personal.email) && <Text>{data.personal.email}</Text>}
              {isValid(data.personal.location) && <Text>{data.personal.location}</Text>}
              {isValid(data.personal.portfolio) && <Text>{data.personal.portfolio}</Text>}
            </View>
          </View>

          {/* Date */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 11 }}>{data.date}</Text>
          </View>

          {/* Recipient Info */}
          <View style={{ marginBottom: 20 }}>
            {isValid(data.recipient.name) && <Text style={{ fontSize: 11, fontWeight: 'bold' }}>{data.recipient.name}</Text>}
            {isValid(data.recipient.title) && <Text style={{ fontSize: 11 }}>{data.recipient.title}</Text>}
            {isValid(data.recipient.company) && <Text style={{ fontSize: 11, fontWeight: 'bold' }}>{data.recipient.company}</Text>}
            {isValid(data.recipient.address) && <Text style={{ fontSize: 11 }}>{data.recipient.address}</Text>}
          </View>

          {/* Salutation */}
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 11 }}>{data.salutation}</Text>
          </View>

          {/* Body Paragraphs */}
          <View style={{ fontSize: 11, lineHeight: 1.5, textAlign: 'justify', marginBottom: 15 }}>
            <Text style={{ marginBottom: 10 }}>{data.opening}</Text>
            
            {data.bodyParagraphs.map((para, i) => (
              <Text key={i} style={{ marginBottom: 10 }}>{para}</Text>
            ))}

            <Text>{data.closing}</Text>
          </View>

          {/* Sign Off */}
          <View style={{ fontSize: 11, marginTop: 20 }}>
            <Text style={{ marginBottom: 40 }}>{data.signOff}</Text>
            <Text style={{ fontWeight: 'bold' }}>{data.personal.fullName}</Text>
          </View>

        </Page>
      </Document>
    );
  }
}
