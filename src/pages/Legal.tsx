import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const LAST_UPDATE = "25 juin 2026";

// Éditeur — informations légales (entreprise individuelle Léo Durand / ECOMMUNICATION)
const EDITOR = {
  name: "Léo Durand",
  brand: "ECOMMUNICATION",
  status: "Entrepreneur individuel (micro-entreprise)",
  address: "2 Impasse des Foulques, 34110 Frontignan, France",
  siren: "824 430 375",
  siret: "824 430 375 00025",
  rcs: "RCS Montpellier 824 430 375",
  tva: "FR75 824 430 375",
  ape: "70.21Z — Conseil en relations publiques et communication",
  email: "ecommunication@etik.com",
};

type DocKey = "mentions" | "cgu" | "confidentialite";

const META: Record<DocKey, { title: string; canonical: string }> = {
  mentions: { title: "Mentions légales", canonical: "/mentions-legales" },
  cgu: { title: "Conditions générales d'utilisation", canonical: "/cgu" },
  confidentialite: { title: "Politique de confidentialité", canonical: "/confidentialite" },
};

function MentionsLegales() {
  return (
    <div className="prose-legal space-y-8">
      <section>
        <h2>Éditeur du site</h2>
        <p>
          Le site <strong>sejour.casaminga.com</strong> (« Casa Minga Séjours ») est édité par&nbsp;:
        </p>
        <ul>
          <li><strong>{EDITOR.name}</strong> — {EDITOR.status}</li>
          <li>Enseigne&nbsp;: {EDITOR.brand}</li>
          <li>Siège&nbsp;: {EDITOR.address}</li>
          <li>SIREN&nbsp;: {EDITOR.siren} — SIRET&nbsp;: {EDITOR.siret}</li>
          <li>{EDITOR.rcs}</li>
          <li>N° TVA intracommunautaire&nbsp;: {EDITOR.tva}</li>
          <li>Code APE&nbsp;: {EDITOR.ape}</li>
          <li>Contact&nbsp;: <a href={`mailto:${EDITOR.email}`}>{EDITOR.email}</a></li>
        </ul>
      </section>

      <section>
        <h2>Directeur de la publication</h2>
        <p>{EDITOR.name}, en sa qualité d'éditeur du site.</p>
      </section>

      <section>
        <h2>Hébergement</h2>
        <p>Le site est hébergé par&nbsp;:</p>
        <ul>
          <li><strong>Infomaniak Network SA</strong></li>
          <li>Rue Eugène-Marziano 25, 1227 Les Acacias (Genève), Suisse</li>
          <li>Téléphone&nbsp;: +41 22 820 35 44</li>
          <li>Site&nbsp;: <a href="https://www.infomaniak.com" target="_blank" rel="noopener noreferrer">infomaniak.com</a></li>
        </ul>
      </section>

      <section>
        <h2>Propriété intellectuelle</h2>
        <p>
          L'ensemble des contenus présents sur ce site (textes, articles, visuels, logo, charte
          graphique) est protégé par le droit de la propriété intellectuelle. Toute reproduction ou
          représentation, totale ou partielle, sans autorisation préalable de l'éditeur, est
          interdite. Les contenus publiés par les membres restent la propriété de leurs auteurs.
        </p>
      </section>

      <section>
        <h2>Responsabilité</h2>
        <p>
          L'éditeur s'efforce d'assurer l'exactitude des informations diffusées mais ne saurait être
          tenu responsable des erreurs, omissions, ou de l'indisponibilité du service. Les liens vers
          des sites tiers sont fournis à titre informatif&nbsp;: l'éditeur n'exerce aucun contrôle sur
          leur contenu.
        </p>
      </section>

      <section>
        <h2>Données personnelles</h2>
        <p>
          Le traitement de vos données est décrit dans la{" "}
          <Link to="/confidentialite">politique de confidentialité</Link>.
        </p>
      </section>
    </div>
  );
}

function CGU() {
  return (
    <div className="prose-legal space-y-8">
      <section>
        <h2>1. Objet</h2>
        <p>
          Les présentes conditions générales d'utilisation (CGU) régissent l'accès et l'usage du site
          <strong> sejour.casaminga.com</strong>, plateforme mettant en relation des foyers et des
          lieux de vie collectifs (habitats participatifs, écolieux, colocations, colivings) en vue
          d'échanges d'hébergement, réciproques ou par points d'hospitalité. L'utilisation du site
          implique l'acceptation pleine et entière des présentes CGU.
        </p>
      </section>

      <section>
        <h2>2. Accès au service</h2>
        <p>
          La consultation des contenus publics est libre. La création de fiches de lieu, l'envoi de
          demandes de séjour et la messagerie nécessitent la création d'un compte. L'utilisateur
          s'engage à fournir des informations exactes et à maintenir la confidentialité de ses
          identifiants. Le service est fourni « en l'état », sans garantie de disponibilité continue.
        </p>
      </section>

      <section>
        <h2>3. Inscription et compte</h2>
        <p>
          L'inscription est réservée aux personnes majeures. Chaque utilisateur est responsable de
          l'activité réalisée depuis son compte. L'éditeur peut suspendre ou supprimer un compte en
          cas de manquement aux présentes CGU ou à la{" "}
          <Link to="/charte">charte de la communauté</Link>.
        </p>
      </section>

      <section>
        <h2>4. Fonctionnement des échanges</h2>
        <p>
          Casa Minga est un <strong>intermédiaire technique</strong> de mise en relation. Les échanges
          d'hébergement (réciproques ou par points) sont conclus directement entre membres, sous leur
          seule responsabilité. L'éditeur n'est pas partie aux accords passés entre membres et ne
          garantit ni la qualité, ni la sécurité, ni la conformité des hébergements proposés.
        </p>
      </section>

      <section>
        <h2>5. Engagements de l'utilisateur</h2>
        <ul>
          <li>Publier des informations sincères sur son lieu et ses séjours.</li>
          <li>Respecter les autres membres, les lieux d'accueil et la charte de la communauté.</li>
          <li>Ne pas publier de contenu illicite, trompeur, diffamatoire ou portant atteinte aux droits de tiers.</li>
          <li>Ne pas détourner la plateforme de sa finalité (démarchage, revente, usage commercial non autorisé).</li>
        </ul>
      </section>

      <section>
        <h2>6. Contenus publiés par les membres</h2>
        <p>
          L'utilisateur conserve la propriété des contenus qu'il publie et concède à l'éditeur une
          licence d'usage limitée à leur affichage sur la plateforme. L'éditeur peut retirer tout
          contenu signalé comme contraire aux présentes CGU.
        </p>
      </section>

      <section>
        <h2>7. Responsabilité</h2>
        <p>
          La responsabilité de l'éditeur ne saurait être engagée du fait des relations établies entre
          membres, des séjours réalisés, ni des contenus publiés par les utilisateurs. L'éditeur met en
          œuvre des moyens raisonnables pour assurer le bon fonctionnement du service sans obligation
          de résultat.
        </p>
      </section>

      <section>
        <h2>8. Modification des CGU</h2>
        <p>
          L'éditeur peut faire évoluer les présentes CGU. La version applicable est celle en vigueur au
          moment de l'utilisation du site. Dernière mise à jour&nbsp;: {LAST_UPDATE}.
        </p>
      </section>

      <section>
        <h2>9. Droit applicable</h2>
        <p>
          Les présentes CGU sont soumises au droit français. En cas de litige, et à défaut de
          résolution amiable, les tribunaux compétents seront ceux du ressort du siège de l'éditeur.
        </p>
      </section>
    </div>
  );
}

function Confidentialite() {
  return (
    <div className="prose-legal space-y-8">
      <section>
        <h2>Responsable du traitement</h2>
        <p>
          Le responsable du traitement des données est <strong>{EDITOR.name}</strong> ({EDITOR.brand}),
          {" "}{EDITOR.address}. Pour toute question relative à vos données&nbsp;:{" "}
          <a href={`mailto:${EDITOR.email}`}>{EDITOR.email}</a>.
        </p>
      </section>

      <section>
        <h2>Données collectées</h2>
        <p>Nous collectons les données strictement nécessaires au fonctionnement du service&nbsp;:</p>
        <ul>
          <li><strong>Compte</strong>&nbsp;: adresse e-mail, nom d'usage, et informations que vous renseignez dans votre profil et vos fiches de lieu.</li>
          <li><strong>Échanges</strong>&nbsp;: messages, demandes de séjour et avis que vous publiez.</li>
          <li><strong>Mesure d'audience</strong>&nbsp;: statistiques de navigation via Google Analytics (pages vues, provenance, type d'appareil).</li>
        </ul>
      </section>

      <section>
        <h2>Finalités et bases légales</h2>
        <ul>
          <li>Fournir le service de mise en relation (exécution du contrat / des CGU).</li>
          <li>Assurer la sécurité et la modération de la plateforme (intérêt légitime).</li>
          <li>Mesurer l'audience et améliorer le site (intérêt légitime / consentement pour la mesure d'audience selon votre choix).</li>
        </ul>
      </section>

      <section>
        <h2>Hébergement et sous-traitants</h2>
        <ul>
          <li><strong>Infomaniak</strong> (Suisse) — hébergement du site.</li>
          <li><strong>Supabase</strong> — base de données et authentification.</li>
          <li><strong>Google Analytics</strong> — mesure d'audience.</li>
        </ul>
        <p>
          Ces prestataires n'utilisent vos données que pour les besoins du service. Certains
          traitements peuvent impliquer un transfert hors Union européenne, encadré par les garanties
          appropriées (clauses contractuelles types).
        </p>
      </section>

      <section>
        <h2>Durée de conservation</h2>
        <p>
          Vos données de compte sont conservées tant que votre compte est actif. À sa suppression,
          elles sont effacées ou anonymisées, sous réserve des obligations légales de conservation. Les
          données de mesure d'audience sont conservées pour une durée limitée conforme aux
          recommandations de la CNIL.
        </p>
      </section>

      <section>
        <h2>Vos droits</h2>
        <p>
          Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de
          limitation, d'opposition et de portabilité de vos données. Vous pouvez les exercer à tout
          moment en écrivant à <a href={`mailto:${EDITOR.email}`}>{EDITOR.email}</a>. Vous pouvez
          également introduire une réclamation auprès de la CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">cnil.fr</a>).
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          Le site utilise des cookies nécessaires à son fonctionnement (session, authentification) et,
          sous réserve de votre consentement, des cookies de mesure d'audience (Google Analytics). Vous
          pouvez configurer votre navigateur pour les refuser.
        </p>
      </section>
    </div>
  );
}

const CONTENT: Record<DocKey, () => JSX.Element> = {
  mentions: MentionsLegales,
  cgu: CGU,
  confidentialite: Confidentialite,
};

const Legal = ({ doc }: { doc: DocKey }) => {
  const meta = META[doc];
  const Body = CONTENT[doc];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO title={`${meta.title} — Casa Minga`} description={meta.title} canonical={meta.canonical} />
      <Navbar />
      <main className="flex-1">
        <section className="bg-warm py-12 md:py-16">
          <div className="container max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">{meta.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">Dernière mise à jour&nbsp;: {LAST_UPDATE}</p>
          </div>
        </section>

        <section className="container max-w-3xl py-10 md:py-14 text-sm text-muted-foreground leading-relaxed [&_h2]:text-lg [&_h2]:md:text-xl [&_h2]:font-serif [&_h2]:text-foreground [&_h2]:mb-3 [&_a]:text-primary [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_p]:mb-3">
          <Body />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Legal;
