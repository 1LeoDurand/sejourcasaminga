-- Migration: seed_resources_articles_c4_i18n
-- Ajoute une colonne `lang` (defaut 'fr', retro-compatible) et insere les
-- versions EN + ES des 3 guides du cluster 4 (1 row par langue, slug localise).
-- Idempotent : ADD COLUMN IF NOT EXISTS + ON CONFLICT (slug) DO UPDATE.
-- Dollar-quoting : titre $t$, description $d$, auteur $a$, content $c$.

alter table public.resources add column if not exists lang text not null default 'fr';

insert into public.resources
  (slug, title, description, type, author_or_director, year, cover_image, external_link, tags, content, lang, is_published, created_at)
values

-- 1. EN pilier: home-exchange-guide
(
  'home-exchange-guide',
  $t$Home exchange: how to travel by staying in someone else's home$t$,
  $d$How home exchange works, what it really costs, and whether it's safe. An honest guide with a comparison, FAQ and practical tips.$d$,
  'guide',
  $a$Casa Minga$a$,
  2026,
  null,
  null,
  ARRAY['home exchange','travel','hospitality','guide'],
  $c$<p><strong>TL;DR</strong> — Home exchange means traveling and staying for free in someone's home while they stay in yours — or in someone else's, through a points system. You pay an annual membership to a platform, not per night. No rent, no commission, just a relationship of trust between hosts. It takes flexibility, planning ahead, and clear communication.</p>

<h2>What is home exchange, exactly?</h2>

<p>Home exchange is a practice where two people or households lend each other their homes — at the same time or on different dates — without any money changing hands for the night: each stay is funded by reciprocity or by hospitality points accumulated on a shared platform.</p>

<p>The idea is not new. In 1953, two initiatives emerged almost simultaneously: <strong>Intervac</strong>, launched by European teachers, and <strong>HomeLink</strong>, founded by New York teacher David Ostroff under the name "Vacation Exchange Club" (<a href="https://www.dwell.com/article/brief-history-home-swapping-house-exchanges-99b78250">source</a>). At the time, everything went through printed directories, letters and phone calls. In the 1990s, websites arrived and transformed the logistics: HomeExchange.com, founded by Ed Kushins, was among the pioneers of this digital shift.</p>

<p>Today, home exchange covers all kinds of places: single-family homes, city apartments, chalets, but also — and this is what makes Casa Minga distinctive — <strong>collective living places</strong>: co-housing projects, ecovillages, shared houses, coliving spaces. These spaces have a culture of hospitality and shared life that often makes exchanges easier.</p>

<p>Home exchange does not eliminate all travel costs. Transport, food, local activities: those remain your responsibility. But it removes the "accommodation" line from the bill — often the heaviest one.</p>

<h2>Reciprocal or points: what's the difference?</h2>

<p>There are two main models of home exchange: reciprocal exchange, where two households swap their homes directly, and points exchange (or hospitality points), where each stay you host or receive generates points you can spend with a third party (<a href="https://help.homeexchange.com/hc/en-us/articles/360000601998-What-are-reciprocal-and-non-reciprocal-exchanges">source</a>).</p>

<p>On HomeExchange, around <strong>85% of exchanges are non-reciprocal</strong>, meaning points-based (<a href="https://help.homeexchange.com/hc/en-us/articles/360000601998-What-are-reciprocal-and-non-reciprocal-exchanges">source</a>). That figure says something important: the flexibility of the points system fits modern schedules better.</p>

<table>
<thead>
<tr><th></th><th>Reciprocal exchange</th><th>Points exchange</th></tr>
</thead>
<tbody>
<tr><td><strong>Principle</strong></td><td>Two households host each other</td><td>One household hosts, the other spends points earned elsewhere</td></tr>
<tr><td><strong>Timing</strong></td><td>Simultaneous or deferred (within the year)</td><td>Completely free — no synchronization required</td></tr>
<tr><td><strong>Flexibility</strong></td><td>Lower — you need someone who wants to come to yours at the same time</td><td>High — you choose a destination independently of who comes to you</td></tr>
<tr><td><strong>Best for</strong></td><td>Hosts with an attractive place and fixed dates</td><td>Hosts who are open to welcoming guests with a flexible schedule</td></tr>
<tr><td><strong>Points generated</strong></td><td>No (it's a direct swap)</td><td>Yes — each night you host credits points</td></tr>
</tbody>
</table>

<p>Reciprocal exchange can be <strong>simultaneous</strong> (both households leave at the same time) or <strong>deferred</strong> (you each host the other at different times). The deferred form is similar in logic to the points system, but remains tied to a bilateral relationship.</p>

<p>To go further on this choice: <a href="/ressources/reciprocal-or-points-exchange">Reciprocal or points exchange: how to choose?</a></p>

<h2>What does it really cost?</h2>

<p>Home exchange is not free: it is based on an <strong>annual membership</strong> to a platform, which then gives you access to unlimited exchanges with no additional commission per stay. The cost varies by platform.</p>

<p>HomeExchange, the world leader with <strong>more than 550,000 homes in 155 countries</strong> (<a href="https://help.homeexchange.com/hc/en-us/articles/360000610118-The-benefits-of-a-HomeExchange-membership">source</a>), charges <strong>€175 per year</strong> for unlimited access (<a href="https://www.homeexchange.fr/blog/homeexchange-tarif/">source</a>). Once you have paid that membership, there are no additional charges per exchange: no commission, no service fee, no nightly cleaning fee.</p>

<h3>Where does Casa Minga fit in?</h3>

<p>Casa Minga Séjours works on the same basic model: an annual membership, with no commission per stay. The platform is <strong>free until June 2026</strong>. It is aimed exclusively at collective living places — which makes it a niche network, with a smaller listing volume than the large generalist platforms, but a community that shares the same values.</p>

<p>It is worth being honest about the limits: the smaller the network, the more patience it takes to find a match. An exchange between two ecovillages in France can take several weeks of coordination.</p>

<h3>What you will still pay for</h3>

<p>The membership does not cover:</p>
<ul>
<li>Transport (train, plane, car)</li>
<li>Food on site</li>
<li>Activities and outings</li>
<li>Travel insurance if you choose to take it out</li>
</ul>

<p>But on a week-long family stay, saving several hundred euros on accommodation changes the budget picture considerably.</p>

<h2>Is it safe? The question of trust</h2>

<p>Trust is central to any home exchange: you welcome strangers into your home, and you stay in strangers' homes. No platform can eliminate that reality — but several mechanisms exist to manage it.</p>

<h3>Profile verification</h3>

<p>Casa Minga verifies profiles by <strong>official ID document</strong>. This verification does not guarantee how a host will behave, but it reduces complete anonymity and creates named accountability. Reviews left after each stay complete the picture.</p>

<p>To understand how this process works: <a href="/ressources/verification-and-trust-between-hosts">Verification and trust between hosts</a> and <a href="/verification">the verification page</a>.</p>

<h3>Deposits and guarantees (the HomeExchange example)</h3>

<p>HomeExchange provides a useful reference framework. Its membership includes a <strong>material damage guarantee of up to $1,000,000 USD</strong> and compensation in the event of theft. The deposit works as a <strong>pre-authorization of up to $2,500 USD</strong>, activated only if damage is found (<a href="https://help.homeexchange.com/hc/en-us/articles/360000619397-What-guarantees-are-included-in-the-HomeExchange-membership">source</a>).</p>

<p>If there is damage, the guest has <strong>10 days to approve or dispute the claim</strong>. Without agreement within 30 days, the platform can withhold the deposit until the dispute is resolved (<a href="https://help.homeexchange.com/hc/en-us/articles/360000626478-What-happens-in-the-case-of-damages-or-disagreements">source</a>).</p>

<h3>Insurance: a point not to overlook</h3>

<p>Before any exchange, check that your <strong>home insurance covers third-party occupancy and notify your insurer</strong> (<a href="https://www.mma.fr/zeroblabla/assurance-echange-maisons.html">source MMA</a>) (in France, MMA covers this topic clearly). Some policies include it as standard; others do not. A quick call to your insurer before your first exchange is a useful habit.</p>

<h3>Risks not to downplay</h3>

<p>Home exchange carries real risks: material damage, broken objects, disrupted privacy, a stay that does not match the photos. These situations remain in the minority according to community feedback — but they do happen. Communicating in advance, providing a clear welcome guide and noting down meter readings or storing valuable items reduces friction, without eliminating it entirely.</p>

<h2>Who it's (really) for — and who it isn't</h2>

<p>Home exchange suits specific profiles. It is not a universal solution, and being honest about that avoids disappointment.</p>

<p><strong>It works well if you:</strong></p>
<ul>
<li>Live somewhere you are willing to share with responsible guests</li>
<li>Can plan your travel dates several weeks in advance</li>
<li>Enjoy human contact and the relational side of travel</li>
<li>Want to travel more often without blowing your accommodation budget</li>
<li>Live in a collective living place and want to meet other similar communities</li>
</ul>

<p><strong>It works less well if you:</strong></p>
<ul>
<li>Travel last-minute or with very rigid dates</li>
<li>Are not comfortable with the idea of strangers sleeping in your bed</li>
<li>Expect hotel-level service (reception, daily cleaning, room service)</li>
<li>Travel solo and want an ultra-flexible, low-cost option: other options (hostels, couchsurfing) may suit you better</li>
<li>Live somewhere with little demand or difficult access</li>
</ul>

<p>The reality of a collective living place adds a layer: some co-housing projects have internal operating rules (meetings, communal life, shared management) that require briefing guests in advance. That is a richness, but also an investment in communication.</p>

<h2>Where to start: 5 first steps</h2>

<p>Starting a home exchange takes some preparation, especially for the first stay. Here is a sequence that helps avoid the classic mistakes.</p>

<ol>
<li><strong>Work on your listing before you start searching.</strong> A complete profile, with honest photos and a detailed description of your place, multiplies your chances of a positive response. Check <a href="/comment-ca-marche">how to list your place</a> for the key points not to miss.</li>
<li><strong>Explore the places available.</strong> Before contacting hosts, spend time understanding what is on offer, the types of places, the geographic areas. The <a href="/discover">Discover</a> page is a good starting point.</li>
<li><strong>Write a personalized first message.</strong> A generic message rarely gets a reply. Show that you have read the listing, explain who you are, why this place appeals to you. Trust starts building from the first contact.</li>
<li><strong>Prepare your home for guests.</strong> A written welcome guide, practical instructions (wifi, bins, appliances), emergency contacts: all of this makes your guests' stay easier and reassures both parties. The <a href="/comment-ca-marche">how it works page</a> walks you through the steps.</li>
<li><strong>Confirm the details with your host before committing.</strong> Dates, number of people, pets, house rules, insurance: better to lay everything out in writing before the exchange. Check the <a href="/comment-ca-marche">how it works page</a> for a complete checklist.</li>
</ol>

<h2>Frequently asked questions</h2>

<h3>Do both parties have to exchange at the same time?</h3>

<p>No. Simultaneous exchange — where both households leave at the same time — is one option among several. Deferred exchange allows you to host each other on different dates; both households agree on a schedule that works for both. And the points system removes this synchronization constraint entirely: you host when you can, you stay when you want.</p>

<h3>What if I only have a small apartment?</h3>

<p>A small, well-located, well-presented place can attract as much interest as a large house. Location, listing clarity and profile quality matter more than floor area. Be honest about the limits though: how many people can it comfortably accommodate? That avoids misunderstandings.</p>

<h3>What insurance do I need?</h3>

<p>Start by contacting your insurer to check that your home insurance covers third-party, non-paying occupancy (<a href="https://www.mma.fr/zeroblabla/assurance-echange-maisons.html">source MMA</a>). Some policies include it; others require an extension. The platform you use may offer its own guarantees — read the exact conditions before your first exchange.</p>

<h3>What's the difference from Airbnb?</h3>

<p>On Airbnb, you rent your home for money: it is a commercial transaction, subject to tax and regulatory obligations depending on the city. On an exchange platform, there is no payment per night: reciprocity (direct or via points) replaces money. The spirit is different — less service transaction, more relationship. To learn more about how Casa Minga works: <a href="/comment-ca-marche">How it works</a>.</p>

<h3>How long does it take to find a first exchange?</h3>

<p>There is no universal timeframe. It depends on the demand for your area, the appeal of your listing and the flexibility of your dates. On a large generalist platform, a few weeks is often enough. On a niche network like Casa Minga — which targets collective living places — it takes longer, especially if you are looking for a co-housing project in an underrepresented region. Reaching out to several hosts in parallel is the most effective strategy.</p>

<h3>Is home exchange legal?</h3>

<p>Yes, in the vast majority of cases. Swapping homes without financial compensation is not treated as a rental. It therefore falls outside the rules on tourist rentals (no tourist tax, no night-count declarations). That said, if you live in a co-owned building, check that the building regulations allow it. Some rental contracts also include clauses on this.</p>

<h2>Sources</h2>

<ul>
<li><a href="https://help.homeexchange.com/hc/en-us/articles/360000610118-The-benefits-of-a-HomeExchange-membership">HomeExchange — Membership benefits (550,000 homes, 155 countries)</a></li>
<li><a href="https://www.homeexchange.fr/blog/homeexchange-tarif/">HomeExchange — Membership price (€175/year)</a></li>
<li><a href="https://help.homeexchange.com/hc/en-us/articles/360000601998-What-are-reciprocal-and-non-reciprocal-exchanges">HomeExchange — Reciprocal and non-reciprocal exchanges (85% via points)</a></li>
<li><a href="https://help.homeexchange.com/hc/en-us/articles/360000619397-What-guarantees-are-included-in-the-HomeExchange-membership">HomeExchange — Guarantees included in membership (damage up to $1,000,000 USD, deposit $2,500 USD)</a></li>
<li><a href="https://help.homeexchange.com/hc/en-us/articles/360000619497-How-does-the-deposit-process-work">HomeExchange — Deposit process</a></li>
<li><a href="https://help.homeexchange.com/hc/en-us/articles/360000626478-What-happens-in-the-case-of-damages-or-disagreements">HomeExchange — What happens in case of damage (10 days / 30 days)</a></li>
<li><a href="https://www.dwell.com/article/brief-history-home-swapping-house-exchanges-99b78250">Dwell — Brief history of home swapping (Intervac 1953, HomeLink, Ed Kushins)</a></li>
<li><a href="https://www.mma.fr/zeroblabla/assurance-echange-maisons.html">MMA — Insurance and home exchange</a></li>
</ul>$c$,
  'en',
  true,
  now()
),

-- 2. EN S1: reciprocal-or-points-exchange
(
  'reciprocal-or-points-exchange',
  $t$Reciprocal or points exchange: what's the difference?$t$,
  $d$Reciprocal exchange or hospitality points exchange: two distinct models for staying in a shared collective living place. We compare their principles, flexibility and limits.$d$,
  'guide',
  $a$Casa Minga$a$,
  2026,
  null,
  null,
  ARRAY['reciprocal exchange','hospitality points','comparison'],
  $c$<h2>TL;DR</h2>

<p>There are two models for staying in a collective living place without paying per night. <strong>Reciprocal exchange</strong>: you host, you get hosted — at the same time or on different dates. <strong>Points exchange</strong> (or hospitality points): you earn points by hosting, and spend them to stay somewhere else, with no need for the dates to overlap. Both have strengths and blind spots. This article compares them to help you choose — or combine the two.</p>

<h2>What is reciprocal exchange?</h2>

<p>Reciprocal exchange is a direct agreement between two households: each hosts the other in their collective living place, in return for an equivalent stay. It is the oldest and most intuitive form of home exchange — no money, no financial intermediary, just a clear-cut reciprocity between two groups or two people who trust each other.</p>

<p>There are two variants.</p>

<p><strong>Simultaneous exchange</strong>: both stays happen at the same time. You are at mine while I am at yours. Both places are occupied by both parties at the same moment, which works well for places where a permanent presence is preferred.</p>

<p><strong>Deferred exchange</strong>: the stays do not happen at the same time. You host me in May, I return the favour in September. This requires an extra degree of trust and clear organisation, since nothing mechanically guarantees the reciprocity — it is a moral commitment between the two hosts.</p>

<p>The main limit: finding a pair whose availability overlaps (simultaneous) or whose wishes complement each other over time (deferred) takes time, and sometimes involves many fruitless approaches.</p>

<h2>What is points exchange?</h2>

<p>Points exchange — also called non-reciprocal exchange or hospitality points system — separates hosting from staying: you earn points by opening your place to other residents, and you spend those points to stay in a place that suits you, without the two exchanges being linked. This mechanism was designed precisely to unlock situations where direct reciprocity is hard to schedule on compatible dates.</p>

<p>In practice: if you can host in winter but only travel in summer, or if nobody in your immediate network wants to come to your place while you are dreaming of an ecovillage in Brittany, points let you get around that synchronization constraint.</p>

<p>This is now the dominant model on large generalist exchange platforms: on HomeExchange, around <a href="https://help.homeexchange.com/hc/en-us/articles/360000601998-What-are-reciprocal-and-non-reciprocal-exchanges">85% of exchanges are non-reciprocal</a>, which shows the appeal of this flexibility.</p>

<p>The trade-off: the system creates a form of internal market. The value of a place can be weighted, and some homes "cost" more in points than others. The relationship is less direct, sometimes less personal.</p>

<h2>Reciprocal vs points: the comparison table</h2>

<table>
<thead>
<tr><th>Criterion</th><th>Reciprocal exchange</th><th>Points exchange</th></tr>
</thead>
<tbody>
<tr><td><strong>Principle</strong></td><td>Two households host each other (simultaneous or deferred)</td><td>You host → you earn points → you stay somewhere else</td></tr>
<tr><td><strong>Date synchronization</strong></td><td>Essential (simultaneous) or to be negotiated (deferred)</td><td>None: hosting and staying are completely independent</td></tr>
<tr><td><strong>Host-host relationship</strong></td><td>Direct, bilateral, often more personal</td><td>Indirect: you do not necessarily host the people who will host you</td></tr>
<tr><td><strong>Scheduling flexibility</strong></td><td>Low to moderate</td><td>High</td></tr>
<tr><td><strong>Best for</strong></td><td>Households available at specific periods, looking for a direct relationship</td><td>Households with staggered availability or who want to choose their destination freely</td></tr>
<tr><td><strong>Limits</strong></td><td>Finding the right match takes time; deferred exchange relies on trust</td><td>More abstract system; some places may be "expensive" in points</td></tr>
<tr><td><strong>Suited to collective living places?</strong></td><td>Yes, especially if the group prefers to know their guests in advance</td><td>Yes, if the group hosts easily but travels at varying times</td></tr>
</tbody>
</table>

<h2>Which should you choose for your situation?</h2>

<p>Neither model is universally better. The right one depends on your concrete situation.</p>

<p><strong>Go for reciprocal exchange if</strong> you know places you want to build an ongoing relationship with. If your place is available on specific slots, and you want to know exactly who will host you — and vice versa.</p>

<p><strong>Go for hospitality points if</strong> your schedule is unpredictable, if you want to travel when the mood strikes, or if you host often but travel little — or the other way round. Points give you a freedom of choice that direct exchange cannot always offer.</p>

<p>Either way, read our <a href="/ressources/home-exchange-guide">complete guide to home exchange</a> to understand the key steps before launching your first stay — whichever model you choose.</p>

<h2>How Casa Minga combines both</h2>

<p>Casa Minga Séjours offers both models on the same platform, which is rare in the shared living space. Depending on the stay, you can choose a direct reciprocal exchange or use the <a href="/points">hospitality points</a> system. Both modes coexist, and nothing forces you to stick to just one.</p>

<p>The platform is designed exclusively for collective living places — co-housing projects, ecovillages, shared houses, coliving spaces. It is not a generalist platform: you exchange with residents who share the same culture of living together.</p>

<p>The <a href="/comment-ca-marche">how it works page</a> covers the practical mechanics. And to understand how trust is built before each stay, the resource on <a href="/ressources/verification-and-trust-between-hosts">verification and trust between hosts</a> is a good starting point.</p>

<p>On the pricing side: annual membership, no commission on exchanges. You can browse available places on <a href="/discover">the discovery page</a>.</p>

<h2>Frequently asked questions</h2>

<h3>Can you mix both models on Casa Minga?</h3>

<p>Yes. Nothing requires you to choose a single model for all your stays. You can do a reciprocal exchange with a place you know well, and use your hospitality points to explore somewhere where direct reciprocity could not have worked. Both systems coexist on the platform.</p>

<h3>Do hospitality points expire?</h3>

<p>That depends on each platform's rules. On Casa Minga, check the <a href="/points">points page</a> directly for up-to-date information — the rules may evolve.</p>

<h3>Is deferred exchange risky?</h3>

<p>Deferred exchange — where you host now and will be hosted later — relies on trust between the two hosts. Casa Minga verifies members' identities by official ID document, which reduces the risk of a commitment not being honoured. But as with any human agreement, clear communication in advance remains the best guarantee. Our resource on <a href="/ressources/verification-and-trust-between-hosts">verification and trust between hosts</a> covers these practical points.</p>

<h2>Sources</h2>

<ol>
<li>HomeExchange — <a href="https://help.homeexchange.com/hc/en-us/articles/360000601998-What-are-reciprocal-and-non-reciprocal-exchanges">Reciprocal and non-reciprocal exchanges: definitions and how they work</a> (figure: ~85% of exchanges are non-reciprocal; definitions of both models)</li>
<li>HomeExchange — <a href="https://help.homeexchange.com/hc/en-us/articles/360000610118-The-benefits-of-a-HomeExchange-membership">The benefits of a HomeExchange membership</a> (network reference: more than 550,000 homes in 155 countries)</li>
</ol>$c$,
  'en',
  true,
  now()
),

-- 3. EN S2: verification-and-trust-between-hosts
(
  'verification-and-trust-between-hosts',
  $t$Identity verification and trust between hosts$t$,
  $d$Verified profile, mutual reviews, insurance, deposit: Casa Minga Séjours gives you an honest account of how trust works in a home exchange between collective living places.$d$,
  'guide',
  $a$Casa Minga$a$,
  2026,
  null,
  null,
  ARRAY['trust','verification','safety','reviews'],
  $c$<p><strong>TL;DR</strong></p>

<p>Casa Minga verifies its members' identities via an official ID document (deleted after review, in compliance with GDPR). Reviews are mutual: guest and host evaluate each other. Your home insurance is your first line of defence; some platforms offer supplementary guarantees on material damage. No system eliminates all risk — but several mechanisms reduce it significantly.</p>

<h2>Why trust is the real engine of home exchange</h2>

<p>Entrusting your home to strangers, even members of the same community, requires a genuine leap of trust: that leap is precisely what makes home exchange possible, and it is why everything a platform does comes down to making it reasonable — without promising the impossible. In a reciprocal exchange or a hospitality points exchange, both parties take a symmetrical risk: the host opens their home, the guest receives a living space that does not belong to them. That reciprocity creates a shared responsibility that a simple rental does not generate.</p>

<p>Collective living places — shared houses, ecovillages, co-housing projects — add an extra layer: you are not just opening your room, but a shared space, a group dynamic, sometimes a life project. Trust is not a comfort detail here. It is the condition for the exchange itself.</p>

<p>For more on the general mechanics, the <a href="/ressources/home-exchange-guide">complete guide to home exchange</a> covers the basics.</p>

<h2>Identity verification, in practice</h2>

<p>Identity verification is the first step for a profile to be considered reliable on Casa Minga Séjours: a member submits an official ID document, which is reviewed and then deleted — in compliance with GDPR — and the profile then displays a "Verified Profile" badge visible to everyone.</p>

<p>What this verification actually provides:</p>

<ul>
<li><strong>It confirms the person exists</strong> and matches the declared identity.</li>
<li><strong>It creates an implicit commitment</strong>: a verified member knows their real identity is linked to their behaviour on the platform.</li>
<li><strong>The badge is visible</strong> on the profile, before any contact or exchange request.</li>
</ul>

<p>What it does not guarantee: that the person will take care of your space the way you would. Identity verification reduces anonymity; it does not predict behaviour. It is a necessary condition, not a sufficient one.</p>

<p>The ID document is deleted after review. You do not keep it, and neither does Casa Minga, once the badge has been assigned. GDPR compliance is not a marketing argument: it is a legal obligation that the platform chooses to meet transparently.</p>

<p>To understand the process and get your own badge, visit the <a href="/verification">become a verified member</a> page.</p>

<h2>Mutual reviews: your reputation works both ways</h2>

<p>In a home exchange, reviews are not one-directional: guest and host evaluate each other after every stay, which creates a symmetrical accountability mechanism that is often absent from traditional rental platforms. A guest who leaves a space in poor condition, or a host whose place does not match the description, builds up a visible history.</p>

<p>This mutual review system has several concrete effects:</p>

<ul>
<li>It encourages both parties to prepare well and communicate clearly before the stay.</li>
<li>It makes it easy to spot profiles with few reviews or mixed feedback.</li>
<li>It surfaces the real experience, not just what the profile says.</li>
</ul>

<p>An honest limit worth noting: reviews are written after the fact, sometimes with a veneer of politeness. Reading between the lines — an enthusiastic but vague review, the absence of a comment on a specific point — is a skill you develop with experience. The <a href="/comment-ca-marche">how it works page</a> gives useful pointers for this.</p>

<h2>Damage, insurance, deposits: who pays what?</h2>

<p>The question of material damage is one nobody enjoys raising, but it is better asked before the stay: in the event of breakage, theft or damage, responsibility depends first on your home insurance policy, and then on the guarantees or mechanisms offered by the platform. There is no universal safety net.</p>

<h3>Your home insurance: the starting point</h3>

<p>Before any exchange, check with your insurer that your home insurance covers third-party occupancy of your home. It is not automatic. <a href="https://www.mma.fr/zeroblabla/assurance-echange-maisons.html">MMA covers this clearly</a> (in France): notifying your insurer before the exchange is a simple step, but an essential one for your coverage to be effective. Wherever you are, the principle is the same: check your policy covers third-party, non-paying occupancy and notify your insurer.</p>

<h3>What some exchange platforms do</h3>

<p>For reference, HomeExchange — one of the world's largest home exchange platforms — includes in its membership a material damage guarantee <a href="https://help.homeexchange.com/hc/en-us/articles/360000619397-What-guarantees-are-included-in-the-HomeExchange-membership">of up to $1,000,000 USD, with a deposit pre-authorization of up to $2,500 USD</a>, activated only if needed. <a href="https://help.homeexchange.com/hc/en-us/articles/360000626478-What-happens-in-the-case-of-damages-or-disagreements">In the event of a dispute over damage</a>, the guest has 10 days to approve or contest the amount claimed; without an agreement within 30 days, the platform can withhold the deposit until the dispute is resolved. This model provides a useful benchmark for what a structured guarantee system can look like.</p>

<p>Casa Minga Séjours is an exchange platform for collective living places, with no per-night payment or commission. The guarantee terms specific to Casa Minga membership are set out on <a href="/charte">the charter page</a> and the terms of use.</p>

<h3>What is worth preparing on your side</h3>

<ul>
<li>A photo inventory before and after the stay.</li>
<li>Clear communication about fragile objects or spaces shared with other residents.</li>
<li>An open conversation about expectations on both sides before departure.</li>
</ul>

<h2>Common sense before and during the stay</h2>

<p>No platform, no badge, no insurance replaces direct human preparation between hosts: a few simple habits reduce bad surprises considerably, without turning the exchange into a bureaucratic procedure.</p>

<p>Before the stay:</p>

<ol>
<li><strong>Read reviews in detail</strong>, not just the overall rating.</li>
<li><strong>Exchange messages or have a video call</strong> with the host or guest — the quality of that contact is often a good indicator.</li>
<li><strong>Check the profile is verified</strong> (badge visible) before accepting or requesting a stay.</li>
<li><strong>Clarify the rules of the shared space</strong> if the place is shared with other residents.</li>
<li><strong>Notify your insurer</strong> if you are opening your home.</li>
<li><strong>Do an inventory</strong> — photos, equipment condition, specific instructions.</li>
</ol>

<p>During the stay:</p>

<ul>
<li>Stay reachable to answer your guests' questions, even remotely.</li>
<li>If a problem arises, direct, prompt communication beats immediate escalation.</li>
</ul>

<p>The article <a href="/comment-ca-marche">how it works</a> covers these habits from the host's perspective.</p>

<p>One final honest point: even with all these mechanisms in place, a home exchange involves an element of the unknown. People different from you will live in your space, with their habits, their relationship to objects, their definition of "clean" or "tidy". That is inherent to the exchange. What the tools allow you to do is choose who you take that risk with — not eliminate it.</p>

<h2>Frequently asked questions</h2>

<p><strong>Q: If someone has the "Verified Profile" badge, does that guarantee they will take care of my home?</strong></p>

<p>No. The "Verified Profile" badge confirms that the member's identity has been checked via an official ID document. It attests to the person's authenticity, not their behaviour. For that, mutual reviews and the quality of prior exchanges are what count.</p>

<p><strong>Q: Is my ID document kept by Casa Minga after verification?</strong></p>

<p>No. In compliance with GDPR, the ID document is deleted after review. Only the "Verified Profile" badge remains visible on your profile. For details on the process, see the <a href="/verification">/verification</a> page.</p>

<p><strong>Q: If there is damage to my home, what happens in practice?</strong></p>

<p>The first step is your home insurance — check that it covers third-party occupancy and notify your insurer before the exchange. The platform's mechanisms (deposit, dispute process) can then apply according to the terms set out in the <a href="/charte">Casa Minga charter</a>. A photo inventory taken before and after the stay is the most useful document in the event of a disagreement.</p>

<h2>Sources</h2>

<ul>
<li><a href="https://help.homeexchange.com/hc/en-us/articles/360000619397-What-guarantees-are-included-in-the-HomeExchange-membership">Guarantees included in HomeExchange membership (material damage, theft)</a></li>
<li><a href="https://help.homeexchange.com/hc/en-us/articles/360000619497-How-does-the-deposit-process-work">How the HomeExchange deposit process works</a></li>
<li><a href="https://help.homeexchange.com/hc/en-us/articles/360000626478-What-happens-in-the-case-of-damages-or-disagreements">What happens in the case of damages or disagreements — HomeExchange</a></li>
<li><a href="https://www.mma.fr/zeroblabla/assurance-echange-maisons.html">Insurance and home exchange — MMA Zéro Blabla</a></li>
</ul>$c$,
  'en',
  true,
  now()
),

-- 4. ES pilier: guia-intercambio-de-casa
(
  'guia-intercambio-de-casa',
  $t$Intercambio de casa: cómo viajar alojándote en casa de un anfitrión$t$,
  $d$Cómo funciona el intercambio de casa, cuánto cuesta de verdad y si es seguro. Guía honesta con comparativa, FAQ y consejos prácticos.$d$,
  'guide',
  $a$Casa Minga$a$,
  2026,
  null,
  null,
  ARRAY['intercambio de casa','viajar','hospitalidad','guia'],
  $c$<p><strong>TL;DR</strong> — El intercambio de casa consiste en viajar alojándote gratis en casa de alguien mientras esa persona se aloja en la tuya, o en la de otra persona, a través de un sistema de puntos. Pagas una cuota anual a una plataforma, no la noche. Sin alquiler, sin comisión, solo una relación de confianza entre anfitriones. Requiere flexibilidad, anticipación y buena comunicación.</p>

<h2>¿Qué es el intercambio de casa, exactamente?</h2>

<p>El intercambio de casa es una práctica en la que dos personas o familias se prestan mutuamente su vivienda —de forma simultánea o en fechas distintas— sin pagar por la noche: cada estancia se financia mediante la reciprocidad o mediante puntos de hospitalidad acumulados en una plataforma común.</p>

<p>El principio es antiguo. En 1953 nacen casi al mismo tiempo dos iniciativas: <strong>Intervac</strong>, impulsado por docentes europeos, y <strong>HomeLink</strong>, fundado por el profesor neoyorquino David Ostroff bajo el nombre "Vacation Exchange Club" (<a href="https://www.dwell.com/article/brief-history-home-swapping-house-exchanges-99b78250">fuente</a>). Por aquel entonces, todo pasaba por anuarios en papel, cartas y llamadas telefónicas. En los años noventa, los sitios web llegan y transforman la logística: HomeExchange.com, fundado por Ed Kushins, figura entre los pioneros de esa transición digital.</p>

<p>Hoy, el intercambio de casa abarca todo tipo de viviendas: casas individuales, pisos en ciudad, cabañas, pero también —y aquí está la especificidad de Casa Minga— <strong>lugares de vida colectivos</strong>: hábitats participativos, ecoaldeas, casas compartidas, espacios de coliving. Estos espacios tienen una cultura de la acogida y de lo común que a menudo facilita los intercambios.</p>

<p>El intercambio no elimina todos los gastos del viaje. Transporte, alimentación, actividades en el destino: todo eso sigue siendo tu responsabilidad. Pero suprime la línea "alojamiento" de la factura, que suele ser la más pesada.</p>

<h2>Intercambio recíproco o por puntos: ¿cuál es la diferencia?</h2>

<p>Existen dos grandes modalidades de intercambio de casa: el intercambio recíproco, en el que dos familias intercambian directamente sus viviendas, y el intercambio por puntos (o puntos de hospitalidad), en el que cada estancia ofrecida o recibida genera puntos utilizables después en casa de un tercero (<a href="https://help.homeexchange.com/hc/en-us/articles/360000601998-What-are-reciprocal-and-non-reciprocal-exchanges">fuente</a>).</p>

<p>En HomeExchange, alrededor del <strong>85 % de los intercambios son no recíprocos</strong>, es decir, por puntos (<a href="https://help.homeexchange.com/hc/en-us/articles/360000601998-What-are-reciprocal-and-non-reciprocal-exchanges">fuente</a>). Este dato dice algo importante: la flexibilidad del sistema de puntos responde mejor a la realidad de las agendas modernas.</p>

<table>
<thead>
<tr><th></th><th>Intercambio recíproco</th><th>Intercambio por puntos</th></tr>
</thead>
<tbody>
<tr><td><strong>Principio</strong></td><td>Dos familias se acogen mutuamente</td><td>Una familia acoge, la otra gasta puntos acumulados en otro lugar</td></tr>
<tr><td><strong>Sincronización</strong></td><td>Simultáneo o diferido (en el año)</td><td>Completamente libre, sin necesidad de sincronización</td></tr>
<tr><td><strong>Flexibilidad</strong></td><td>Menor — hay que encontrar a alguien que quiera ir a tu casa al mismo tiempo</td><td>Alta — eliges destino con independencia de quién viene a la tuya</td></tr>
<tr><td><strong>Para quién</strong></td><td>Perfiles con una vivienda atractiva y fechas fijas</td><td>Perfiles con una vivienda abierta a la acogida y agenda variable</td></tr>
<tr><td><strong>Puntos generados</strong></td><td>No (es un trueque directo)</td><td>Sí — cada noche de acogida acredita puntos</td></tr>
</tbody>
</table>

<p>El intercambio recíproco puede ser <strong>simultáneo</strong> (los dos grupos salen al mismo tiempo) o <strong>diferido</strong> (cada parte acoge en momentos distintos). Esta segunda forma se parece más al sistema de puntos en su lógica, pero sigue vinculada a una relación bilateral.</p>

<p>Para profundizar en esta elección: <a href="/ressources/intercambio-reciproco-o-por-puntos">Intercambio recíproco o por puntos: ¿cómo elegir?</a></p>

<h2>¿Cuánto cuesta de verdad?</h2>

<p>El intercambio de casa no es gratuito: se basa en una <strong>cuota anual</strong> a una plataforma, que da acceso a un número ilimitado de intercambios sin comisión adicional por estancia. El coste varía según la plataforma.</p>

<p>HomeExchange, líder mundial con <strong>más de 550 000 casas en 155 países</strong> (<a href="https://help.homeexchange.com/hc/en-us/articles/360000610118-The-benefits-of-a-HomeExchange-membership">fuente</a>), cobra <strong>175 € al año</strong> por acceso ilimitado (<a href="https://www.homeexchange.fr/blog/homeexchange-tarif/">fuente</a>). Una vez pagada esa cuota, no hay gastos adicionales por intercambio: ni comisión, ni tasas de servicio, ni "gastos de limpieza" por noche.</p>

<h3>¿Y Casa Minga?</h3>

<p>Casa Minga Séjours funciona con el mismo modelo básico: una cuota anual, sin comisión por estancia. La plataforma es <strong>gratuita hasta junio de 2026</strong>. Está dirigida exclusivamente a lugares de vida colectivos, lo que la convierte en una red de nicho: un volumen de anuncios más reducido que las grandes plataformas generalistas, pero una comunidad más homogénea en sus valores.</p>

<p>Conviene ser honesto sobre sus límites: cuanto más pequeña es la red, más paciencia hace falta para encontrar un encaje. Un intercambio entre dos ecoaldeas puede llevar varias semanas de coordinación.</p>

<h3>Lo que seguirás pagando</h3>

<p>La cuota no cubre:</p>
<ul>
<li>El transporte (tren, avión, coche)</li>
<li>La alimentación en el destino</li>
<li>Las actividades y salidas</li>
<li>El seguro de viaje, si decides contratarlo</li>
</ul>

<p>Pero en una estancia de una semana en familia, ahorrar varios cientos de euros en alojamiento cambia mucho el presupuesto total.</p>

<h2>¿Es seguro? La cuestión de la confianza</h2>

<p>La confianza es el punto central de cualquier intercambio de casa: acoge a desconocidos en tu hogar y te alojas en casa de desconocidos. Ninguna plataforma puede eliminar esa realidad, pero existen varios mecanismos para gestionarla.</p>

<h3>Verificación de perfiles</h3>

<p>Casa Minga verifica los perfiles mediante <strong>documento de identidad</strong>. Esta verificación no garantiza el comportamiento de un anfitrión, pero reduce el anonimato completo y crea una responsabilidad nominativa. Las valoraciones que dejan los anfitriones después de cada estancia completan el panorama.</p>

<p>Para entender cómo funciona este proceso: <a href="/ressources/verificacion-y-confianza-entre-anfitriones">Verificación y confianza entre anfitriones</a> y <a href="/verification">la página de verificación del sitio</a>.</p>

<h3>Fianza y garantías (el ejemplo de HomeExchange)</h3>

<p>HomeExchange ofrece un marco de referencia útil. La adhesión incluye una <strong>garantía de daños materiales de hasta 1 000 000 $US</strong> y una indemnización en caso de robo. La fianza funciona como una <strong>autorización de cargo de hasta 2 500 $US</strong>, activada solo si se constatan daños (<a href="https://help.homeexchange.com/hc/en-us/articles/360000619397-What-guarantees-are-included-in-the-HomeExchange-membership">fuente</a>).</p>

<p>En caso de daños, el invitado dispone de <strong>10 días para aceptar o impugnar</strong>. Sin acuerdo en 30 días, la plataforma puede retener la fianza hasta la resolución del litigio (<a href="https://help.homeexchange.com/hc/en-us/articles/360000626478-What-happens-in-the-case-of-damages-or-disagreements">fuente</a>).</p>

<h3>El seguro: un punto que no hay que descuidar</h3>

<p>Antes de cualquier intercambio, comprueba que tu <strong>seguro de hogar cubre la ocupación por un tercero</strong> y avisa a tu aseguradora (<a href="https://www.mma.fr/zeroblabla/assurance-echange-maisons.html">fuente MMA</a>) (en Francia, MMA lo detalla con claridad). Algunos contratos lo incluyen de oficio, otros no. Una llamada a tu aseguradora antes del primer intercambio es un hábito que vale la pena adquirir.</p>

<h3>Riesgos que no conviene minimizar</h3>

<p>El intercambio de casa conlleva riesgos reales: daños materiales, objetos rotos, intimidad alterada, una estancia que no corresponde a las fotos. Estas situaciones son minoritarias según la experiencia de la comunidad, pero existen. La comunicación previa, una guía de acogida clara y guardar bajo llave los objetos de valor reducen los roces, aunque no los eliminan.</p>

<h2>Para quién es (de verdad) — y para quién no</h2>

<p>El intercambio de casa encaja con perfiles concretos. No es una solución universal, y ser honesto en este punto evita decepciones.</p>

<p><strong>Encaja bien si:</strong></p>
<ul>
<li>Vives en una vivienda que estás dispuesto a compartir con anfitriones serios</li>
<li>Puedes planificar tus fechas de viaje con varias semanas de antelación</li>
<li>Disfrutas del contacto humano y de la dimensión relacional del viaje</li>
<li>Quieres viajar con más frecuencia sin disparar tu presupuesto de alojamiento</li>
<li>Vives en un lugar de vida colectivo y quieres conocer otras comunidades similares</li>
</ul>

<p><strong>Encaja menos bien si:</strong></p>
<ul>
<li>Viajas a última hora o con fechas muy rígidas</li>
<li>No te sientes cómodo con la idea de que desconocidos duerman en tu cama</li>
<li>Esperas un nivel de servicio hotelero (recepción, limpieza diaria, servicio en habitación)</li>
<li>Viajas solo y buscas una opción ultraflexible y económica: otras alternativas (albergues, couchsurfing) pueden ser más adecuadas</li>
<li>Vives en una zona poco demandada o con acceso difícil</li>
</ul>

<p>La realidad de un lugar de vida colectivo añade una capa adicional: algunos hábitats participativos tienen normas de funcionamiento interno (reuniones, vida en común, gestión compartida) que implican informar a los anfitriones con antelación. Es una riqueza, pero también una inversión en comunicación.</p>

<h2>Por dónde empezar: 5 primeros pasos</h2>

<p>Comenzar un intercambio de casa requiere algo de preparación, sobre todo para la primera estancia. Esta secuencia ayuda a evitar los errores más habituales.</p>

<ol>
<li><strong>Cuida tu anuncio antes de buscar.</strong> Un perfil completo, con fotos honestas y una descripción detallada de tu lugar, multiplica tus posibilidades de respuesta positiva. Consulta la <a href="/comment-ca-marche">página de cómo funciona</a> para no perderte los puntos clave.</li>
<li><strong>Explora los lugares disponibles.</strong> Antes de contactar con anfitriones, dedica tiempo a entender qué se ofrece, qué tipos de lugares y qué zonas geográficas hay. La página <a href="/discover">Descubrir los lugares</a> es un buen punto de partida.</li>
<li><strong>Escribe un primer mensaje personalizado.</strong> Un mensaje genérico rara vez recibe respuesta. Demuestra que has leído el anuncio, explica quién eres y por qué ese lugar te atrae. La confianza se construye desde el primer contacto.</li>
<li><strong>Prepara tu vivienda para la acogida.</strong> Una guía de acogida escrita, las instrucciones prácticas (wifi, basura, equipamiento), los contactos de emergencia: todo eso facilita la estancia de tus invitados y tranquiliza a las dos partes. Consulta <a href="/comment-ca-marche">cómo funciona</a> para ver los pasos detallados.</li>
<li><strong>Confirma todos los detalles con tu anfitrión antes de cerrar el trato.</strong> Fechas, número de personas, animales, normas de la casa, seguro: mejor dejarlo todo por escrito antes del intercambio. Consulta la <a href="/ressources/guia-intercambio-de-casa">guía de intercambio de casa</a> para una lista de verificación completa.</li>
</ol>

<h2>Preguntas frecuentes</h2>

<h3>¿Hay que intercambiar al mismo tiempo?</h3>

<p>No. El intercambio simultáneo (los dos grupos salen a la vez) es una opción entre otras. El intercambio diferido permite acogerse en fechas distintas, de común acuerdo. Y el sistema de puntos elimina por completo esta restricción de sincronización: acoge cuando puedas y viaja cuando quieras.</p>

<h3>¿Y si solo tengo un piso pequeño?</h3>

<p>Un piso pequeño bien situado y bien presentado puede generar tanto interés como una casa grande. La ubicación, la claridad del anuncio y la calidad del perfil pesan más que los metros cuadrados. Eso sí, sé honesto sobre sus límites: ¿cuántas personas pueden alojarse cómodamente? Así evitas malentendidos.</p>

<h3>¿Qué seguro necesito?</h3>

<p>Empieza por contactar con tu aseguradora para verificar que tu seguro de hogar cubre la ocupación por un tercero no remunerado (<a href="https://www.mma.fr/zeroblabla/assurance-echange-maisons.html">fuente MMA</a>). Algunos contratos lo incluyen; otros requieren una extensión. La plataforma que uses puede ofrecer sus propias garantías: lee bien las condiciones antes de tu primer intercambio.</p>

<h3>¿Qué diferencia hay con Airbnb?</h3>

<p>En Airbnb alquilas tu vivienda a cambio de dinero: es una transacción comercial sujeta a obligaciones fiscales y normativas según la ciudad. En una plataforma de intercambio no hay pago por noche: la reciprocidad (directa o por puntos) sustituye al dinero. El espíritu es distinto: menos prestación de servicio, más relación humana. Para saber más sobre el funcionamiento de Casa Minga: <a href="/comment-ca-marche">Cómo funciona</a>.</p>

<h3>¿Cuánto tiempo se tarda en encontrar un primer intercambio?</h3>

<p>No hay un plazo universal. Depende de la demanda en tu zona, del atractivo de tu anuncio y de la flexibilidad de tus fechas. En una plataforma generalista grande, a menudo bastan unas semanas. En una red de nicho como Casa Minga —que apunta a los lugares de vida colectivos—, hay que contar con más tiempo, sobre todo si buscas un hábitat participativo en una región poco representada. Anticiparse y contactar con varios anfitriones a la vez es la estrategia más eficaz.</p>

<h3>¿Es legal el intercambio de casa?</h3>

<p>Sí, en la gran mayoría de los casos. El intercambio de vivienda sin contraprestación económica no se asimila a un alquiler. Por eso queda al margen de las normas sobre alquiler turístico (sin tasa turística, sin límite de noches que declarar). No obstante, si vives en una comunidad de propietarios, comprueba que el reglamento interno lo permita. Algunos contratos de arrendamiento también incluyen cláusulas al respecto.</p>

<h2>Fuentes</h2>

<ul>
<li><a href="https://help.homeexchange.com/hc/en-us/articles/360000610118-The-benefits-of-a-HomeExchange-membership">HomeExchange — Ventajas de la adhesión (550 000 casas, 155 países)</a></li>
<li><a href="https://www.homeexchange.fr/blog/homeexchange-tarif/">HomeExchange — Precio de la suscripción (175 €/año)</a></li>
<li><a href="https://help.homeexchange.com/hc/en-us/articles/360000601998-What-are-reciprocal-and-non-reciprocal-exchanges">HomeExchange — Intercambios recíprocos y no recíprocos (85 % por puntos)</a></li>
<li><a href="https://help.homeexchange.com/hc/en-us/articles/360000619397-What-guarantees-are-included-in-the-HomeExchange-membership">HomeExchange — Garantías incluidas en la adhesión (daños hasta 1 000 000 $US, fianza 2 500 $US)</a></li>
<li><a href="https://help.homeexchange.com/hc/en-us/articles/360000619497-How-does-the-deposit-process-work">HomeExchange — Procedimiento de fianza</a></li>
<li><a href="https://help.homeexchange.com/hc/en-us/articles/360000626478-What-happens-in-the-case-of-damages-or-disagreements">HomeExchange — Procedimiento en caso de daños (10 días / 30 días)</a></li>
<li><a href="https://www.dwell.com/article/brief-history-home-swapping-house-exchanges-99b78250">Dwell — Breve historia del intercambio de casa (Intervac 1953, HomeLink, Ed Kushins)</a></li>
<li><a href="https://www.mma.fr/zeroblabla/assurance-echange-maisons.html">MMA — Seguro e intercambio de casa</a></li>
</ul>$c$,
  'es',
  true,
  now()
),

-- 5. ES S1: intercambio-reciproco-o-por-puntos
(
  'intercambio-reciproco-o-por-puntos',
  $t$Intercambio recíproco o por puntos: ¿qué diferencia?$t$,
  $d$Intercambio recíproco o por puntos de hospitalidad: dos modelos distintos para alojarte en un lugar de vida colectivo. Comparamos sus principios, su flexibilidad y sus límites.$d$,
  'guide',
  $a$Casa Minga$a$,
  2026,
  null,
  null,
  ARRAY['intercambio reciproco','puntos hospitalidad','comparativa'],
  $c$<h2>TL;DR</h2>

<p>Existen dos modelos para alojarte en un lugar de vida colectivo sin pagar por noche. El <strong>intercambio recíproco</strong>: tú acoge, te acogen — de forma simultánea o en fechas distintas. El <strong>intercambio por puntos</strong> (o puntos de hospitalidad): acumulas puntos acogiendo y los gastas para alojarte en otro lugar, sin que las fechas tengan que coincidir. Los dos tienen sus ventajas y sus puntos ciegos. Este artículo los compara para ayudarte a elegir — o a combinar ambos.</p>

<h2>¿Qué es el intercambio recíproco?</h2>

<p>El intercambio recíproco es un acuerdo directo entre dos familias o grupos: cada parte acoge a la otra en su lugar de vida colectivo, a cambio de una estancia equivalente. Es la forma más antigua e intuitiva de intercambio de vivienda: sin dinero de por medio, sin intermediario financiero, solo una reciprocidad asumida entre dos grupos o dos personas que se tienen confianza mutuamente.</p>

<p>Existen dos variantes.</p>

<p><strong>El intercambio simultáneo</strong>: las dos estancias tienen lugar al mismo tiempo. Tú estás en mi casa mientras yo estoy en la tuya. Los lugares están ocupados por ambas partes a la vez, lo que encaja bien con hábitats donde se prefiere que haya alguien siempre presente.</p>

<p><strong>El intercambio diferido</strong>: las estancias no coinciden en el tiempo. Me acoge en mayo, yo te correspondo en septiembre. Esto requiere un grado adicional de confianza y una organización clara, ya que nada garantiza mecánicamente la reciprocidad — es un compromiso entre los dos anfitriones.</p>

<p>El principal límite: encontrar una pareja cuya disponibilidad coincida (simultáneo) o cuyos deseos se complementen en el tiempo (diferido) lleva tiempo y a veces muchos intercambios fallidos.</p>

<h2>¿Qué es el intercambio por puntos?</h2>

<p>El intercambio por puntos — también llamado intercambio no recíproco o sistema de puntos de hospitalidad — separa la acogida de la estancia: ganas puntos abriendo tu lugar a otras personas, y los gastas para alojarte en un hábitat que te interesa, sin que ambos intercambios estén vinculados. Este mecanismo se diseñó precisamente para desbloquear las situaciones en las que la reciprocidad directa es difícil de cuadrar en fechas compatibles.</p>

<p>En la práctica: si puedes acoger en invierno pero solo viajas en verano, o si nadie en tu red inmediata quiere venir a tu casa mientras tú sueñas con una ecoaldea en Bretaña, los puntos permiten sortear esa restricción de sincronización.</p>

<p>Es el modelo dominante en las grandes plataformas de intercambio generalistas: en HomeExchange, alrededor del <a href="https://help.homeexchange.com/hc/en-us/articles/360000601998-What-are-reciprocal-and-non-reciprocal-exchanges">85 % de los intercambios son no recíprocos</a>, lo que ilustra el atractivo de esta flexibilidad.</p>

<p>La contrapartida: el sistema crea una especie de mercado interno. El valor de un lugar puede estar ponderado, y algunos hábitats "se venden" mejor que otros en puntos. La relación es menos directa, a veces menos personal.</p>

<h2>Recíproco vs puntos: la tabla comparativa</h2>

<table>
<thead>
<tr><th>Criterio</th><th>Intercambio recíproco</th><th>Intercambio por puntos</th></tr>
</thead>
<tbody>
<tr><td><strong>Principio</strong></td><td>Dos familias se acogen mutuamente (simultáneo o diferido)</td><td>Acoge → ganas puntos → te alojas en otro lugar</td></tr>
<tr><td><strong>Sincronización de fechas</strong></td><td>Imprescindible (simultáneo) o a negociar (diferido)</td><td>Ninguna: acogida y estancia son totalmente independientes</td></tr>
<tr><td><strong>Relación anfitrión-anfitrión</strong></td><td>Directa, bilateral, a menudo más personal</td><td>Indirecta: no necesariamente acoge quien te acogerá</td></tr>
<tr><td><strong>Flexibilidad de agenda</strong></td><td>Baja o moderada</td><td>Alta</td></tr>
<tr><td><strong>¿Para quién?</strong></td><td>Familias disponibles en periodos concretos, que buscan una relación directa</td><td>Familias con disponibilidad variable o que quieren elegir libremente su destino</td></tr>
<tr><td><strong>Límites</strong></td><td>Encontrar la pareja adecuada lleva tiempo; el diferido depende de la confianza</td><td>Sistema más abstracto; algunos lugares pueden ser "caros" en puntos</td></tr>
<tr><td><strong>¿Adecuado para hábitats colectivos?</strong></td><td>Sí, sobre todo si el grupo prefiere conocer a sus anfitriones de antemano</td><td>Sí, si el grupo acoge con facilidad pero viaja en momentos variados</td></tr>
</tbody>
</table>

<h2>¿Cuál elegir según tu situación?</h2>

<p>Ninguno de los dos es universalmente mejor. El modelo adecuado depende de tu situación concreta.</p>

<p><strong>Opta por el intercambio recíproco si</strong> conoces lugares con los que quieres construir una relación duradera. Si tu hábitat tiene disponibilidad en periodos concretos y quieres saber exactamente quién te acogerá — y viceversa.</p>

<p><strong>Opta por los puntos de hospitalidad si</strong> tu agenda es impredecible, si quieres partir cuando te apetezca, o si acoge a menudo pero viajas poco — o al revés. Los puntos te dan una libertad de elección que el intercambio directo no siempre puede ofrecer.</p>

<p>En cualquier caso, consulta nuestra <a href="/ressources/guia-intercambio-de-casa">guía completa sobre el intercambio de casa</a> para entender los pasos clave antes de lanzarte a tu primera estancia, elijas el modelo que elijas.</p>

<h2>Cómo Casa Minga combina los dos</h2>

<p>Casa Minga Séjours ofrece los dos modelos en la misma plataforma, algo poco frecuente en el espacio del hábitat compartido. Puedes elegir, según la estancia, el intercambio recíproco directo o el sistema de <a href="/points">puntos de hospitalidad</a>. Los dos modos coexisten, y nada te obliga a usar solo uno.</p>

<p>La plataforma está diseñada exclusivamente para lugares de vida colectivos: hábitats participativos, ecoaldeas, casas compartidas, espacios de coliving. No es una plataforma generalista: intercambias con personas que comparten una misma cultura del vivir en común.</p>

<p>La <a href="/comment-ca-marche">página "cómo funciona"</a> detalla el funcionamiento práctico. Y para entender cómo se construye la confianza antes de cada estancia, el artículo sobre <a href="/ressources/verificacion-y-confianza-entre-anfitriones">verificación y confianza entre anfitriones</a> es un buen punto de partida.</p>

<p>En cuanto al modelo económico: cuota anual, sin comisión en los intercambios. Puedes ver los hábitats disponibles en <a href="/discover">la página de descubrimiento</a>.</p>

<h2>Preguntas frecuentes</h2>

<h3>¿Se pueden combinar los dos modelos en Casa Minga?</h3>

<p>Sí. Nada te impone elegir un solo modelo para todas tus estancias. Puedes hacer un intercambio recíproco con un hábitat que conoces bien, y usar tus puntos de hospitalidad para explorar un lugar donde la reciprocidad directa no habría funcionado. Los dos sistemas coexisten en la plataforma.</p>

<h3>¿Los puntos de hospitalidad caducan?</h3>

<p>Depende de las normas de cada plataforma. En Casa Minga, consulta directamente las <a href="/points">condiciones relativas a los puntos</a> para tener una respuesta actualizada — las reglas pueden cambiar.</p>

<h3>¿Es arriesgado el intercambio diferido?</h3>

<p>El intercambio diferido — en el que acoge ahora y te alojarás más adelante — depende de la confianza entre los dos anfitriones. Casa Minga verifica la identidad de los miembros mediante documento de identidad, lo que reduce el riesgo de incumplimiento. Pero como en cualquier acuerdo humano, una comunicación clara y previa sigue siendo la mejor garantía. La <a href="/ressources/guia-intercambio-de-casa">guía de intercambio de casa</a> aborda estos aspectos prácticos.</p>

<h2>Fuentes</h2>

<ol>
<li>HomeExchange — <a href="https://help.homeexchange.com/hc/en-us/articles/360000601998-What-are-reciprocal-and-non-reciprocal-exchanges">Intercambios recíprocos y no recíprocos: definiciones y funcionamiento</a> (cifra: ~85 % de los intercambios son no recíprocos; definiciones de ambos modelos)</li>
<li>HomeExchange — <a href="https://help.homeexchange.com/hc/en-us/articles/360000610118-The-benefits-of-a-HomeExchange-membership">Las ventajas de una adhesión a HomeExchange</a> (referencia de red: más de 550 000 casas en 155 países)</li>
</ol>$c$,
  'es',
  true,
  now()
),

-- 6. ES S2: verificacion-y-confianza-entre-anfitriones
(
  'verificacion-y-confianza-entre-anfitriones',
  $t$Verificación de identidad y confianza entre anfitriones$t$,
  $d$Perfil verificado, valoraciones cruzadas, seguro, fianza: Casa Minga Séjours te explica con honestidad cómo funciona la confianza en un intercambio de casa entre lugares de vida colectivos.$d$,
  'guide',
  $a$Casa Minga$a$,
  2026,
  null,
  null,
  ARRAY['confianza','verificacion','seguridad','opiniones'],
  $c$<p><strong>TL;DR</strong></p>

<p>Casa Minga verifica la identidad de sus miembros mediante documento de identidad (eliminado tras la comprobación, conforme al RGPD). Las valoraciones son bidireccionales: invitado y anfitrión se evalúan mutuamente. El seguro de hogar sigue siendo tu primera línea de defensa; algunas plataformas ofrecen garantías complementarias sobre daños materiales. Ningún sistema elimina todo el riesgo, pero varios mecanismos permiten reducirlo considerablemente.</p>

<h2>Por qué la confianza es el verdadero motor del intercambio de casa</h2>

<p>Confiar tu vivienda a desconocidos, aunque sean miembros de una misma comunidad, requiere un salto de confianza real: precisamente ese salto es lo que hace posible el intercambio de casa, y por eso el gran reto de una plataforma de intercambio es hacerlo razonable, sin prometer lo imposible. En un intercambio recíproco o por puntos de hospitalidad, las dos partes asumen un riesgo simétrico: el anfitrión abre su casa, el invitado recibe un espacio de vida que no le pertenece. Esta reciprocidad genera una responsabilidad compartida que no existe en un alquiler convencional.</p>

<p>Los lugares de vida colectivos — pisos compartidos, ecolugares, hábitats participativos — añaden una capa más: no solo abres tu habitación, sino un espacio común, una dinámica de grupo, a veces un proyecto de vida. La confianza no es un detalle de confort. Es la condición del intercambio en sí.</p>

<p>Para profundizar en el funcionamiento general, la <a href="/ressources/guia-intercambio-de-casa">guía completa del intercambio de casa</a> sienta las bases.</p>

<h2>La verificación de identidad, en la práctica</h2>

<p>La verificación de identidad es el primer paso para que un perfil se considere fiable en Casa Minga Séjours: un miembro aporta un documento de identidad oficial, que se comprueba y se elimina — conforme al RGPD — y el perfil muestra a continuación un distintivo de "Perfil verificado" visible para todos.</p>

<p>Lo que aporta esta verificación de forma concreta:</p>

<ul>
<li><strong>Confirma que la persona existe</strong> y corresponde a la identidad declarada.</li>
<li><strong>Crea un compromiso implícito</strong>: un miembro verificado sabe que su identidad real está asociada a su comportamiento en la plataforma.</li>
<li><strong>El distintivo es visible</strong> en el perfil, antes de cualquier contacto o solicitud de intercambio.</li>
</ul>

<p>Lo que no garantiza: que la persona cuide tu espacio como lo harías tú. La verificación de identidad reduce el anonimato, pero no predice los comportamientos. Es una condición necesaria, no suficiente.</p>

<p>El documento de identidad se elimina tras la comprobación. Tú no lo guardas, Casa Minga tampoco, una vez asignado el distintivo. El cumplimiento del RGPD no es un argumento de marketing: es una obligación legal que la plataforma elige gestionar con transparencia.</p>

<p>Para entender el procedimiento y obtener tu propio distintivo, consulta la página <a href="/verification">hacerte miembro verificado</a>.</p>

<h2>Las valoraciones cruzadas: tu reputación funciona en los dos sentidos</h2>

<p>En un intercambio de casa, las valoraciones no van en una sola dirección: invitado y anfitrión se evalúan mutuamente después de cada estancia, lo que crea un mecanismo de responsabilización simétrico que suele estar ausente en las plataformas de alquiler convencionales. Un invitado que deja el espacio en mal estado, o un anfitrión cuya vivienda no se corresponde con la descripción, acumula un historial visible.</p>

<p>Este sistema de valoraciones bidireccionales tiene varios efectos concretos:</p>

<ul>
<li>Incentiva a ambas partes a prepararse bien y a comunicar con claridad antes de la estancia.</li>
<li>Permite identificar rápidamente los perfiles con pocas valoraciones o con comentarios ambiguos.</li>
<li>Hace visible la experiencia real, no solo el perfil declarativo.</li>
</ul>

<p>Un límite honesto que conviene mencionar: las valoraciones se escriben a posteriori, a veces con una cortesía de fachada. Leer entre líneas — una valoración entusiasta pero vaga, la ausencia de comentario sobre un punto concreto — es una habilidad que se desarrolla con la experiencia. La <a href="/ressources/guia-intercambio-de-casa">guía de intercambio de casa</a> da pautas útiles al respecto.</p>

<h2>Daños, seguro, fianza: ¿quién paga qué?</h2>

<p>La pregunta por los daños materiales es la que nadie quiere hacer, pero vale la pena tener resuelta antes de la estancia: en caso de rotura, robo o deterioro, la responsabilidad depende en primer lugar de tu contrato de seguro de hogar, y después de las garantías o mecanismos que ofrezca la plataforma. No existe una red de seguridad universal.</p>

<h3>Tu seguro de hogar: el punto de partida</h3>

<p>Antes de cualquier intercambio, comprueba con tu aseguradora que tu seguro multirriesgo de hogar cubre la ocupación de tu vivienda por un tercero. No es automático. <a href="https://www.mma.fr/zeroblabla/assurance-echange-maisons.html">MMA lo detalla con claridad</a> (en Francia): avisar a tu aseguradora antes del intercambio es un trámite sencillo pero imprescindible para que la cobertura sea efectiva. Comprueba también la situación con tu propia aseguradora según el país donde estés.</p>

<h3>Lo que hacen algunas plataformas de intercambio</h3>

<p>A modo de referencia, HomeExchange — una de las mayores plataformas mundiales de intercambio de casa — incluye en su adhesión una garantía sobre daños materiales <a href="https://help.homeexchange.com/hc/en-us/articles/360000619397-What-guarantees-are-included-in-the-HomeExchange-membership">de hasta 1 000 000 $US, con una autorización de fianza de hasta 2 500 $US</a>, activada solo si es necesario. <a href="https://help.homeexchange.com/hc/en-us/articles/360000626478-What-happens-in-the-case-of-damages-or-disagreements">En caso de litigio por daños</a>, el invitado dispone de 10 días para validar o impugnar el importe reclamado; sin acuerdo en 30 días, la plataforma retiene la fianza hasta la resolución. Este modelo ofrece un punto de referencia útil sobre lo que puede proponer un sistema de garantías estructurado.</p>

<p>Casa Minga Séjours es una plataforma de intercambio entre lugares de vida colectivos, sin pago por noche ni comisión. Las modalidades de garantía propias de la adhesión a Casa Minga se pueden consultar directamente en <a href="/charte">la carta</a> y en las condiciones de uso.</p>

<h3>Lo que conviene tener previsto por tu parte</h3>

<ul>
<li>Un inventario fotográfico antes y después de la estancia.</li>
<li>Una comunicación clara sobre los objetos frágiles o los espacios compartidos con otras personas del hábitat.</li>
<li>Una conversación abierta sobre las expectativas de cada parte antes de la llegada.</li>
</ul>

<h2>El sentido común antes y durante la estancia</h2>

<p>Ninguna plataforma, ningún distintivo, ningún seguro sustituye la preparación humana y directa entre anfitriones: unos pocos reflejos sencillos reducen considerablemente las malas sorpresas, sin convertir el intercambio en un trámite burocrático.</p>

<p>Antes de la estancia:</p>

<ol>
<li><strong>Lee las valoraciones en detalle</strong>, no solo la nota global.</li>
<li><strong>Intercambia mensajes o haz una videollamada</strong> con el anfitrión o el invitado — la calidad del contacto suele ser un buen indicador.</li>
<li><strong>Comprueba que el perfil está verificado</strong> (distintivo visible) antes de aceptar o solicitar una estancia.</li>
<li><strong>Aclara las normas del espacio común</strong> si el lugar lo comparten otros residentes.</li>
<li><strong>Avisa a tu aseguradora</strong> si abres tu vivienda.</li>
<li><strong>Haz un inventario</strong> — fotos, estado del equipamiento, instrucciones específicas.</li>
</ol>

<p>Durante la estancia:</p>

<ul>
<li>Mantente disponible para responder las preguntas de tus invitados, aunque sea a distancia.</li>
<li>Ante cualquier problema, la comunicación directa y rápida es mejor que la escalada inmediata.</li>
</ul>

<p>La <a href="/comment-ca-marche">página de cómo funciona</a> detalla estos reflejos desde el lado del anfitrión.</p>

<p>Un último punto de honestidad: incluso con todos estos mecanismos en marcha, un intercambio de casa conlleva una parte de incertidumbre. Personas distintas a ti van a vivir en tu espacio, con sus hábitos, su relación con los objetos, su definición de "limpio" o de "ordenado". Es algo inherente al intercambio. Lo que permiten las herramientas es elegir con quién asumes ese riesgo — no eliminarlo.</p>

<h2>Preguntas frecuentes</h2>

<p><strong>P: Si alguien tiene el distintivo de "Perfil verificado", ¿garantiza eso que cuidará bien mi vivienda?</strong></p>

<p>No. El distintivo de "Perfil verificado" confirma que la identidad del miembro ha sido comprobada mediante documento de identidad. Acredita la autenticidad de la persona, no su comportamiento. Para valorar este último, lo que cuenta son las valoraciones bidireccionales y la calidad de los intercambios previos.</p>

<p><strong>P: ¿Casa Minga conserva mi documento de identidad tras la verificación?</strong></p>

<p>No. Conforme al RGPD, el documento de identidad se elimina tras la comprobación. Solo el distintivo de "Perfil verificado" permanece visible en tu perfil. Para los detalles del procedimiento, consulta la página <a href="/verification">/verification</a>.</p>

<p><strong>P: En caso de daños en mi vivienda, ¿qué ocurre exactamente?</strong></p>

<p>El primer paso es tu seguro multirriesgo de hogar — comprueba que cubre la ocupación por un tercero y avisa a tu aseguradora antes del intercambio. Después, los mecanismos de la plataforma (fianza, procedimiento de litigio) pueden intervenir según las modalidades previstas en la <a href="/charte">carta de Casa Minga</a>. Un inventario fotográfico antes y después sigue siendo el documento más útil en caso de desacuerdo.</p>

<h2>Fuentes</h2>

<ul>
<li><a href="https://help.homeexchange.com/hc/en-us/articles/360000619397-What-guarantees-are-included-in-the-HomeExchange-membership">Garantías incluidas en la adhesión a HomeExchange (daños materiales, robo)</a></li>
<li><a href="https://help.homeexchange.com/hc/en-us/articles/360000619497-How-does-the-deposit-process-work">Funcionamiento de la fianza en HomeExchange</a></li>
<li><a href="https://help.homeexchange.com/hc/en-us/articles/360000626478-What-happens-in-the-case-of-damages-or-disagreements">Procedimiento en caso de daños o desacuerdo – HomeExchange</a></li>
<li><a href="https://www.mma.fr/zeroblabla/assurance-echange-maisons.html">Seguro e intercambio de casas – MMA Zéro Blabla</a></li>
</ul>$c$,
  'es',
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
  lang = excluded.lang,
  is_published = excluded.is_published;
