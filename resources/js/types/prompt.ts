export interface Prompt {
  id: number;
  name: string;
  category: string;
  prompt: string;
  active?: boolean;
  example_image_url?: string;
}
