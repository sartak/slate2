import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CodeEditor } from './CodeEditor';

export const ProjectEditor = () => {
  const dispatch = useDispatch();
  const project = useSelector(project => project);
  const code = useSelector(project => project.code);

  return (
    <div className="ProjectEditor" style={{padding: 20}}>
      <CodeEditor
        width="400"
        height="300"
        language="javascript"
        value={code}
        onChange={(code) => dispatch({type: 'change-code', code})}
      />
    </div>
  );
};
