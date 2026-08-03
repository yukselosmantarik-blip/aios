export const CUSTOMER_NOTES_MIGRATION_FILE =
  "supabase/migrations/20260803170000_ensure_customer_notes_table.sql";

export const CUSTOMER_NOTES_SETUP_MESSAGE =
  "Notizen sind in Supabase noch nicht eingerichtet. Führe die Migration supabase/migrations/20260803170000_ensure_customer_notes_table.sql im SQL Editor aus.";

export function isCustomerNotesSetupError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message === CUSTOMER_NOTES_SETUP_MESSAGE
  );
}
