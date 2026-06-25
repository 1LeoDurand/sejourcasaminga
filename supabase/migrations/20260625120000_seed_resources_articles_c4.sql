-- Migration: seed_resources_articles_c4
-- Cluster 4 (échange de maison) : 1 pilier + 2 satellites, catégorie 'guide'.
-- Idempotent : ON CONFLICT (slug) DO UPDATE (ne touche pas cover_image/external_link).
-- Champs texte en dollar-quoting : titre $t$, description $d$, auteur $a$, content $c$.

insert into public.resources
  (slug, title, description, type, author_or_director, year, cover_image, external_link, tags, content, is_published, created_at)
values
(
  'echange-de-maison-guide',
  $t$Échange de maison : comment voyager en logeant chez l'habitant$t$,
  $d$Comment fonctionne l'échange de maison, combien ça coûte vraiment, et si c'est sûr. Guide honnête avec comparatif, FAQ et conseils pratiques.$d$,
  'guide',
  $a$Casa Minga$a$,
  2026,
  null,
  null,
  ARRAY['echange de maison','voyage','hospitalite','guide'],
  $c$<p><strong>TL;DR</strong> — L'échange de maison, c'est voyager en logeant gratuitement chez quelqu'un pendant qu'il loge chez toi — ou chez quelqu'un d'autre, via un système de points. Tu paies une adhésion annuelle à une plateforme, pas la nuit. Pas de loyer, pas de commission, juste une relation de confiance entre hôtes. Ça demande de la flexibilité, de l'anticipation, et une bonne communication.</p>

<h2>Qu'est-ce que l'échange de maison, concrètement ?</h2>

<p>L'échange de maison est une pratique où deux personnes ou foyers se prêtent mutuellement leur logement — simultanément ou à des dates différentes — sans versement d'argent pour la nuit : chaque séjour est financé par la réciprocité ou par des points d'hospitalité accumulés sur une plateforme commune.</p>

<p>Le principe est ancien. En 1953, deux initiatives naissent presque au même moment : <strong>Intervac</strong>, lancé par des enseignants européens, et <strong>HomeLink</strong>, fondé par l'enseignant new-yorkais David Ostroff sous le nom "Vacation Exchange Club" (<a href="https://www.dwell.com/article/brief-history-home-swapping-house-exchanges-99b78250">source</a>). À l'époque, tout passe par des annuaires papier, des lettres et des coups de téléphone. Dans les années 1990, les sites web arrivent et transforment la logistique : HomeExchange.com, fondé par Ed Kushins, figure parmi les pionniers de cette transition numérique.</p>

<p>Aujourd'hui, l'échange de maison touche toutes sortes de logements : maisons individuelles, appartements en ville, chalets, mais aussi — et c'est là la spécificité de Casa Minga — des <strong>lieux de vie collectifs</strong> : habitats participatifs, écovillages, maisons partagées, espaces de coliving. Ces espaces ont une culture de l'accueil et du commun qui facilite souvent les échanges.</p>

<p>L'échange ne supprime pas tous les frais de voyage. Transport, alimentation, activités sur place : tout ça reste à ta charge. Mais il retire la ligne "hébergement" de la note — souvent la plus lourde.</p>

<h2>Réciproque ou par points : quelle différence ?</h2>

<p>Il existe deux grandes formules d'échange de maison : l'échange réciproque, où les deux foyers échangent directement leurs logements, et l'échange par points (ou points d'hospitalité), où chaque séjour créé ou reçu génère des points utilisables ensuite chez un tiers (<a href="https://help.homeexchange.com/hc/en-us/articles/360000601998-What-are-reciprocal-and-non-reciprocal-exchanges">source</a>).</p>

<p>Sur HomeExchange, environ <strong>85 % des échanges sont non réciproques</strong>, c'est-à-dire par points (<a href="https://help.homeexchange.com/hc/en-us/articles/360000601998-What-are-reciprocal-and-non-reciprocal-exchanges">source</a>). Ce chiffre dit quelque chose d'important : la souplesse du système de points répond mieux à la réalité des agendas modernes.</p>

<table>
<thead>
<tr><th></th><th>Échange réciproque</th><th>Échange par points</th></tr>
</thead>
<tbody>
<tr><td><strong>Principe</strong></td><td>Deux foyers s'accueillent mutuellement</td><td>Un foyer accueille, l'autre dépense des points accumulés ailleurs</td></tr>
<tr><td><strong>Timing</strong></td><td>Simultané ou différé (dans l'année)</td><td>Complètement libre, pas de synchronisation requise</td></tr>
<tr><td><strong>Souplesse</strong></td><td>Moindre — il faut trouver quelqu'un qui veut aller chez toi en même temps</td><td>Grande — tu cherches une destination indépendamment de qui vient chez toi</td></tr>
<tr><td><strong>Pour qui</strong></td><td>Profils avec un logement attractif et des dates fixes</td><td>Profils avec un logement ouvert à l'accueil, agenda variable</td></tr>
<tr><td><strong>Points générés</strong></td><td>Non (c'est un troc direct)</td><td>Oui — chaque nuit accueillie crédite des points</td></tr>
</tbody>
</table>

<p>L'échange réciproque peut être <strong>simultané</strong> (les deux foyers partent en même temps) ou <strong>différé</strong> (on s'échange l'accueil à des moments différents). Cette seconde forme ressemble davantage au système de points dans sa logique, mais reste liée à une relation bilatérale.</p>

<p>Pour aller plus loin sur ce choix : <a href="/ressources/echange-reciproque-ou-points">Réciproque ou par points : comment choisir ?</a></p>

<h2>Combien ça coûte vraiment ?</h2>

<p>L'échange de maison n'est pas gratuit : il repose sur une <strong>adhésion annuelle</strong> à une plateforme, qui ouvre ensuite l'accès à un nombre illimité d'échanges sans commission supplémentaire par séjour. Le coût varie selon la plateforme.</p>

<p>HomeExchange, leader mondial avec <strong>plus de 550 000 maisons dans 155 pays</strong> (<a href="https://help.homeexchange.com/hc/en-us/articles/360000610118-The-benefits-of-a-HomeExchange-membership">source</a>), facture <strong>175 € par an</strong> pour un accès illimité (<a href="https://www.homeexchange.fr/blog/homeexchange-tarif/">source</a>). Une fois cette adhésion payée, aucun frais supplémentaire par échange : ni commission, ni frais de service, ni "frais de ménage" à la nuit.</p>

<h3>Et Casa Minga dans tout ça ?</h3>

<p>Casa Minga Séjours fonctionne sur le même modèle de base : une adhésion annuelle, sans commission par séjour. La plateforme est <strong>gratuite jusqu'en juin 2026</strong>. Elle s'adresse exclusivement aux lieux de vie collectifs — ce qui en fait un réseau de niche, avec un volume d'annonces plus restreint que les grandes plateformes généralistes, mais une communauté plus homogène dans ses valeurs.</p>

<p>Il faut être honnête sur les limites : plus le réseau est petit, plus il faut de patience pour trouver une correspondance. Un échange entre deux écovillages en France, ça peut prendre plusieurs semaines de coordination.</p>

<h3>Ce que tu paieras quand même</h3>

<p>L'adhésion ne couvre pas :</p>
<ul>
<li>Le transport (train, avion, voiture)</li>
<li>La nourriture sur place</li>
<li>Les activités et sorties</li>
<li>L'assurance voyage si tu en prends une</li>
</ul>

<p>Mais sur un séjour d'une semaine en famille, économiser plusieurs centaines d'euros d'hébergement change la donne budgétaire.</p>

<h2>Est-ce sûr ? La question de la confiance</h2>

<p>La confiance est le point central de tout échange de maison : tu accueilles des inconnus chez toi, et tu séjournes chez des inconnus. Aucune plateforme ne peut supprimer cette réalité — mais plusieurs mécanismes existent pour la gérer.</p>

<h3>Vérification des profils</h3>

<p>Casa Minga vérifie les profils par <strong>pièce d'identité</strong>. Cette vérification ne garantit pas le comportement d'un hôte, mais elle réduit l'anonymat complet et crée une responsabilité nominative. Les avis laissés après chaque séjour complètent ce tableau.</p>

<p>Pour comprendre comment fonctionne ce processus : <a href="/ressources/verification-confiance-entre-hotes">Vérification et confiance entre hôtes</a> et <a href="/verification">la page de vérification du site</a>.</p>

<h3>Caution et garanties (l'exemple HomeExchange)</h3>

<p>HomeExchange donne un cadre de référence utile. L'adhésion inclut une <strong>garantie dommages matériels jusqu'à 1 000 000 $US</strong> et une indemnisation en cas de vol. La caution fonctionne comme une <strong>autorisation de prélèvement jusqu'à 2 500 $US</strong>, activée uniquement si des dégâts sont constatés (<a href="https://help.homeexchange.com/hc/en-us/articles/360000619397-What-guarantees-are-included-in-the-HomeExchange-membership">source</a>).</p>

<p>En cas de dégâts, l'invité dispose de <strong>10 jours pour approuver ou contester</strong>. Sans accord sous 30 jours, la plateforme peut retenir la caution jusqu'à résolution du litige (<a href="https://help.homeexchange.com/hc/en-us/articles/360000626478-What-happens-in-the-case-of-damages-or-disagreements">source</a>).</p>

<h3>L'assurance : un point à ne pas négliger</h3>

<p>Avant tout échange, il est nécessaire de vérifier que ta <strong>multirisque habitation couvre l'occupation par un tiers</strong> et de prévenir ton assureur (<a href="https://www.mma.fr/zeroblabla/assurance-echange-maisons.html">source MMA</a>). Certains contrats l'incluent d'office, d'autres non. Un coup de téléphone à son assureur avant le premier échange est un réflexe utile.</p>

<h3>Risques à ne pas minimiser</h3>

<p>L'échange de maison comporte des risques réels : dégâts matériels, objets cassés, intimité bousculée, séjour qui ne correspond pas aux photos. Ces situations restent minoritaires selon les retours d'expérience de la communauté — mais elles existent. La communication en amont, un guide d'accueil clair et un relevé des compteurs ou objets de valeur rangés réduisent les frictions sans les supprimer.</p>

<h2>Pour qui c'est (vraiment) fait — et pour qui ça ne l'est pas</h2>

<p>L'échange de maison convient à des profils précis. Ce n'est pas une solution universelle, et l'honnêteté sur ce point évite des déceptions.</p>

<p><strong>Ça correspond bien si tu :</strong></p>
<ul>
<li>Vis dans un logement que tu es prêt à partager avec des hôtes sérieux</li>
<li>Peux anticiper tes dates de voyage plusieurs semaines à l'avance</li>
<li>Apprécies le contact humain et la dimension relationnelle du voyage</li>
<li>Cherches à voyager plus fréquemment sans exploser ton budget hébergement</li>
<li>Vis dans un lieu de vie collectif et veux rencontrer d'autres communautés similaires</li>
</ul>

<p><strong>Ça correspond moins bien si tu :</strong></p>
<ul>
<li>Pars en voyage de dernière minute ou avec des dates très rigides</li>
<li>N'es pas à l'aise avec l'idée que des inconnus dorment dans ton lit</li>
<li>Attends un niveau de service hôtelier (réception, ménage quotidien, service en chambre)</li>
<li>Voyages seul et cherches une solution ultra-flexible et bon marché : d'autres options (auberges de jeunesse, couchsurfing) peuvent être plus adaptées</li>
<li>Habites dans une zone peu demandée ou avec des contraintes d'accès difficiles</li>
</ul>

<p>La réalité d'un lieu de vie collectif ajoute une couche : certains habitats participatifs ont des règles de fonctionnement internes (réunions, vie commune, gestion partagée) qui impliquent de briefer les hôtes en amont. C'est une richesse, mais aussi un investissement en communication.</p>

<h2>Par où commencer : 5 premiers pas</h2>

<p>Commencer un échange de maison demande un peu de préparation, surtout pour le premier séjour. Voici une séquence qui aide à éviter les erreurs classiques.</p>

<ol>
<li><strong>Soigne ton annonce avant de chercher.</strong> Un profil complet, avec des photos honnêtes et une description détaillée de ton lieu, multiplie tes chances de réponse positive. Consulte le <a href="/ressources/guide-proposer-un-sejour">guide pour proposer un séjour</a> pour les points à ne pas rater.</li>
<li><strong>Explore les lieux disponibles.</strong> Avant de contacter des hôtes, passe du temps à comprendre ce qui est proposé, les types de lieux, les zones géographiques. La page <a href="/discover">Découvrir les lieux</a> est un bon point de départ.</li>
<li><strong>Écris un premier message personnalisé.</strong> Un message générique reçoit rarement de réponse. Montre que tu as lu l'annonce, explique qui tu es, pourquoi ce lieu t'attire. La confiance se construit dès le premier contact.</li>
<li><strong>Prépare ton logement pour l'accueil.</strong> Un guide d'accueil écrit, les consignes pratiques (wifi, poubelles, équipements), les contacts d'urgence : tout ça facilite le séjour de tes hôtes et rassure les deux parties. Le <a href="/ressources/guide-accueillir-un-voyageur">guide pour accueillir un voyageur</a> détaille les étapes.</li>
<li><strong>Vérifie les modalités avec ton hôte avant de confirmer.</strong> Dates, nombre de personnes, animaux, règles de la maison, assurance : mieux vaut tout poser à plat par écrit avant l'échange. Consulte le <a href="/ressources/guide-preparer-son-sejour">guide pour préparer son séjour</a> pour une checklist complète.</li>
</ol>

<p>Et pour le tout premier séjour, un article dédié : <a href="/ressources/reussir-son-premier-sejour">Réussir son premier séjour</a>.</p>

<h2>Questions fréquentes</h2>

<h3>Faut-il échanger en même temps ?</h3>

<p>Non. L'échange simultané (les deux foyers partent en même temps) est une option parmi d'autres. L'échange différé permet de s'accueillir à des dates distinctes — les deux foyers se mettent d'accord sur un calendrier qui convient aux deux. Et le système de points supprime complètement cette contrainte de synchronisation : tu accueilles quand tu peux, tu séjournes quand tu veux.</p>

<h3>Et si je n'ai qu'un petit appartement ?</h3>

<p>Un petit logement bien situé et bien présenté peut susciter autant d'intérêt qu'une grande maison. La localisation, la clarté de l'annonce et la qualité du profil jouent davantage que la surface. En revanche, sois honnête sur les limites : combien de personnes peut-il accueillir confortablement ? Cela évitera des malentendus.</p>

<h3>Quelles assurances faut-il prévoir ?</h3>

<p>Commence par contacter ton assureur pour vérifier que ta multirisque habitation couvre l'occupation par un tiers non rémunéré (<a href="https://www.mma.fr/zeroblabla/assurance-echange-maisons.html">source MMA</a>). Certains contrats l'incluent, d'autres nécessitent une extension. La plateforme que tu utilises peut proposer ses propres garanties — lis les conditions précises avant ton premier échange.</p>

<h3>Quelle différence avec Airbnb ?</h3>

<p>Sur Airbnb, tu loues ton logement contre de l'argent : c'est une transaction commerciale, soumise à des obligations fiscales et réglementaires selon les villes. Sur une plateforme d'échange, il n'y a pas de paiement à la nuit : la réciprocité (directe ou par points) remplace l'argent. L'esprit est différent — moins de prestation, plus de relation. Pour en savoir plus sur le fonctionnement de Casa Minga : <a href="/comment-ca-marche">Comment ça marche</a>.</p>

<h3>Combien de temps faut-il pour trouver un premier échange ?</h3>

<p>Il n'y a pas de délai universel. Cela dépend de la popularité de ta zone, de l'attractivité de ton annonce et de la flexibilité de tes dates. Sur une grande plateforme généraliste, des semaines suffisent souvent. Sur un réseau de niche comme Casa Minga — qui cible les lieux de vie collectifs —, il faut compter davantage de temps, surtout si tu recherches un habitat participatif dans une région peu représentée. Anticiper et contacter plusieurs hôtes en parallèle est la stratégie la plus efficace.</p>

<h3>L'échange de maison, c'est légal ?</h3>

<p>Oui, dans la grande majorité des cas. L'échange de logement sans contrepartie financière n'est pas assimilé à une location. Il échappe donc aux règles sur la location touristique (pas de taxe de séjour, pas de plafond de nuits à déclarer). Toutefois, si tu vis dans une copropriété, vérifie que le règlement intérieur l'autorise. Certains contrats de location incluent aussi des clauses à ce sujet.</p>

<h2>Sources</h2>

<ul>
<li><a href="https://help.homeexchange.com/hc/en-us/articles/360000610118-The-benefits-of-a-HomeExchange-membership">HomeExchange — Avantages de l'adhésion (550 000 maisons, 155 pays)</a></li>
<li><a href="https://www.homeexchange.fr/blog/homeexchange-tarif/">HomeExchange — Tarif de l'abonnement (175 €/an)</a></li>
<li><a href="https://help.homeexchange.com/hc/en-us/articles/360000601998-What-are-reciprocal-and-non-reciprocal-exchanges">HomeExchange — Échanges réciproques et non réciproques (85 % par points)</a></li>
<li><a href="https://help.homeexchange.com/hc/en-us/articles/360000619397-What-guarantees-are-included-in-the-HomeExchange-membership">HomeExchange — Garanties incluses dans l'adhésion (dommages jusqu'à 1 000 000 $US, caution 2 500 $US)</a></li>
<li><a href="https://help.homeexchange.com/hc/en-us/articles/360000619497-How-does-the-deposit-process-work">HomeExchange — Procédure de caution</a></li>
<li><a href="https://help.homeexchange.com/hc/en-us/articles/360000626478-What-happens-in-the-case-of-damages-or-disagreements">HomeExchange — Procédure en cas de dégâts (10 jours / 30 jours)</a></li>
<li><a href="https://www.dwell.com/article/brief-history-home-swapping-house-exchanges-99b78250">Dwell — Brève histoire de l'échange de maison (Intervac 1953, HomeLink, Ed Kushins)</a></li>
<li><a href="https://www.mma.fr/zeroblabla/assurance-echange-maisons.html">MMA — Assurance et échange de maison</a></li>
</ul>$c$,
  true,
  now()
),
(
  'echange-reciproque-ou-points',
  $t$Échange réciproque ou échange par points : quelle différence ?$t$,
  $d$Échange réciproque ou échange par points d'hospitalité : deux modèles distincts pour séjourner dans un habitat partagé. On compare leurs principes, leur souplesse et leurs limites.$d$,
  'guide',
  $a$Casa Minga$a$,
  2026,
  null,
  null,
  ARRAY['echange reciproque','points hospitalite','comparatif'],
  $c$<h2>TL;DR</h2>

<p>Deux modèles existent pour séjourner dans un lieu de vie collectif sans payer de nuitée. L'<strong>échange réciproque</strong> : tu accueilles, on t'accueille — simultanément ou à des dates différentes. L'<strong>échange par points</strong> (ou points d'hospitalité) : tu accumules des points en accueillant, tu les dépenses pour séjourner ailleurs, sans que les dates se croisent. Les deux ont leurs forces et leurs angles morts. Cet article les compare pour t'aider à choisir — ou à combiner les deux.</p>

<h2>L'échange réciproque, c'est quoi ?</h2>

<p>L'échange réciproque est un accord direct entre deux foyers : chacun accueille l'autre dans son lieu de vie collectif, en contrepartie d'un séjour équivalent. C'est la forme la plus ancienne et la plus intuitive d'échange de logement — pas de monnaie, pas d'intermédiaire financier, juste une réciprocité assumée entre deux groupes ou deux personnes qui se font mutuellement confiance.</p>

<p>Il existe deux variantes.</p>

<p><strong>L'échange simultané</strong> : les deux séjours se déroulent en même temps. Tu es chez moi pendant que je suis chez toi. Les lieux sont occupés par les deux parties au même moment, ce qui convient bien aux habitats où une présence permanente est souhaitée.</p>

<p><strong>L'échange différé</strong> : les séjours n'ont pas lieu aux mêmes dates. Tu m'accueilles en mai, je te rends la pareille en septembre. Il faut alors un degré de confiance supplémentaire et une organisation claire, puisque rien ne garantit mécaniquement la réciprocité — c'est un engagement moral entre les deux hôtes.</p>

<p>La limite principale : trouver un binôme dont les disponibilités se superposent (simultané) ou dont les envies se complètent dans le temps (différé) demande du temps et parfois beaucoup d'échanges infructueux.</p>

<h2>L'échange par points, c'est quoi ?</h2>

<p>L'échange par points — aussi appelé échange non réciproque ou système de points d'hospitalité — dissocie l'accueil du séjour : tu gagnes des points en ouvrant ton lieu à d'autres habitantes et habitants, et tu dépenses ces points pour séjourner dans un habitat qui te convient, sans que les deux échanges soient liés. Ce mécanisme a été conçu précisément pour débloquer les situations où la réciprocité directe est difficile à caler sur des dates compatibles.</p>

<p>Concrètement : si tu peux accueillir en hiver mais voyager seulement en été, ou si personne dans ton réseau immédiat n'a envie de venir chez toi alors que tu rêves d'un écovillage en Bretagne, les points permettent de contourner cette contrainte de synchronisation.</p>

<p>C'est aujourd'hui le modèle dominant dans les grandes plateformes d'échange généralistes : sur HomeExchange, environ <a href="https://help.homeexchange.com/hc/en-us/articles/360000601998-What-are-reciprocal-and-non-reciprocal-exchanges">85 % des échanges sont non réciproques</a>, ce qui illustre l'attrait de cette souplesse.</p>

<p>La contrepartie : le système crée une forme de marché interne. La valeur d'un lieu peut être pondérée, et certains habitats "se vendent" mieux que d'autres en points. La relation est moins directe, parfois moins personnelle.</p>

<h2>Réciproque vs points : le tableau comparatif</h2>

<table>
<thead>
<tr><th>Critère</th><th>Échange réciproque</th><th>Échange par points</th></tr>
</thead>
<tbody>
<tr><td><strong>Principe</strong></td><td>Deux foyers s'accueillent mutuellement (simultané ou différé)</td><td>Tu accueilles → tu gagnes des points → tu séjournes ailleurs</td></tr>
<tr><td><strong>Synchronisation des dates</strong></td><td>Indispensable (simultané) ou à négocier (différé)</td><td>Aucune : accueil et séjour sont totalement indépendants</td></tr>
<tr><td><strong>Relation hôte-hôte</strong></td><td>Directe, bilatérale, souvent plus personnelle</td><td>Indirecte : tu n'accueilles pas nécessairement ceux qui t'accueilleront</td></tr>
<tr><td><strong>Souplesse de planning</strong></td><td>Faible à modérée</td><td>Élevée</td></tr>
<tr><td><strong>Pour qui ?</strong></td><td>Foyers disponibles à des périodes précises, cherchant une relation directe</td><td>Foyers à disponibilités décalées ou qui veulent choisir librement leur destination</td></tr>
<tr><td><strong>Limites</strong></td><td>Trouver le bon binôme prend du temps ; l'échange différé repose sur la confiance</td><td>Système plus abstrait ; certains lieux peuvent être "hors de prix" en points</td></tr>
<tr><td><strong>Adapté aux habitats collectifs ?</strong></td><td>Oui, surtout si le groupe préfère connaître ses hôtes à l'avance</td><td>Oui, si le groupe accueille facilement mais voyage à des moments variés</td></tr>
</tbody>
</table>

<h2>Lequel choisir selon ta situation ?</h2>

<p>Ni l'un ni l'autre n'est universellement meilleur. Le bon modèle dépend de ta situation concrète.</p>

<p><strong>Opte pour l'échange réciproque si</strong> tu connais des lieux avec qui tu veux construire une relation dans la durée. Si votre habitat est disponible sur des créneaux précis, et que tu veux savoir exactement qui t'accueillera — et réciproquement.</p>

<p><strong>Opte pour les points d'hospitalité si</strong> ton agenda est imprévisible, si tu veux partir quand l'envie se présente, ou si tu accueilles souvent mais voyages peu — et vice-versa. Les points te donnent une liberté de choix que l'échange direct ne peut pas toujours offrir.</p>

<p>Dans tous les cas, consulte notre <a href="/ressources/echange-de-maison-guide">guide complet sur l'échange de maison</a> pour comprendre les étapes clés avant de lancer ton premier séjour — que tu choisisses l'un ou l'autre modèle.</p>

<h2>Comment Casa Minga combine les deux</h2>

<p>Casa Minga Séjours propose les deux modèles sur la même plateforme, ce qui est rare dans l'espace de l'habitat partagé. Tu peux choisir, selon le séjour, de passer par un échange réciproque direct ou par le système de <a href="/points">points d'hospitalité</a>. Les deux modes coexistent, et rien ne t'oblige à n'en utiliser qu'un seul.</p>

<p>La plateforme est conçue exclusivement pour les lieux de vie collectifs — habitats participatifs, écovillages, maisons partagées, espaces de coliving. Ce n'est pas une plateforme généraliste : tu échanges avec des habitantes et habitants qui partagent une même culture du vivre-ensemble.</p>

<p>La <a href="/comment-ca-marche">page "comment ça marche"</a> détaille le fonctionnement pratique. Et pour comprendre comment la confiance est construite avant chaque séjour, la ressource sur la <a href="/ressources/verification-confiance-entre-hotes">vérification et la confiance entre hôtes</a> est un bon point de départ.</p>

<p>Côté modèle économique : adhésion annuelle, sans commission sur les échanges. Tu trouveras les habitats disponibles sur <a href="/discover">la page de découverte</a>.</p>

<h2>Questions fréquentes</h2>

<h3>Peut-on mélanger les deux modèles sur Casa Minga ?</h3>

<p>Oui. Rien n'impose de choisir un seul modèle pour tous tes séjours. Tu peux faire un échange réciproque avec un habitat que tu connais bien, et utiliser tes points d'hospitalité pour explorer un lieu où la réciprocité directe n'aurait pas pu fonctionner. Les deux systèmes coexistent sur la plateforme.</p>

<h3>Les points d'hospitalité expirent-ils ?</h3>

<p>Ce point dépend des règles de chaque plateforme. Sur Casa Minga, consulte directement les <a href="/points">conditions liées aux points</a> pour avoir une réponse à jour — les règles peuvent évoluer.</p>

<h3>L'échange différé est-il risqué ?</h3>

<p>L'échange différé — où tu accueilles maintenant et seras accueilli plus tard — repose sur la confiance entre les deux hôtes. Casa Minga vérifie les identités des membres par pièce d'identité, ce qui réduit le risque d'engagement non tenu. Mais comme pour tout accord humain, une communication claire en amont reste la meilleure garantie. Notre ressource <a href="/ressources/reussir-son-premier-sejour">réussir son premier séjour</a> aborde ces points pratiques.</p>

<h2>Sources</h2>

<ol>
<li>HomeExchange — <a href="https://help.homeexchange.com/hc/en-us/articles/360000601998-What-are-reciprocal-and-non-reciprocal-exchanges">Échanges réciproques et non réciproques : définitions et fonctionnement</a> (chiffre : ~85 % des échanges sont non réciproques ; définitions des deux modèles)</li>
<li>HomeExchange — <a href="https://help.homeexchange.com/hc/en-us/articles/360000610118-The-benefits-of-a-HomeExchange-membership">Les avantages d'une adhésion HomeExchange</a> (référence réseau : plus de 550 000 maisons dans 155 pays)</li>
</ol>$c$,
  true,
  now()
),
(
  'verification-confiance-entre-hotes',
  $t$Vérification d'identité et confiance entre hôtes$t$,
  $d$Profil vérifié, avis croisés, assurance, caution : Casa Minga Séjours t'explique honnêtement comment fonctionne la confiance dans un échange de maison entre lieux de vie collectifs.$d$,
  'guide',
  $a$Casa Minga$a$,
  2026,
  null,
  null,
  ARRAY['confiance','verification','securite','avis'],
  $c$<p><strong>TL;DR</strong></p>

<p>Casa Minga vérifie l'identité de ses membres via pièce d'identité (supprimée après contrôle, conformément au RGPD). Les avis sont bidirectionnels : invité et hôte s'évaluent mutuellement. L'assurance habitation reste ta première ligne de défense ; certaines plateformes proposent des garanties complémentaires sur les dommages matériels. Aucun système n'élimine tout risque — mais plusieurs mécanismes permettent de les réduire sérieusement.</p>

<h2>Pourquoi la confiance est le vrai moteur de l'échange de maison</h2>

<p>Confier son logement à des inconnus, même membres d'une même communauté, demande un saut de confiance réel : c'est précisément ce saut qui rend l'échange de maison possible, et c'est pourquoi tout l'enjeu d'une plateforme d'échange est de le rendre raisonnable, sans promettre l'impossible. Dans un échange réciproque ou par points d'hospitalité, les deux parties prennent un risque symétrique : l'hôte ouvre sa maison, l'invité reçoit un espace de vie qui ne lui appartient pas. Cette réciprocité crée une responsabilité partagée que ne génère pas une simple location.</p>

<p>Les lieux de vie collectifs — colocations, écolieux, habitats participatifs — ajoutent une couche supplémentaire : tu n'ouvres pas seulement ta chambre, mais un espace commun, une dynamique de groupe, parfois un projet de vie. La confiance n'est donc pas un détail de confort. C'est la condition de l'échange lui-même.</p>

<p>Pour aller plus loin sur le fonctionnement général, le <a href="/ressources/echange-de-maison-guide">guide complet de l'échange de maison</a> pose les bases.</p>

<h2>La vérification d'identité, concrètement</h2>

<p>La vérification d'identité est la première étape pour qu'un profil soit considéré comme fiable sur Casa Minga Séjours : un membre fournit une pièce d'identité officielle, qui est contrôlée puis supprimée — conformément au RGPD — et le profil affiche ensuite un badge "Profil vérifié" visible de tous.</p>

<p>Ce que cette vérification apporte concrètement :</p>

<ul>
<li><strong>Elle confirme que la personne existe</strong> et correspond à l'identité déclarée.</li>
<li><strong>Elle crée un engagement implicite</strong> : un membre vérifié sait que son identité réelle est associée à son comportement sur la plateforme.</li>
<li><strong>Le badge est visible</strong> sur le profil, avant tout contact ou demande d'échange.</li>
</ul>

<p>Ce qu'elle ne garantit pas : que la personne prendra soin de ton espace comme toi tu le ferais. La vérification d'identité réduit l'anonymat, elle ne prédit pas les comportements. C'est une condition nécessaire, pas suffisante.</p>

<p>La pièce d'identité est supprimée après contrôle. Tu ne la stockes pas, Casa Minga non plus, une fois le badge attribué. Le respect du RGPD n'est pas un argument marketing : c'est une obligation légale que la plateforme choisit de tenir de façon transparente.</p>

<p>Pour comprendre la procédure et obtenir ton propre badge, consulte la page <a href="/verification">devenir membre vérifié</a>.</p>

<h2>Les avis croisés : ta réputation marche dans les deux sens</h2>

<p>Dans un échange de maison, l'avis n'est pas à sens unique : invité et hôte s'évaluent mutuellement après chaque séjour, ce qui crée un mécanisme de responsabilisation symétrique souvent absent des plateformes de location classiques. Un invité qui laisse un espace en mauvais état, ou un hôte qui ne correspond pas à la description de son logement, accumule un historique visible.</p>

<p>Ce système d'avis bidirectionnels a plusieurs effets concrets :</p>

<ul>
<li>Il incite les deux parties à bien se préparer et à communiquer clairement avant le séjour.</li>
<li>Il permet de repérer rapidement les profils avec peu d'avis ou des retours mitigés.</li>
<li>Il rend visible l'expérience réelle, pas seulement le profil déclaratif.</li>
</ul>

<p>Une limite honnête à mentionner : les avis sont écrits après coup, parfois avec une politesse de façade. Lire entre les lignes — un avis enthousiaste mais vague, l'absence de commentaire sur un point précis — reste une compétence que tu développes avec l'expérience. Le guide <a href="/ressources/reussir-son-premier-sejour">réussir son premier séjour</a> donne des repères utiles pour ça.</p>

<h2>Dégâts, assurance, caution : qui paie quoi ?</h2>

<p>La question des dommages matériels est celle que personne n'aime poser, mais qu'il vaut mieux avoir posée avant le séjour : en cas de casse, de vol ou de dégradation, la responsabilité dépend d'abord de ton contrat d'assurance habitation, et ensuite des garanties ou mécanismes proposés par la plateforme. Il n'existe pas de filet universel.</p>

<h3>Ton assurance habitation : le point de départ</h3>

<p>Avant tout échange, vérifie auprès de ton assureur que ta multirisque habitation couvre l'occupation de ton logement par un tiers. Ce n'est pas automatique. <a href="https://www.mma.fr/zeroblabla/assurance-echange-maisons.html">MMA le détaille clairement</a> : prévenir son assureur avant l'échange est une démarche simple, mais indispensable pour que la couverture soit effective.</p>

<h3>Ce que font certaines plateformes d'échange</h3>

<p>À titre de comparaison, HomeExchange — l'une des plus grandes plateformes mondiales d'échange de maison — propose dans son adhésion une garantie sur les dommages matériels <a href="https://help.homeexchange.com/hc/en-us/articles/360000619397-What-guarantees-are-included-in-the-HomeExchange-membership">allant jusqu'à 1 000 000 $US, avec une autorisation de caution jusqu'à 2 500 $US</a>, activée seulement si nécessaire. <a href="https://help.homeexchange.com/hc/en-us/articles/360000626478-What-happens-in-the-case-of-damages-or-disagreements">En cas de litige sur des dégâts</a>, l'invité dispose de 10 jours pour valider ou contester le montant réclamé ; sans accord sous 30 jours, la plateforme retient la caution jusqu'à résolution. Ce modèle donne un repère utile sur ce que peut proposer un système de garanties structuré.</p>

<p>Casa Minga Séjours est une plateforme d'échange entre lieux de vie collectifs, sans paiement à la nuitée ni commission. Les modalités de garantie propres à l'adhésion Casa Minga sont à consulter directement sur <a href="/charte">la charte</a> et les conditions d'utilisation.</p>

<h3>Ce qu'il vaut mieux prévoir de ton côté</h3>

<ul>
<li>Un inventaire photographié avant et après le séjour.</li>
<li>Une communication claire sur les objets fragiles ou les espaces partagés avec d'autres habitantes et habitants.</li>
<li>Une discussion ouverte sur les attentes de chacun avant le départ.</li>
</ul>

<h2>Le bon sens avant et pendant le séjour</h2>

<p>Aucune plateforme, aucun badge, aucune assurance ne remplacent la préparation humaine et directe entre hôtes : quelques réflexes simples réduisent considérablement les mauvaises surprises, sans transformer l'échange en procédure administrative.</p>

<p>Avant le séjour :</p>

<ol>
<li><strong>Lis les avis dans le détail</strong>, pas seulement la note globale.</li>
<li><strong>Échange par messages ou visio</strong> avec l'hôte ou l'invité — la qualité du contact est souvent un bon indicateur.</li>
<li><strong>Vérifie que le profil est vérifié</strong> (badge visible) avant d'accepter ou de demander un séjour.</li>
<li><strong>Clarifie les règles de l'espace commun</strong> si le lieu est partagé avec d'autres résidents.</li>
<li><strong>Préviens ton assureur</strong> si tu ouvres ton logement.</li>
<li><strong>Fais un inventaire</strong> — photos, état des équipements, consignes spécifiques.</li>
</ol>

<p>Pendant le séjour :</p>

<ul>
<li>Reste disponible pour répondre aux questions de tes invités, même à distance.</li>
<li>En cas de problème, la communication directe et rapide vaut mieux que l'escalade immédiate.</li>
</ul>

<p>L'article <a href="/ressources/guide-accueillir-un-voyageur">guide pour bien accueillir un voyageur</a> détaille ces réflexes côté hôte.</p>

<p>Un dernier point d'honnêteté : même avec tous ces mécanismes en place, un échange de maison comporte une part d'inconnu. Des gens différents de toi vont vivre dans ton espace, avec leurs habitudes, leur rapport aux objets, leur définition du "propre" ou du "rangé". C'est inhérent à l'échange. Ce que les outils permettent, c'est de choisir avec qui tu prends ce risque — pas de le supprimer.</p>

<h2>Questions fréquentes</h2>

<p><strong>Q : Si quelqu'un a le badge "Profil vérifié", est-ce que ça garantit qu'il prendra soin de mon logement ?</strong></p>

<p>Non. Le badge "Profil vérifié" confirme que l'identité du membre a été contrôlée via pièce d'identité. Il atteste de l'authenticité de la personne, pas de son comportement. Pour évaluer ce dernier, ce sont les avis bidirectionnels et la qualité des échanges préalables qui comptent.</p>

<p><strong>Q : Ma pièce d'identité est-elle conservée par Casa Minga après vérification ?</strong></p>

<p>Non. Conformément au RGPD, la pièce d'identité est supprimée après le contrôle. Seul le badge "Profil vérifié" reste visible sur ton profil. Pour les détails de la procédure, consulte la page <a href="/verification">/verification</a>.</p>

<p><strong>Q : En cas de dégâts dans mon logement, que se passe-t-il concrètement ?</strong></p>

<p>La première étape est ton assurance habitation multirisque — vérifie qu'elle couvre l'occupation par un tiers et préviens ton assureur avant l'échange. Ensuite, les mécanismes de la plateforme (caution, procédure de litige) peuvent intervenir selon les modalités prévues dans la <a href="/charte">charte Casa Minga</a>. Un inventaire photographié avant/après reste le document le plus utile en cas de désaccord.</p>

<h2>Sources</h2>

<ul>
<li><a href="https://help.homeexchange.com/hc/en-us/articles/360000619397-What-guarantees-are-included-in-the-HomeExchange-membership">Garanties incluses dans l'adhésion HomeExchange (dommages matériels, vol)</a></li>
<li><a href="https://help.homeexchange.com/hc/en-us/articles/360000619497-How-does-the-deposit-process-work">Fonctionnement de la caution HomeExchange</a></li>
<li><a href="https://help.homeexchange.com/hc/en-us/articles/360000626478-What-happens-in-the-case-of-damages-or-disagreements">Procédure en cas de dégâts ou désaccord – HomeExchange</a></li>
<li><a href="https://www.mma.fr/zeroblabla/assurance-echange-maisons.html">Assurance et échange de maisons – MMA Zéro Blabla</a></li>
</ul>$c$,
  true,
  now()
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  type = excluded.type,
  author_or_director = excluded.author_or_director,
  year = excluded.year,
  tags = excluded.tags,
  content = excluded.content,
  is_published = excluded.is_published;
