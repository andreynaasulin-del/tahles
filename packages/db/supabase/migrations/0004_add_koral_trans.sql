-- Remove Sugar Baby category from frontend (keep DB row for historical data)
-- Add Koral trans profile

-- Get system user for foreign key
DO $$
DECLARE
  sys_user_id uuid;
  koral_ad_id uuid := '279dc2d0-4840-40d6-a8b4-4830352f21bf';
  trans_cat_id uuid;
BEGIN
  -- Get first user as system user
  SELECT id INTO sys_user_id FROM public.users LIMIT 1;
  IF sys_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found — cannot insert ad';
  END IF;

  -- Get trans category ID
  SELECT id INTO trans_cat_id FROM public.categories WHERE slug = 'trans';

  -- Insert Koral advertisement
  INSERT INTO public.advertisements (
    id, user_id, nickname, description, age, verified, vip_status,
    service_type, gender, city, photos, source, source_id,
    online_status, raw_data, created_at, updated_at
  ) VALUES (
    koral_ad_id,
    sys_user_id,
    'Koral',
    'טרנסית שווה לעכשיו בת״א | דירה פרטית | דיסקרטיות מלאה. מארחת למפגש באווירה מעניינת נעימה ורגועה. פינוק מלא בהבטחה והתאמה אישית עם הניסיון שיביא אותך לתוצאות והתחושות הטובות ביותר. אוהבת גם סטלה ולהנות. לתיאום ופרטים רק בנייד. נפגשת רק לאחר אימות בוידאו או תמונה.',
    28,
    false,
    false,
    'both',
    'trans',
    'Tel Aviv',
    '{}',
    'manual',
    'koral-trans-01',
    false,
    jsonb_build_object(
      '_verified', 'true',
      '_category', 'trans',
      '_ethnicity', null,
      '_score', 0,
      '_score_category', null,
      '_address', 'Tel Aviv',
      'contacts', jsonb_build_object(
        'phone', '+972539635925',
        'whatsapp', '+972539635925',
        'telegram', '@KORALTRANS'
      )
    ),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    nickname = EXCLUDED.nickname,
    description = EXCLUDED.description,
    raw_data = EXCLUDED.raw_data,
    updated_at = now();

  -- Insert contacts
  INSERT INTO public.contacts (ad_id, phone, whatsapp, telegram_username)
  VALUES (koral_ad_id, '+972539635925', '+972539635925', '@KORALTRANS')
  ON CONFLICT (ad_id) DO UPDATE SET
    phone = EXCLUDED.phone,
    whatsapp = EXCLUDED.whatsapp,
    telegram_username = EXCLUDED.telegram_username;

  -- Link to trans category
  IF trans_cat_id IS NOT NULL THEN
    INSERT INTO public.ad_categories (ad_id, category_id)
    VALUES (koral_ad_id, trans_cat_id)
    ON CONFLICT DO NOTHING;
  END IF;

END $$;
