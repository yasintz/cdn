import { PlusCircleIcon } from 'lucide-react';

type CreateInputProps = {
  onAdd: () => void;
};

const CreateInput = ({ onAdd }: CreateInputProps) => {
  return (
    <div className="flex items-center gap-2 my-2">
      <div className="border-b border-gray-300 flex-1" />
      <PlusCircleIcon
        size={16}
        className="text-gray-300 cursor-pointer"
        onClick={() => onAdd()}
      />
      <div className="border-b border-gray-300 flex-1" />
    </div>
  );
};

export default CreateInput;
