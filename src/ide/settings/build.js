import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { defaultIndexHtml, defaultPostbuild, defaultWebpackConfig } from '../assemble';
import { makeSelectBuildOption } from '../project/selectors';
import { setBuildOptionAction } from '../project/actions';
import { useFloatingEditor } from '../code-editor';
import { useClosePanelFloating } from '../panel';

const languageForName = {
  indexHtml: 'html',
  postbuild: 'shell',
  webpackConfig: 'javascript',
};

export const EditConfigFile = ({ title, name, defaultValue }) => {
  const dispatch = useDispatch();
  const value = useSelector(makeSelectBuildOption(name));
  const openEditor = useFloatingEditor();
  const closePanel = useClosePanelFloating();

  const setCode = (code) => {
    dispatch(setBuildOptionAction(name, code));
  };

  const edit = () => {
    const options = {
      language: languageForName[name] || "javascript",
      onChange: (value) => setCode(value),
    };

    const code = value ?? defaultValue;

    if (closePanel) {
      closePanel();
    }

    openEditor(code, `build.${name}`, options);
  };

  return (
    <React.Fragment>
      <tt>{title}</tt>
      <button onClick={edit}>{value ? "Edit Code" : "Customize"}</button>
    </React.Fragment>
  );
};

export const BuildSettings = () => {
  return (
    <ul className="BuildSettings">
      <li><EditConfigFile title="index.html" name="indexHtml" defaultValue={defaultIndexHtml} /></li>
      <li><EditConfigFile title="postbuild.sh" name="postbuild" defaultValue={defaultPostbuild} /></li>
      <li><EditConfigFile title="webpack.config.js" name="webpackConfig" defaultValue={defaultWebpackConfig} /></li>
    </ul>
  );
};
