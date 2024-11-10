import _ from 'lodash';
import { ExpandIcon, TrashIcon } from 'lucide-react';
import React from 'react';

type JsonFormProps = {
  value: any;
  onChange: (value: any) => void;
  path: string | undefined;
  setPath: (path: string) => void;
};

const PrimitiveForm = ({
  value,
  onChange,
}: {
  value: any;
  onChange: (value: any) => void;
}) => {
  const isDate =
    (typeof value === 'string' &&
      new Date(value).toString() !== 'Invalid Date') ||
    (typeof value === 'number' &&
      value.toString().length === 13 &&
      new Date(value).toString() !== 'Invalid Date');

  if (isDate) {
    return (
      <input
        type="datetime-local"
        value={new Date(value).toISOString().slice(0, 16)}
        onChange={(e) => onChange(new Date(e.target.value).getTime())}
      />
    );
  }

  if (typeof value === 'boolean') {
    return (
      <select
        value={`${value}`}
        onChange={(e) => onChange(e.target.value === 'true')}
      >
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    );
  }

  return (
    <input
      type={typeof value === 'number' ? 'number' : 'text'}
      value={value}
      onChange={(e) =>
        onChange(
          typeof value === 'number'
            ? parseFloat(e.target.value)
            : e.target.value
        )
      }
    />
  );
};

const ListContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
          <th>Type</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
};

const Cell = ({
  value,
  onClick,
  onValueChange,
}: {
  value: any;
  onClick?: () => void;
  onValueChange: (value: any) => void;
}) => {
  const isPrimitive = typeof value !== 'object' || value === null;
  return isPrimitive ? (
    <PrimitiveForm value={value} onChange={onValueChange} />
  ) : (
    <button
      className="border rounded-sm px-1 flex gap-2 items-center"
      onClick={onClick}
    >
      Open ({Array.isArray(value) ? 'array' : typeof value})
      <ExpandIcon className="size-3" />
    </button>
  );
};

const Row = ({
  name,
  value,
  onClick,
  onValueChange,
  onRemove,
}: {
  name: string | number;
  value: any;
  onClick?: () => void;
  onValueChange: (value: any) => void;
  onRemove?: () => void;
}) => {
  return (
    <tr>
      <td>{name}</td>
      <td>
        <Cell value={value} onClick={onClick} onValueChange={onValueChange} />
      </td>
      <td>
        <select value={Array.isArray(value) ? 'array' : typeof value}>
          <option>string</option>
          <option>number</option>
          <option>boolean</option>
          <option>object</option>
          <option>array</option>
        </select>
      </td>
      <td>
        <div className="flex gap-2 items-center">
          <TrashIcon
            onClick={onRemove}
            className="size-5 cursor-pointer hover:bg-gray-200 px-1 rounded-sm"
          />
        </div>
      </td>
    </tr>
  );
};

const JsonForm = ({ value, onChange, setPath, path }: JsonFormProps) => {
  const openClick = (index: string | number) => {
    setPath(path ? `${path}.${index}` : `${index}`);
  };

  const onValueChange = (subPath: string | number, subValue: any) => {
    const newPath = path ? `${path}.${subPath}` : subPath;
    const newValue = _.set(_.cloneDeep(value), newPath, subValue);

    onChange(newValue);
  };

  const onValueRemove = (subPath: string | number) => {
    const newValue = _.cloneDeep(value);

    if (Array.isArray(newValue)) {
      newValue.splice(subPath as number, 1);
    } else {
      delete newValue[subPath];
    }

    onChange(newValue);
  };

  if (Array.isArray(value)) {
    const allKeys = _.uniq(
      _.flatten(
        value.map((item) =>
          typeof item === 'object' && item !== null ? Object.keys(item) : []
        )
      )
    );

    if (allKeys.length === 0) {
      return (
        <table>
          <tbody>
            {value.map((item, index) => (
              <tr key={index}>
                <td>
                  <Cell
                    value={item}
                    onValueChange={(newValue: any) =>
                      onValueChange(index, newValue)
                    }
                    onClick={() => openClick(index)}
                  />
                </td>
              </tr>
            ))}
            <tr>
              <td>
                <button
                  className="w-full"
                  onClick={() => {
                    const newValue = [...value, null];
                    onChange(newValue);
                  }}
                >
                  Add
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      );
    }

    return (
      <table>
        <tr>
          {allKeys.map((key) => (
            <th key={key}>
              {key}(
              <select
                value={
                  Array.isArray(value[0]?.[key]) ? 'array' : typeof value[0]
                }
              >
                <option>string</option>
                <option>number</option>
                <option>boolean</option>
                <option>object</option>
                <option>array</option>
              </select>
              )
            </th>
          ))}
        </tr>

        {value.map((item, index) => (
          <tr key={index}>
            {allKeys.map((key) => (
              <td key={key}>
                <Cell
                  value={item?.[key] || ''}
                  onValueChange={(newValue: any) =>
                    onValueChange(index, { ...(item || {}), [key]: newValue })
                  }
                  onClick={() => openClick(`${index}.${key}`)}
                />
              </td>
            ))}
          </tr>
        ))}
        <tr>
          <td colSpan={allKeys.length}>
            <button
              className="w-full"
              onClick={() => {
                const newValue = [...value, null];
                onChange(newValue);
              }}
            >
              Add
            </button>
          </td>
        </tr>
      </table>
    );
  }

  const isObject = typeof value === 'object' && value !== null;

  if (isObject) {
    return (
      <ListContainer>
        {Object.keys(value).map((key) => (
          <Row
            value={value[key]}
            name={key}
            key={key}
            onClick={() => openClick(key)}
            onValueChange={(newValue) => onValueChange(key, newValue)}
            onRemove={() => onValueRemove(key)}
          />
        ))}
      </ListContainer>
    );
  }

  return <PrimitiveForm value={value} onChange={onChange} />;
};

export default JsonForm;
