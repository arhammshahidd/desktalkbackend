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
  ('home_hero', '{"title":"Where Expert Conversations Become Community","subtitle":"Discover expert insights through podcasts, connect with a global community, and join events that inspire meaningful conversations and lasting connections.","videoTitle":"Why Market Research & UX Research Are Finally Converging.","youtubeUrl":"","videoThumbnail":""}'::jsonb),
  ('community', '{"title":"The DeskTalk community is growing!","body":"Join researchers, leaders, and innovators sharing insights that shape the future of tech and business.","cta":"Join our Community","people1":"","people2":"","people3":"","people4":"","people5":"","people6":"","people7":""}'::jsonb),
  ('podcasts_hero', '{"title":"Listen to the voices shaping the Future of Tech & leadership."}'::jsonb),
  ('about_hero', '{"title":"Where Tech Leaders Share How Technology Is Disrupting Business","capsule1":"","capsule2":"","capsule3":"","capsule4":"","capsule5":"","visionTitle":"Our Vision","visionBody":"We bring expert conversations to a global community of leaders and innovators.","visionImage":"","whatWeDoTitle":"What We Do","whatWeDoBody":"DeskTalks produces podcasts, blogs, and community events focused on AI, research, and leadership.","whatWeDoImage":"","quoteText":"We host technology leaders across startups and Fortune 500 companies as they share real-world experiences, bold ideas, and insights on how technology is transforming industries, reshaping businesses, and creating what is next.","quoteName":"Michael Dorman","quoteRole":"Design Leader at Microsoft.","quoteImage":""}'::jsonb),
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
  title, slug, excerpt, body, author_name, author_role, author_linkedin, faq, published, published_at, category_id
)
select
  'AI Is Transforming Research Faster Than Ever: 5 Key Takeaways',
  'ai-transforming-research-5-key-takeaways',
  'At IIEX Europe 2026, AI wasn''t the future of market research. It was the present.',
  $body$
<p>At IIEX Europe 2026, AI wasn't the future of market research. It was the present. From keynote sessions to conversations across the exhibition floor, one thing became clear: the industry has moved beyond asking whether AI belongs in research. The focus has shifted to a much bigger question. How do we use AI to produce research that is not only faster, but more meaningful, reliable, and actionable? Here are five key takeaways from this year's event.</p>
<h2>The Future Isn't AI vs. Researchers. It's AI with Researchers.</h2>
<p>One of the strongest messages throughout IIEX Europe was that AI works best when it complements human expertise. Researchers are using AI to summarize interviews, analyze large datasets, identify patterns, and automate repetitive tasks. This creates more time for what technology cannot replicate: asking better questions, understanding context, challenging assumptions, and uncovering the <strong>why</strong> behind consumer behavior.</p>
<h2>Faster Insights Don't Always Mean Better Insights</h2>
<p>AI has dramatically reduced the time it takes to process information, but speed alone doesn't create value. Several speakers emphasized that AI-generated insights still require human validation. Without careful review, AI can present incomplete or misleading conclusions.</p>
<h2>Responsible AI Is Becoming a Business Requirement</h2>
<p>As organizations adopt AI at scale, the advantage won't come from getting answers first. It will come from knowing which answers can actually be trusted. Responsible AI practices — transparency, auditability, and human oversight — are becoming table stakes.</p>
<h2>Looking Ahead</h2>
<p>The teams that win will pair automation with judgment. Use AI to accelerate the work, then invest the freed capacity in deeper questioning, stakeholder alignment, and decisions that stick.</p>
$body$,
  'Michael John',
  'Director AI Research, Confiz',
  'https://www.linkedin.com',
  '[
    {"question":"How is AI changing market research?","answer":"AI is speeding up tasks like data analysis, reporting, and insight generation, allowing researchers to deliver findings much faster."},
    {"question":"Will AI replace researchers?","answer":"No. AI works best alongside human expertise — automating repetitive work so researchers can focus on judgment, context, and the why behind behavior."},
    {"question":"Why is trust important when using AI in research?","answer":"Speed without validation can produce incomplete conclusions. Trust comes from human review, responsible AI practices, and knowing which answers are reliable."}
  ]'::jsonb,
  true,
  now(),
  c.id
from categories c where c.slug = 'ai-research'
on conflict (slug) do update set
  body = excluded.body,
  author_name = excluded.author_name,
  author_role = excluded.author_role,
  author_linkedin = excluded.author_linkedin,
  faq = excluded.faq,
  updated_at = now();

insert into blogs (
  title, slug, excerpt, body, author_name, author_role, faq, published, published_at, category_id
)
select
  'Beyond Dashboards - Why Research Is More Than Metrics',
  'beyond-dashboards-research-more-than-metrics',
  'Metrics matter — but stories and context turn data into decisions.',
  $body$
<p>Dashboards alone rarely change behavior. The best research programs pair numbers with narrative, stakeholder workshops, and clear next steps.</p>
<h2>Why Metrics Alone Fall Short</h2>
<p>Numbers show <strong>what</strong> happened. Without context, they rarely explain <em>why</em> — or what to do next.</p>
<h2>Building Decision-Ready Insights</h2>
<p>Pair dashboards with workshops, stories, and prioritized recommendations so teams can act with confidence.</p>
$body$,
  'Desktalk Editorial',
  'Research Editor',
  '[
    {"question":"Are dashboards still useful?","answer":"Yes — as one input. They work best when paired with narrative and clear next steps."}
  ]'::jsonb,
  true,
  now(),
  c.id
from categories c where c.slug = 'global-networks'
on conflict (slug) do update set
  body = excluded.body,
  author_role = excluded.author_role,
  faq = excluded.faq,
  updated_at = now();

