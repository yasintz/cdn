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
          <th>Index/Key</th>
          <th>Value</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
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
  const isPrimitive = typeof value !== 'object' || value === null;
  return (
    <tr>
      <td>{name}</td>
      <td>
        {isPrimitive ? (
          <PrimitiveForm value={value} onChange={onValueChange} />
        ) : (
          <button
            className="border rounded-sm px-1 flex gap-2 items-center"
            onClick={onClick}
          >
            Open
            <ExpandIcon className="size-3" />
          </button>
        )}
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
    return (
      <ListContainer>
        {value.map((item, index) => (
          <Row
            value={item}
            name={index}
            key={index}
            onClick={() => openClick(index)}
            onValueChange={(newValue) => onValueChange(index, newValue)}
            onRemove={() => onValueRemove(index)}
          />
        ))}

        <tr>
          <td colSpan={3}>
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
      </ListContainer>
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
