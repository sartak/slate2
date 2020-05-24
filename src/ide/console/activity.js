import React, { useEffect, useRef } from 'react';
import { useConsole } from './context';
import { ConsoleInput } from './input';
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

  useEffect(() => {
    const unsubscribe = manager.subscribe((level, args) => {
      if (listRef.current) {
        const li = document.createElement('li');
        li.innerText = renderArgs(args);
        li.classList.add(level);
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
      <ul ref={listRef} key={Date.now()}>
        {manager.lines.map(([level, args], i) => (
          <li key={i} className={level}>
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
