-- Migration: resources_content
-- Ajoute une colonne `content` (HTML riche) a la table resources
-- et remplit les fiches Films & Documentaires (texte editorial complet).
-- Idempotent : ADD COLUMN IF NOT EXISTS + UPDATE par slug.
-- Apostrophes FR via dollar-quoting $c$...$c$

alter table public.resources add column if not exists content text;

update public.resources set content = $c$<p>Et si, au lieu de subir l'effondrement annoncé, on allait filmer celles et ceux qui construisent déjà autre chose ? C'est le pari de <em>Demain</em>, devenu en quelques années le documentaire de référence de toute une génération.</p>
<h2>De quoi ça parle</h2>
<p>Partis d'une étude alarmante sur l'avenir de l'humanité, Cyril Dion et Mélanie Laurent traversent dix pays pour enquêter, non pas sur les catastrophes, mais sur les solutions concrètes déjà à l'œuvre : agriculture urbaine, monnaies locales, énergies renouvelables, démocratie directe, éducation alternative. Le film a reçu le César du meilleur documentaire en 2016.</p>
<h2>Pourquoi ça résonne avec l'habitat participatif</h2>
<p>Ce qui frappe dans <em>Demain</em>, c'est que toutes les solutions montrées reposent sur la même intuition : on agit mieux à plusieurs, à l'échelle d'un quartier, d'une commune, d'un collectif. C'est exactement la logique des écolieux et des habitats participatifs — relocaliser le pouvoir d'agir, retrouver le lien et faire de la coopération un mode de vie plutôt qu'une exception.</p>
<h2>Où le voir</h2>
<p>Disponible en VOD à la location ou à l'achat sur les principales plateformes françaises, et édité en DVD par ARTE Éditions. Les disponibilités en streaming évoluent : vérifiez selon votre région au moment de regarder.</p>$c$ where slug = 'demain';

update public.resources set content = $c$<p>Une petite commune alsacienne peut-elle vraiment réduire son empreinte écologique tout en renforçant le lien entre habitants ? Ungersheim l'a fait — et Marie-Monique Robin est allée le filmer.</p>
<h2>De quoi ça parle</h2>
<p>Le documentaire suit Ungersheim, 2 200 habitants, qui s'est lancé dans un programme de transition baptisé « 21 actions pour le 21e siècle ». Monnaie locale, cantine bio et autonome, énergie solaire, régie agricole communale, éco-hameau : le film montre concrètement comment une collectivité réorganise son quotidien autour de la résilience et de la démocratie participative.</p>
<h2>Pourquoi ça résonne avec l'habitat participatif</h2>
<p>Ungersheim, c'est l'habitat participatif passé à l'échelle d'un village. On y retrouve tout ce qui fait la force des écolieux : décisions prises collectivement, mutualisation des ressources, autonomie alimentaire et énergétique. Le film rappelle qu'un projet collectif ambitieux ne tient pas à une technologie, mais à la volonté des gens de faire ensemble.</p>
<h2>Où le voir</h2>
<p>Disponible en VOD sur plusieurs plateformes françaises et édité en DVD. Le film circule aussi beaucoup en projections-débats organisées par des associations de transition.</p>$c$ where slug = 'qu-est-ce-qu-on-attend';

update public.resources set content = $c$<p>Que se passe-t-il quand deux amis d'enfance décident de tout plaquer pour aller poser, aux quatre coins du monde, la plus simple des questions : qu'est-ce qui donne du sens à nos vies ?</p>
<h2>De quoi ça parle</h2>
<p>Nathanaël Coste et Marc de la Ménardière partent à la rencontre de penseurs, scientifiques et activistes — d'un biologiste cellulaire à un jardinier urbain en passant par des sages. Ce road-movie philosophique interroge notre vision du monde, notre rapport à la nature et au vivant, et cherche des pistes pour réinventer notre manière d'habiter la Terre.</p>
<h2>Pourquoi ça résonne avec l'habitat participatif</h2>
<p>Avant de changer ses murs, on change souvent son regard. C'est précisément le déclic que beaucoup d'habitants d'écolieux décrivent : un basculement intérieur qui pousse à chercher plus de cohérence entre ses valeurs et son quotidien. <em>En quête de sens</em> met des mots sur ce cheminement qui mène, souvent, vers des projets de vie plus collectifs et plus sobres.</p>
<h2>Où le voir</h2>
<p>Les réalisateurs ont fait le choix de la diffusion à participation libre : le film est visible en streaming sur son site officiel, et également proposé en VOD sur certaines plateformes.</p>$c$ where slug = 'en-quete-de-sens';

update public.resources set content = $c$<p>La permaculture, ce n'est pas une technique de jardinage de plus. C'est une manière de penser nos relations au vivant — et, par extension, entre nous.</p>
<h2>De quoi ça parle</h2>
<p>Adrien Bellay dresse le portrait de praticiens et de pédagogues de la permaculture, en France et ailleurs. À travers leurs parcours, le film révèle une approche qui prend soin des sols, observe les écosystèmes et conçoit des systèmes résilients — tout en posant une éthique : prendre soin de la Terre, prendre soin des humains, partager équitablement.</p>
<h2>Pourquoi ça résonne avec l'habitat participatif</h2>
<p>Les principes de la permaculture — coopération plutôt que compétition, diversité, autonomie, soin du commun — sont exactement ceux qui font tenir un collectif dans la durée. Beaucoup d'écolieux s'appuient d'ailleurs sur le design permaculturel pour organiser à la fois leurs jardins et leur vie ensemble.</p>
<h2>Où le voir</h2>
<p>Disponible en DVD via le site officiel du film et des librairies spécialisées. Le documentaire est aussi fréquemment programmé en projections-débats près de chez vous.</p>$c$ where slug = 'eveil-de-la-permaculture';

update public.resources set content = $c$<p>Et si la réponse aux grands désordres du monde commençait, très concrètement, sous nos pieds — dans la santé d'un sol vivant ?</p>
<h2>De quoi ça parle</h2>
<p>Pendant près de trois ans, Coline Serreau parcourt le monde à la rencontre d'agriculteurs, de penseurs et d'économistes qui expérimentent des alternatives concrètes. On y croise Pierre Rabhi, Vandana Shiva ou encore les microbiologistes des sols Lydia et Claude Bourguignon. Au-delà de la critique de l'agriculture industrielle, le film montre des solutions qui fonctionnent, ici et maintenant.</p>
<h2>Pourquoi ça résonne avec l'habitat participatif</h2>
<p>Retrouver un rapport direct à la terre nourricière est l'un des moteurs de nombreux projets collectifs. Cultiver ensemble, partager les récoltes, retrouver une forme d'autonomie alimentaire : ces gestes tissent du lien autant qu'ils nourrissent. Le film éclaire les racines agricoles de l'aspiration à vivre autrement.</p>
<h2>Où le voir</h2>
<p>Disponible en VOD à la location ou à l'achat sur les plateformes de cinéma indépendant, et édité en DVD.</p>$c$ where slug = 'solutions-locales-pour-un-desordre-global';

update public.resources set content = $c$<p>Quitter Los Angeles pour ressusciter une terre morte : le pari semblait fou. Huit ans plus tard, Apricot Lane Farms grouille de vie.</p>
<h2>De quoi ça parle</h2>
<p>John et Molly Chester quittent la ville pour transformer 80 hectares de terres épuisées en une ferme régénérative en harmonie avec la nature. Le documentaire, filmé sur près de huit années, chronique avec honnêteté leurs réussites et leurs échecs : ravageurs, sécheresses, doutes — et l'émergence progressive d'un écosystème équilibré.</p>
<h2>Pourquoi ça résonne avec l'habitat participatif</h2>
<p>Le film raconte une vérité que connaissent bien les collectifs : rien de vivant ne se construit dans l'urgence. Restaurer un sol, comme bâtir une communauté, demande de la patience, de l'observation et l'acceptation des déséquilibres temporaires. Une belle leçon pour qui rêve de poser un projet de vie sur le long terme.</p>
<h2>Où le voir</h2>
<p>Disponible en VOD sur les principales plateformes selon votre région, et édité en DVD et Blu-ray. Titre original : <em>The Biggest Little Farm</em>.</p>$c$ where slug = 'the-biggest-little-farm';

update public.resources set content = $c$<p>Que se passe-t-il quand une poignée de personnes décident de vivre, pendant une année entière, une expérience grandeur nature de simplicité volontaire ?</p>
<h2>De quoi ça parle</h2>
<p>Dans la région de Gippsland, en Australie, une communauté se rassemble pour démontrer qu'un mode de vie plus simple est non seulement possible, mais désirable. Construction de tiny houses, jardins nourriciers, vie partagée : le film alterne expérience concrète et réflexions de penseurs comme David Holmgren, Helena Norberg-Hodge ou Ted Trainer.</p>
<h2>Pourquoi ça résonne avec l'habitat participatif</h2>
<p>C'est sans doute le film le plus proche de l'esprit de Casa Minga : on y voit, sans filtre, la beauté mais aussi les défis très concrets de la vie en collectif — partager l'espace, négocier les décisions, articuler intimité et communauté. Un document précieux pour quiconque envisage de franchir le pas.</p>
<h2>Où le voir</h2>
<p>Bonne nouvelle : le film est disponible gratuitement et en intégralité sur la chaîne YouTube de Happen Films et sur leur site. Titre original : <em>A Simpler Way: Crisis as Opportunity</em>.</p>$c$ where slug = 'a-simpler-way';

update public.resources set content = $c$<p>Tout quitter — emploi, voiture, logement — et enfourcher un vélo pour chercher, à travers tout un pays, l'endroit où l'on aimerait vraiment vivre.</p>
<h2>De quoi ça parle</h2>
<p>Mandy et Ryan parcourent environ 10 500 kilomètres à vélo à travers les États-Unis, visitant écovillages et communautés intentionnelles. Au fil des rencontres, leur quête d'un lieu durable devient aussi un voyage intérieur : qu'est-ce qui fait qu'on se sent enfin « chez soi » au sein d'un collectif ?</p>
<h2>Pourquoi ça résonne avec l'habitat participatif</h2>
<p>Le film montre une diversité précieuse de modèles de vie collective — il n'existe pas une seule bonne façon de vivre ensemble. Cette exploration fait écho à la démarche de qui cherche son lieu : visiter, ressentir, comparer avant de s'engager. Exactement ce que permet un séjour dans un habitat participatif.</p>
<h2>Où le voir</h2>
<p>Visible sur la chaîne YouTube officielle du film et sur certaines plateformes VOD. Titre original : <em>Within Reach</em>.</p>$c$ where slug = 'within-reach';

update public.resources set content = $c$<p>Partant d'une fresque peinte au 14e siècle à Sienne, ce film pose une question étonnamment actuelle : à quoi ressemble un territoire bien gouverné ?</p>
<h2>De quoi ça parle</h2>
<p>Dominique Marchais nous emmène en voyage à travers l'Europe, de la Méditerranée aux Alpes. Il y rencontre des agriculteurs en coopérative — comme les Galline Felici en Sicile —, des architectes et des élus qui travaillent à faire vivre la démocratie au plus près du terrain et à façonner un paysage du « bon gouvernement ».</p>
<h2>Pourquoi ça résonne avec l'habitat participatif</h2>
<p>Le film éclaire une dimension souvent sous-estimée de la vie collective : la gouvernance. Comment décide-t-on ensemble ? Comment articule-t-on intérêt individuel et bien commun ? Ces questions sont au cœur de tout habitat participatif, et <em>Nul homme n'est une île</em> en offre une réflexion d'une grande finesse.</p>
<h2>Où le voir</h2>
<p>Édité en DVD par Météore Films et proposé en VOD sur certaines plateformes documentaires selon la programmation.</p>$c$ where slug = 'nul-homme-n-est-une-ile';

update public.resources set content = $c$<p>Et si une visiteuse venue d'une planète vivant en harmonie avec la nature posait sur notre monde un regard à la fois naïf et terriblement lucide ?</p>
<h2>De quoi ça parle</h2>
<p>Sur une planète idéale, libérée du consumérisme et vivant en lien étroit avec la nature, une habitante se porte volontaire pour visiter la seule planète jugée irrécupérable : la Terre. Cette comédie satirique de Coline Serreau, portée par Vincent Lindon et Marion Cotillard, tourne en dérision nos modes de vie pressés et déconnectés.</p>
<h2>Pourquoi ça résonne avec l'habitat participatif</h2>
<p>Sous ses airs de comédie, <em>La Belle Verte</em> est une véritable utopie écologiste : sobriété, entraide, lien au vivant, rejet de l'accumulation. Autant de valeurs qui animent aujourd'hui les écolieux. Le film, longtemps confidentiel, est devenu culte précisément parce qu'il met en images un imaginaire désirable du « vivre autrement ».</p>
<h2>Où le voir</h2>
<p>Régulièrement diffusé à la télévision et disponible en DVD. Sa disponibilité en streaming varie selon les régions et les périodes.</p>$c$ where slug = 'la-belle-verte';
