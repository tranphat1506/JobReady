// @ts-nocheck
import { StyleSheet, Font } from '@react-pdf/renderer';
import * as path from 'path';

const isBrowser = typeof window !== 'undefined';

if (isBrowser) {
  Font.register({
    family: 'Lora',
    fonts: [
      { src: 'https://fonts.gstatic.com/s/lora/v37/0QI6MX1D_JOuGQbT0gvTJPa787weuyJG.ttf' },
      { src: 'https://fonts.gstatic.com/s/lora/v37/0QI6MX1D_JOuGQbT0gvTJPa787z5vCJG.ttf', fontWeight: 'bold' },
      { src: 'https://fonts.gstatic.com/s/lora/v37/0QI8MX1D_JOuMw_hLdO6T2wV9KnW-MoFkqg.ttf', fontStyle: 'italic' },
      { src: 'https://fonts.gstatic.com/s/lora/v37/0QI8MX1D_JOuMw_hLdO6T2wV9KnW-C0Ckqg.ttf', fontWeight: 'bold', fontStyle: 'italic' }
    ]
  });
} else {
  // Use CDN for Node as well to simplify font management and guarantee metrics consistency
  Font.register({
    family: 'Lora',
    fonts: [
      { src: 'https://fonts.gstatic.com/s/lora/v37/0QI6MX1D_JOuGQbT0gvTJPa787weuyJG.ttf' },
      { src: 'https://fonts.gstatic.com/s/lora/v37/0QI6MX1D_JOuGQbT0gvTJPa787z5vCJG.ttf', fontWeight: 'bold' },
      { src: 'https://fonts.gstatic.com/s/lora/v37/0QI8MX1D_JOuMw_hLdO6T2wV9KnW-MoFkqg.ttf', fontStyle: 'italic' },
      { src: 'https://fonts.gstatic.com/s/lora/v37/0QI8MX1D_JOuMw_hLdO6T2wV9KnW-C0Ckqg.ttf', fontWeight: 'bold', fontStyle: 'italic' }
    ]
  });
}

export const styles = StyleSheet.create({
  page: {
    padding: '0.5in',
    fontFamily: 'Lora',
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
  sectionTitleContainer: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    marginBottom: 8,
    marginTop: 10,
  },
  sectionTitleText: {
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
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
