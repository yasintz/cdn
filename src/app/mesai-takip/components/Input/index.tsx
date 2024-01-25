type InputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
};

export const Input = ({
  label,
  value,
  onChange,
  placeholder,
  type,
}: InputProps) => {
  return (
    <div className="input">
      <span>{label}</span>
      <input
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
      />
    </div>
  );
};
