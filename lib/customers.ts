import { createClient } from "@/lib/supabase/server";
import type {
  CreateCustomerInput,
  Customer,
  UpdateCustomerInput,
} from "@/lib/customers.types";
import { normalizeCustomerStatus } from "@/lib/customers.types";

export type {
  CreateCustomerInput,
  Customer,
  CustomerCrmStats,
  CustomerNote,
  CustomerSortOption,
  CustomerStatus,
  UpdateCustomerInput,
} from "@/lib/customers.types";

export {
  CUSTOMER_SOURCE_OPTIONS,
  CUSTOMER_STATUSES,
  CUSTOMER_STATUS_OPTIONS,
  normalizeCustomerStatus,
} from "@/lib/customers.types";

function mapCustomer(row: Customer): Customer {
  return {
    ...row,
    status: normalizeCustomerStatus(row.status),
  };
}

export async function getCustomers(): Promise<Customer[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapCustomer(row as Customer));
}

export async function createCustomer(
  input: CreateCustomerInput,
): Promise<Customer> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customers")
    .insert(input)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapCustomer(data as Customer);
}

export async function updateCustomer(
  id: string,
  ownerId: string,
  input: UpdateCustomerInput,
): Promise<Customer> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customers")
    .update(input)
    .eq("id", id)
    .eq("owner_id", ownerId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapCustomer(data as Customer);
}

export async function getCustomerById(
  id: string,
  ownerId: string,
): Promise<Customer | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return mapCustomer(data as Customer);
}

export async function deleteCustomer(
  id: string,
  ownerId: string,
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id)
    .eq("owner_id", ownerId);

  if (error) {
    throw new Error(error.message);
  }
}
