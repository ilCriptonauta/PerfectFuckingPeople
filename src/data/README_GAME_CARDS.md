# 🎮 Guida alla Personalizzazione Personaggi Hood Tycoon

Il file principale di configurazione di tutti i personaggi e delle relative abilità si trova in:
📍 **`src/data/game_cards.json`**

Tutte le modifiche effettuate a questo file si riflettono **istantaneamente** su tutta la piattaforma (Carte di Gioco, Selezione Boss, Abilità Speciali e Modali).

---

## 🛠️ Struttura di un Personaggio in `game_cards.json`

Ogni personaggio della collezione `PFP-717e46` è identificato dal suo ID NFT (es. `"PFP-717e46-07"` per *Hot Dog Boy*).

```json
"PFP-717e46-07": {
  "id": "PFP-717e46-07",
  "name": "P.F.P 4",
  "charName": "Hot Dog Boy",
  "season": "1",
  "role": "boss",
  "stats": {
    "boldness": 8,
    "charisma": 6,
    "blackmail": 8
  },
  "abilityName": "Street Feast",
  "abilityDescription": "Festa di Strada: Concede +4 punti influenza bonus a tutti i membri della Crew alleati.",
  "imageUrl": "https://media.multiversx.com/nfts/thumbnail/PFP-717e46-a5ba7598"
}
```

---

## 📊 Significato dei Campi da Personalizzare

| Campo | Descrizione | Valori Consigliati |
| :--- | :--- | :--- |
| **`charName`** | Nome esplicito del Personaggio (es. `Hot Dog Boy`, `Medusa`, `Lisa`) | Testo libero |
| **`role`** | Ruolo nel Gioco | `"boss"` (NFT OG Stagioni 1-5) oppure `"crew"` (Collectibles) |
| **`stats.boldness`** | Forza Bruta / Sfrontatezza (Usato nei territori *The Street*) | Da `1` a `10` |
| **`stats.charisma`** | Carisma / Fascino (Usato nei territori *The Club*) | Da `1` a `10` |
| **`stats.blackmail`** | Astuzia / Ricatto (Usato nei territori *The Vault* & *The Press*) | Da `1` a `10` |
| **`abilityName`** | Nome dell'Abilità Speciale | Es. `"Stone Statue"`, `"Fuga di Notizie"` |
| **`abilityDescription`** | Descrizione dettagliata dell'effetto del potere in gioco | Testo libero esplicativo |

---

## 🌟 Elenco dei 116 Personaggi Presenti nel File

Il file include tutti i **116 NFT della collezione**, tra cui:
- 👑 **Boss OG**: *Hot Dog Boy*, *Lisa*, *Piguet Robot*, *The Dreamer*, *The Bear*, *The Publisher*, *The Alien*, *Modern Pharaoh*, *Mona Lisa*, *FuckingZILLA*, ecc.
- 💼 **Crew Collectibles**: *Medusa*, *The Scarecrow*, *The Spartan*, *Bad Bunny*, *The Bread Boy*, *The Promoter*, *Telescopius*, ecc.
