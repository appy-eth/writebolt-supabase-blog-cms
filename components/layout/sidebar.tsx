import type { BlogSettings } from "@/types";
import { PopularArticles } from "@/components/blog/popular-articles";
import { CTASidebar } from "@/components/callouts/cta-sidebar";
import { NewsletterSignup } from "@/components/callouts/newsletter-signup";

interface SidebarProps {
  settings: BlogSettings;
}

export async function Sidebar({ settings }: SidebarProps) {
  return (
    <aside className="w-full lg:w-[300px] lg:shrink-0">
      <div className="sticky top-8 space-y-8">
        {settings.sidebar_cta_enabled && settings.sidebar_cta_title && (
          <CTASidebar
            title={settings.sidebar_cta_title}
            description={settings.sidebar_cta_description ?? undefined}
            buttonText={settings.sidebar_cta_button_text ?? undefined}
            buttonUrl={settings.sidebar_cta_button_url ?? undefined}
            imageUrl={settings.sidebar_cta_image_url ?? undefined}
          />
        )}

        {settings.newsletter_enabled && settings.newsletter_form_action && (
          <NewsletterSignup
            formAction={settings.newsletter_form_action}
            title="Stay updated"
            description="Get new articles in your inbox."
            successMessage={settings.newsletter_success_message}
            variant="card"
          />
        )}

        <PopularArticles />
      </div>
    </aside>
  );
}
