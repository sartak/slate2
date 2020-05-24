import React, { useCallback, useEffect, useRef } from 'react';
import { useConsole } from './context';
import { ConsoleInput } from './input';
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import './activity.less';

const renderArgs = (args) => {
  return args.map((arg) => {
    if (arg === null) {
      return "null";
    } else if (arg === undefined) {
      return "undefined";
    } else if (typeof arg === "object") {
      try {
        return JSON.stringify(arg, null, 2);
      } catch (e) {
        return arg;
      }
    }

    return arg;
  }).join(' ');
};

export const ConsoleActivity = () => {
  const manager = useConsole();
  const listRef = useRef(null);
  const scrollTimeout = useRef(null);
  const inputRef = useRef(null);

  const setListRef = useCallback((list) => {
    listRef.current = list;
    list?.querySelectorAll('li[data-lang=javascript').forEach((li) => {
      monaco.editor.colorizeElement(li, { theme: 'vs-dark' });
    });
  }, []);

  useEffect(() => {
    const unsubscribe = manager.subscribe((level, args) => {
      if (listRef.current) {
        const li = document.createElement('li');
        li.innerText = renderArgs(args);
        li.classList.add(level);
        if (level === 's2_eval_input') {
          li.dataset.lang = 'javascript';
          monaco.editor.colorizeElement(li, { theme: 'vs-dark' });
        }
        listRef.current.appendChild(li);
        inputRef.current?.scrollIntoView(false);
      }
    });
    return unsubscribe;
  }, [manager]);

  useEffect(() => {
    inputRef.current?.scrollIntoView(false);
  }, [manager.lines.length]);

  return (
    <div className="ConsoleActivity">
      <ul ref={setListRef} key={Date.now()}>
        {manager.lines.map(([level, args], i) => (
          <li
            key={i}
            className={level}
            data-lang={level === 's2_eval_input' ? 'javascript' : null}
          >
            {renderArgs(args)}
          </li>
        ))}
      </ul>
      <div ref={inputRef} className="input">
        <div className="sigil">&gt;</div>
        <div className="field"><ConsoleInput /></div>
      </div>
    </div>
  );
};
