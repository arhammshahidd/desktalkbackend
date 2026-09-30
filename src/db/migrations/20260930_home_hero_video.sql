-- Ensure home_hero page settings include YouTube URL + thumbnail fields
update page_settings
set
  value = coalesce(value, '{}'::jsonb) || jsonb_build_object(
    'youtubeUrl', coalesce(value->>'youtubeUrl', ''),
    'videoThumbnail', coalesce(value->>'videoThumbnail', ''),
    'videoTitle', coalesce(value->>'videoTitle', 'Why Market Research & UX Research Are Finally Converging.')
  ),
  updated_at = now()
where key = 'home_hero';
