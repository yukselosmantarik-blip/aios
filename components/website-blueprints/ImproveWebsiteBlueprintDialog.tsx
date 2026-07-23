"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { improveWebsiteBlueprintAction } from "@/app/actions/website-blueprints";

type ImproveWebsiteBlueprintDialogProps = {
  briefId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onPendingChange?: (isPending: boolean) => void;
};

type ImproveWebsiteBlueprintFormProps = {
  briefId: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onPendingChange?: (isPending: boolean) => void;
};

function ImproveWebsiteBlueprintForm({
  briefId,
  onClose,
  onSuccess,
  onPendingChange,
}: ImproveWebsiteBlueprintFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPending, onClose]);

  function handleConfirm() {
    setError(undefined);

    startTransition(async () => {
      const result = await improveWebsiteBlueprintAction(briefId);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.success && result.message) {
        onSuccess(result.message);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        aria-label="Dialog schließen"
        className="absolute inset-0 bg-black/70"
        onClick={() => {
          if (!isPending) {
            onClose();
          }
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative z-10 w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 shadow-md"
      >
        <div className="border-b border-zinc-800 px-6 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-zinc-50">
            Blueprint mit KI verbessern
          </h2>
          <p id={descriptionId} className="mt-2 text-sm text-zinc-400">
            Das bestehende deterministische Blueprint wird anhand des Website
            Briefs mit KI verbessert. Das vorherige Blueprint wird dabei
            überschrieben.
          </p>
        </div>

        <div className="px-6 py-5">
          {error ? (
            <p
              role="alert"
              className="mb-4 rounded-lg border border-red-900/50 bg-red-950/20 px-3 py-2 text-sm text-red-400"
            >
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "KI verbessert Blueprint..." : "Mit KI verbessern"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ImproveWebsiteBlueprintDialog({
  briefId,
  open,
  onClose,
  onSuccess,
  onPendingChange,
}: ImproveWebsiteBlueprintDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <ImproveWebsiteBlueprintForm
        key={briefId}
        briefId={briefId}
        onClose={onClose}
        onSuccess={onSuccess}
        onPendingChange={onPendingChange}
      />
    </div>
  );
}
