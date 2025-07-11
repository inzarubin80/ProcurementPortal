import React from 'react';
import MonacoEditor from '@monaco-editor/react';

const CustomMonacoEditor: React.FC<React.ComponentProps<typeof MonacoEditor>> = (props) => {
  return <MonacoEditor {...props} />;
};

export default CustomMonacoEditor; 