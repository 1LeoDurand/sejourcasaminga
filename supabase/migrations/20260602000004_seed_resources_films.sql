-- Migration: seed_resources_films
-- Catégorie Ressources > Films & Documentaires (remplace l'ancien seed blog)
-- La Belle Verte = type 'film' ; les 9 autres = type 'documentaire'
-- Idempotent : ON CONFLICT (slug) DO NOTHING
-- Affiches : CDN TMDB (image.tmdb.org)
-- Champs texte en dollar-quoting -> apostrophes simples, pas d'echappement
-- external_link laisse a NULL (a renseigner via l'admin Ressources si souhaite)

insert into public.resources
  (slug, title, description, type, author_or_director, year, cover_image, tags, is_published, created_at)
values

-- 1. Demain
(
  'demain',
  $t$Demain$t$,
  $d$Le documentaire culte (Cesar 2016) de Cyril Dion et Melanie Laurent part a la rencontre de celles et ceux qui inventent deja le monde d'apres : agriculture urbaine, monnaies locales, energies renouvelables, democratie directe. Une bouffee d'espoir qui rappelle qu'on agit mieux a plusieurs, a l'echelle d'un quartier ou d'un collectif.$d$,
  'documentaire',
  $a$Cyril Dion, Melanie Laurent$a$,
  2015,
  'https://image.tmdb.org/t/p/w780/tbULVqeSieoRrqkNkie7ZZfZLZ8.jpg',
  ARRAY['transition','ecologie','solutions'],
  true,
  now() - interval '1 day'
),

-- 2. Qu'est-ce qu'on attend ?
(
  'qu-est-ce-qu-on-attend',
  $t$Qu'est-ce qu'on attend ?$t$,
  $d$Marie-Monique Robin filme Ungersheim, village alsacien de 2 200 habitants engage dans 21 actions concretes de transition : monnaie locale, cantine bio autonome, energie solaire, eco-hameau. L'habitat participatif passe a l'echelle d'un village entier.$d$,
  'documentaire',
  $a$Marie-Monique Robin$a$,
  2016,
  'https://image.tmdb.org/t/p/w780/6TImtJqu3SM1j4FtDhANrZlINpc.jpg',
  ARRAY['transition','commune','autonomie'],
  true,
  now() - interval '2 days'
),

-- 3. En quete de sens
(
  'en-quete-de-sens',
  $t$En quete de sens$t$,
  $d$Deux amis d'enfance quittent tout pour comprendre comment notre rapport au monde s'est deregle. Un road-movie philosophique qui met des mots sur le basculement interieur menant souvent vers des projets de vie plus collectifs et plus sobres.$d$,
  'documentaire',
  $a$Nathanael Coste, Marc de la Menardiere$a$,
  2015,
  'https://image.tmdb.org/t/p/w780/vtcpDX2UXJOngJePltHdkIOKTIZ.jpg',
  ARRAY['sens','philosophie','vivant'],
  true,
  now() - interval '3 days'
),

-- 4. L'Eveil de la permaculture
(
  'eveil-de-la-permaculture',
  $t$L'Eveil de la permaculture$t$,
  $d$Bien plus qu'une facon de jardiner : la permaculture comme philosophie de vie. A travers le portrait de praticiens, le film d'Adrien Bellay revele une ethique - prendre soin de la Terre, prendre soin des humains, partager - qui fait aussi tenir un collectif dans la duree.$d$,
  'documentaire',
  $a$Adrien Bellay$a$,
  2017,
  'https://image.tmdb.org/t/p/w780/tsboMfcSqAAT6hv789OHhSP53e3.jpg',
  ARRAY['permaculture','jardin','ethique'],
  true,
  now() - interval '4 days'
),

-- 5. Solutions locales pour un desordre global
(
  'solutions-locales-pour-un-desordre-global',
  $t$Solutions locales pour un desordre global$t$,
  $d$Coline Serreau donne la parole a des agriculteurs et penseurs qui reinventent notre rapport au sol - avec Pierre Rabhi et Vandana Shiva. Au-dela de la critique de l'agriculture industrielle, des alternatives concretes qui fonctionnent ici et maintenant.$d$,
  'documentaire',
  $a$Coline Serreau$a$,
  2010,
  'https://image.tmdb.org/t/p/w780/2zo5jagp4pGyJz8N1jTKb2KmOFH.jpg',
  ARRAY['agriculture','sol','alternatives'],
  true,
  now() - interval '5 days'
),

-- 6. The Biggest Little Farm
(
  'the-biggest-little-farm',
  $t$The Biggest Little Farm$t$,
  $d$John et Molly Chester transforment 80 hectares de sol epuise en ferme regenerative foisonnante de vie. Filme sur huit ans, un documentaire magnifique sur la patience : restaurer un sol, comme batir une communaute, ne se fait jamais dans l'urgence.$d$,
  'documentaire',
  $a$John Chester$a$,
  2018,
  'https://image.tmdb.org/t/p/w780/bSeX2N4tGnqgF6WSNRIIVjV4Z3c.jpg',
  ARRAY['ferme','regeneration','patience'],
  true,
  now() - interval '6 days'
),

-- 7. A Simpler Way: Crisis as Opportunity
(
  'a-simpler-way',
  $t$A Simpler Way: Crisis as Opportunity$t$,
  $d$En Australie, une communaute se rassemble un an pour experimenter la sobriete heureuse : tiny houses, potagers, vie partagee. Sans filtre, la beaute mais aussi les defis tres concrets de la vie en collectif. Disponible gratuitement en ligne (Happen Films).$d$,
  'documentaire',
  $a$Jordan Osmond, Samuel Alexander$a$,
  2016,
  'https://image.tmdb.org/t/p/w780/scuFBZmFUWKICkjgdLxHJUvEdto.jpg',
  ARRAY['sobriete','communaute','tinyhouse'],
  true,
  now() - interval '7 days'
),

-- 8. Within Reach
(
  'within-reach',
  $t$Within Reach$t$,
  $d$Un jeune couple traverse les Etats-Unis a velo, d'ecovillage en communaute intentionnelle, en quete d'un lieu ou poser ses valises. Un road-movie inspirant qui montre qu'il n'existe pas une seule bonne facon de vivre ensemble.$d$,
  'documentaire',
  $a$Mandy Creighton, Ryan Mlynarczyk$a$,
  2013,
  'https://image.tmdb.org/t/p/w780/1KhAuUaUfZ3LwkBU3KV884ELEQJ.jpg',
  ARRAY['ecovillage','voyage','communaute'],
  true,
  now() - interval '8 days'
),

-- 9. Nul homme n'est une ile
(
  'nul-homme-n-est-une-ile',
  $t$Nul homme n'est une ile$t$,
  $d$De la Mediterranee aux Alpes, Dominique Marchais rencontre agriculteurs en cooperative, architectes et elus qui font vivre la democratie au plus pres du terrain. Une reflexion fine sur la gouvernance, au coeur de tout habitat participatif.$d$,
  'documentaire',
  $a$Dominique Marchais$a$,
  2018,
  'https://image.tmdb.org/t/p/w780/aTsfDOSmOO2YvGJnRgYXmCY8OTz.jpg',
  ARRAY['democratie','gouvernance','territoire'],
  true,
  now() - interval '9 days'
),

-- 10. La Belle Verte (seul FILM de fiction)
(
  'la-belle-verte',
  $t$La Belle Verte$t$,
  $d$Une habitante d'une planete ideale, liberee du consumerisme, vient visiter la Terre. Sous ses airs de comedie, une veritable utopie ecologiste - sobriete, entraide, lien au vivant - devenue culte car elle met en images un imaginaire desirable du vivre autrement. De Coline Serreau.$d$,
  'film',
  $a$Coline Serreau$a$,
  1996,
  'https://image.tmdb.org/t/p/w780/vy6J1RJEuQ4W2NZUN8GJKsqKAjW.jpg',
  ARRAY['utopie','comedie','ecologie'],
  true,
  now() - interval '10 days'
)

on conflict (slug) do nothing;
