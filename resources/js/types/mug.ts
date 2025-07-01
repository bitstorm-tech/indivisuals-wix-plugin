export interface MugCategory {
  id: number;
  name: string;
}

export interface MugSubCategory {
  id: number;
  name: string;
  category_id: number;
}

export interface Mug {
  id: number;
  name: string;
  description_long?: string;
  description_short?: string;
  height_mm?: number;
  diameter_mm?: number;
  print_template_width_mm?: number;
  print_template_height_mm?: number;
  filling_quantity?: string;
  dishwasher_safe: boolean;
  price: number;
  category_id?: number;
  subcategory_id?: number;
  image_path?: string;
  image_url?: string;
  active: boolean;
  category?: MugCategory;
  subcategory?: MugSubCategory;
  created_at: string;
  updated_at: string;
}
