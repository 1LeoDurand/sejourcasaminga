-- ============================================================================
-- Casa Minga — Photos + availabilities for 10 test personas
-- Idempotent. Run after seed_test_personas.sql.
-- Photos: Unsplash (free, no API key). Each place gets 3 images, each listing 2.
-- ============================================================================

-- ─── PHOTOS ──────────────────────────────────────────────────────────────────

-- 1 · Claire Mercier — Coopérative urbaine, Lyon
update public.places set
  image  = 'https://images.unsplash.com/photo-1555041469-4e4f753d2d2f?auto=format&fit=crop&w=800&q=80',
  images = array[
    'https://images.unsplash.com/photo-1555041469-4e4f753d2d2f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80'
  ]
where id = 'd1000000-0000-4000-8000-000000000001';

update public.listings set
  image  = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
  images = array[
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80'
  ]
where id = 'd2000000-0000-4000-8000-000000000001';

-- 2 · Thomas Lefèvre — Écolieu / Yourte, Ariège
update public.places set
  image  = 'https://images.unsplash.com/photo-1504233580560-4b736603d012?auto=format&fit=crop&w=800&q=80',
  images = array[
    'https://images.unsplash.com/photo-1504233580560-4b736603d012?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80'
  ]
where id = 'd1000000-0000-4000-8000-000000000002';

update public.listings set
  image  = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
  images = array[
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80'
  ]
where id = 'd2000000-0000-4000-8000-000000000002';

-- 3 · Yael Cohen — Kibboutz Lotan, Néguev
update public.places set
  image  = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
  images = array[
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1597220492609-4a0da74f0700?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80'
  ]
where id = 'd1000000-0000-4000-8000-000000000003';

update public.listings set
  image  = 'https://images.unsplash.com/photo-1597220492609-4a0da74f0700?auto=format&fit=crop&w=800&q=80',
  images = array[
    'https://images.unsplash.com/photo-1597220492609-4a0da74f0700?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80'
  ]
where id = 'd2000000-0000-4000-8000-000000000003';

-- 4 · Ananda Rivière — Auroville, Inde
update public.places set
  image  = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
  images = array[
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1540202404-a2f29016b523?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1548013141-4b5c3b2bde42?auto=format&fit=crop&w=800&q=80'
  ]
where id = 'd1000000-0000-4000-8000-000000000004';

update public.listings set
  image  = 'https://images.unsplash.com/photo-1540202404-a2f29016b523?auto=format&fit=crop&w=800&q=80',
  images = array[
    'https://images.unsplash.com/photo-1540202404-a2f29016b523?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80'
  ]
where id = 'd2000000-0000-4000-8000-000000000004';

-- 5 · Maëlle Le Goff — Kerterre, Crozon
update public.places set
  image  = 'https://images.unsplash.com/photo-1518684245543-cb9e6f8059f5?auto=format&fit=crop&w=800&q=80',
  images = array[
    'https://images.unsplash.com/photo-1518684245543-cb9e6f8059f5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1505142468610-359e7d316be0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800&q=80'
  ]
where id = 'd1000000-0000-4000-8000-000000000005';

update public.listings set
  image  = 'https://images.unsplash.com/photo-1518684245543-cb9e6f8059f5?auto=format&fit=crop&w=800&q=80',
  images = array[
    'https://images.unsplash.com/photo-1518684245543-cb9e6f8059f5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1505142468610-359e7d316be0?auto=format&fit=crop&w=800&q=80'
  ]
where id = 'd2000000-0000-4000-8000-000000000005';

-- 6 · Lars Nielsen — Cohousing, Copenhague
update public.places set
  image  = 'https://images.unsplash.com/photo-1560185127-6ed189af71e0?auto=format&fit=crop&w=800&q=80',
  images = array[
    'https://images.unsplash.com/photo-1560185127-6ed189af71e0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80'
  ]
where id = 'd1000000-0000-4000-8000-000000000006';

update public.listings set
  image  = 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
  images = array[
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
  ]
where id = 'd2000000-0000-4000-8000-000000000006';

-- 7 · Sophie Tremblay — Cabane en forêt, Québec
update public.places set
  image  = 'https://images.unsplash.com/photo-1449158743421-3e6a0e7f4e74?auto=format&fit=crop&w=800&q=80',
  images = array[
    'https://images.unsplash.com/photo-1449158743421-3e6a0e7f4e74?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80'
  ]
where id = 'd1000000-0000-4000-8000-000000000007';

update public.listings set
  image  = 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=800&q=80',
  images = array[
    'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80'
  ]
where id = 'd2000000-0000-4000-8000-000000000007';

-- 8 · Marc Dubois — Coopérative, Genève
update public.places set
  image  = 'https://images.unsplash.com/photo-1563089145-e38e1c52a84a?auto=format&fit=crop&w=800&q=80',
  images = array[
    'https://images.unsplash.com/photo-1563089145-e38e1c52a84a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'
  ]
where id = 'd1000000-0000-4000-8000-000000000008';

update public.listings set
  image  = 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80',
  images = array[
    'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1563089145-e38e1c52a84a?auto=format&fit=crop&w=800&q=80'
  ]
where id = 'd2000000-0000-4000-8000-000000000008';

-- 9 · Awa Diop — Écovillage, Sénégal
update public.places set
  image  = 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80',
  images = array[
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1530099486328-e021101a494a?auto=format&fit=crop&w=800&q=80'
  ]
where id = 'd1000000-0000-4000-8000-000000000009';

update public.listings set
  image  = 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
  images = array[
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80'
  ]
where id = 'd2000000-0000-4000-8000-000000000009';

-- 10 · João Almeida — Écovillage + roulotte, Portugal
update public.places set
  image  = 'https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=800&q=80',
  images = array[
    'https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1585208798174-6cedd4b41c7c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80'
  ]
where id = 'd1000000-0000-4000-8000-000000000010';

update public.listings set
  image  = 'https://images.unsplash.com/photo-1585208798174-6cedd4b41c7c?auto=format&fit=crop&w=800&q=80',
  images = array[
    'https://images.unsplash.com/photo-1585208798174-6cedd4b41c7c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=800&q=80'
  ]
where id = 'd2000000-0000-4000-8000-000000000010';

-- ─── AVAILABILITIES ───────────────────────────────────────────────────────────
-- 2-3 realistic periods per listing (summer + autumn 2026)
-- Mix of available / reciprocal_only

insert into public.availabilities (listing_id, start_date, end_date, status) values
-- 1 Claire — coop Lyon
('d2000000-0000-4000-8000-000000000001', '2026-06-15', '2026-06-30', 'available'),
('d2000000-0000-4000-8000-000000000001', '2026-07-14', '2026-08-10', 'reciprocal_only'),
('d2000000-0000-4000-8000-000000000001', '2026-09-01', '2026-09-30', 'available'),

-- 2 Thomas — yourte Ariège
('d2000000-0000-4000-8000-000000000002', '2026-06-20', '2026-07-31', 'available'),
('d2000000-0000-4000-8000-000000000002', '2026-08-15', '2026-09-15', 'available'),
('d2000000-0000-4000-8000-000000000002', '2026-10-01', '2026-10-31', 'reciprocal_only'),

-- 3 Yael — kibboutz Lotan
('d2000000-0000-4000-8000-000000000003', '2026-07-01', '2026-07-21', 'available'),
('d2000000-0000-4000-8000-000000000003', '2026-09-15', '2026-10-15', 'available'),

-- 4 Ananda — Auroville
('d2000000-0000-4000-8000-000000000004', '2026-06-01', '2026-06-30', 'available'),
('d2000000-0000-4000-8000-000000000004', '2026-10-01', '2026-11-30', 'available'),

-- 5 Maëlle — kerterre Crozon
('d2000000-0000-4000-8000-000000000005', '2026-06-21', '2026-07-05', 'available'),
('d2000000-0000-4000-8000-000000000005', '2026-07-20', '2026-08-20', 'reciprocal_only'),
('d2000000-0000-4000-8000-000000000005', '2026-08-25', '2026-09-20', 'available'),

-- 6 Lars — cohousing Copenhague
('d2000000-0000-4000-8000-000000000006', '2026-07-05', '2026-07-26', 'reciprocal_only'),
('d2000000-0000-4000-8000-000000000006', '2026-08-01', '2026-08-31', 'available'),

-- 7 Sophie — cabane Québec
('d2000000-0000-4000-8000-000000000007', '2026-06-15', '2026-07-15', 'available'),
('d2000000-0000-4000-8000-000000000007', '2026-08-01', '2026-09-07', 'available'),
('d2000000-0000-4000-8000-000000000007', '2026-09-20', '2026-10-12', 'reciprocal_only'),

-- 8 Marc — coop Genève
('d2000000-0000-4000-8000-000000000008', '2026-07-01', '2026-07-31', 'available'),
('d2000000-0000-4000-8000-000000000008', '2026-09-01', '2026-09-30', 'reciprocal_only'),

-- 9 Awa — écovillage Sénégal
('d2000000-0000-4000-8000-000000000009', '2026-06-01', '2026-07-15', 'available'),
('d2000000-0000-4000-8000-000000000009', '2026-10-01', '2026-11-15', 'available'),

-- 10 João — roulotte Portugal
('d2000000-0000-4000-8000-000000000010', '2026-06-15', '2026-07-31', 'available'),
('d2000000-0000-4000-8000-000000000010', '2026-09-01', '2026-10-15', 'reciprocal_only')

on conflict do nothing;
