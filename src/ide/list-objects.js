import React from 'react';
import './list-objects.less';

export const ObjectList = ({ objects, activeId, onSelect, onAdd, addLabel }) => {
  return (
    <div className="ObjectList">
      <ul>
        {objects.map((object) => {
          const { id, label } = object;
          return (
            <li
              key={id}
              className={activeId === id ? "active" : null}
              onClick={() => onSelect(object)}
            >{label}</li>
          );
        })}
      </ul>
      {onAdd && (
        <div className="controls">
          <button onClick={onAdd}>{addLabel}</button>
        </div>
      )}
    </div>
  );
};
