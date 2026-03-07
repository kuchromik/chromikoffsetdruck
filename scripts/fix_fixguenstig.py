import re

with open('src/routes/fixguenstig/+page.svelte', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. DPD -> Paketdienst
old1 = "Versand per DPD (+{versandkostenNetto.toFixed(2)} \u20ac netto / +{versandkostenBrutto.toFixed(2)} \u20ac brutto)"
new1 = "Versand per Paketdienst (+{versandkostenNetto.toFixed(2).replace('.', ',')} \u20ac netto / +{versandkostenBrutto.toFixed(2).replace('.', ',')} \u20ac brutto)"
if old1 in content:
    content = content.replace(old1, new1)
    print('1. DPD -> Paketdienst ersetzt')
else:
    print('1. NICHT GEFUNDEN')

# 2. Versandkosten-Betraege mit Kommaformat
old2 = "Netto: {versandkostenNetto.toFixed(2)} \u20ac<br>"
new2 = "Netto: {versandkostenNetto.toFixed(2).replace('.', ',')} \u20ac<br>"
if old2 in content:
    content = content.replace(old2, new2)
    print('2a. Netto-Betrag ersetzt')
else:
    print('2a. NICHT GEFUNDEN')

old3 = "zzgl. 19% MwSt.: {(versandkostenNetto * mehrwertsteuer).toFixed(2)} \u20ac<br>"
new3 = "zzgl. 19 % MwSt.: {(versandkostenNetto * mehrwertsteuer).toFixed(2).replace('.', ',')} \u20ac<br>"
if old3 in content:
    content = content.replace(old3, new3)
    print('2b. MwSt-Betrag ersetzt')
else:
    print('2b. NICHT GEFUNDEN')

old4 = "<strong>Brutto: {versandkostenBrutto.toFixed(2)} \u20ac</strong>"
new4 = "<strong>Brutto: {versandkostenBrutto.toFixed(2).replace('.', ',')} \u20ac</strong>"
if old4 in content:
    content = content.replace(old4, new4)
    print('2c. Brutto-Betrag ersetzt')
else:
    print('2c. NICHT GEFUNDEN')

# 3. Hinweis "Versandadressdaten" nach dem Versandkosten-Block
# Find the closing </span>\n...\t\t\t\t\t\t\t\t</div> inside the versandkosten box
hint_text = '<p style="margin: 0.6rem 0 0; font-size: 0.82rem; color: #555;">Zur Durchf\u00fchrung der Lieferung werden Ihre Versandadressdaten an den beauftragten Paketdienst weitergegeben.</p>'

# Find the green versandkosten box
marker = 'background-color: #d4edda; border: 1px solid #c3e6cb'
pos = content.find(marker)
if pos != -1:
    # Find the closing </div> of this box
    close_div = content.find('</div>', pos)
    if close_div != -1:
        # Get indentation at that position
        line_start = content.rfind('\n', 0, close_div) + 1
        indent = ''
        for ch in content[line_start:close_div]:
            if ch == '\t':
                indent += '\t'
            else:
                break
        insert_text = '\n' + indent + hint_text
        content = content[:close_div] + insert_text + '\n' + indent + '</div>' + content[close_div + len('</div>'):]
        print('3. Hinweis eingefuegt')
    else:
        print('3. </div> NICHT GEFUNDEN')
else:
    print('3. Versandkosten-Box NICHT GEFUNDEN')

with open('src/routes/fixguenstig/+page.svelte', 'w', encoding='utf-8') as f:
    f.write(content)
print('Gespeichert.')
