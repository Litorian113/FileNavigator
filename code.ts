figma.showUI(__html__, { width: 400, height: 600, themeColors: true });

// Hilfsfunktion: Einfache UUID generieren
function generateSID(): string {
  return 'sid-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
}

// Funktion, um UI mit Daten der aktuellen Auswahl zu füttern
function updateUI() {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.ui.postMessage({ type: 'selection-empty' });
    return;
  }

  const node = selection[0];

  // Prüfen, ob es ein Frame ist
  if (node.type !== 'FRAME') {
    figma.ui.postMessage({ type: 'wrong-type' });
    return;
  }

  // Daten aus dem Frame lesen (PluginData ist wie dein lokales JSON am Objekt)
  const storedAltText = node.getPluginData('altText');
  const storedSID = node.getPluginData('sid');

  figma.ui.postMessage({
    type: 'update-data',
    altText: storedAltText || '',
    sid: storedSID || 'Noch keine SID',
    nodeName: node.name
  });
}

// Event: Wenn der Nutzer in Figma etwas anderes auswählt
figma.on('selectionchange', () => {
  updateUI();
});

// Initialer Aufruf beim Start
updateUI();

figma.ui.onmessage = msg => {
  if (msg.type === 'save-alt-text') {
    const selection = figma.currentPage.selection;

    if (selection.length === 1 && selection[0].type === 'FRAME') {
      const node = selection[0];
      
      // 1. SID prüfen oder erstellen
      let sid = node.getPluginData('sid');
      if (!sid) {
        sid = generateSID();
        node.setPluginData('sid', sid);
      }

      // 2. Alt Text speichern
      node.setPluginData('altText', msg.altText);

      // Feedback an UI und Console
      console.log(`Gespeichert für Frame "${node.name}":`, { sid, altText: msg.altText });
      
      // UI aktualisieren, damit die neue SID angezeigt wird falls sie neu war
      updateUI();
      
      figma.notify("Alt-Text und SID gespeichert!");
    } else {
      figma.notify("Bitte genau einen Frame auswählen.");
    }
  }

  if (msg.type === 'search-frames') {
    const query = msg.query.toLowerCase();
    if (!query) {
      figma.notify("Bitte Suchbegriff eingeben.");
      return;
    }

    // Suche auf der aktuellen Seite nach Frames mit passendem Alt-Text
    const matches = figma.currentPage.findAll(node => {
      if (node.type !== 'FRAME') return false;
      const altText = node.getPluginData('altText');
      return !!(altText && altText.toLowerCase().includes(query));
    });

    if (matches.length > 0) {
      // Selektiere die gefundenen Frames
      figma.currentPage.selection = matches;
      // Zoome auf die Auswahl
      figma.viewport.scrollAndZoomIntoView(matches);
      figma.notify(`${matches.length} Frame(s) gefunden!`);
    } else {
      figma.notify("Keine Frames mit diesem Text gefunden.");
    }
  }

  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};
