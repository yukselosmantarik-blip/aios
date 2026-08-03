import { createClient } from "@/lib/supabase/server";
import type {
  CreateCustomerNoteInput,
  CustomerNote,
} from "@/lib/customers.types";

export type { CustomerNote } from "@/lib/customers.types";

export async function listCustomerNotes(
  customerId: string,
  ownerId: string,
): Promise<CustomerNote[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customer_notes")
    .select("*")
    .eq("customer_id", customerId)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CustomerNote[];
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
    throw new Error(error.message);
  }
}
