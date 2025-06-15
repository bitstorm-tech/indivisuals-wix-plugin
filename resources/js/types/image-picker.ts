export interface UploadResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  generated_image_url?: string;
}
