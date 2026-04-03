import { X, Download, Share, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InstallPromptModal({
  open,
  onClose,
  onInstall,
  canInstall,
  isIos,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="w-full rounded-t-3xl bg-background p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-muted" />

        {/* App icon */}
        <div className="mb-5 flex justify-center">
          <div className="h-16 w-16 overflow-hidden rounded-2xl shadow-lg">
            <img
              src="/web-app-manifest-192x192.png"
              alt="Budgify app icon"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              Install Budgify
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Get faster access, a more app-like experience, and open Budgify
              directly from your home screen.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Close install prompt"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {canInstall ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                Budgify is ready to be installed on this device.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={onInstall} className="w-full" size="lg">
                <Download className="mr-2 h-4 w-4" />
                Install now
              </Button>

              <Button
                onClick={onClose}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Maybe later
              </Button>
            </div>
          </div>
        ) : isIos ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                On iPhone, installation is done manually through Safari.
              </p>
            </div>

            <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background text-sm font-semibold">
                  1
                </div>
                <p className="text-sm text-foreground">
                  Tap the <Share className="mx-1 inline h-4 w-4" /> share button.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background text-sm font-semibold">
                  2
                </div>
                <p className="text-sm text-foreground">
                  Choose <span className="font-medium">Add to Home Screen</span>{" "}
                  <Plus className="mx-1 inline h-4 w-4" />.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background text-sm font-semibold">
                  3
                </div>
                <p className="text-sm text-foreground">
                  Tap <span className="font-medium">Add</span>.
                </p>
              </div>
            </div>

            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Got it
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                Installation is not available right now on this browser, but the app
                still works as a web app.
              </p>
            </div>

            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}