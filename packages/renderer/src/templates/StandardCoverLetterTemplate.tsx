// @ts-nocheck
import React from 'react';
import { Document, Page, Text, View, Image } from '@react-pdf/renderer';
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
        <Page size="A4" style={{ ...styles.page, padding: 40 }}>

          {/* Header - Sender Info */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              {data.personal.avatar && data.personal.showAvatar !== false ? (
                <Image
                  src={data.personal.avatar}
                  style={{ width: 113, height: 170, objectFit: 'cover', borderRadius: 2 }}
                />
              ) : null}
              <View style={{ flex: 1 }}>
                <View style={{ minHeight: 30, justifyContent: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 5 }}>
                    {data.personal.fullName}
                  </Text>
                </View>
                {isValid(data.personal.jobTitle) ? (
                  <View style={{ minHeight: 18, marginBottom: 5, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 12, color: '#555' }}>{data.personal.jobTitle}</Text>
                  </View>
                ) : null}
                <View style={{ fontSize: 10, color: '#333', lineHeight: 1.5 }}>
                  {isValid(data.personal.phone) ? <Text>{data.personal.phone}</Text> : null}
                  {isValid(data.personal.email) ? <Text>{data.personal.email}</Text> : null}
                  {isValid(data.personal.location) ? <Text>{data.personal.location}</Text> : null}
                  {isValid(data.personal.portfolio) ? <Text>{data.personal.portfolio}</Text> : null}
                </View>
              </View>
            </View>
          </View>

          {/* Date */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 11 }}>{data.date || ''}</Text>
          </View>

          {/* Recipient Info */}
          <View style={{ marginBottom: 20 }}>
            {isValid(data.recipient.name) ? <Text style={{ fontSize: 11, fontWeight: 'bold' }}>{data.recipient.name}</Text> : null}
            {isValid(data.recipient.title) ? <Text style={{ fontSize: 11 }}>{data.recipient.title}</Text> : null}
            {isValid(data.recipient.company) ? <Text style={{ fontSize: 11, fontWeight: 'bold' }}>{data.recipient.company}</Text> : null}
            {isValid(data.recipient.address) ? <Text style={{ fontSize: 11 }}>{data.recipient.address}</Text> : null}
          </View>

          {/* Salutation */}
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 11 }}>{data.salutation || ''}</Text>
          </View>

          {/* Body Paragraphs */}
          <View style={{ fontSize: 11, lineHeight: 1.5, textAlign: 'justify', marginBottom: 15 }}>
            <Text style={{ marginBottom: 10 }}>{data.opening || ''}</Text>

            {(data.bodyParagraphs || []).map((para, i) => (
              <Text key={i} style={{ marginBottom: 10 }}>{para}</Text>
            ))}

            <Text>{data.closing || ''}</Text>
          </View>

          {/* Sign Off */}
          <View style={{ fontSize: 11, marginTop: 20 }}>
            {((data as any).signOff || '').split('\n').map((line: string, i: number) => (
              <Text key={i} style={{ marginBottom: i === 0 ? 40 : 4 }}>{line}</Text>
            ))}
          </View>

        </Page>
      </Document>
    );
  }
}
