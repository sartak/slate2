import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedTabLabelAction } from './project/actions';
import { makeSelectTabLabel } from './project/selectors';
import './tabs.less';

export const Tabs = ({ id, tabs }) => {
  const dispatch = useDispatch();
  const selectedTabLabel = useSelector(makeSelectTabLabel(id));
  const storeIndex = tabs.findIndex(([label]) => label === selectedTabLabel);
  const selectedIndex = storeIndex === -1 ? 0 : storeIndex;

  const SelectedComponent = tabs[selectedIndex][1];

  return (
    <div className="tabs">
      <ul className="controls">
        {tabs.map(([label], i) => (
          <li
            key={i}
            className={`tab${i === selectedIndex ? " selected" : ""}`}
            onClick={() => dispatch(setSelectedTabLabelAction(id, label))}
          >
            <span className="label">
              {label}
            </span>
          </li>
        ))}
      </ul>
      <div className="content">
        <SelectedComponent />
      </div>
    </div>
  );
};
