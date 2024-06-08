import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/loading';
import { UploadIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { cloudinary } from './cloudinary';

type FileUploadProps = {
  onUpload: (src: string) => void;
};

const FileUpload = ({ onUpload }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const handleUploadImageClick = () => {
    fileInputRef.current?.click();
  };

  const onFileUpload = async () => {
    try {
      setImageUploading(true);
      const file = fileInputRef.current?.files?.[0];
      const uploadedFile = await cloudinary.upload(file!);
      if (uploadedFile?.url) {
        onUpload(uploadedFile?.url);
      }
    } catch (error) {
      alert('Islem Basarisiz');
    }
    setImageUploading(false);
  };

  return (
    <>
      <Button
        variant="secondary"
        onClick={handleUploadImageClick}
        disabled={imageUploading}
      >
        {imageUploading ? (
          <Loading className="mr-2 size-4" />
        ) : (
          <UploadIcon className="mr-2" size={16} />
        )}{' '}
        Resim Yukle
      </Button>
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        accept="image/x-png,image/jpeg"
        onChange={onFileUpload}
      />
    </>
  );
};

export default FileUpload;
