interface CTAInlineProps {
  title: string;
  description?: string;
  buttonText: string;
  buttonUrl: string;
  variant?: "highlight" | "subtle" | "branded";
}

export function CTAInline({
  title,
  description,
  buttonText,
  buttonUrl,
  variant = "highlight",
}: CTAInlineProps) {
  const variants = {
    highlight:
      "border-[#2563EB]/20 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 dark:border-blue-800/30",
    subtle:
      "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50",
    branded:
      "border-[#2563EB] bg-[#2563EB] text-white dark:bg-[#1D4ED8]",
  };

  const isBranded = variant === "branded";

  return (
    <div
      className={`my-8 rounded-xl border p-6 sm:p-8 ${variants[variant]}`}
      role="complementary"
      aria-label="Call to action"
    >
      <h3
        className={`text-lg font-bold sm:text-xl ${
          isBranded ? "text-white" : "text-gray-900 dark:text-gray-100"
        }`}
      >
        {title}
      </h3>
      {description && (
        <p
          className={`mt-2 text-sm sm:text-base ${
            isBranded
              ? "text-white/90"
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          {description}
        </p>
      )}
      <a
        href={buttonUrl}
        className={`mt-4 inline-block rounded-lg px-5 py-2.5 text-sm font-semibold shadow-sm transition-colors ${
          isBranded
            ? "bg-white text-[#2563EB] hover:bg-gray-100"
            : "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
        }`}
      >
        {buttonText}
      </a>
    </div>
  );
}
