-- Seed content matching Figma sample copy
-- Run after schema.sql (and after creating an admin via npm run seed:admin)

insert into categories (name, slug, type) values
  ('AI Research', 'ai-research', 'blog'),
  ('Global Networks', 'global-networks', 'blog'),
  ('Guest Post', 'guest-post', 'blog'),
  ('Tech & Leadership', 'tech-leadership', 'podcast'),
  ('Market Research', 'market-research', 'podcast')
on conflict (slug) do nothing;

insert into page_settings (key, value) values
  ('home_hero', '{"title":"Where Expert Conversations Become Community","subtitle":"Discover expert insights through podcasts, connect with a global community, and join events that inspire meaningful conversations and lasting connections.","videoTitle":"Why Market Research & UX Research Are Finally Converging."}'::jsonb),
  ('community', '{"title":"The DeskTalk community is growing!","body":"Join researchers, leaders, and innovators sharing insights that shape the future of tech and business.","cta":"Join our Community"}'::jsonb),
  ('podcasts_hero', '{"title":"Listen to the voices shaping the Future of Tech & leadership."}'::jsonb),
  ('about_hero', '{"title":"Where Tech comes More New Technology Is Disrupting Business","visionTitle":"Our Vision","visionBody":"We bring expert conversations to a global community of leaders and innovators.","whatWeDoTitle":"What We Do","whatWeDoBody":"DeskTalks produces podcasts, blogs, and community events focused on AI, research, and leadership."}'::jsonb),
  ('privacy', '{"title":"Desktalks Privacy Policy","body":"Welcome to Desk Talks, operated by The Insights Desk. This Privacy Policy explains our practices concerning the collection, use, and disclosure of personal information when you use our Service. Your privacy is important to us. By accessing or using Desk Talks, you agree to the practices outlined in this Privacy Policy. Contact: request@theinsightsdesk.com"}'::jsonb),
  ('footer', '{"copyright":"© 2026 DeskTalks. All rights reserved.","social":{"youtube":"#","linkedin":"#","instagram":"#","x":"#"}}'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();

insert into partners (name, logo_url, sort_order) values
  ('Google', '', 1),
  ('Microsoft', '', 2),
  ('ServiceNow', '', 3),
  ('Martec', '', 4),
  ('Adobe', '', 5),
  ('IBM', '', 6),
  ('Walmart', '', 7),
  ('Gallagher', '', 8)
on conflict do nothing;

insert into team_members (name, role, bio, photo_url, sort_order) values
  ('Alex Morgan', 'Founder', 'Building conversations that connect research and leadership.', '', 1),
  ('Jordan Lee', 'Producer', 'Crafting stories from industry experts worldwide.', '', 2),
  ('Sam Rivera', 'Editor', 'Turning insights into clear, actionable content.', '', 3)
on conflict do nothing;

-- Sample podcasts (update thumbnail/video URLs via admin after B2 upload)
insert into podcasts (
  title, slug, summary, description, rating, host_name, guest_name, published, published_at, sort_order, category_id
)
select
  'Proving Business Value in the Age of AI',
  'proving-business-value-in-the-age-of-ai',
  'How leaders measure ROI when AI transforms research and product.',
  'A deep dive into proving business value with AI-driven insights, featuring practical frameworks for research and leadership teams.',
  4.8,
  'Alex Morgan',
  'Industry Guest',
  true,
  now(),
  1,
  c.id
from categories c where c.slug = 'tech-leadership'
on conflict (slug) do nothing;

insert into podcasts (
  title, slug, summary, description, rating, host_name, guest_name, published, published_at, sort_order, category_id
)
select
  'Why Market Research & UX Research Are Finally Converging',
  'market-research-ux-research-converging',
  'The lines between market and UX research are disappearing.',
  'Experts discuss why market research and UX research are converging — and what it means for teams.',
  4.7,
  'Alex Morgan',
  'Research Lead',
  true,
  now(),
  2,
  c.id
from categories c where c.slug = 'market-research'
on conflict (slug) do nothing;

insert into blogs (
  title, slug, excerpt, body, author_name, published, published_at, category_id
)
select
  'AI Is Transforming Research Faster Than Ever: 5 Key Takeaways',
  'ai-transforming-research-5-key-takeaways',
  'At IIEX Europe 2026, AI wasn''t the future of market research. It was the present.',
  '<p>At IIEX Europe 2026, AI wasn''t the future of market research. It was the present. From keynote sessions to conversations across the exhibition floor, one theme was clear: teams that adopt AI thoughtfully will move faster without losing rigor.</p><p>Here are five takeaways for leaders building research practices in the age of AI.</p>',
  'Desktalk Editorial',
  true,
  now(),
  c.id
from categories c where c.slug = 'ai-research'
on conflict (slug) do nothing;

insert into blogs (
  title, slug, excerpt, body, author_name, published, published_at, category_id
)
select
  'Beyond Dashboards - Why Research Is More Than Metrics',
  'beyond-dashboards-research-more-than-metrics',
  'Metrics matter — but stories and context turn data into decisions.',
  '<p>Dashboards alone rarely change behavior. The best research programs pair numbers with narrative, stakeholder workshops, and clear next steps.</p>',
  'Desktalk Editorial',
  true,
  now(),
  c.id
from categories c where c.slug = 'global-networks'
on conflict (slug) do nothing;
