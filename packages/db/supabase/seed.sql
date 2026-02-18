-- Seed: categories
insert into public.categories (name, slug) values
  ('Massage',     'massage'),
  ('Dating Only', 'dating'),
  ('Sugar Baby',  'sugar-baby'),
  ('Domina',      'domina'),
  ('Individual',  'individual'),
  ('Trans',       'trans')
on conflict (slug) do nothing;
