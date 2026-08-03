import "server-only";

import { createClient } from "@/lib/supabase/server";
import {
  CUSTOMER_NOTES_SETUP_MESSAGE,
  isCustomerNotesSetupError,
} from "@/lib/customer-notes.constants";
import type {
  CreateCustomerNoteInput,
  CustomerNote,
} from "@/lib/customers.types";
import type { PostgrestError } from "@supabase/supabase-js";

export type { CustomerNote } from "@/lib/customers.types";

export {
  CUSTOMER_NOTES_MIGRATION_FILE,
  CUSTOMER_NOTES_SETUP_MESSAGE,
  isCustomerNotesSetupError,
} from "@/lib/customer-notes.constants";

export type CustomerNotesListResult = {
  notes: CustomerNote[];
  notesAvailable: boolean;
};

function isCustomerNotesTableMissing(error: PostgrestError): boolean {
  return error.code === "PGRST205";
}

export async function listCustomerNotes(
  customerId: string,
  ownerId: string,
): Promise<CustomerNotesListResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customer_notes")
    .select("*")
    .eq("customer_id", customerId)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) {
    if (isCustomerNotesTableMissing(error)) {
      return { notes: [], notesAvailable: false };
    }
    throw new Error(error.message);
  }

  return {
    notes: (data ?? []) as CustomerNote[],
    notesAvailable: true,
  };
}

export async function createCustomerNote(
  input: CreateCustomerNoteInput,
): Promise<CustomerNote> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customer_notes")
    .insert(input)
    .select()
    .single();

  if (error) {
    if (isCustomerNotesTableMissing(error)) {
      throw new Error(CUSTOMER_NOTES_SETUP_MESSAGE);
    }
    throw new Error(error.message);
  }

  return data as CustomerNote;
}

export async function deleteCustomerNote(
  noteId: string,
  ownerId: string,
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("customer_notes")
    .delete()
    .eq("id", noteId)
    .eq("owner_id", ownerId);

  if (error) {
    if (isCustomerNotesTableMissing(error)) {
      throw new Error(CUSTOMER_NOTES_SETUP_MESSAGE);
    }
    throw new Error(error.message);
  }
}
