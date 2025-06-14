export interface UploadResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  generated_image_url?: string;
}

export interface Prompt {
  id: number;
  name: string;
  category: string;
  prompt: string;
  active: boolean;
  has_example_image?: boolean;
  example_image_mime_type?: string;
}
