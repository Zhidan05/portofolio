import { test, expect, describe } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Admin client can be used for setup/teardown if needed
// Create anon client
const supabaseAnon = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

describe('Experience Database & RLS', () => {
  test('Anonymous users can only read published experiences', async () => {
    const { data, error } = await supabaseAnon.from('portfolio_experiences').select('*');
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
    // Even if there are unpublished records, anon shouldn't see them
    data.forEach(exp => {
      expect(exp.published).toBe(true);
    });
  });

  test('Anonymous users cannot insert experience', async () => {
    const { error } = await supabaseAnon.from('portfolio_experiences').insert([{
      organization: 'Anon Corp',
      role: 'Hacker',
      description: 'Hacking stuff',
      start_label: '2026',
      status: 'active',
      status_label: 'ACTIVE',
      accent: 'primary'
    }]);
    
    expect(error).not.toBeNull();
  });
});
