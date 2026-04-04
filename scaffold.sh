#!/bin/bash
# =============================================================================
# Writebolt Blog — Project Scaffolding Script
# =============================================================================
# Run this in your project root directory AFTER running:
#   npx create-next-app@latest writebolt-blog --typescript --tailwind --eslint --app --src-dir=false
#   cd writebolt-blog
#   bash scaffold.sh
#
# This creates the complete folder tree and empty placeholder files.
# =============================================================================

set -e

echo "⚡ Scaffolding Writebolt Blog project structure..."
echo ""

# =============================================================================
# APP ROUTES
# =============================================================================

# Blog routes
mkdir -p app/blog/\[slug\]
mkdir -p app/blog/category/\[category\]
mkdir -p app/blog/tag/\[tag\]

# Author routes
mkdir -p app/authors/\[slug\]

# Admin routes
mkdir -p app/admin/new
mkdir -p app/admin/edit/\[id\]
mkdir -p app/admin/categories
mkdir -p app/admin/media
mkdir -p app/admin/settings/ai

# API routes
mkdir -p app/api/og
mkdir -p app/api/ai/generate-draft
mkdir -p app/api/ai/rewrite
mkdir -p app/api/ai/expand
mkdir -p app/api/ai/suggest-headline
mkdir -p app/api/ai/generate-excerpt
mkdir -p app/api/ai/generate-image
mkdir -p app/api/upload
mkdir -p app/api/writebolt/redirect
mkdir -p app/rss.xml
mkdir -p app/sitemap.xml

# =============================================================================
# COMPONENTS
# =============================================================================

# Blog components
mkdir -p components/blog
mkdir -p components/admin
mkdir -p components/callouts
mkdir -p components/author
mkdir -p components/layout
mkdir -p components/seo
mkdir -p components/ui

# =============================================================================
# LIB
# =============================================================================

mkdir -p lib/supabase
mkdir -p lib/ai
mkdir -p lib/storage
mkdir -p lib/mdx
mkdir -p lib/utils

# =============================================================================
# OTHER DIRECTORIES
# =============================================================================

mkdir -p scripts
mkdir -p public/images/blog
mkdir -p supabase/migrations
mkdir -p types

# =============================================================================
# CREATE PLACEHOLDER FILES — APP ROUTES
# =============================================================================

# Root layout and page (already exist from create-next-app, but ensure they're there)
touch app/page.tsx

# Blog
touch app/blog/layout.tsx
touch app/blog/page.tsx
touch app/blog/\[slug\]/page.tsx
touch app/blog/category/\[category\]/page.tsx
touch app/blog/tag/\[tag\]/page.tsx

# Authors
touch app/authors/page.tsx
touch app/authors/\[slug\]/page.tsx

# Admin
touch app/admin/layout.tsx
touch app/admin/page.tsx
touch app/admin/new/page.tsx
touch app/admin/edit/\[id\]/page.tsx
touch app/admin/categories/page.tsx
touch app/admin/media/page.tsx
touch app/admin/settings/page.tsx
touch app/admin/settings/ai/page.tsx

# API routes
touch app/api/og/route.tsx
touch app/api/ai/generate-draft/route.ts
touch app/api/ai/rewrite/route.ts
touch app/api/ai/expand/route.ts
touch app/api/ai/suggest-headline/route.ts
touch app/api/ai/generate-excerpt/route.ts
touch app/api/ai/generate-image/route.ts
touch app/api/upload/route.ts
touch app/api/writebolt/redirect/route.ts
touch app/rss.xml/route.ts
touch app/sitemap.xml/route.ts

# =============================================================================
# CREATE PLACEHOLDER FILES — COMPONENTS
# =============================================================================

# Blog components
touch components/blog/article-card.tsx
touch components/blog/article-content.tsx
touch components/blog/article-header.tsx
touch components/blog/article-footer.tsx
touch components/blog/reading-progress-bar.tsx
touch components/blog/table-of-contents.tsx
touch components/blog/related-articles.tsx
touch components/blog/category-filter.tsx
touch components/blog/tag-cloud.tsx
touch components/blog/search-bar.tsx
touch components/blog/pagination.tsx

# Admin components
touch components/admin/article-editor.tsx
touch components/admin/ai-assist-toolbar.tsx
touch components/admin/ai-image-generator.tsx
touch components/admin/writebolt-generate-btn.tsx
touch components/admin/image-upload.tsx
touch components/admin/media-library.tsx
touch components/admin/frontmatter-editor.tsx
touch components/admin/category-manager.tsx
touch components/admin/nav-menu-editor.tsx
touch components/admin/blog-settings-form.tsx
touch components/admin/ai-settings-form.tsx

# Callout components
touch components/callouts/cta-inline.tsx
touch components/callouts/cta-sidebar.tsx
touch components/callouts/lead-magnet.tsx
touch components/callouts/newsletter-signup.tsx

# Author components
touch components/author/author-card.tsx
touch components/author/author-profile.tsx
touch components/author/author-articles-list.tsx

# Layout components
touch components/layout/blog-layout-provider.tsx
touch components/layout/blog-header.tsx
touch components/layout/blog-nav.tsx
touch components/layout/blog-footer.tsx
touch components/layout/sidebar.tsx
touch components/layout/theme-toggle.tsx

# SEO components
touch components/seo/meta-tags.tsx
touch components/seo/json-ld.tsx

# =============================================================================
# CREATE PLACEHOLDER FILES — LIB
# =============================================================================

touch lib/supabase/client.ts
touch lib/supabase/server.ts
touch lib/supabase/queries.ts

touch lib/ai/provider.ts
touch lib/ai/text-generation.ts
touch lib/ai/image-generation.ts
touch lib/ai/prompts.ts

touch lib/storage/provider.ts
touch lib/storage/local.ts
touch lib/storage/supabase-storage.ts

touch lib/mdx/config.ts
touch lib/mdx/components.tsx

touch lib/utils/reading-time.ts
touch lib/utils/slug.ts
touch lib/utils/search.ts

# =============================================================================
# CREATE PLACEHOLDER FILES — OTHER
# =============================================================================

touch types/index.ts
touch scripts/setup.ts
touch scripts/seed.ts

# writebolt.config.json
cat > writebolt.config.json << 'CONFIGEOF'
{
  "version": 1,
  "format": "mdx",
  "image_dir": "public/images/blog",
  "frontmatter_schema": {
    "headline": "string",
    "slug": "string",
    "excerpt": "string",
    "author_id": "string",
    "category": "string",
    "tags": "string[]",
    "featured_image": "string",
    "featured_image_alt": "string",
    "seo_title": "string",
    "seo_description": "string",
    "status": "string",
    "published_at": "datetime"
  },
  "supabase_sync": {
    "enabled": true,
    "table": "articles"
  },
  "naming_convention": "slug"
}
CONFIGEOF

# .env.example
cat > .env.example << 'ENVEOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Encryption (for BYOK API key storage)
SETTINGS_ENCRYPTION_KEY=generate-a-random-32-byte-hex-string

# Optional: AI keys can also be set here instead of the admin UI
# OPENAI_API_KEY=
# REPLICATE_API_KEY=
ENVEOF

# .gitkeep for empty image directory
touch public/images/blog/.gitkeep

# =============================================================================
# SUMMARY
# =============================================================================

echo ""
echo "✅ Scaffolding complete!"
echo ""
echo "Files and directories created:"
echo ""

# Count
DIRS=$(find . -type d -not -path './node_modules/*' -not -path './.next/*' -not -path './.git/*' | wc -l)
FILES=$(find . -type f -not -path './node_modules/*' -not -path './.next/*' -not -path './.git/*' -name '*.tsx' -o -name '*.ts' -o -name '*.mdx' -o -name '*.json' -o -name '*.env*' | wc -l)

echo "  📁 $DIRS directories"
echo "  📄 $FILES source files"
echo ""
echo "Next steps:"
echo "  1. Copy .env.example to .env.local and fill in your Supabase credentials"
echo "  2. Run the SQL from writebolt-sql.md in your Supabase SQL Editor"
echo "  3. Run: npm run dev"
echo "  4. Visit http://localhost:3000/admin to configure your blog"
echo ""
