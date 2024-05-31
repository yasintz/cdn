import axios, { AxiosRequestConfig } from 'axios';

enum UploadPresets {
  Chat = 'chat-uploads',
}

const CLOUD_NAME = 'yasintz';
export const CLOUDINARY_RES_IMAGE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;
export const CLOUDINARY_RES_VIDEO_URL = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload`;
const CLOUDINARY_FETCH_IMAGE_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
const CLOUDINARY_FETCH_VIDEO_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`;

export type CloudinaryFile = {
  access_mode?: string;
  asset_id?: string;
  format: string;
  height: number;
  public_id: string;
  width: number;
  url?: string;
  secure_url?: string;
  resource_type: string;
  original_filename: string;
  bytes: number;
  created_at?: string;
  etag?: string;
  moderation?: {
    kind: string;
    response: {
      human_loop_activation_output: any;
      moderation_labels: {
        name: string;
        confidence: number;
        parent_name: string;
      }[];
      moderation_model_version: string;
    };
    status: string;
    updated_at: string;
  }[];
  placeholder?: boolean;
  signature?: string;
  tags?: string[];
  type?: string;
  version?: number;
  version_id?: string;
  error?: {
    message: string;
  };
};

const upload = async (
  file: File,
  uploadPreset: UploadPresets = UploadPresets.Chat,
  onUploadProgress?: AxiosRequestConfig['onUploadProgress']
): Promise<CloudinaryFile | null | undefined> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  const isVideo = file.type.includes('video/');
  const fetchUrl = isVideo
    ? CLOUDINARY_FETCH_VIDEO_URL
    : CLOUDINARY_FETCH_IMAGE_URL;
  const { data } = await axios.request<CloudinaryFile>({
    url: fetchUrl,
    method: 'POST',
    data: formData,
    onUploadProgress,
  });
  return data;
};

export const cloudinary = { upload, UploadPresets };
