import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { addComponentToEntityAction, setEntityLabelAction } from '../project/actions';
import { selectEnabledComponents, makeSelectComponent, makeSelectEntity } from '../project/selectors';
import { useSelectorLazy } from '../project/useSelectorLazy';
import { editorForType } from '../types';
import { useLiveEntityComponentValue } from '../preflight/useLiveEntityComponentValue';
import { TextControlled } from '../field/text-controlled';

const InspectEntityComponentValue = ({ entityId, component, field }) => {
  const fieldRef = useRef(null);

  const { id: componentId } = component;
  const { id: fieldId, label: fieldLabel, type, defaultValue } = field;

  const setComponentValue = useLiveEntityComponentValue((mode, value) => {
    fieldRef.current?.setValueUnlessFocused(value);
  }, entityId, componentId, fieldId);

  const Editor = editorForType(type);

  return (
    <li className="field">
      <span className="label">{fieldLabel ?? fieldId}</span>
      <Editor
        ref={fieldRef}
        defaultValue={defaultValue}
        onChange={setComponentValue}
      />
    </li>
  );
};

const InspectEntityComponent = React.memo(({ entityId, componentId }) => {
  const component = useSelector(makeSelectComponent(componentId));
  const { fields, label: componentLabel } = component;

  return (
    <div className="InspectSubobject">
      <div className="label">{componentLabel}</div>
      <ul>
        {fields.map((field) => (
          <InspectEntityComponentValue
            key={field.id}
            entityId={entityId}
            component={component}
            field={field}
          />
        ))}
      </ul>
    </div>
  );
});

const AddComponentToEntity = ({ id }) => {
  const dispatch = useDispatch();
  const [isAdding, setAdding] = useState(false);
  const enabledComponentsLazy = useSelectorLazy(selectEnabledComponents);
  const entityLazy = useSelectorLazy(makeSelectEntity(id));

  useEffect(() => {
    setAdding(false);
  }, [id]);

  if (!isAdding) {
    return (
      <button onClick={() => setAdding(true)}>Add Component</button>
    );
  }

  const enabledComponents = enabledComponentsLazy();
  const entity = entityLazy();

  const addComponent = (component) => {
    dispatch(addComponentToEntityAction(id, component.makeEntityComponent()));
    setAdding(false);
  };

  return (
    <ul>
      {enabledComponents.map((component) => {
        if (entity.componentConfig[component.id]) {
          return null;
        }

        return (
          <li key={component.id}>
            <button onClick={() => addComponent(component)}>Add {component.label}</button>
          </li>
        );
      })}
    </ul>
  );
};

export const InspectEntityLabel = ({ id }) => {
  const dispatch = useDispatch();
  const entity = useSelector(
    makeSelectEntity(id),
    (prev, next) => prev.label === next.label,
  );

  const { label } = entity;
  const setLabel = (label) => dispatch(setEntityLabelAction(id, label));

  return (
    <div className="InspectLabel">
      <TextControlled
        value={label}
        defaultValue={`Entity${id}`}
        onChange={setLabel}
      />
    </div>
  );
};

export const InspectEntity = ({ id }) => {
  const entity = useSelector(
    makeSelectEntity(id),
    (prev, next) => shallowEqual(
      Object.keys(prev.componentConfig),
      Object.keys(next.componentConfig),
    ),
  );

  return (
    <div className="InspectObject">
      <InspectEntityLabel id={id} />
      <ul>
        {entity.componentIds.map((componentId) => (
          <li key={componentId}>
            <InspectEntityComponent
              entityId={id}
              componentId={componentId}
            />
          </li>
        ))}
      </ul>
      <div className="controls">
        <AddComponentToEntity id={id} />
      </div>
    </div>
  );
};
