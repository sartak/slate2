import React, { useCallback, useEffect, useRef } from 'react';
import { useConsole } from './context';
import { ConsoleInput } from './input';
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import './activity.less';

const renderArg = (arg) => {
  if (arg === null) {
    return ["javascript", "null"];
  } else if (arg === undefined) {
    return ["javascript", "undefined"];
  } else if (typeof arg === "object") {
    try {
      return ["javascript", JSON.stringify(arg, null, 2)];
    } catch (e) {
      return [null, arg];
    }
  }

  return [null, arg];
};

export const ConsoleActivity = () => {
  const manager = useConsole();
  const listRef = useRef(null);
  const scrollTimeout = useRef(null);
  const inputRef = useRef(null);

  const setListRef = useCallback((list) => {
    listRef.current = list;
    list?.querySelectorAll('li span[data-lang=javascript').forEach((span) => {
      monaco.editor.colorizeElement(span, { theme: 'vs-dark' });
    });
  }, []);

  useEffect(() => {
    const unsubscribe = manager.subscribe((level, args) => {
      if (listRef.current) {
        const li = document.createElement('li');
        li.classList.add(level);

        args.forEach((arg) => {
          let [lang, display] = renderArg(arg);
          if (level === 's2_eval_input') {
            lang = 'javascript';
          }

          const span = document.createElement('span');

          if (lang) {
            span.dataset.lang = lang;
          }

          const textNode = document.createTextNode(display);
          span.appendChild(textNode);
          li.appendChild(span);

          if (lang) {
            monaco.editor.colorizeElement(span, { theme: 'vs-dark' });
          }
        });

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
          <li key={i} className={level}>
            {args.map((arg, i) => {
              let [lang, display] = renderArg(arg);
              if (level === 's2_eval_input') {
                lang = 'javascript';
              }
              return <span key={i} data-lang={lang}>{display}</span>;
            })}
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
