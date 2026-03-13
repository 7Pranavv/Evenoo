import { supabase } from './supabase';

export const getDocument = async <T extends { id?: string }>(
  table: string,
  id: string
): Promise<T | null> => {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching ${table}:`, error);
    return null;
  }

  return data as T | null;
};

export const getCollection = async <T>(
  table: string,
  filters?: Array<{ column: string; value: any; operator?: string }>
): Promise<T[]> => {
  let query = supabase.from(table).select('*');

  if (filters) {
    for (const filter of filters) {
      const operator = filter.operator || 'eq';
      query = query.filter(filter.column, operator, filter.value) as any;
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching ${table}:`, error);
    return [];
  }

  return (data as T[]) || [];
};

export const createDocument = async <T extends { id?: string }>(
  table: string,
  data: Omit<T, 'id' | 'created_at' | 'updated_at'>
): Promise<string | null> => {
  const { data: result, error } = await supabase
    .from(table)
    .insert([
      {
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select('id')
    .single();

  if (error) {
    console.error(`Error creating ${table}:`, error);
    return null;
  }

  return result?.id || null;
};

export const setDocument = async <T extends { id?: string }>(
  table: string,
  id: string,
  data: Omit<T, 'id'>
): Promise<boolean> => {
  const { error } = await supabase
    .from(table)
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error(`Error updating ${table}:`, error);
    return false;
  }

  return true;
};

export const updateDocument = async (
  table: string,
  id: string,
  data: Record<string, any>
): Promise<boolean> => {
  const { error } = await supabase
    .from(table)
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error(`Error updating ${table}:`, error);
    return false;
  }

  return true;
};

export const deleteDocument = async (table: string, id: string): Promise<boolean> => {
  const { error } = await supabase.from(table).delete().eq('id', id);

  if (error) {
    console.error(`Error deleting ${table}:`, error);
    return false;
  }

  return true;
};
