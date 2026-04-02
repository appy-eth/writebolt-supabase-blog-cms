interface CTASidebarProps {
  title: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  imageUrl?: string;
}

export function CTASidebar({
  title,
  description,
  buttonText,
  buttonUrl,
  imageUrl,
}: CTASidebarProps) {
  return (
    <div
      className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      role="complementary"
      aria-label="Sidebar call to action"
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          className="mb-4 w-full rounded-lg"
          loading="lazy"
        />
      )}
      <h3 className="font-bold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}
      {buttonText && buttonUrl && (
        <a
          href={buttonUrl}
          className="mt-4 inline-block rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
        >
          {buttonText}
        </a>
      )}
    </div>
  );
}
