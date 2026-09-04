export interface Author {
  id: string;
  user_id: string | null;
  name: string;
  slug: string;
  bio: string | null;
  avatar_url: string | null;
  website_url: string | null;
  twitter_handle: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  role: "contributor" | "editor" | "admin";
  is_active: boolean;
  created_at: string;
}

export interface Article {
  id: string;
  author_id: string | null;
  slug: string;
  headline: string;
  excerpt: string | null;
  content_markdown: string | null;
  content_html: string | null;
  featured_image: string | null;
  featured_image_alt: string | null;
  category: string | null;
  tags: string[];
  word_count: number | null;
  reading_time_minutes: number | null;
  seo_title: string | null;
  seo_description: string | null;
  status: "draft" | "published" | "archived" | "scheduled";
  published_at: string | null;
  scheduled_date: string | null;
  created_at: string;
  updated_at: string;
  author?: Author;
}

export interface BlogSettings {
  id: string;
  blog_name: string;
  /** Short tagline: header subtitle, default meta description, and social cards when no per-page description exists */
  blog_description: string;
  logo_url: string | null;
  favicon_url: string | null;
  layout_mode: "standalone" | "embedded" | "custom";
  show_header: boolean;
  show_footer: boolean;
  show_blog_title: boolean;
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
  /** Optional audience override; falls back to newsletter_list_id when null */
  inline_cta_list_id: string | null;
  sidebar_cta_enabled: boolean;
  sidebar_cta_title: string | null;
  sidebar_cta_description: string | null;
  sidebar_cta_button_text: string | null;
  sidebar_cta_button_url: string | null;
  sidebar_cta_image_url: string | null;
  newsletter_enabled: boolean;
  newsletter_provider: string | null;
  /** Audience / list / campaign ID for API-based providers */
  newsletter_list_id: string | null;
  newsletter_success_message: string;
  newsletter_success_redirect_url: string | null;
  /** Optional: hosted form POST URL (e.g. Mailchimp embed) when not using the API */
  newsletter_embed_url: string | null;
  site_title_template: string;
  default_og_image: string | null;
  google_analytics_id: string | null;
  social_twitter: string | null;
  social_linkedin: string | null;
  social_github: string | null;
  social_youtube: string | null;
  social_website: string | null;
  image_storage_provider: "local" | "supabase";
  supabase_storage_bucket: string;
  scheduled_publishing_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  article_count: number;
  home_page_featured: boolean;
  created_at: string;
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
