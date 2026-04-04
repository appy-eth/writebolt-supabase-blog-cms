import { AISettingsForm } from "@/components/admin/ai-settings-form";

export default function AISettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">AI Configuration</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage your AI API keys and generation preferences
      </p>
      <div className="mt-8">
        <AISettingsForm />
      </div>
    </div>
  );
}
