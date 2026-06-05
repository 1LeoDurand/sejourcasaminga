-- ============================================================================
-- Casa Minga — 10 test persona accounts (real auth users, controllable via
-- the +alias inbox 1leodurand+<name>@gmail.com). Password: CasaTest2026!
-- Idempotent: re-running is safe (ON CONFLICT DO NOTHING / UPDATE).
-- ============================================================================

create temporary table tmp_personas (
  uid uuid, pid uuid, lid uuid, email text, full_name text,
  bio text, hosting_style text, langs text[], coll_exp text,
  pname text, ptype text, penv text, pcity text, pregion text, pcountry text,
  pinhab int, pshort text, pdesc text, pvalues text[], pvibe text, pslug text,
  ltitle text, ltype text, lrel text, lcap int, ldesc text,
  lhighlights text[], lrules text[], lslug text
) on commit drop;

insert into tmp_personas values
(
  'd0000000-0000-4000-8000-000000000001','d1000000-0000-4000-8000-000000000001','d2000000-0000-4000-8000-000000000001',
  '1leodurand+claire@gmail.com','Claire Mercier',
  'Architecte de 38 ans, j''ai co-fondé notre coopérative d''habitants au cœur de Lyon. Je crois aux villes plus douces, partagées et écologiques.',
  'Accueil chaleureux, repas partagés et découverte de la gouvernance coopérative.',
  ARRAY['Français','English'],'Co-fondatrice d''une coopérative urbaine depuis 7 ans.',
  'Le Toit Vertical','Coopérative d''habitants','Urbain','Lyon','Auvergne-Rhône-Alpes','France',
  35,'Coopérative d''habitants en plein cœur de Lyon, autogérée et écologique.',
  'Un immeuble coopératif autogéré de 35 habitant·es : buanderie commune, toit-terrasse potager, salle partagée et gouvernance sociocratique. Nous ouvrons régulièrement notre chambre d''amis aux curieux de l''habitat partagé urbain.',
  ARRAY['Gouvernance partagée','Écologie','Inclusion'],'balanced','le-toit-vertical',
  'Chambre d''amis du Toit Vertical','guest_room','collective_run',2,
  'Une chambre lumineuse au 4e étage, accès au toit-terrasse et aux espaces communs. Idéal pour découvrir la vie coopérative urbaine.',
  ARRAY['Toit-terrasse potager','Vie de quartier animée','Découverte de la sociocratie'],
  ARRAY['Non-fumeur','Participation au repas commun du jeudi appréciée'],'chambre-amis-toit-vertical'
),
(
  'd0000000-0000-4000-8000-000000000002','d1000000-0000-4000-8000-000000000002','d2000000-0000-4000-8000-000000000002',
  '1leodurand+thomas@gmail.com','Thomas Lefèvre',
  'Maraîcher en permaculture, 45 ans. J''ai quitté la ville pour fonder un écolieu en Ariège. Sobriété, low-tech et autonomie sont mon quotidien.',
  'Immersion dans la vie du lieu : jardin, four à pain, veillées.',
  ARRAY['Français'],'Fondateur d''un écolieu en permaculture depuis 10 ans.',
  'Écolieu des Sources','Écolieu','Rural','Foix','Occitanie','France',
  18,'Écolieu en permaculture niché dans les vallées ariégeoises.',
  'Sur 12 hectares, nous vivons en autonomie alimentaire partielle : maraîchage, verger, ruches et constructions low-tech. Hébergement en yourte traditionnelle au milieu des arbres.',
  ARRAY['Permaculture','Sobriété','Autonomie alimentaire','Low-tech'],'calm','ecolieu-des-sources',
  'Séjour immersif en yourte','immersion_stay','collective_supported',3,
  'Dormez en yourte et partagez nos journées : récolte, cuisine au feu de bois, et le silence des montagnes. Une vraie déconnexion.',
  ARRAY['Yourte tout confort','Autonomie alimentaire','Nuits étoilées sans pollution lumineuse'],
  ARRAY['Pas de réseau, c''est voulu','Participation aux tâches du jardin'],'sejour-yourte-ecolieu-sources'
),
(
  'd0000000-0000-4000-8000-000000000003','d1000000-0000-4000-8000-000000000003','d2000000-0000-4000-8000-000000000003',
  '1leodurand+yael@gmail.com','Yael Cohen',
  'Née sur un kibboutz, 33 ans, je vis aujourd''hui à Lotan, un kibboutz écologique du désert du Néguev. Je guide les visiteurs sur l''agriculture du désert.',
  'Vie communautaire complète : repas collectifs, travail partagé, construction en terre.',
  ARRAY['Français','English','עברית'],'Membre d''un kibboutz écologique depuis la naissance.',
  'Kibboutz Lotan','Communauté intentionnelle','Désert','Lotan','Néguev','Israël',
  150,'Kibboutz écologique pionnier de l''agriculture et de la construction durable au désert.',
  'Fondé sur les valeurs communautaires du kibboutz, Lotan est un laboratoire d''écologie du désert : maisons en terre-paille, traitement écologique de l''eau, agriculture régénérative et vie collective intense.',
  ARRAY['Agroécologie','Résilience','Éducation alternative'],'balanced','kibboutz-lotan',
  'Séjour participatif au kibboutz','immersion_stay','collective_run',4,
  'Vivez le kibboutz de l''intérieur : repas communs, ateliers de construction en terre et découverte de l''agriculture du désert. Une expérience collective unique.',
  ARRAY['Maisons en terre-paille','Agriculture du désert','Vie communautaire authentique'],
  ARRAY['Repas pris en commun','Participation à une demi-journée de travail collectif'],'sejour-kibboutz-lotan'
),
(
  'd0000000-0000-4000-8000-000000000004','d1000000-0000-4000-8000-000000000004','d2000000-0000-4000-8000-000000000004',
  '1leodurand+ananda@gmail.com','Ananda Rivière',
  'Française installée à Auroville depuis 20 ans, 50 ans. J''accompagne les visiteurs dans cette cité internationale dédiée à l''unité humaine.',
  'Accueil contemplatif, méditation et découverte d''Auroville.',
  ARRAY['Français','English'],'Résidente d''Auroville depuis 20 ans.',
  'Auroville — quartier Aspiration','Communauté intentionnelle','Tropical','Auroville','Tamil Nadu','Inde',
  3200,'Cité internationale expérimentale dédiée à l''unité humaine, au sud de l''Inde.',
  'Auroville rassemble plus de 3000 personnes de 50 nationalités autour d''un idéal d''unité humaine. Architecture organique, reforestation, économie de partage et recherche spirituelle laïque.',
  ARRAY['Spiritualité laïque','Écologie','Inclusion'],'calm','auroville-aspiration',
  'Chambre privée à Auroville','private_room','collective_run',2,
  'Une chambre paisible dans une maison communautaire, à deux pas du Matrimandir. Idéal pour un séjour de ressourcement et de découverte.',
  ARRAY['Cité internationale unique','Forêt reboisée','Recherche spirituelle laïque'],
  ARRAY['Lieu non-fumeur','Respect du calme et de la méditation'],'chambre-privee-auroville'
),
(
  'd0000000-0000-4000-8000-000000000005','d1000000-0000-4000-8000-000000000005','d2000000-0000-4000-8000-000000000005',
  '1leodurand+maelle@gmail.com','Maëlle Le Goff',
  'Artisane en éco-construction, 29 ans. J''ai bâti ma kerterre de mes mains sur la presqu''île de Crozon. La sobriété comme art de vivre.',
  'Hébergement intime dans un habitat léger autoconstruit, face à la mer.',
  ARRAY['Français'],'Autoconstructrice d''habitat léger.',
  'La Kerterre de la Pointe','Habitat léger','Littoral','Crozon','Bretagne','France',
  1,'Kerterre autoconstruite en chaux-chanvre face à l''océan, en presqu''île de Crozon.',
  'Une kerterre — petite construction organique en chaux et chanvre — posée dans la lande bretonne, à quelques pas des falaises. Habitat léger, doux et chaleureux, pensé pour la sobriété.',
  ARRAY['Sobriété','Low-tech','Bien-être'],'calm','kerterre-de-la-pointe',
  'Nuit en kerterre face à l''océan','hosted_stay','personal',2,
  'Dormez dans une kerterre unique, blottie dans la lande. Réveil au son des vagues, petit-déjeuner local et balades sur les sentiers côtiers.',
  ARRAY['Habitat léger autoconstruit','Vue sur la lande et l''océan','Sentiers côtiers à pied'],
  ARRAY['Toilettes sèches','Eau et électricité en autonomie'],'nuit-kerterre-crozon'
),
(
  'd0000000-0000-4000-8000-000000000006','d1000000-0000-4000-8000-000000000006','d2000000-0000-4000-8000-000000000006',
  '1leodurand+lars@gmail.com','Lars Nielsen',
  'Danois, 41 ans, papa de deux enfants. Je vis dans un cohousing près de Copenhague — le modèle d''origine du bofællesskab. Le collectif au service des familles.',
  'Échange de maison familiale au sein d''un cohousing danois.',
  ARRAY['Français','English','Dansk'],'Habitant d''un cohousing danois depuis 12 ans.',
  'Sættedammen Cohousing','Cohousing','Urbain','Copenhague','Hovedstaden','Danemark',
  80,'L''un des plus anciens cohousings du monde, berceau du modèle danois.',
  'Le cohousing danois (bofællesskab) invente la vie collective moderne depuis les années 70 : maisons privées, maison commune avec repas partagés plusieurs fois par semaine, gouvernance horizontale et entraide entre familles.',
  ARRAY['Famille','Gouvernance partagée','Écologie'],'balanced','saettedammen-cohousing',
  'Échange de notre maison familiale','home_exchange','known_by_collective',5,
  'Notre maison de 4 chambres dans un cohousing vivant, avec accès à la maison commune et ses dîners partagés. Parfait pour une famille curieuse du modèle danois.',
  ARRAY['Maison commune et repas partagés','Quartier piéton sûr pour les enfants','Modèle cohousing d''origine'],
  ARRAY['Échange réciproque souhaité','Vélos à disposition'],'echange-maison-saettedammen'
),
(
  'd0000000-0000-4000-8000-000000000007','d1000000-0000-4000-8000-000000000007','d2000000-0000-4000-8000-000000000007',
  '1leodurand+sophie@gmail.com','Sophie Tremblay',
  'Québécoise, 36 ans, amoureuse de la forêt. J''accueille dans ma cabane en bois rond au cœur des Cantons-de-l''Est. Slow life garantie.',
  'Accueil convivial à la cabane, feu de bois et nature.',
  ARRAY['Français','English'],'Hôtesse d''un habitat forestier autonome.',
  'La Cabane des Cantons','Habitat forestier','Forêt','Eastman','Québec','Canada',
  1,'Cabane en bois rond isolée dans la forêt québécoise des Cantons-de-l''Est.',
  'Une cabane en bois rond chauffée au poêle, perdue dans 20 acres de forêt. Lac à proximité, sentiers de randonnée et observation de la faune. Le calme absolu à la québécoise.',
  ARRAY['Résilience','Bien-être','Autonomie'],'calm','la-cabane-des-cantons',
  'Séjour à la cabane en forêt','hosted_stay','personal',2,
  'Déconnexion totale dans une cabane en bois rond : poêle à bois, lac pour la baignade, et le chant des huards au crépuscule. Bienvenue au Québec.',
  ARRAY['Cabane chauffée au poêle à bois','Lac et forêt privés','Observation de la faune'],
  ARRAY['Accès en voiture conseillé','Gestion du feu de bois expliquée à l''arrivée'],'sejour-cabane-cantons'
),
(
  'd0000000-0000-4000-8000-000000000008','d1000000-0000-4000-8000-000000000008','d2000000-0000-4000-8000-000000000008',
  '1leodurand+marc@gmail.com','Marc Dubois',
  'Suisse, 52 ans, retraité actif. Je vis dans une coopérative d''habitants à Genève. Convaincu que l''habitat coopératif est un modèle d''avenir, surtout pour les seniors.',
  'Accueil posé, échanges sur le modèle coopératif suisse.',
  ARRAY['Français','Deutsch'],'Membre d''une coopérative d''habitants genevoise.',
  'Coopérative de la Jonction','Coopérative d''habitants','Urbain','Genève','Genève','Suisse',
  40,'Coopérative d''habitants intergénérationnelle au bord du Rhône, à Genève.',
  'Inspirée du modèle coopératif suisse, notre maison accueille 40 habitant·es de tous âges : appartements privés, jardin partagé, atelier de bricolage et belle mixité intergénérationnelle.',
  ARRAY['Gouvernance partagée','Seniors','Inclusion'],'balanced','cooperative-de-la-jonction',
  'Chambre privée en coopérative','private_room','collective_supported',2,
  'Une chambre confortable dans un appartement coopératif, avec accès au jardin partagé et à la vie de la maison. Idéal pour découvrir le modèle suisse.',
  ARRAY['Coopérative intergénérationnelle','Au bord du Rhône','Jardin partagé'],
  ARRAY['Non-fumeur','Accès facile en transports'],'chambre-cooperative-jonction'
),
(
  'd0000000-0000-4000-8000-000000000009','d1000000-0000-4000-8000-000000000009','d2000000-0000-4000-8000-000000000009',
  '1leodurand+awa@gmail.com','Awa Diop',
  'Sénégalaise, 34 ans, animatrice d''un écovillage du réseau GEN. Je transmets les savoir-faire de construction en terre et l''agroécologie sahélienne.',
  'Immersion festive et participative dans la vie de l''écovillage.',
  ARRAY['Français','Wolof'],'Animatrice d''un écovillage du réseau GEN Afrique.',
  'Écovillage de Mbackombel','Écovillage','Rural','Mbackombel','Thiès','Sénégal',
  60,'Écovillage sénégalais du réseau GEN, pionnier de l''agroécologie sahélienne.',
  'Membre du Réseau Mondial des Écovillages (GEN), Mbackombel allie cases traditionnelles en terre crue, reforestation, jardins agroécologiques et une vie communautaire rythmée par les chants et les fêtes.',
  ARRAY['Agroécologie','Autonomie alimentaire','Éducation alternative'],'festive','ecovillage-mbackombel',
  'Immersion en case de terre','immersion_stay','collective_run',6,
  'Logez dans une case traditionnelle en terre crue et partagez la vie de l''écovillage : champs, ateliers de construction, cuisine sénégalaise et soirées musicales.',
  ARRAY['Case en terre crue traditionnelle','Agroécologie sahélienne','Soirées chants et percussions'],
  ARRAY['Repas partagés en commun','Participation aux activités du village'],'immersion-case-mbackombel'
),
(
  'd0000000-0000-4000-8000-000000000010','d1000000-0000-4000-8000-000000000010','d2000000-0000-4000-8000-000000000010',
  '1leodurand+joao@gmail.com','João Almeida',
  'Portugais, 47 ans, ex-ingénieur reconverti en écovillage de l''Alentejo. Je vis en roulotte et accompagne les projets de permaculture.',
  'Accueil en habitat léger, ateliers de permaculture.',
  ARRAY['Français','Português','English'],'Habitant d''un écovillage portugais depuis 8 ans.',
  'Aldeia da Terra','Écovillage','Rural','Odemira','Alentejo','Portugal',
  25,'Écovillage de permaculture dans les collines préservées de l''Alentejo.',
  'Dans l''Alentejo sauvage, notre écovillage expérimente la permaculture, la gestion de l''eau en climat sec et l''habitat léger. Roulottes, tiny houses et constructions naturelles au milieu des chênes-lièges.',
  ARRAY['Permaculture','Spiritualité laïque','Résilience'],'balanced','aldeia-da-terra',
  'Séjour en roulotte à l''écovillage','immersion_stay','collective_supported',2,
  'Une roulotte rénovée avec goût au milieu des oliviers, et la vie de l''écovillage à partager : ateliers de permaculture, repas végétariens et couchers de soleil sur l''Alentejo.',
  ARRAY['Roulotte cosy en pleine nature','Ateliers de permaculture','Couchers de soleil sur l''Alentejo'],
  ARRAY['Habitat léger (toilettes sèches)','Repas végétariens partagés'],'sejour-roulotte-aldeia-terra'
);

-- 1) Auth users (password CasaTest2026!, email pre-confirmed)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
select
  '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
  email, extensions.crypt('CasaTest2026!', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', full_name),
  now(), now()
from tmp_personas
on conflict (id) do nothing;

-- 2) Auth identities (email provider) so login works cleanly
insert into auth.identities (
  provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id
)
select
  uid::text, uid,
  jsonb_build_object('sub', uid::text, 'email', email, 'email_verified', true, 'phone_verified', false),
  'email', now(), now(), now(), gen_random_uuid()
from tmp_personas
on conflict do nothing;

-- 3) Enrich profiles (auto-created by handle_new_user trigger)
update public.profiles p set
  display_name = t.full_name,
  bio = t.bio,
  hosting_style = t.hosting_style,
  languages = t.langs,
  collective_experience = t.coll_exp,
  newsletter_opt_in = false
from tmp_personas t
where p.user_id = t.uid;

-- 4) Places (the habitat of each persona)
insert into public.places (
  id, created_by, name, type, environment_type, city, region, country,
  inhabitants, short_desc, description, values, vibe, participatory_stay,
  published, is_visible, contact_enabled, claim_status, claimed_by_user_id,
  hosting_style, slug
)
select
  pid, uid, pname, ptype, penv, pcity, pregion, pcountry,
  pinhab, pshort, pdesc, pvalues, pvibe, true,
  true, true, true, 'claimed', uid,
  hosting_style, pslug
from tmp_personas
on conflict (id) do nothing;

-- 5) Listings (the stay each persona offers)
insert into public.listings (
  id, host_id, place_id, title, description, listing_type, collective_relationship,
  capacity, published, available, highlights, practical_rules, slug
)
select
  lid, uid, pid, ltitle, ldesc, ltype::listing_type, lrel::collective_relationship,
  lcap, true, true, lhighlights, lrules, lslug
from tmp_personas
on conflict (id) do nothing;
