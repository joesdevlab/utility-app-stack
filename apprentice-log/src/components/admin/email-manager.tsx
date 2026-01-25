"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail,
  Send,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Smartphone,
  Monitor,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
}

interface EmailPreview {
  id: string;
  name: string;
  description: string;
  sampleProps: Record<string, unknown>;
  html: string;
}

type ViewMode = "desktop" | "mobile";

export function EmailManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [preview, setPreview] = useState<EmailPreview | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  // Fetch templates list on mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Fetch preview when template is selected
  useEffect(() => {
    if (selectedTemplate) {
      fetchPreview(selectedTemplate);
    } else {
      setPreview(null);
    }
  }, [selectedTemplate]);

  const fetchTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const response = await fetch("/api/admin/email-preview", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      } else {
        toast.error("Failed to load email templates");
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
      toast.error("Failed to load email templates");
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const fetchPreview = async (templateId: string) => {
    setIsLoadingPreview(true);
    try {
      const response = await fetch(`/api/admin/email-preview?template=${templateId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setPreview(data);
      } else {
        toast.error("Failed to load email preview");
      }
    } catch (error) {
      console.error("Failed to fetch preview:", error);
      toast.error("Failed to load email preview");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const sendTestEmail = async () => {
    if (!selectedTemplate) return;

    setIsSending(true);
    setSendResult(null);

    try {
      const response = await fetch("/api/admin/email-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          templateId: selectedTemplate,
          recipientEmail: testEmail || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSendResult({ success: true, message: data.message });
        toast.success(data.message);
      } else {
        setSendResult({ success: false, message: data.error });
        toast.error(data.error);
      }
    } catch (error) {
      const message = "Failed to send test email";
      setSendResult({ success: false, message });
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoadingTemplates) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg shadow-violet-500/25 flex items-center justify-center">
          <Mail className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Email Templates</h2>
          <p className="text-sm text-muted-foreground">Preview and test email templates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Templates</p>
          <div className="space-y-2">
            {templates.map((template, i) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <button
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    selectedTemplate === template.id
                      ? "bg-violet-50 border-violet-200 shadow-md"
                      : "bg-white border-gray-200 hover:border-violet-200 hover:bg-violet-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        selectedTemplate === template.id
                          ? "bg-violet-500 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <p className={`font-medium ${
                          selectedTemplate === template.id ? "text-violet-700" : "text-gray-900"
                        }`}>
                          {template.name}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {template.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 transition-transform ${
                      selectedTemplate === template.id ? "text-violet-500 translate-x-1" : "text-gray-400"
                    }`} />
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Preview & Actions */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="wait">
            {!selectedTemplate ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="h-[600px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Eye className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-muted-foreground">Select a template to preview</p>
                  </div>
                </Card>
              </motion.div>
            ) : isLoadingPreview ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="h-[600px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                </Card>
              </motion.div>
            ) : preview ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Controls */}
                <Card className="border-violet-100 bg-gradient-to-r from-violet-50/50 to-purple-50/50">
                  <CardContent className="py-4">
                    <div className="flex flex-wrap items-center gap-4">
                      {/* View mode toggle */}
                      <div className="flex items-center gap-2 bg-white rounded-lg p-1 border">
                        <button
                          onClick={() => setViewMode("desktop")}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                            viewMode === "desktop"
                              ? "bg-violet-500 text-white shadow-sm"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <Monitor className="h-4 w-4" />
                          Desktop
                        </button>
                        <button
                          onClick={() => setViewMode("mobile")}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                            viewMode === "mobile"
                              ? "bg-violet-500 text-white shadow-sm"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <Smartphone className="h-4 w-4" />
                          Mobile
                        </button>
                      </div>

                      <div className="flex-1" />

                      {/* Test email input & send button */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="testEmail" className="text-sm text-gray-600 whitespace-nowrap">
                            Send to:
                          </Label>
                          <Input
                            id="testEmail"
                            type="email"
                            placeholder="your@email.com (or leave blank)"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            className="w-56 h-9 text-sm"
                          />
                        </div>
                        <Button
                          onClick={sendTestEmail}
                          disabled={isSending}
                          className="bg-violet-500 hover:bg-violet-600 text-white gap-2"
                        >
                          {isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          Send Test
                        </Button>
                      </div>
                    </div>

                    {/* Send result */}
                    <AnimatePresence>
                      {sendResult && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t border-violet-100"
                        >
                          <div className={`flex items-center gap-2 text-sm ${
                            sendResult.success ? "text-emerald-600" : "text-rose-600"
                          }`}>
                            {sendResult.success ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <AlertCircle className="h-4 w-4" />
                            )}
                            {sendResult.message}
                            <button
                              onClick={() => setSendResult(null)}
                              className="ml-auto p-1 hover:bg-white rounded"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>

                {/* Template info */}
                <div className="flex items-center gap-3">
                  <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {preview.name}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{preview.description}</span>
                </div>

                {/* Preview iframe */}
                <Card className="overflow-hidden">
                  <div className={`bg-gray-100 p-4 flex justify-center transition-all duration-300 ${
                    viewMode === "mobile" ? "bg-gray-800" : ""
                  }`}>
                    <div
                      className={`bg-white shadow-2xl transition-all duration-300 overflow-hidden ${
                        viewMode === "mobile"
                          ? "w-[375px] rounded-[2rem] border-[8px] border-gray-900"
                          : "w-full max-w-[700px] rounded-lg"
                      }`}
                      style={{
                        height: viewMode === "mobile" ? "667px" : "550px",
                      }}
                    >
                      <iframe
                        srcDoc={preview.html}
                        className="w-full h-full border-0"
                        title="Email Preview"
                        sandbox="allow-same-origin"
                      />
                    </div>
                  </div>
                </Card>

                {/* Sample props */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Sample Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-x-auto text-gray-600">
                      {JSON.stringify(preview.sampleProps, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
