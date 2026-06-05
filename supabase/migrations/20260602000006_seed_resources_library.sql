-- Migration: seed_resources_library
-- 5 ressources par catégorie : Livres, Podcasts, Articles, Guides, + 4 Films (La Belle Verte existe deja)
-- Documentaires non concernes (deja 9 en base).
-- Articles & Guides = contenu original Casa Minga. Livres/Podcasts/Films = oeuvres reelles.
-- cover_image laisse a NULL (a enrichir via l'admin). Idempotent : ON CONFLICT (slug) DO NOTHING.

insert into public.resources
  (slug, title, description, content, type, author_or_director, year, tags, is_published)
values

-- ====================== LIVRES ======================
(
  'la-sobriete-heureuse',
  $t$La Sobriété heureuse$t$,
  $d$Pierre Rabhi y défend l'idée qu'une vie plus sobre, reliée à la nature et débarrassée de la course à l'accumulation, peut être source de joie profonde. Un texte fondateur pour beaucoup d'habitants d'écolieux.$d$,
  $c$<p>Et si « moins » pouvait vouloir dire « mieux » ? Dans ce court essai devenu une référence, Pierre Rabhi invite à repenser notre rapport à la consommation et au temps.</p>
<h2>Pourquoi le lire</h2>
<p>La sobriété qu'il décrit n'est pas une privation mais un choix libérateur : se reconnecter à l'essentiel, au vivant, aux autres. C'est précisément l'élan qui pousse beaucoup de personnes vers l'habitat participatif et les écolieux — sortir du « toujours plus » pour retrouver du sens et du lien.</p>$c$,
  'livre', $a$Pierre Rabhi$a$, 2010,
  ARRAY['sobriété','écologie','philosophie'], true
),
(
  'l-entraide-autre-loi-de-la-jungle',
  $t$L'Entraide, l'autre loi de la jungle$t$,
  $d$Les deux auteurs montrent, exemples scientifiques à l'appui, que la coopération est aussi puissante que la compétition dans le vivant — et chez les humains. Une base solide pour penser la vie collective.$d$,
  $c$<p>On nous a longtemps répété que la nature n'était qu'une lutte impitoyable. Servigne et Chapelle racontent l'autre moitié de l'histoire : partout, le vivant coopère.</p>
<h2>Pourquoi le lire</h2>
<p>De la cellule aux sociétés humaines, l'entraide est un moteur d'évolution. Pour qui s'engage dans un projet collectif, ce livre offre un socle rassurant : coopérer n'est pas une utopie naïve, c'est une force profondément ancrée dans le vivant.</p>$c$,
  'livre', $a$Pablo Servigne & Gauthier Chapelle$a$, 2017,
  ARRAY['entraide','coopération','vivant'], true
),
(
  'comment-tout-peut-s-effondrer',
  $t$Comment tout peut s'effondrer$t$,
  $d$Le livre qui a popularisé la « collapsologie » en France : un état des lieux lucide des fragilités de notre civilisation industrielle, et une invitation à imaginer des modes de vie plus résilients.$d$,
  $c$<p>Que se passerait-il si les systèmes dont dépend notre quotidien — énergie, finance, alimentation — venaient à se gripper ? Servigne et Stevens posent la question sans catastrophisme, mais sans détour.</p>
<h2>Pourquoi le lire</h2>
<p>Au-delà du constat, l'ouvrage invite à construire dès maintenant des modes de vie plus autonomes et solidaires. Les écolieux et habitats participatifs sont souvent des réponses concrètes à cette quête de résilience.</p>$c$,
  'livre', $a$Pablo Servigne & Raphaël Stevens$a$, 2015,
  ARRAY['résilience','collapsologie','transition'], true
),
(
  'l-age-des-low-tech',
  $t$L'Âge des low-tech$t$,
  $d$Et si la solution n'était pas « plus de technologie » mais « la bonne technologie » ? Philippe Bihouix plaide pour des techniques simples, durables et réparables, sobres en ressources.$d$,
  $c$<p>Face aux limites planétaires, la fuite en avant technologique a ses propres limites. Philippe Bihouix propose un autre chemin : les low-tech, ces techniques robustes, accessibles et économes.</p>
<h2>Pourquoi le lire</h2>
<p>Beaucoup d'écolieux expérimentent déjà ces approches : toilettes sèches, autoconstruction, réparation, récupération. Ce livre donne le cadre intellectuel d'un quotidien plus sobre et plus autonome.</p>$c$,
  'livre', $a$Philippe Bihouix$a$, 2014,
  ARRAY['low-tech','sobriété','autonomie'], true
),
(
  'la-vie-secrete-des-arbres',
  $t$La Vie secrète des arbres$t$,
  $d$Le forestier allemand révèle un monde insoupçonné : des arbres qui communiquent, s'entraident et forment de véritables communautés. Une ode au vivant comme système coopératif.$d$,
  $c$<p>Et si la forêt était une société ? Peter Wohlleben raconte comment les arbres échangent des nutriments, s'avertissent des dangers et prennent soin de leurs voisins affaiblis.</p>
<h2>Pourquoi le lire</h2>
<p>Cette plongée dans l'intelligence du vivant résonne avec l'esprit des collectifs humains : ce qui est fort, c'est le réseau, l'interdépendance, le soin mutuel. Une lecture inspirante pour penser nos manières de faire communauté.</p>$c$,
  'livre', $a$Peter Wohlleben$a$, 2017,
  ARRAY['vivant','forêt','coopération'], true
),

-- ====================== PODCASTS ======================
(
  'podcast-sismique',
  $t$Sismique$t$,
  $d$Un podcast d'entretiens fouillés pour comprendre les grandes transformations du monde — écologie, économie, société — et imaginer les futurs possibles.$d$,
  $c$<p>Pourquoi notre monde change-t-il si vite, et vers quoi ? Dans Sismique, Julien Devaureix interroge chercheurs, penseurs et acteurs du changement avec une vraie exigence.</p>
<h2>Pourquoi l'écouter</h2>
<p>Les épisodes éclairent les racines de la crise écologique et les pistes de bifurcation. De quoi nourrir la réflexion de qui veut s'engager dans des modes de vie plus soutenables et collectifs.</p>$c$,
  'podcast', $a$Julien Devaureix$a$, null,
  ARRAY['transition','société','entretiens'], true
),
(
  'podcast-presages',
  $t$Présages$t$,
  $d$Des conversations profondes sur les bouleversements écologiques de notre époque et les manières de les habiter avec lucidité, sensibilité et espoir.$d$,
  $c$<p>Comment vivre à la hauteur des bouleversements écologiques sans se réfugier dans le déni ni le désespoir ? Alexia Soyeux mène des entretiens d'une grande sensibilité.</p>
<h2>Pourquoi l'écouter</h2>
<p>Présages relie l'intime et le collectif, l'émotion et l'action. Un compagnon précieux pour celles et ceux qui cherchent du sens et de nouvelles façons de faire ensemble.</p>$c$,
  'podcast', $a$Alexia Soyeux$a$, null,
  ARRAY['écologie','sens','entretiens'], true
),
(
  'podcast-basilic',
  $t$Basilic$t$,
  $d$Le podcast qui donne la parole à celles et ceux qui agissent pour l'écologie au quotidien, des plus discrets aux plus inspirants.$d$,
  $c$<p>L'écologie se vit dans les gestes concrets. Dans Basilic, Jeane Clesse part à la rencontre de personnes engagées qui transforment leur quotidien et leur territoire.</p>
<h2>Pourquoi l'écouter</h2>
<p>Les portraits sont accessibles, sincères et motivants. Idéal pour s'inspirer d'initiatives reproductibles, y compris dans la vie collective et l'habitat partagé.</p>$c$,
  'podcast', $a$Jeane Clesse$a$, null,
  ARRAY['écologie','engagement','portraits'], true
),
(
  'podcast-vlan',
  $t$Vlan !$t$,
  $d$Un podcast qui questionne notre société, nos modes de vie et nos relations, avec des invités variés et un regard tourné vers le changement.$d$,
  $c$<p>Comment mieux vivre, ensemble, dans un monde en mutation ? Grégory Pouy explore ces questions avec des invités venus d'horizons très divers.</p>
<h2>Pourquoi l'écouter</h2>
<p>Entre société, écologie et relations humaines, Vlan ! ouvre des pistes concrètes pour repenser nos manières de faire — utile pour nourrir un projet de vie plus collectif.</p>$c$,
  'podcast', $a$Grégory Pouy$a$, null,
  ARRAY['société','relations','changement'], true
),
(
  'podcast-la-terre-au-carre',
  $t$La Terre au carré$t$,
  $d$L'émission quotidienne d'écologie de France Inter : sciences du vivant, climat, biodiversité et initiatives de transition, accessibles à tous.$d$,
  $c$<p>Chaque jour, La Terre au carré explore le vivant, le climat et les solutions, avec rigueur et curiosité, sous la houlette de Mathieu Vidard.</p>
<h2>Pourquoi l'écouter</h2>
<p>Un excellent point d'entrée pour comprendre les enjeux écologiques et découvrir des initiatives concrètes — dont beaucoup font écho aux valeurs des écolieux.</p>$c$,
  'podcast', $a$Mathieu Vidard$a$, null,
  ARRAY['écologie','sciences','radio'], true
),

-- ====================== ARTICLES (originaux Casa Minga) ======================
(
  'qu-est-ce-que-l-habitat-participatif',
  $t$Qu'est-ce que l'habitat participatif ?$t$,
  $d$Définition, principes et atouts de l'habitat participatif : une manière de concevoir et d'habiter un lieu collectivement, entre logements privés et espaces partagés.$d$,
  $c$<p>L'habitat participatif désigne un mode d'habitat où les futurs habitants conçoivent, financent et gèrent ensemble leur lieu de vie. Ni tout à fait individuel, ni totalement communautaire, il invente un entre-deux fait de logements privés et d'espaces partagés.</p>
<h2>Les principes clés</h2>
<p>On y retrouve trois ingrédients : la <strong>co-conception</strong> (les habitants décident ensemble), la <strong>mutualisation</strong> (buanderie, salle commune, jardin, parfois véhicules) et une <strong>gouvernance partagée</strong> où chacun a voix au chapitre.</p>
<h2>Pourquoi ça séduit</h2>
<p>Au-delà des économies, l'habitat participatif répond à un besoin de lien, de solidarité de proximité et de sobriété. C'est l'une des formes que prend, concrètement, l'envie de « vivre autrement ».</p>$c$,
  'article', $a$Casa Minga$a$, 2026,
  ARRAY['habitat participatif','définition','collectif'], true
),
(
  'ecolieu-eco-hameau-habitat-groupe',
  $t$Écolieu, éco-hameau, habitat groupé : quelles différences ?$t$,
  $d$Un petit lexique pour s'y retrouver entre les différentes formes de vie collective et écologique, de la colocation engagée à l'écovillage.$d$,
  $c$<p>Les mots se ressemblent et se mélangent souvent. Voici de quoi distinguer les principales formes de vie collective.</p>
<h2>Les grandes familles</h2>
<p>L'<strong>habitat groupé / participatif</strong> réunit plusieurs foyers dans un projet immobilier commun. L'<strong>écolieu</strong> met l'accent sur l'écologie et souvent une activité (accueil, agriculture). L'<strong>éco-hameau</strong> est un écolieu à l'échelle de quelques habitations. L'<strong>écovillage</strong> vise une plus grande autonomie, parfois plusieurs dizaines d'habitants.</p>
<h2>Un même esprit</h2>
<p>Au fond, tous partagent une intention commune : mutualiser, prendre soin du vivant et décider ensemble. Les frontières sont poreuses — l'essentiel est le projet humain derrière.</p>$c$,
  'article', $a$Casa Minga$a$, 2026,
  ARRAY['écolieu','écovillage','lexique'], true
),
(
  'decider-ensemble-sociocratie',
  $t$Décider ensemble : sociocratie et gouvernance partagée$t$,
  $d$Comment des dizaines de personnes peuvent-elles décider sans se déchirer ? Tour d'horizon des outils de gouvernance partagée utilisés dans les collectifs.$d$,
  $c$<p>La vie collective bute souvent sur une question : comment décide-t-on ? La gouvernance partagée propose des réponses concrètes pour éviter aussi bien la tyrannie de la majorité que la paralysie.</p>
<h2>Quelques outils</h2>
<p>La <strong>sociocratie</strong> organise les décisions par cercles et par consentement (on valide une proposition tant qu'il n'y a pas d'objection raisonnable). Les <strong>rôles tournants</strong> et la <strong>facilitation</strong> aident à répartir le pouvoir et la parole.</p>
<h2>L'essentiel</h2>
<p>Aucun outil ne remplace la confiance et l'écoute. Mais un cadre clair, accepté par tous, fait toute la différence entre un collectif qui dure et un collectif qui s'épuise.</p>$c$,
  'article', $a$Casa Minga$a$, 2026,
  ARRAY['gouvernance','sociocratie','collectif'], true
),
(
  'financer-un-projet-d-habitat-collectif',
  $t$Financer un projet d'habitat collectif$t$,
  $d$Montages juridiques, financements et leviers : un aperçu des grandes options pour donner vie à un projet d'habitat participatif.$d$,
  $c$<p>Un beau projet collectif a besoin d'un montage solide. Bonne nouvelle : plusieurs cadres existent pour acheter et gérer un lieu à plusieurs.</p>
<h2>Les montages courants</h2>
<p>La <strong>coopérative d'habitants</strong>, la <strong>SCI</strong> (société civile immobilière) ou la <strong>SAS</strong> permettent de détenir collectivement le foncier. Chaque forme a ses implications fiscales et de gouvernance — un accompagnement juridique est vivement conseillé.</p>
<h2>Les leviers</h2>
<p>Apports des habitants, prêts bancaires, financement participatif, parfois soutien de collectivités ou de foncières solidaires : la plupart des projets combinent plusieurs sources. La clé est d'anticiper les départs et les arrivées.</p>$c$,
  'article', $a$Casa Minga$a$, 2026,
  ARRAY['financement','juridique','projet'], true
),
(
  'reussir-son-premier-sejour',
  $t$Réussir son premier séjour en habitat participatif$t$,
  $d$Quelques repères simples pour vivre un premier séjour serein et enrichissant dans un habitat collectif, côté voyageur.$d$,
  $c$<p>Premier séjour dans un habitat participatif ? Voici comment en profiter pleinement, dans le bon état d'esprit.</p>
<h2>Avant de partir</h2>
<p>Renseignez-vous sur le fonctionnement du lieu, ses règles et ce qui est partagé. Annoncez clairement vos dates et vos besoins, et posez vos questions sans gêne.</p>
<h2>Sur place</h2>
<p>Proposez un coup de main, participez aux repas et aux temps communs si on vous y invite, respectez les espaces et les rythmes. L'échange prime sur le confort : c'est cette posture qui transforme un hébergement en vraie rencontre.</p>$c$,
  'article', $a$Casa Minga$a$, 2026,
  ARRAY['séjour','conseils','voyageur'], true
),

-- ====================== GUIDES (originaux Casa Minga) ======================
(
  'guide-creer-sa-fiche-de-lieu',
  $t$Guide : créer sa fiche de lieu$t$,
  $d$Pas à pas pour référencer votre habitat sur Casa Minga et donner envie aux voyageurs de vous découvrir.$d$,
  $c$<p>Référencer votre lieu sur Casa Minga ne prend que quelques minutes. Voici comment soigner votre fiche.</p>
<h2>Les étapes</h2>
<p>Renseignez le nom, le type de lieu, la région et une description sincère de votre projet. Ajoutez de belles photos lumineuses des espaces partagés et des extérieurs — c'est ce qui crée le premier déclic.</p>
<h2>Nos conseils</h2>
<p>Soyez authentique : décrivez aussi votre fonctionnement collectif et vos valeurs. Une fiche honnête attire les bonnes personnes et évite les malentendus.</p>$c$,
  'guide', $a$Casa Minga$a$, 2026,
  ARRAY['guide','fiche','hôte'], true
),
(
  'guide-proposer-un-sejour',
  $t$Guide : proposer un séjour attractif$t$,
  $d$Comment décrire et organiser un séjour qui donne envie, tout en restant fidèle à la réalité de votre lieu.$d$,
  $c$<p>Un bon séjour se prépare. Voici comment formuler une proposition claire et engageante.</p>
<h2>L'essentiel à préciser</h2>
<p>Indiquez ce que vous offrez (couchage, repas, participation à la vie du lieu), ce que vous attendez en retour, et les périodes possibles. La clarté rassure et évite les déceptions.</p>
<h2>Le petit plus</h2>
<p>Racontez ce qu'un voyageur peut vivre chez vous : un chantier participatif, une récolte, une veillée. C'est l'expérience humaine qui fait la différence.</p>$c$,
  'guide', $a$Casa Minga$a$, 2026,
  ARRAY['guide','séjour','hôte'], true
),
(
  'guide-accueillir-un-voyageur',
  $t$Guide : accueillir un voyageur pour la première fois$t$,
  $d$Quelques repères pour un premier accueil réussi, du premier message au départ.$d$,
  $c$<p>Accueillir quelqu'un chez soi, c'est ouvrir un peu de son intimité collective. Voici comment le faire sereinement.</p>
<h2>Avant l'arrivée</h2>
<p>Échangez en amont sur les attentes, le déroulé et les règles de vie. Préparez l'espace et prévenez le collectif de la venue d'un invité.</p>
<h2>Pendant le séjour</h2>
<p>Présentez le lieu et ses habitants, montrez les espaces communs, et laissez de la place à la spontanéité. Un accueil chaleureux mais cadré est la meilleure base de confiance.</p>$c$,
  'guide', $a$Casa Minga$a$, 2026,
  ARRAY['guide','accueil','hôte'], true
),
(
  'guide-preparer-son-sejour',
  $t$Guide : préparer son séjour$t$,
  $d$Côté voyageur : tout ce qu'il faut anticiper pour arriver dans de bonnes conditions.$d$,
  $c$<p>Un séjour réussi se prépare des deux côtés. Voici la check-list du voyageur.</p>
<h2>La logistique</h2>
<p>Confirmez vos dates, votre mode d'arrivée et vos éventuels besoins (alimentaires, mobilité). Demandez ce que vous devez apporter (duvet, bottes, etc.).</p>
<h2>L'état d'esprit</h2>
<p>Venez curieux et disponible. Proposez votre aide, respectez les usages du lieu et adaptez-vous à son rythme. C'est la clé d'un séjour mémorable.</p>$c$,
  'guide', $a$Casa Minga$a$, 2026,
  ARRAY['guide','séjour','voyageur'], true
),
(
  'guide-organiser-une-reunion-collective',
  $t$Guide : organiser une réunion collective efficace$t$,
  $d$Des conseils simples pour des réunions de collectif plus courtes, plus claires et plus apaisées.$d$,
  $c$<p>Les réunions sont le nerf de la vie collective — et parfois sa principale source de fatigue. Quelques règles changent tout.</p>
<h2>Avant</h2>
<p>Préparez un ordre du jour clair, avec un objectif et une durée pour chaque point. Désignez une personne pour faciliter et une autre pour prendre les notes.</p>
<h2>Pendant</h2>
<p>Donnez la parole à tour de rôle, distinguez les temps d'information, de discussion et de décision, et actez clairement qui fait quoi pour la suite. Terminez à l'heure : c'est une marque de respect.</p>$c$,
  'guide', $a$Casa Minga$a$, 2026,
  ARRAY['guide','gouvernance','réunion'], true
),

-- ====================== FILMS (fiction, +4) ======================
(
  'captain-fantastic',
  $t$Captain Fantastic$t$,
  $d$Un père élève ses six enfants en pleine forêt, loin de la société de consommation. Une fable tendre et piquante sur l'éducation, la liberté et les limites du retrait du monde.$d$,
  $c$<p>Dans les forêts du nord-ouest américain, Ben élève ses enfants en marge de la société : sport, philosophie, autosuffisance. Jusqu'au jour où la famille doit replonger dans le monde « normal ».</p>
<h2>Pourquoi le voir</h2>
<p>Le film interroge avec finesse le rêve d'un retrait radical : ses beautés, mais aussi ses angles morts. Une réflexion stimulante pour qui s'interroge sur l'équilibre entre autonomie et ouverture au monde.</p>$c$,
  'film', $a$Matt Ross$a$, 2016,
  ARRAY['autonomie','éducation','nature'], true
),
(
  'into-the-wild',
  $t$Into the Wild$t$,
  $d$L'histoire vraie d'un jeune homme qui abandonne tout pour vivre au plus près de la nature. Un récit bouleversant sur la quête de sens et la place du lien aux autres.$d$,
  $c$<p>Diplômé brillant, Christopher McCandless brûle ses papiers et part sur les routes, jusqu'aux étendues sauvages de l'Alaska, en quête d'une vie authentique.</p>
<h2>Pourquoi le voir</h2>
<p>Au-delà de l'appel de la nature, le film délivre une leçon douce-amère : le bonheur n'est réel que partagé. Une méditation précieuse sur l'équilibre entre liberté individuelle et besoin de communauté.</p>$c$,
  'film', $a$Sean Penn$a$, 2007,
  ARRAY['nature','quête','liberté'], true
),
(
  'woman-at-war',
  $t$Woman at War$t$,
  $d$En Islande, une femme mène une guerre solitaire contre l'industrie qui défigure les paysages. Une comédie écologiste singulière, à la fois drôle et engagée.$d$,
  $c$<p>Le jour, Halla dirige une chorale ; la nuit, elle sabote les lignes électriques d'une industrie polluante. Ce film islandais mêle suspense, humour et écologie avec une grande originalité.</p>
<h2>Pourquoi le voir</h2>
<p>Derrière la fable, une question sérieuse : jusqu'où agir pour protéger le vivant ? Un film qui interroge l'engagement écologique sans jamais donner de leçon.</p>$c$,
  'film', $a$Benedikt Erlingsson$a$, 2018,
  ARRAY['écologie','engagement','nature'], true
),
(
  'little-forest',
  $t$Little Forest$t$,
  $d$Lassée de la ville, une jeune femme revient dans son village natal et retrouve, au fil des saisons, le goût de cuisiner ce qu'elle cultive. Une ode apaisante à la vie au rythme de la nature.$d$,
  $c$<p>Hyewon quitte la ville et retrouve la maison de son enfance, à la campagne. Au fil des saisons, elle cuisine ce que la terre lui donne et réapprend à vivre lentement.</p>
<h2>Pourquoi le voir</h2>
<p>Ce film coréen, contemplatif et lumineux, célèbre l'autosuffisance, le soin et le temps long. Une parenthèse douce qui donne envie de remettre les mains dans la terre.</p>$c$,
  'film', $a$Yim Soon-rye$a$, 2018,
  ARRAY['autosuffisance','saisons','ruralité'], true
)

on conflict (slug) do nothing;
