"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createCustomer,
  CUSTOMER_STATUSES,
  deleteCustomer,
  getCustomerById,
  updateCustomer,
  type CustomerStatus,
} from "@/lib/customers";
import type { UpdateCustomerInput } from "@/lib/customers.types";
import { createClient } from "@/lib/supabase/server";

export type CreateCustomerState = {
  error?: string;
  success?: boolean;
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
  const contact_first_name =
    formData.get("contact_first_name")?.toString().trim() ?? "";
  const contact_last_name =
    formData.get("contact_last_name")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() ?? "";
  const statusValue = formData.get("status")?.toString().trim() || "lead";

  if (!company_name) {
    return { ok: false, error: "Unternehmensname ist erforderlich." };
  }

  if (!contact_first_name) {
    return { ok: false, error: "Vorname ist erforderlich." };
  }

  if (!contact_last_name) {
    return { ok: false, error: "Nachname ist erforderlich." };
  }

  if (!email) {
    return { ok: false, error: "E-Mail ist erforderlich." };
  }

  if (!isValidEmail(email)) {
    return { ok: false, error: "Bitte gib eine gültige E-Mail-Adresse ein." };
  }

  if (!isCustomerStatus(statusValue)) {
    return { ok: false, error: "Ungültiger Status." };
  }

  return {
    ok: true,
    data: {
      company_name,
      contact_first_name,
      contact_last_name,
      email,
      website: optionalText(formData.get("website")),
      industry: optionalText(formData.get("industry")),
      phone: optionalText(formData.get("phone")),
      source: optionalText(formData.get("source")),
      status: statusValue,
    },
  };
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
    await createCustomer({
      ...parsed.data,
      owner_id: user.id,
    });

    revalidatePath("/customers");
    return { success: true };
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
    revalidatePath("/customers");
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
    revalidatePath("/customers");

    return {
      success: true,
      message: "Kunde wurde erfolgreich gelöscht.",
    };
  } catch {
    return {
      error:
        "Der Kunde konnte nicht gelöscht werden. Bitte versuche es erneut.",
    };
  }
}
