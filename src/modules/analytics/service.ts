import { getSupabase } from '../../config/supabase.js';
import { AppError } from '../../middleware/errorHandler.js';
import type { TrackViewInput } from './schema.js';

function startOfUtcDay(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function daysAgoUtc(n: number) {
  const d = startOfUtcDay();
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

function iso(d: Date) {
  return d.toISOString();
}

export async function trackView(input: TrackViewInput, userAgent = '') {
  const supabase = getSupabase();
  const path = input.path.startsWith('/') ? input.path : `/${input.path}`;

  // Skip admin / API noise
  if (path.startsWith('/admin') || path.startsWith('/api')) {
    return { tracked: false };
  }

  const { error } = await supabase.from('page_views').insert({
    visitor_id: input.visitorId,
    path,
    page_type: input.pageType,
    content_id: input.contentId || null,
    content_slug: input.contentSlug || '',
    content_title: input.contentTitle || '',
    referrer: input.referrer || '',
    user_agent: (userAgent || '').slice(0, 400),
  });

  if (error) {
    if (error.message?.includes('page_views') || error.code === '42P01') {
      throw new AppError('Analytics table missing. Run page_views migration.', 503);
    }
    throw new AppError(error.message, 500);
  }

  return { tracked: true };
}

async function uniqueVisitorsSince(since: Date) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('page_views')
    .select('visitor_id')
    .gte('created_at', iso(since));

  if (error) throw new AppError(error.message, 500);
  return new Set((data || []).map((r) => r.visitor_id)).size;
}

async function totalViewsSince(since: Date) {
  const supabase = getSupabase();
  const { count, error } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', iso(since));

  if (error) throw new AppError(error.message, 500);
  return count || 0;
}

async function dailySeries(days: number) {
  const supabase = getSupabase();
  const since = daysAgoUtc(days - 1);
  const { data, error } = await supabase
    .from('page_views')
    .select('visitor_id, created_at')
    .gte('created_at', iso(since))
    .order('created_at', { ascending: true });

  if (error) throw new AppError(error.message, 500);

  const buckets: Record<string, Set<string>> = {};
  for (let i = 0; i < days; i += 1) {
    const d = daysAgoUtc(days - 1 - i);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = new Set();
  }

  for (const row of data || []) {
    const key = String(row.created_at).slice(0, 10);
    if (!buckets[key]) buckets[key] = new Set();
    buckets[key].add(row.visitor_id);
  }

  return Object.keys(buckets)
    .sort()
    .map((date) => ({
      date,
      visitors: buckets[date].size,
    }));
}

async function topContent(pageType: 'podcast' | 'blog', since: Date, limit = 8) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('page_views')
    .select('content_slug, content_title, content_id, visitor_id')
    .eq('page_type', pageType)
    .neq('content_slug', '')
    .gte('created_at', iso(since));

  if (error) throw new AppError(error.message, 500);

  const map = new Map<
    string,
    { slug: string; title: string; contentId: string | null; views: number; visitors: Set<string> }
  >();

  for (const row of data || []) {
    const slug = row.content_slug as string;
    if (!slug) continue;
    const existing = map.get(slug) || {
      slug,
      title: (row.content_title as string) || slug,
      contentId: (row.content_id as string) || null,
      views: 0,
      visitors: new Set<string>(),
    };
    existing.views += 1;
    if (row.visitor_id) existing.visitors.add(row.visitor_id as string);
    if (row.content_title) existing.title = row.content_title as string;
    map.set(slug, existing);
  }

  return [...map.values()]
    .map(({ slug, title, contentId, views, visitors }) => ({
      slug,
      title,
      contentId,
      views,
      visitors: visitors.size,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

export async function getAnalyticsOverview() {
  const today = startOfUtcDay();
  const week = daysAgoUtc(6);
  const month = daysAgoUtc(29);

  const [
    visitorsToday,
    visitorsWeek,
    visitorsMonth,
    viewsToday,
    viewsWeek,
    viewsMonth,
    daily,
    topPodcasts,
    topBlogs,
  ] = await Promise.all([
    uniqueVisitorsSince(today),
    uniqueVisitorsSince(week),
    uniqueVisitorsSince(month),
    totalViewsSince(today),
    totalViewsSince(week),
    totalViewsSince(month),
    dailySeries(14),
    topContent('podcast', month, 10),
    topContent('blog', month, 10),
  ]);

  return {
    visitors: {
      today: visitorsToday,
      week: visitorsWeek,
      month: visitorsMonth,
    },
    views: {
      today: viewsToday,
      week: viewsWeek,
      month: viewsMonth,
    },
    daily,
    topPodcasts,
    topBlogs,
  };
}
