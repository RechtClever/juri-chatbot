# Juri Chatbot - Entwicklungsdokumentation

## 1. Verzeichnisstruktur und Namenskonventionen

### 1.1 Verzeichnisbenennungsregeln
- Hauptordner beginnen mit einer zweistelligen Zahl (z.B. "10 Mietrecht")
- Unterordner beginnen mit einer zweistelligen Zahl gefolgt vom Thema (z.B. "01 Ende Abrechnungsjahr")
- Verwenden Sie beschreibende Namen für Ordner
- Vermeiden Sie Sonderzeichen außer Leerzeichen und Unterstriche
- Verwenden Sie Standardbenennungsmuster wie "weiter/" für Fortsetzungspfade

### 1.2 Beispiel für Verzeichnishierarchie
```
XX Hauptthema/
├── Hauptthema.txt        # Eingangsfrage
├── weiter/              # Standard-Fortsetzungsordner
│   ├── 01 Erste Frage/
│   │   ├── Frage.txt   # Für Einzelauswahl
│   │   ├── Option1/    # Mögliche Antwort
│   │   │   └── script.txt
│   │   └── Option2/    # Alternative Antwort
│   │       └── script.txt
│   └── 02 Zweite Frage/
```

### 1.3 Identifikation von Fragen- und Antwortdateien

#### 1.3.1 Bestimmung von Fragenordnern
- Die Identifikation eines Fragenordners erfolgt durch seine Position in der Hierarchie, nicht durch seinen Namen
- Ein Ordner wird als Fragenordner betrachtet, wenn:
  - Er direkt unter einem "weiter/" Ordner liegt (z.B. "01 Erste Frage/")
  - Er eine eindeutige Nummerierung im Namen hat (z.B. "01", "02")
  - Er kein Antwortordner ist (wie "ja/", "nein/", "Option1/")

#### 1.3.2 Textdateien in Ordnern
- Jeder Fragenordner muss genau eine zugehörige Textdatei enthalten
- Diese Textdatei definiert die Frage und die möglichen Antwortformate
- Antwortordner enthalten Dateien namens "answer.txt", die keine Fragen, sondern Antwortoptionen definieren
- Die Identifikation einer Datei als Frage- oder Antwortdatei erfolgt durch den Ordnertyp, nicht durch den Dateinamen

## 2. Fragetypen und Implementierung

### 2.1 Einzelauswahl (Ordnerbasiert)
- Implementiert durch Verzeichnisstruktur
- Benötigt nur eine frage.txt im übergeordneten Ordner
- Jede Option ist ein Unterordner
- Jede Option kann ihre eigene script.txt enthalten

Beispiel:
```
# Ihre Frage hier?
-----
/multiple-choice
- Option 1
  goto $option1$
- Option 2
  goto $option2$
```

### 2.2 Mehrfachauswahl
- Implementiert mit /multiple-choice Formular
- Kann mehrere Optionen gleichzeitig setzen
- Variablen werden mit true/false gesetzt
- Jede Option kann zugehörige Aktionen haben

Beispiel:
```
# Wählen Sie zutreffende Punkte aus:
-----
/multiple-choice
- Heizung und Warmwasser
  #HeizungWarmwasser = true
  $heizungOption$
- Wartung
  #Wartung = true
  $wartungOption$
```

### 2.3 Datumseingabe
- Implementiert mit /date Formular
- Speichert Datum in Variable
- Häufig für Fristberechnungen verwendet

Beispiel:
```
# Wann endete die Abrechnungsperiode?
-----
/date
    #AbrechnungsendDatum
```

### 2.4 UUID-basierte Navigation und Goto-Befehle
- Jede Frage und Antwortoption erhält eine eindeutige UUID (z.B. `$68d2ce9d-6fe1-4beb-b540-7f734d46f0f2$`)
- Diese UUIDs werden für die Navigation zwischen Dialogen verwendet
- In Scripts können bedingte Sprünge mit goto-Befehlen erfolgen:
```javascript
if (tageNachEnde > 1825) { // 5 Jahre
    #Korrespondenztext = "Die Forderung ist nach Art. 128 Ziff. 1 OR verjährt.";
    goto $verjaehrt$;
}
```

## 3. Skript-Syntax und Regeln

### 3.1 Grundlegende Skriptstruktur
```javascript
\\ Script Start
// Ihr Code hier
\\ Script End
```

### 3.2 Formulartypen

#### 3.2.1 Textformulare
```
/text
#variablenName
```

#### 3.2.2 Adressformulare
```
/address
#adressVariable
```

#### 3.2.3 Zahlenformulare
```
/number
#zahlenVariable
```

#### 3.2.4 Währungsformulare
```
/currency
#waehrungVariable
```

### 3.3 Korrespondenztexte
- Verwendet #Korrespondenztext
- NUR für rechtliche Dokumente und formelle Schreiben
- NICHT für Benutzerkommunikation
- Enthält nur Inhalte, die in einem rechtlichen Dokument erscheinen würden

Beispiel:
```javascript
#Korrespondenztext = "Analyse Ihres Anliegens\n" +
    "===================\n\n" +
    "Feststellungen:\n" +
    "- Punkt 1\n" +
    "- Punkt 2\n\n" +
    "Rechtsgrundlage:\n" +
    "Art. X OR\n\n" +
    "Empfehlung:\n" +
    "Konkrete Handlungsempfehlung";
```

### 3.4 Mehrzellige Variablenzuweisungen
- Variablenzuweisungen müssen immer in einer einzigen Zeile erfolgen
- Bei längeren Zeichenketten sollte die Konkatenation mit + in derselben Zeile erfolgen
- Zeilenumbrüche im Code zwischen Stringteilen führen zu Parser-Fehlern

Falsch:
```javascript
#Korrespondenztext = "\n\nDie Akontozahlungen weichen erheblich von den tatsächlichen Kosten ab. " + 
"\nEine angemessene Akontozahlung würde bei ca. CHF " + empfohleneAkonto.ToString("F2") + " liegen.";
```

Richtig:
```javascript
#Korrespondenztext = "\n\nDie Akontozahlungen weichen erheblich von den tatsächlichen Kosten ab. " + "\nEine angemessene Akontozahlung würde bei ca. CHF " + empfohleneAkonto.ToString("F2") + " liegen.";
```

### 3.5 Variablendefinitionen

#### 3.5.1 Syntax in Antwortdateien (answer.txt)
- In Antwortdateien werden Variablen mit der einfachen Syntax `#key = Wert` definiert
- Anführungszeichen sind NICHT notwendig
- Die C#-Syntax gilt NICHT für Variablendefinitionen in Antwortdateien
- Beispiel: `#Korrespondenztext = Der gewählte Verteilschlüssel ist nicht nachvollziehbar.`

#### 3.5.2 Array-Variablen
Bestimmte vordefinierte Variablen speichern Arrays von Strings:
- #Korrespondenztext
- #BriefAdresse
- #Materielles
- #Formelles
- #Sachverhalt
- #Antrag

- Bei erneuter Zuweisung wird der bestehende Array-Inhalt ergänzt
- Mehrere Definitionen derselben Variable über verschiedene Dateien hinweg sind möglich

### 3.6 Variablenpersistenz und -zugänglichkeit
- Variablen sind über Fragen und Scripts hinweg zugänglich
- Eine Variable bleibt während der gesamten Chatbot-Sitzung bestehen
- Bei mehrfacher Definition:
  - Reguläre Variablen: Neuer Wert überschreibt alten Wert
  - Array-Variablen: Neuer Wert wird hinzugefügt

### 3.7 Variablenbenennungskonventionen

#### 3.7.1 Nummerierte Variablen
- Variablen mit Nummernsuffixen (z.B. #HeizungWarmwasser210, #HeizungWarmwasser565) kennzeichnen verschiedene Fragebereiche
- Die Nummern sollten beibehalten werden, um die Zuordnung zu gewährleisten

#### 3.7.2 Boolean-Variablen
- Boolean-Variablen werden als Strings gespeichert ("true"/"false")
- Vergleiche müssen explizit gegen Strings erfolgen
```javascript
if (#PauschaleModell == "true") {
    // Code hier
}
```

## 4. Rechtsdokumenterstellung

### 4.1 Dokumenttypen und ihre Templates
1. Einsprache (an Vermieter) - Template: template_Korrespondenz.docx
2. Schlichtungsgesuch - Template: RO_Gesuch.docx
3. Gerichtseinreichung/Klage - Template: RO_Gesuch.docx

### 4.2 Schlüsselvariablen nach Dokumenttyp

#### 4.2.1 Für template_Korrespondenz.docx (Einsprachen, Nachfristgesuche)
- #Korrespondenztext: Vollständiger Brieftext als zusammenhängender Text
- #BriefAdresse: Adressierungsinformationen
- #Anrede230: Persönliche Anrede
- #Rechtsschriftentyp: Art des Dokuments (z.B. "Einsprache", "Nachfristgesuch")
- #Rechtsschrift: Genaue Bezeichnung (z.B. "Einsprache gegen Nebenkostenabrechnung")

#### 4.2.2 Für RO_Gesuch.docx (Schlichtungsgesuche, Klagen)
- #Korrespondenztext: Einleitender Text
- #Formelles: Formelle Aspekte des Falles
- #Materielles: Materielle Rechtsfragen
- #Antrag: Konkrete Rechtsbegehren (nur bei Klagen)
- #Rechtsschriftentyp: Art des Dokuments
- #Rechtsschrift: Genaue Bezeichnung
- #gerichtstyp: Gerichtstyp ("car" für Schlichtungsbehörde, "dc" für Gericht)
- #Gerichtsadresse: Adresse der zuständigen Behörde

### 4.3 Regeln zur Dokumentenerstellung

#### 4.3.1 Allgemeine Regeln
- Klare Trennung zwischen Dokumenttypen
- Dynamische Generierung basierend auf Benutzereingaben
- Keine Vermischung von Variablen zwischen Dokumenttypen
- Strikte Einhaltung der schweizerischen Rechtsanforderungen

#### 4.3.2 Korrespondenztexte
- Vollständige, grammatikalisch korrekte Sätze
- Kohärente und strukturierte Argumentation
- Formeller Stil mit präzisen Rechtsbegriffen
- Gesetzliche Verweise korrekt und eindeutig
- Keine Stichpunkte oder fragmentierte Texte
- Bei mehreren Argumenten nummerierte Liste

#### 4.3.3 Template-spezifische Anforderungen
- Bei template_Korrespondenz.docx: #Korrespondenztext enthält den gesamten Brieftext
- Bei RO_Gesuch.docx: Trennung in #Formelles, #Materielles und ggf. #Antrag
- Bei Klagen: #Antrag präzise und vollständig formulieren

### 4.4 Spezielle Szenarien

#### 4.4.1 Nachzahlungsszenarien
- Korrespondenztext auf Einsprache gegen die Forderung ausrichten
- Bei Schlichtung/Klage: Fokus auf Feststellung der Unzulässigkeit der Forderung

#### 4.4.2 Rückzahlungsszenarien
- Korrespondenztext auf Geltendmachung eines Anspruchs ausrichten
- Bei Schlichtung/Klage: Fokus auf Leistungsbegehren

### 4.5 Beispiele für korrekte Variable-Nutzung

#### Für Einsprache (template_Korrespondenz.docx):
```javascript
#template = "template_Korrespondenz.docx";
#Rechtsschriftentyp = "Einsprache";
#Rechtsschrift = "Einsprache gegen Nebenkostenabrechnung";

#Korrespondenztext = "Sehr geehrte Damen und Herren\n\n" + 
  "Bezugnehmend auf Ihre Nebenkostenabrechnung vom [Datum] erhebe ich hiermit Einsprache. Nach sorgfältiger Prüfung stelle ich folgende Mängel fest..."

#BriefAdresse = "Sehr geehrte Damen und Herren";
```

#### Für Schlichtungsgesuch (RO_Gesuch.docx):
```javascript
#template = "RO_Gesuch.docx";
#Rechtsschriftentyp = "Schlichtungsgesuch";
#Rechtsschrift = "Schlichtungsgesuch";
#Preis = "66.00";
#Gerichtsadresse = "[gesuchsteller.gerichtsadresse]";
#gerichtstyp = "car";

#Formelles = "Der Mieter hat am [Datum] Einsprache gegen die Nebenkostenabrechnung erhoben.";

#Materielles = "Die strittigen Positionen der Nebenkostenabrechnung stützen sich auf folgende Rechtsgrundlagen:";

#Anrede230 = "Sehr geehrte Damen und Herren";
```

#### Für Klage (RO_Gesuch.docx):
```javascript
#template = "RO_Gesuch.docx";
#Rechtsschriftentyp = "Klage";
#Rechtsschrift = "Klage betreffend Nebenkostenabrechnung";
#Preis = "66.00";
#Gerichtsadresse = "[gesuchsteller.gerichtsadresse]";
#gerichtstyp = "dc";

#Formelles = "Das Schlichtungsverfahren wurde am [Datum] abgeschlossen.";

#Materielles = "Dem Rechtsbegehren liegen folgende materiellrechtliche Grundlagen zugrunde:";

#Antrag = "Der Kläger stellt folgende Rechtsbegehren:";

#Anrede230 = "Sehr geehrte Damen und Herren";
```

## 5. Implementierungseinschränkungen

### 5.1 Technische Beschränkungen
- Keine komplexen Datenstrukturen (Arrays, Objekte)
- Keine Funktionsdefinitionen
- Keine externen Bibliotheken
- Keine Schleifenkonstrukte
- Nur spezifizierte Variablen können verwendet werden
- Reine Textgenerierung ohne Nebeneffekte

### 5.2 Bewährte Praktiken
- Schweizerische Rechtsgrundlagen immer berücksichtigen
- Korrespondenztexte ausschließlich für rechtliche Dokumente
- Benutzerkommunikation durch Chat-Fragen
- Logische Trennung zwischen Ablaufsteuerung, Benutzerkommunikation und rechtlichen Dokumenten
- Skripte kurz und fokussiert halten
- Klare, aussagekräftige Variablennamen verwenden
- Korrespondenztexte systematisch strukturieren

### 5.3 Fehlervermeidung
- Variablen konsistent verwenden
- Goto-Labels sorgfältig prüfen
- Dateipfade und Ordnernamen verifizieren
- Skripte immer mit \\ Script Start und \\ Script End markieren

### 5.4 Vollständigkeit des Fragenkatalogs
- Für jeden Fragenordner muss eine zugehörige Textdatei existieren
- Die Ordnerstruktur bestimmt, ob es sich um einen Fragenordner handelt
- Vor der Implementierung sollte eine vollständige Überprüfung aller Pfade erfolgen
- Besondere Aufmerksamkeit auf tiefe Verschachtelungen richten

### 5.5 Prüfungs-Checkliste
1. Zeilenübergreifende Variablenzuweisungen überprüfen
2. Jeden Pfad auf Vollständigkeit der Fragendateien untersuchen
3. Automatisiertes Prüfskript für systematische Fehlererkennung empfohlen

## 6. Benutzerbenachrichtigungen und Navigation

### 6.1 Implementierung von Warnungen
- Warnungen MÜSSEN als reguläre Chat-Fragen implementiert werden
- Navigation zu Warnungen erfolgt über goto-Befehle:
```javascript
if (verbleibendeTageZahlung < 10 && verbleibendeTageZahlung > 0) {
    goto $warnung_zahlungsfrist_kurz$;
}
```

### 6.2 Warnungsstruktur
```
├── 13 Warnung Zahlungsfrist abgelaufen/
│   ├── Warnung
│   │   │ # Achtung: Die Zahlungsfrist ist bereits abgelaufen, wir müssen schnell handeln.
│   │   │ -----
│   │   │     $warnung_zahlungsfrist_abgelaufen$
```

### 6.3 Wichtige Hinweise
- KEINE systemgenerierten Warnmeldungen oder Popups
- Alle Benutzerbenachrichtigungen im regulären Chat-Fluss
- Jede Warnung braucht einen eindeutigen Fragenordner mit UUID