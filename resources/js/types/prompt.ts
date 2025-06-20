export interface PromptCategory {
  id: number;
  name: string;
  prompts_count?: number;
}

export interface PromptSubCategory {
  id: number;
  name: string;
  category_id?: number;
  category?: PromptCategory;
  prompts_count?: number;
}

export interface Prompt {
  id: number;
  name: string;
  category_id?: number;
  subcategory_id?: number;
  category?: PromptCategory;
  subcategory?: PromptSubCategory;
  prompt: string;
  active?: boolean;
  example_image_url?: string;
}
