"use client";

import { Copy, Link2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { meetingDialogClass } from "./meetingFormStyles";

export function ShareMeetingLinkDialog({ open, onOpenChange, meetingUrl, onCopy }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={meetingDialogClass}>
        <div className="border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-violet-500/5 px-6 py-5">
          <DialogHeader className="text-left space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 border border-blue-500/30 mb-1">
              <Link2 className="h-5 w-5 text-blue-300" />
            </div>
            <DialogTitle className="text-xl font-semibold text-white tracking-tight">
              Your meeting link
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-400 leading-relaxed">
              Share this link with people you want to meet. Save it — you will need it to start
              as host later.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-6 space-y-4">
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <p className="min-w-0 flex-1 break-all text-sm font-mono text-zinc-300">
              {meetingUrl}
            </p>
            <button
              type="button"
              onClick={onCopy}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-violet-300 transition hover:bg-white/15 hover:text-white"
              aria-label="Copy link"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
