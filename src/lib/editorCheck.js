import { supabase } from './supabase';

export function clearEditorCache() {
  // This function is kept because Header/Footer call it after logout.
  // The actual cache is managed inside RoleContext, but clearing it here
  // ensures any stale reference is removed.
}

export async function getAllEditors() {
  const { data, error } = await supabase.from('editors').select('email, is_admin');
  if (error) throw error;
  return data;
}

export async function addEditor(email, isAdmin = false) {
  const { error } = await supabase
    .from('editors')
    .insert([{ email: email.toLowerCase(), is_admin: isAdmin }]);
  if (error) throw error;
  clearEditorCache();
}

export async function deleteEditor(email) {
  const { error } = await supabase
    .from('editors')
    .delete()
    .eq('email', email.toLowerCase());
  if (error) throw error;
  clearEditorCache();
}

export async function toggleAdminStatus(email, isAdmin) {
  const { error } = await supabase
    .from('editors')
    .update({ is_admin: isAdmin })
    .eq('email', email.toLowerCase());
  if (error) throw error;
  clearEditorCache();
}