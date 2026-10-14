export interface Author {
  id: string;
  user_id?: string | null;
  name: string;
  slug: string;
  bio: string | null;
  avatar_url: string | null;
  website_url: string | null;
  twitter_handle: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  role: 'contributor' | 'editor' | 'admin';
  is_active: boolean;
  is_default: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  show_in_nav: boolean;
  sort_order: number;
  article_count: number;
  home_page_featured: boolean;
  created_at: string;
}

export interface Article {
  id: string;
  headline: string;
  slug: string;
  content_markdown: string | null;
  content_html?: string | null;
  excerpt: string | null;
  featured_image: string | null;
  featured_image_alt: string | null;
  author_id: string | null;
  category_id: string | null;
  tags: string[];
  word_count: number | null;
  reading_time_minutes: number | null;
  seo_title: string | null;
  seo_description: string | null;
  status: 'draft' | 'published' | 'archived' | 'scheduled';
  published_at: string | null;
  scheduled_for: string | null;
  created_at: string;
  updated_at: string;
  authors?: Author | null;
  categories?: Pick<Category, 'id' | 'name' | 'slug'> | null;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  site_description: string;
  logo_url: string | null;
  favicon_url: string | null;
  layout_mode: 'standalone' | 'embedded' | 'custom';
  show_header: boolean;
  show_footer: boolean;
  show_blog_title: boolean;
  blog_page_heading: string | null;
  show_featured_categories: boolean;
  default_author_id: string | null;
  posts_per_page: number;
  show_reading_time: boolean;
  show_table_of_contents: boolean;
  show_related_articles: boolean;
  show_author_card: boolean;
  inline_cta_enabled: boolean;
  inline_cta_heading: string | null;
  inline_cta_subheading: string | null;
  inline_cta_email_placeholder: string | null;
  inline_cta_button_text: string | null;
  inline_cta_success_redirect_url: string | null;
  inline_cta_list_id: string | null;
  sidebar_cta_enabled: boolean;
  sidebar_cta_title: string | null;
  sidebar_cta_description: string | null;
  sidebar_cta_button_text: string | null;
  sidebar_cta_button_url: string | null;
  sidebar_cta_image_url: string | null;
  newsletter_enabled: boolean;
  newsletter_provider: string | null;
  newsletter_list_id: string | null;
  newsletter_success_message: string;
  newsletter_success_redirect_url: string | null;
  newsletter_embed_url: string | null;
  site_title_template: string;
  default_og_image: string | null;
  google_analytics_id: string | null;
  social_twitter: string | null;
  social_linkedin: string | null;
  social_github: string | null;
  social_youtube: string | null;
  social_website: string | null;
  image_storage_provider: 'local' | 'supabase';
  supabase_storage_bucket: string;
  scheduled_publishing_enabled: boolean;
  writebolt_ads_site_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface NavItem {
  id: string;
  label: string;
  url: string;
  open_in_new_tab: boolean;
  display_order: number;
  is_visible: boolean;
  icon: string | null;
  created_at: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  id: '',
  site_name: 'My Blog',
  site_description:
    'A short tagline for your site. Used in the header, default meta description, and social previews.',
  logo_url: null,
  favicon_url: null,
  layout_mode: 'standalone',
  show_header: true,
  show_footer: true,
  show_blog_title: true,
  blog_page_heading: null,
  show_featured_categories: false,
  default_author_id: null,
  posts_per_page: 10,
  show_reading_time: true,
  show_table_of_contents: true,
  show_related_articles: true,
  show_author_card: true,
  inline_cta_enabled: false,
  inline_cta_heading: null,
  inline_cta_subheading: null,
  inline_cta_email_placeholder: 'Enter your email',
  inline_cta_button_text: null,
  inline_cta_success_redirect_url: null,
  inline_cta_list_id: null,
  sidebar_cta_enabled: false,
  sidebar_cta_title: null,
  sidebar_cta_description: null,
  sidebar_cta_button_text: null,
  sidebar_cta_button_url: null,
  sidebar_cta_image_url: null,
  newsletter_enabled: false,
  newsletter_provider: null,
  newsletter_list_id: null,
  newsletter_success_message: 'Thanks for subscribing!',
  newsletter_success_redirect_url: null,
  newsletter_embed_url: null,
  site_title_template: '{title} | {site_name}',
  default_og_image: null,
  google_analytics_id: null,
  social_twitter: null,
  social_linkedin: null,
  social_github: null,
  social_youtube: null,
  social_website: null,
  image_storage_provider: 'local',
  supabase_storage_bucket: 'blog-images',
  scheduled_publishing_enabled: true,
  writebolt_ads_site_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
