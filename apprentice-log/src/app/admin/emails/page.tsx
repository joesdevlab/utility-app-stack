"use client";

import { EmailManager } from "@/components/admin/email-manager";

export default function AdminEmailsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Email Templates</h1>
        <p className="text-muted-foreground">Preview and send test emails</p>
      </div>
      <EmailManager />
    </div>
  );
}
