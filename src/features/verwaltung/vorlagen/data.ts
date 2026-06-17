export type VorlagenParagraph = { id: string; titel: string; text: string }

export type Vorlage = {
  id: string
  label: string
  paragraphen: VorlagenParagraph[]
}

export const VORLAGEN: Vorlage[] = [
  {
    id: 'hausordnung',
    label: 'Hausordnung',
    paragraphen: [
      {
        id: 'ho_1',
        titel: 'Ruhezeiten',
        text: 'Allgemeine Ruhezeiten sind werktags von 22:00 bis 6:00 Uhr sowie an Sonn- und Feiertagen ganztägig einzuhalten. Mittagsruhe besteht in der Regel von 13:00 bis 15:00 Uhr. Während dieser Zeiten sind ruhestörende Tätigkeiten zu unterlassen. Fernseh-, Radio- und Musikgeräte sind stets auf Zimmerlautstärke einzustellen.',
      },
      {
        id: 'ho_2',
        titel: 'Reinigung gemeinschaftlicher Flächen',
        text: 'Treppenhäuser, Flure, Keller- und Bodenräume sowie Zugangswege sind sauber und frei von Hindernissen zu halten. Soweit nichts anderes vereinbart ist, erfolgt die Reinigung wöchentlich im Wechsel gemäß Reinigungsplan. Bei Schnee und Glatteis ist der Streu- und Räumdienst gemäß örtlicher Satzung von 7:00 bis 20:00 Uhr sicherzustellen.',
      },
      {
        id: 'ho_3',
        titel: 'Müllentsorgung',
        text: 'Müll ist getrennt in den dafür vorgesehenen Behältern (Restmüll, Bioabfall, Papier, Verpackungen, Glas) zu entsorgen. Sperrmüll, Bauschutt, Sondermüll und Elektrogeräte sind eigenständig den zuständigen Sammelstellen zuzuführen. Eine Lagerung im Treppenhaus, im Keller oder auf gemeinschaftlichen Flächen ist nicht zulässig.',
      },
      {
        id: 'ho_4',
        titel: 'Lüften und Heizen',
        text: 'Zur Vermeidung von Feuchtigkeits- und Schimmelschäden sind alle Räume regelmäßig durch Stoßlüften (mehrfach täglich mit weit geöffneten Fenstern für 5–10 Minuten) zu lüften. Dauerkippstellung ist zu vermeiden. Während der Heizperiode sind die Räume so zu beheizen, dass auch in Abwesenheit keine Schäden durch Frost oder Feuchtigkeit entstehen können.',
      },
      {
        id: 'ho_5',
        titel: 'Haustür und Sicherheit',
        text: 'Die Haustür ist in der Zeit von 22:00 bis 6:00 Uhr geschlossen zu halten. Fenster in gemeinschaftlich genutzten Räumen sind bei Regen und Frost sowie über Nacht zu schließen.',
      },
      {
        id: 'ho_6',
        titel: 'Balkone, Fenster, Trockenflächen',
        text: 'Wäsche darf nur an den dafür vorgesehenen Plätzen getrocknet werden. Das Ausschütteln von Teppichen, Decken oder Putztüchern aus Fenstern und Balkonen ist nicht gestattet. Blumenkästen sind verkehrssicher anzubringen.',
      },
      {
        id: 'ho_7',
        titel: 'Grillen',
        text: 'Das Grillen mit offenem Feuer (Holzkohle) auf Balkonen ist nicht gestattet. Elektrogrills sind unter Wahrung gegenseitiger Rücksichtnahme zulässig.',
      },
      {
        id: 'ho_8',
        titel: 'Haftung',
        text: 'Verstöße gegen die Hausordnung können nach Abmahnung zur Kündigung des Mietverhältnisses führen. Für Schäden, die durch schuldhafte Verletzung der Hausordnung entstehen, haftet der Verursacher.',
      },
    ],
  },
  {
    id: 'uebergabeprotokoll',
    label: 'Wohnungsübergabeprotokoll',
    paragraphen: [
      {
        id: 'up_1',
        titel: 'Anlass und Beteiligte',
        text: 'Dieses Protokoll dokumentiert die Übergabe der Mietsache bei Beginn des Mietverhältnisses. Anwesend sind Vermieter (oder Bevollmächtigte/r) und Mieter. Der festgehaltene Zustand ist für die Beurteilung von Schönheitsreparaturen und Rückgabeansprüchen maßgeblich (Anlage 1 zum Mietvertrag).',
      },
      {
        id: 'up_2',
        titel: 'Zählerstände',
        text: 'Die Zählerstände werden bei Übergabe gemeinsam abgelesen und mit Zählernummer notiert: Strom, Gas, Wasser (kalt/warm) sowie Heizung. Beide Parteien bestätigen die Richtigkeit der abgelesenen Werte durch Unterschrift.',
      },
      {
        id: 'up_3',
        titel: 'Schlüsselübergabe',
        text: 'Dem Mieter werden sämtliche Schlüssel ausgehändigt (Wohnung, Haustür, Briefkasten sowie ggf. Keller, Dachboden, Garage/Stellplatz). Anzahl und Art der Schlüssel werden festgehalten. Der Mieter darf ohne Zustimmung des Vermieters keine zusätzlichen Schlüssel anfertigen lassen.',
      },
      {
        id: 'up_4',
        titel: 'Zustand und Mängel',
        text: 'Der Zustand der Räume, Böden, Wände, Decken, Fenster, Türen und sanitären Einrichtungen wird raumweise erfasst. Vorhandene Mängel oder Gebrauchsspuren werden ausdrücklich aufgeführt; nicht aufgeführte Mängel gelten als bei Übergabe nicht vorhanden.',
      },
    ],
  },
  {
    id: 'wohnungsgeberbestaetigung',
    label: 'Wohnungsgeberbestätigung',
    paragraphen: [
      {
        id: 'wg_1',
        titel: 'Rechtsgrundlage',
        text: 'Der Vermieter (Wohnungsgeber) bestätigt dem Mieter den Ein- bzw. Auszug gemäß § 19 Bundesmeldegesetz (BMG). Diese Bestätigung ist der Meldebehörde innerhalb von zwei Wochen vorzulegen.',
      },
      {
        id: 'wg_2',
        titel: 'Angaben zur Wohnung',
        text: 'Bestätigt werden Name und Anschrift des Wohnungsgebers, die Anschrift der Wohnung, das Einzugs- bzw. Auszugsdatum sowie die Namen aller meldepflichtigen Personen, die in die Wohnung ein- oder ausgezogen sind.',
      },
      {
        id: 'wg_3',
        titel: 'Hinweis',
        text: 'Eine wissentlich falsche oder nicht rechtzeitige Ausstellung der Bestätigung stellt eine Ordnungswidrigkeit dar und kann mit Bußgeld geahndet werden.',
      },
    ],
  },
  {
    id: 'kuendigungsbestaetigung',
    label: 'Kündigungsbestätigung',
    paragraphen: [
      {
        id: 'ku_1',
        titel: 'Bestätigung des Eingangs',
        text: 'Der Vermieter bestätigt den Eingang der Kündigung des Mietverhältnisses. Festgehalten werden das Datum des Zugangs der Kündigung sowie das hieraus berechnete Vertragsende unter Beachtung der gesetzlichen bzw. vertraglichen Kündigungsfrist.',
      },
      {
        id: 'ku_2',
        titel: 'Rückgabe der Mietsache',
        text: 'Die Wohnung ist zum Vertragsende vollständig geräumt, besenrein und mit sämtlichen Schlüsseln zurückzugeben. Ein gemeinsamer Rückgabetermin wird rechtzeitig vereinbart; der Zustand wird in einem Rückgabeprotokoll mit Zählerständen festgehalten.',
      },
      {
        id: 'ku_3',
        titel: 'Kaution und Abrechnung',
        text: 'Über die Mietsicherheit wird nach Rückgabe der Wohnung und Vorliegen der Betriebskostenabrechnung innerhalb einer angemessenen Frist abgerechnet. Ein angemessener Teilbetrag kann wegen noch nicht abgerechneter Betriebskosten vorübergehend einbehalten werden.',
      },
    ],
  },
]

export function getVorlage(id: string): Vorlage | undefined {
  return VORLAGEN.find((v) => v.id === id)
}
