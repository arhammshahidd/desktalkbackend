import { getSupabase } from '../../config/supabase.js';
import { AppError } from '../../middleware/errorHandler.js';

async function countTable(table: string) {
  const supabase = getSupabase();
  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true });

  if (error) throw new AppError(error.message, 500);
  return count ?? 0;
}

export async function getStats() {
  const [
    podcasts,
    blogs,
    categories,
    team,
    partners,
    contact,
    guest,
    host,
    newsletter,
    media,
  ] = await Promise.all([
    countTable('podcasts'),
    countTable('blogs'),
    countTable('categories'),
    countTable('team_members'),
    countTable('partners'),
    countTable('contact_submissions'),
    countTable('guest_applications'),
    countTable('host_applications'),
    countTable('newsletter_subscribers'),
    countTable('media_assets'),
  ]);

  return {
    podcasts,
    blogs,
    categories,
    team,
    partners,
    submissions: {
      contact,
      guest,
      host,
      newsletter,
      total: contact + guest + host + newsletter,
    },
    media,
  };
}
