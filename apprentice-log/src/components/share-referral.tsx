"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Share2,
  Copy,
  Check,
  Gift,
  Users,
  Mail,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { trackShare } from "@/lib/analytics";

interface ReferralData {
  code: string;
  referralLink: string;
  stats: {
    total: number;
    successful: number;
    pending: number;
  };
}

interface ShareReferralProps {
  trigger?: React.ReactNode;
}

export function ShareReferral({ trigger }: ShareReferralProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && !referralData) {
      fetchReferralData();
    }
  }, [open, referralData]);

  const fetchReferralData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/referrals");
      if (response.ok) {
        const data = await response.json();
        setReferralData(data);
      }
    } catch (error) {
      console.error("Failed to fetch referral data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!referralData) return;

    try {
      await navigator.clipboard.writeText(referralData.referralLink);
      setCopied(true);
      trackShare("copy", "referral_dialog");
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const shareViaEmail = () => {
    if (!referralData) return;

    trackShare("email", "referral_dialog");
    const subject = encodeURIComponent("Try Apprentice Log - Free logbook app for NZ apprentices");
    const body = encodeURIComponent(
      `Hey!\n\nI've been using Apprentice Log to keep track of my apprenticeship hours. It's free and makes logging work so easy - just speak and it writes up your entry.\n\nCheck it out: ${referralData.referralLink}\n\nCheers!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaWhatsApp = () => {
    if (!referralData) return;

    trackShare("whatsapp", "referral_dialog");
    const text = encodeURIComponent(
      `Check out Apprentice Log - it's a free logbook app for NZ apprentices. Just speak and it writes up your entry! ${referralData.referralLink}`
    );
    window.open(`https://wa.me/?text=${text}`);
  };

  const shareNative = async () => {
    if (!referralData) return;

    trackShare("link", "referral_dialog");
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Apprentice Log",
          text: "Free logbook app for NZ apprentices - just speak and it writes your entries!",
          url: referralData.referralLink,
        });
      } catch {
        // User cancelled or share failed, copy instead
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-orange-500" />
            Invite Your Mates
          </DialogTitle>
          <DialogDescription>
            Share Apprentice Log with fellow apprentices and earn rewards!
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : referralData ? (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-orange-50 rounded-xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {referralData.stats.total}
                </div>
                <div className="text-xs text-gray-600">Invited</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {referralData.stats.successful}
                </div>
                <div className="text-xs text-gray-600">Signed Up</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {referralData.stats.pending}
                </div>
                <div className="text-xs text-gray-600">Pending</div>
              </div>
            </div>

            {/* Referral Link */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Your referral link
              </label>
              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 truncate">
                  {referralData.referralLink}
                </div>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="icon"
                  className={copied ? "bg-green-50 border-green-200" : ""}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Share buttons */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Share via
              </label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  className="flex-col h-auto py-4 gap-2"
                  onClick={shareViaWhatsApp}
                >
                  <MessageCircle className="h-5 w-5 text-green-600" />
                  <span className="text-xs">WhatsApp</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-col h-auto py-4 gap-2"
                  onClick={shareViaEmail}
                >
                  <Mail className="h-5 w-5 text-blue-600" />
                  <span className="text-xs">Email</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-col h-auto py-4 gap-2"
                  onClick={shareNative}
                >
                  <Share2 className="h-5 w-5 text-gray-600" />
                  <span className="text-xs">More</span>
                </Button>
              </div>
            </div>

            {/* Referral benefits */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-900">
                    Help your mates track their hours
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    When they sign up, you&apos;ll both benefit from a growing
                    community of Kiwi apprentices.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Failed to load referral data. Please try again.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
