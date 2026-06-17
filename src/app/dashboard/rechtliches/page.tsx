export default function RechtlichesPage() {
  const LegalCard = ({
    title, paragraph, items,
  }: { title: string; paragraph: string; items: string[] }) => (
    <div className="bg-linen border border-paper p-5 space-y-3">
      <p className="font-label text-xs uppercase tracking-widest text-stone-600">{title}</p>
      <p className="font-label text-[10px] uppercase tracking-widest text-stone-400">{paragraph}</p>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5 font-body text-sm text-stone-700">
            <span className="text-stone-400 shrink-0 mt-0.5">—</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <div className="space-y-10">

      <div>
        <h1 className="font-display text-3xl text-ink mb-1">Rechtliche Grundlagen</h1>
        <p className="font-body text-sm text-smoke">Orientierungshilfe — kein Rechtsrat. Bei Unsicherheiten anwaltliche Prüfung empfohlen.</p>
      </div>

      {/* ── Mietvertragsarten ─────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-display text-xl text-ink border-b border-paper pb-2">Mietvertragsarten</h2>

        <LegalCard
          title="Standardmietvertrag — Vergleichsmiete"
          paragraph="§§ 558 ff. BGB"
          items={[
            'Erhöhung bis zur ortsüblichen Vergleichsmiete zulässig',
            'Kappungsgrenze: max. 20 % in 3 Jahren (15 % in angespannten Märkten)',
            'Mietpreisbremse (§ 556d BGB): max. 10 % über Vergleichsmiete bei Neuvermietung',
            'Ankündigung schriftlich mit Begründung (Mietspiegel, Vergleichswohnungen oder Gutachten)',
            'Zustimmungsfrist: Mieter hat 2 Monate Überlegungszeit; danach Klage auf Zustimmung möglich',
            'Modernisierungsmieterhöhung (§ 559 BGB): max. 8 % der Modernisierungskosten jährlich',
          ]}
        />

        <LegalCard
          title="Staffelmietvertrag"
          paragraph="§ 557a BGB"
          items={[
            'Schriftform § 126 BGB: beide Parteien unterschreiben eigenhändig',
            'Erhöhungsbetrag in €: muss als Absolutbetrag angegeben werden, nicht in Prozent',
            'Mindestabstand: 12 Monate zwischen zwei Staffeln',
            'Sperrwirkung: § 558 (Vergleichsmiete) und § 559 (Modernisierung) gesperrt',
            'Mietpreisbremse gilt für jede einzelne Staffelstufe',
            'Sonderkündigung Mieter möglich, wenn Staffel die Vergleichsmiete um mehr als 10 % übersteigt',
          ]}
        />

        <div className="space-y-3">
          <LegalCard
            title="Indexmietvertrag"
            paragraph="§ 557b BGB"
            items={[
              'Schriftform § 126 BGB: beide Parteien unterschreiben eigenhändig (kein E-Mail-Abschluss)',
              'Index: Verbraucherpreisindex für Deutschland (Destatis, Basis 2020=100) — andere Indizes im Wohnraum unzulässig',
              'Klausel muss in beide Richtungen wirken — auch Senkungen des VPI sind verpflichtend zu berücksichtigen',
              'Mindestabstand: 12 Monate zwischen zwei Anpassungen (§ 557b Abs. 2)',
              'Keine automatische Erhöhung: Anpassung aktiv in Textform gegenüber dem Mieter geltend machen',
              'Erhöhungsschreiben muss enthalten: alter VPI-Wert, neuer VPI-Wert, neue Miete oder Erhöhungsbetrag in €',
              'Wirksam: frühestens Beginn des übernächsten Monats nach Zugang des Schreibens',
              'Sperrwirkung: §§ 558 (Vergleichsmiete) und 559 (Modernisierung) gesperrt',
              'Ausnahme Sperrwirkung: gesetzlich vorgeschriebene Maßnahmen (z. B. Pflicht-Heizungstausch)',
              'Mietpreisbremse (§§ 556d–556g BGB) gilt für die Ausgangsmiete',
              'Ausgangsindexstand (VPI-Wert des Bezugsmonats) muss im Vertrag stehen — ohne diesen Wert ist keine Erhöhung berechenbar',
            ]}
          />
          <div className="border border-amber-200 bg-amber-50 p-4 space-y-1.5">
            <p className="font-label text-xs uppercase tracking-widest text-amber-700">Reform-Hinweis — noch nicht in Kraft (Stand Juni 2026)</p>
            <p className="font-body text-sm text-amber-900 leading-relaxed">
              Kabinettsbeschluss 29.04.2026 — „Mietrecht II": In angespannten Wohnungsmärkten sollen
              VPI-Steigerungen über 3 % künftig nur zur Hälfte angerechnet werden. Die Regelung soll
              symmetrisch wirken (auch bei Senkungen) und bestehende wie neue Verträge erfassen.
              Bis zur Verabschiedung gilt die bisherige Rechtslage ohne Kappung.
            </p>
          </div>
        </div>
      </section>

      {/* ── Übergabe ──────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-display text-xl text-ink border-b border-paper pb-2">Übergabe & Beweislast</h2>

        <LegalCard
          title="Beweislast bei Übergabe"
          paragraph="BGH VIII ZR 71/08 · § 416 ZPO"
          items={[
            'Vermieter trägt grundsätzlich die Beweislast für den Zustand der Wohnung bei Übergabe',
            'Beidseitig unterschriebenes Übergabeprotokoll kehrt die Beweislast faktisch um (Privaturkunde § 416 ZPO)',
            'Ohne Protokoll gilt die Wohnung im Zweifel als mangelfrei zurückgegeben',
            'BGH VIII ZR 48/09: Unterschriebenes Protokoll — Mieter muss beweisen, dass Schäden bereits bei Einzug vorhanden waren',
            'BGH 18.03.2015: Mieter trägt Beweislast dafür, dass unrenoviert übergeben wurde (wenn Vermieter Renovierung dokumentiert hat)',
            '§ 536b BGB: Mieter, der Wohnung vorbehaltlos annimmt, verliert Gewährleistungsrechte wegen bekannter Mängel',
            'Protokoll raumweise mit konkretem Zustand (Wände, Decken, Türen, Böden, Fenster) und Zählerständen',
          ]}
        />
      </section>

      {/* ── Schönheitsreparaturen ─────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-display text-xl text-ink border-b border-paper pb-2">Schönheitsreparaturen</h2>

        <LegalCard
          title="Wirksamkeitsvoraussetzungen (BGH-konform)"
          paragraph="§ 535 BGB · BGH-Rechtsprechung"
          items={[
            'Renovierte Übergabe muss dokumentiert sein — sonst ist die Klausel AGB-unwirksam',
            'Weicher Fristenplan (Richtwerte, nicht starr): Küche/Bad ca. 5 Jahre, Wohnräume ca. 8 Jahre, Nebenräume ca. 10 Jahre',
            'Keine Endrenovierungsklausel — BGH-Falle: unwirksam, wenn Mieter bei Auszug stets renovieren muss',
            'Keine Quotenabgeltungsklausel — BGH-Falle: unwirksam wegen starrer Berechnungsformel',
            'Selbstvornahme durch Mieter erlaubt (keine Fachfirmenpflicht)',
            'Nur mittlere Art und Güte; Mieter ist in der Farbwahl frei',
            'BGH VIII ZR 163/18 / 270/18: Bei unrenovierter Übergabe und verschlechtertem Zustand kann der Mieter Renovierung verlangen — beteiligt sich aber hälftig an den Kosten',
          ]}
        />
      </section>

      {/* ── Kleinreparaturen ──────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-display text-xl text-ink border-b border-paper pb-2">Kleinreparaturen</h2>

        <LegalCard
          title="Rechtliche Grenzen der Kleinreparaturklausel"
          paragraph="§ 535 BGB · BGH-Rechtsprechung"
          items={[
            'Nur an Gegenständen, die dem häufigen direkten Zugriff des Mieters ausgesetzt sind: Lichtschalter, Steckdosen, Wasserhähne, Türschlösser, Rollladengurte, Fensterriegel',
            'Pro Einzelfall: max. ca. 100–120 € (BGH-Grenze, regelmäßig angepasst)',
            'Jahresobergrenze: max. 8 % der Jahres-Nettokaltmiete',
            'Klausel muss beides nennen — Einzelfallbetrag UND Jahresdeckel — sonst unwirksam',
            'Größere Reparaturen (Heizung, Fenster, Rohre) gehen stets zulasten des Vermieters',
          ]}
        />
      </section>

      {/* ── Rückgabe & Verjährung ─────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-display text-xl text-ink border-b border-paper pb-2">Rückgabe & Verjährung</h2>

        <LegalCard
          title="Rückgabepflicht & Schadensersatz"
          paragraph="§§ 546, 538 BGB"
          items={[
            '§ 546 BGB: Rückgabepflicht des Mieters — nur besenrein, keine weitergehende Pflicht ohne Vereinbarung',
            '§ 538 BGB: Normale Abnutzung trägt der Vermieter — keine Haftung des Mieters',
            'Schadensersatz „neu für alt": Lebensdauer der Einrichtung anteilig berücksichtigen (Küche ca. 20–25 Jahre)',
            'Schäden (Nebenpflicht): sofort abrechnen/verrechnen, KEINE Nachfrist nötig',
            'Unterlassene Schönheitsreparaturen (Hauptleistungspflicht): erst Nachfrist setzen, dann Schadensersatz',
          ]}
        />

        <div className="bg-red-50 border border-red-200 p-5 space-y-3">
          <p className="font-label text-xs uppercase tracking-widest text-red-700">§ 548 BGB — Kritische Verjährungsfrist</p>
          <ul className="space-y-2">
            {[
              'Nur 6 Monate nach Rückgabe (nicht nach Mietende!) — Frist beginnt mit Schlüsselrückgabe',
              'Gilt für: Schadensersatz wegen Beschädigungen, unterlassene Schönheitsreparaturen, bauliche Veränderungen',
              'Frist läuft unabhängig davon, ob der Vermieter von den Schäden informiert wurde',
              'Handlungspflicht: sofort nach Rückgabe begehen, dokumentieren, Kostenvoranschläge einholen',
              'Nach Fristablauf: Ansprüche verjährt und nicht mehr klagbar',
            ].map((item, i) => (
              <li key={i} className="flex gap-2.5 font-body text-sm text-red-800">
                <span className="text-red-400 shrink-0 mt-0.5">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Kaution ───────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-display text-xl text-ink border-b border-paper pb-2">Kaution</h2>

        <LegalCard
          title="Kaution & Abrechnung"
          paragraph="§ 551 BGB · BGH VIII ZR 184/23 (10.07.2024)"
          items={[
            'Maximalbetrag: 3 Nettokaltmieten (§ 551 BGB)',
            'Mieter kann in 3 gleichen Monatsraten zahlen — erste Rate bei Mietbeginn fällig',
            'Vermieter legt Kaution getrennt vom Vermögen insolvenzfest und verzinslich an',
            'Zinsen stehen dem Mieter zu und erhöhen die Sicherheit',
            'Abrechnung innerhalb angemessener Prüfungsfrist nach Rückgabe (3–6 Monate üblich)',
            'Einbehalt für noch nicht abgerechnete Betriebskosten zulässig',
            'BGH 10.07.2024 (VIII ZR 184/23): Vermieter darf auch mit verjährten Schadensersatzansprüchen gegen die Kautionsrückzahlung aufrechnen — gilt nur für Barkaution (nicht Bürgschaft oder Sparbuch)',
          ]}
        />
      </section>

    </div>
  )
}
