const React = require('react');
const { View, Text, Document, Page } = require('@react-pdf/renderer');

const el = React.createElement(View, { style: { color: 'red' } }, 
  React.createElement(Text, null, "Hello")
);

console.log(el.type);
console.log(typeof el.type);
