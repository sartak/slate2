import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUserDefinedComponentLabelAction, setUserDefinedComponentFieldMetadataAction, addFieldToUserDefinedComponentAction, setActiveSystemAction } from '../project/actions';
import { makeSelectComponent, makeSelectComponentField, selectEnabledSystems } from '../project/selectors';
import { newUserDefinedField } from '../ecs/components';
import { BuiltinTypes, zeroValueForType, editorForType, canonicalizeValue } from '../types';
import { ObjectList } from '../list-objects';
import { TextControlled } from '../field/text-controlled';

const InspectComponentField = ({ componentId, fieldId, userDefined }) => {
  const dispatch = useDispatch();
  const field = useSelector(makeSelectComponentField(componentId, fieldId));

  const { type, defaultValue } = field;

  const zeroValue = zeroValueForType(type);
  const types = Object.keys(BuiltinTypes);
  const Editor = editorForType(type);

  return (
    <div className="InspectSubobject">
      { userDefined ? (
        <InspectUserDefinedComponentFieldLabel componentId={componentId} fieldId={fieldId} />
      ) : (
        <div className="label">{field.id}</div>
      )}
      <ul>
        <li>
          <span className="label">type</span>
          <select
            value={type}
            readOnly={!userDefined}
            onChange={({ target }) => dispatch(setUserDefinedComponentFieldMetadataAction(componentId, fieldId, 'type', target.value))}
          >
            {types.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </li>
        <li>
          <span className="label">default</span>
          <Editor
            value={defaultValue}
            defaultValue={zeroValue}
            readOnly={!userDefined}
            onChange={(value) => {
              const canonicalized = canonicalizeValue(type, value, zeroValue);
              dispatch(setUserDefinedComponentFieldMetadataAction(componentId, fieldId, 'defaultValue', canonicalized));
            }}
          />
        </li>
      </ul>
    </div>
  );
};

export const InspectUserDefinedComponentLabel = ({ id }) => {
  const dispatch = useDispatch();
  const component = useSelector(
    makeSelectComponent(id),
    (prev, next) => prev.label === next.label,
  );

  const { label } = component;
  const setLabel = (label) => dispatch(setUserDefinedComponentLabelAction(id, label));

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

const InspectUserDefinedComponentFieldLabel = ({ componentId, fieldId }) => {
  const dispatch = useDispatch();
  const field = useSelector(
    makeSelectComponentField(componentId, fieldId),
    (prev, next) => prev.label === next.label,
  );

  const { label } = field;
  const setLabel = (label) => dispatch(setUserDefinedComponentFieldMetadataAction(componentId, fieldId, 'label', label));

  return (
    <div className="InspectLabel">
      <TextControlled
        value={label}
        defaultValue={`field${fieldId}`}
        onChange={setLabel}
      />
    </div>
  );
};

const AddFieldToComponent = ({ id }) => {
  const dispatch = useDispatch();

  const addField = () => dispatch(addFieldToUserDefinedComponentAction(id, newUserDefinedField()));

  return <button onClick={addField}>Add Field</button>;
};

const InspectComponentSystems = ({ systems }) => {
  const dispatch = useDispatch();

  return (
    <React.Fragment>
      <div className="label">Related Systems</div>
      <ObjectList
        objects={systems}
        onSelect={({ id }) => dispatch(setActiveSystemAction(id))}
      />
    </React.Fragment>
  );
};

export const InspectComponent = ({ id }) => {
  const component = useSelector(makeSelectComponent(id));
  const systems = useSelector(selectEnabledSystems).filter(({ requiredComponents }) => (
    requiredComponents.find((componentId) => componentId === id)
  ));

  const { userDefined } = component;

  return (
    <div className="InspectObject">
      { userDefined ? (
        <InspectUserDefinedComponentLabel id={id} />
      ) : (
        <div className="label">{component.label}</div>
      )}
      <ul>
        {component.fields.map(({ id: fieldId }) => (
          <li key={fieldId}>
            <InspectComponentField componentId={id} fieldId={fieldId} userDefined={userDefined} />
          </li>
        ))}
      </ul>
      <div className="controls">
        { userDefined && <AddFieldToComponent id={id} /> }
      </div>
      <div className="references">
        {systems.length ? (
          <InspectComponentSystems systems={systems} />
        ) : null}
      </div>
    </div>
  );
};
