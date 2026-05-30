import { StyleSheet, Font } from '@react-pdf/renderer';
import * as path from 'path';

// Register fonts
const fontPath = path.resolve(__dirname, '../../../assets/fonts/Tinos');
Font.register({
  family: 'Tinos',
  fonts: [
    { src: path.join(fontPath, 'Tinos-Regular.ttf') },
    { src: path.join(fontPath, 'Tinos-Bold.ttf'), fontWeight: 'bold' },
    { src: path.join(fontPath, 'Tinos-Italic.ttf'), fontStyle: 'italic' },
    { src: path.join(fontPath, 'Tinos-BoldItalic.ttf'), fontWeight: 'bold', fontStyle: 'italic' }
  ]
});

export const styles = StyleSheet.create({
  page: {
    padding: '0.5in',
    fontFamily: 'Tinos',
    fontSize: 10,
    lineHeight: 1.2,
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
