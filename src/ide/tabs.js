import React, { useState } from 'react';
import './tabs.less';

export const Tabs = ({ tabs }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const SelectedComponent = tabs[selectedIndex][1];

  return (
    <div className="tabs">
      <ul className="controls">
        {tabs.map(([label], i) => (
          <li
            key={i}
            className={`tab${i === selectedIndex ? " selected" : ""}`}
            onClick={() => setSelectedIndex(i)}
          >
            {label}
          </li>
        ))}
      </ul>
      <div className="content">
        <SelectedComponent />
      </div>
    </div>
  );
};
