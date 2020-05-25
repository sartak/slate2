import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSelectorLazy } from '../project/useSelectorLazy';
import { selectCommandsList, makeSelectCommand } from '../project/selectors';
import { addCommandAction, removeCommandAction, addKeyForCommandAction, removeKeyForCommandAction, setLabelForCommandAction } from '../project/actions';
import { TextControlled } from '../field/text-controlled';

const InspectCommandLabel = ({ id }) => {
  const dispatch = useDispatch();
  const command = useSelector(
    makeSelectCommand(id),
    (prev, next) => prev.label === next.label,
  );

  const { label } = command;
  const setLabel = (label) => dispatch(setLabelForCommandAction(id, label));

  return (
    <div className="InspectLabel">
      <TextControlled
        value={label}
        defaultValue={id}
        onChange={setLabel}
      />
    </div>
  );
};

const InspectCommand = ({ id }) => {
  const dispatch = useDispatch();
  const command = useSelector(
    makeSelectCommand(id),
    (prev, next) => prev.label === next.label,
  );

  const { keys } = command;

  return (
    <div className="InspectSubobject">
      <InspectCommandLabel id={id} />
      <ul className="keys">
        {keys.map((key) => (
          <li key={key}>
            {key}
            <button onClick={() => dispatch(removeKeyForCommandAction(id, key))}>Remove</button>
          </li>
        ))}
      </ul>
      <div className="controls">
        <ul>
          <li><AddKeyToCommand id={id} /></li>
          <li><button onClick={() => dispatch(removeCommandAction(id))}>Remove Command</button></li>
        </ul>
      </div>
    </div>
  );
};

const AddKeyToCommand = ({ id }) => {
  const dispatch = useDispatch();
  const [isAdding, setAdding] = useState(false);
  const commandLazy = useSelectorLazy(makeSelectCommand(id));

  useEffect(() => {
    setAdding(false);
  }, [id]);

  const inputRef = useCallback((input) => input?.focus(), []);

  if (!isAdding) {
    return (
      <button onClick={() => setAdding(true)}>Add Key</button>
    );
  }

  const command = commandLazy();

  const addKey = (key) => {
    if (command.keys.indexOf(key) === -1) {
      dispatch(addKeyForCommandAction(id, key));
    }

    setAdding(false);
  };

  return (
    <input
      type="text"
      ref={inputRef}
      className="key-entry"
      placeholder="Type a key, or click outside to cancel"
      defaultValue=""
      onKeyDown={({ key }) => addKey(key)}
      onBlur={() => setAdding(false)}
    />
  );
};

export const InspectCommands = () => {
  const dispatch = useDispatch();
  const commands = useSelector(selectCommandsList);

  return (
    <div className="InspectSubobject">
      <div className="label">Commands</div>
      <ul>
        {commands.map(({ id }) => (
          <li key={id}><InspectCommand id={id} /></li>
        ))}
      </ul>
      <div className="controls">
        <button onClick={() => dispatch(addCommandAction())}>Add Command</button>
      </div>
    </div>
  );
};
