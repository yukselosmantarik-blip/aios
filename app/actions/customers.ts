"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createCustomer,
  CUSTOMER_STATUSES,
  deleteCustomer,
  getCustomerById,
  normalizeCustomerStatus,
  updateCustomer,
  type CustomerStatus,
} from "@/lib/customers";
import { createCustomerNote } from "@/lib/customer-notes";
import type { UpdateCustomerInput } from "@/lib/customers.types";
import { createClient } from "@/lib/supabase/server";

export type CreateCustomerState = {
  error?: string;
  success?: boolean;
  customerId?: string;
};

export type UpdateCustomerState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export type DeleteCustomerState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export type CreateCustomerNoteState = {
  error?: string;
  success?: boolean;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

function optionalText(value: FormDataEntryValue | null): string | null {
  const trimmed = value?.toString().trim();
  return trimmed ? trimmed : null;
}

function isCustomerStatus(value: string): value is CustomerStatus {
  return CUSTOMER_STATUSES.includes(value as CustomerStatus);
}

function isValidUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

function parseCustomerFields(formData: FormData):
  | { ok: true; data: UpdateCustomerInput }
  | { ok: false; error: string } {
  const company_name = formData.get("company_name")?.toString().trim() ?? "";
  const contact_first_name = optionalText(formData.get("contact_first_name"));
  const contact_last_name = optionalText(formData.get("contact_last_name"));
  const emailRaw = optionalText(formData.get("email"));
  const statusValue =
    formData.get("status")?.toString().trim() || "lead";

  if (!company_name) {
    return { ok: false, error: "Unternehmensname ist erforderlich." };
  }

  if (emailRaw && !isValidEmail(emailRaw)) {
    return { ok: false, error: "Bitte gib eine gültige E-Mail-Adresse ein." };
  }

  const normalizedStatus = normalizeCustomerStatus(statusValue);
  if (!isCustomerStatus(normalizedStatus)) {
    return { ok: false, error: "Ungültiger Status." };
  }

  return {
    ok: true,
    data: {
      company_name,
      contact_first_name,
      contact_last_name,
      email: emailRaw,
      website: optionalText(formData.get("website")),
      industry: optionalText(formData.get("industry")),
      phone: optionalText(formData.get("phone")),
      source: optionalText(formData.get("source")),
      status: normalizedStatus,
    },
  };
}

function revalidateCustomerPaths(customerId?: string) {
  revalidatePath("/customers");
  revalidatePath("/");
  if (customerId) {
    revalidatePath(`/customers/${customerId}`);
  }
}

export async function createCustomerAction(
  _prevState: CreateCustomerState,
  formData: FormData,
): Promise<CreateCustomerState> {
  const user = await requireUser();
  const parsed = parseCustomerFields(formData);

  if (!parsed.ok) {
    return { error: parsed.error };
  }

  try {
    const customer = await createCustomer({
      ...parsed.data,
      owner_id: user.id,
    });

    const initialNote = optionalText(formData.get("initial_note"));
    if (initialNote) {
      await createCustomerNote({
        customer_id: customer.id,
        owner_id: user.id,
        body: initialNote,
      });
    }

    revalidateCustomerPaths(customer.id);
    return { success: true, customerId: customer.id };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Kunde konnte nicht erstellt werden.";
    return { error: message };
  }
}

export async function updateCustomerAction(
  _prevState: UpdateCustomerState,
  formData: FormData,
): Promise<UpdateCustomerState> {
  const user = await requireUser();
  const id = formData.get("id")?.toString().trim() ?? "";

  if (!id || !isValidUuid(id)) {
    return { error: "Ungültiger Kunde." };
  }

  const parsed = parseCustomerFields(formData);

  if (!parsed.ok) {
    return { error: parsed.error };
  }

  try {
    await updateCustomer(id, user.id, parsed.data);
    revalidateCustomerPaths(id);
    return {
      success: true,
      message: "Kunde wurde erfolgreich aktualisiert.",
    };
  } catch {
    return {
      error:
        "Der Kunde konnte nicht gespeichert werden. Bitte versuche es erneut.",
    };
  }
}

export async function deleteCustomerAction(
  id: string,
): Promise<DeleteCustomerState> {
  const user = await requireUser();
  const trimmedId = id.trim();

  if (!trimmedId || !isValidUuid(trimmedId)) {
    return { error: "Ungültiger Kunde." };
  }

  try {
    const customer = await getCustomerById(trimmedId, user.id);

    if (!customer) {
      return { error: "Kunde wurde nicht gefunden." };
    }

    await deleteCustomer(trimmedId, user.id);
    revalidateCustomerPaths();

    return {
      success: true,
      message: "Kunde wurde erfolgreich gelöscht.",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Löschen fehlgeschlagen.";
    if (/foreign key|restrict/i.test(message)) {
      return {
        error:
          "Der Kunde kann nicht gelöscht werden, solange noch Projekte verknüpft sind.",
      };
    }
    return {
      error:
        "Der Kunde konnte nicht gelöscht werden. Bitte versuche es erneut.",
    };
  }
}

export async function createCustomerNoteAction(
  _prevState: CreateCustomerNoteState,
  formData: FormData,
): Promise<CreateCustomerNoteState> {
  const user = await requireUser();
  const customerId = formData.get("customer_id")?.toString().trim() ?? "";
  const body = formData.get("body")?.toString().trim() ?? "";

  if (!customerId || !isValidUuid(customerId)) {
    return { error: "Ungültiger Kunde." };
  }

  if (!body) {
    return { error: "Bitte gib eine Notiz ein." };
  }

  const customer = await getCustomerById(customerId, user.id);
  if (!customer) {
    return { error: "Kunde wurde nicht gefunden." };
  }

  try {
    await createCustomerNote({
      customer_id: customerId,
      owner_id: user.id,
      body,
    });
    revalidateCustomerPaths(customerId);
    return { success: true };
  } catch {
    return { error: "Notiz konnte nicht gespeichert werden." };
  }
}
