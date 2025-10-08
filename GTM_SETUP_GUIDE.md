# Guide de Configuration GTM - raccordement-connect.com

## ✅ Nettoyage Terminé

### Ce qui a été fait :
1. **Supprimé tous les scripts analytics directs** :
   - ❌ gtag.js GT-MJKTJGCK (supprimé)
   - ❌ Google Analytics GA4 direct (supprimé)
   - ❌ Fonctions gads_* (supprimées)
   
2. **Conservé UNIQUEMENT GTM** :
   - ✅ GTM-T2VZD5DL (seul conteneur analytics)
   - ✅ 3 événements dataLayer avec Enhanced Conversions
   - ✅ Email/phone transmis de manière sécurisée (sessionStorage)

3. **Fichiers nettoyés** :
   - `client/index.html` - Supprimé bloc gtag.js
   - `client/src/lib/analytics.ts` - Supprimé initGA(), trackPageView()
   - `client/src/lib/gclid-tracking.ts` - Supprimé gtag('config')
   - `client/src/components/analytics-tracker.tsx` - SUPPRIMÉ (inutilisé)

---

## 📋 Checklist GTM Workspace

### Étape 1 : Variables DataLayer à créer

Dans GTM > Variables > Variables définies par l'utilisateur > Nouvelle :

1. **Variable email**
   - Type : Variable de couche de données
   - Nom de la variable de couche de données : `email`
   - Nom : `DL - Email`

2. **Variable phone**
   - Type : Variable de couche de données
   - Nom de la variable de couche de données : `phone`
   - Nom : `DL - Phone`

3. **Variable transaction_id**
   - Type : Variable de couche de données
   - Nom de la variable de couche de données : `transaction_id`
   - Nom : `DL - Transaction ID`

4. **Variable value**
   - Type : Variable de couche de données
   - Nom de la variable de couche de données : `value`
   - Nom : `DL - Value`

5. **Variable currency**
   - Type : Variable de couche de données
   - Nom de la variable de couche de données : `currency`
   - Nom : `DL - Currency`

---

### Étape 2 : Déclencheurs (Triggers) à créer

1. **Trigger : Form Start**
   - Type : Événement personnalisé
   - Nom de l'événement : `form_start`
   - Nom : `CE - Form Start`

2. **Trigger : Form Submit**
   - Type : Événement personnalisé
   - Nom de l'événement : `form_submit`
   - Nom : `CE - Form Submit`

3. **Trigger : Purchase**
   - Type : Événement personnalisé
   - Nom de l'événement : `purchase`
   - Nom : `CE - Purchase`

---

### Étape 3 : Balises (Tags) Google Ads à configurer

#### Tag 1 : Ads – Form Start
- **Type de balise** : Suivi des conversions Google Ads
- **ID de conversion** : Votre ID de conversion Google Ads
- **Libellé de conversion** : Votre libellé pour form_start
- **Valeur de conversion** : Ne pas inclure
- **Déclenchement** : CE - Form Start

**Enhanced Conversions** :
- Activer "Enhanced Conversions"
- User data from variables :
  - `email` → {{DL - Email}}
  - `phone_number` → {{DL - Phone}}

#### Tag 2 : Ads – Form Submit
- **Type de balise** : Suivi des conversions Google Ads
- **ID de conversion** : Votre ID de conversion Google Ads
- **Libellé de conversion** : Votre libellé pour form_submit
- **Valeur de conversion** : Ne pas inclure
- **Déclenchement** : CE - Form Submit

**Enhanced Conversions** :
- Activer "Enhanced Conversions"
- User data from variables :
  - `email` → {{DL - Email}}
  - `phone_number` → {{DL - Phone}}

#### Tag 3 : Ads – Purchase
- **Type de balise** : Suivi des conversions Google Ads
- **ID de conversion** : Votre ID de conversion Google Ads
- **Libellé de conversion** : Votre libellé pour purchase
- **Valeur de conversion** : {{DL - Value}}
- **Code devise** : {{DL - Currency}}
- **ID de transaction** : {{DL - Transaction ID}}
- **Déclenchement** : CE - Purchase

**Enhanced Conversions** :
- Activer "Enhanced Conversions"
- User data from variables :
  - `email` → {{DL - Email}}
  - `phone_number` → {{DL - Phone}}

---

## 🧪 Plan de Test avec Tag Assistant

### Avant de tester :
1. Installer l'extension Chrome : [Google Tag Assistant](https://tagassistant.google.com/)
2. Ouvrir raccordement-connect.com
3. Activer Tag Assistant > Connect
4. Cliquer sur "Preview" dans GTM

### Test 1 : Form Start Event

**Actions** :
1. Ouvrir la homepage
2. Cliquer sur "Commencer ma demande" ou tout CTA qui mène au formulaire
3. **IMPORTANT** : Remplir au minimum les champs Email et Téléphone
4. L'événement `form_start` se déclenche automatiquement dès que email ET phone sont remplis (validation basique : email contient '@', phone ≥ 10 caractères)

**Vérifications dans Tag Assistant** :
- ✅ Event `form_start` apparaît dans le Summary (après avoir rempli email + phone)
- ✅ Tags qui se déclenchent : "Ads – Form Start"
- ✅ Paramètres dataLayer : 
  - `event`: "form_start"
  - `email`: "user@example.com" (email saisi dans le formulaire)
  - `phone`: "+33612345678" (téléphone saisi dans le formulaire)
- ✅ Enhanced Conversions : email et phone transmis au tag Ads

**Console navigateur** :
```
📊 GTM: form_start event pushed to dataLayer {event: 'form_start', email: 'user@example.com', phone: '+33612345678'}
```

**Note importante** : form_start **REQUIERT** maintenant email + phone pour les Enhanced Conversions. L'événement ne se déclenche QUE lorsque l'utilisateur a rempli ces deux champs critiques.

---

### Test 2 : Form Submit Event

**Actions** :
1. Remplir le formulaire avec :
   - Email : test@example.com
   - Phone : +33612345678
   - Tous les autres champs requis
2. Cliquer sur "Soumettre" puis "Confirmer et passer au paiement"

**Vérifications dans Tag Assistant** :
- ✅ Event `form_submit` apparaît dans le Summary
- ✅ Tags qui se déclenchent : "Ads – Form Submit"
- ✅ Paramètres dataLayer : 
  - `event`: "form_submit"
  - `email`: "test@example.com"
  - `phone`: "+33612345678"
- ✅ Enhanced Conversions : email et phone transmis au tag Ads

**Console navigateur** :
```
📊 GTM: form_submit event pushed to dataLayer {event: 'form_submit', email: 'test@example.com', phone: '+33612345678'}
```

---

### Test 3 : Purchase Event

**Actions** :
1. Compléter le paiement Stripe avec carte test : `4242 4242 4242 4242`
2. Date future quelconque, CVC quelconque
3. Vérifier la redirection vers /merci

**Vérifications dans Tag Assistant** :
- ✅ Event `purchase` apparaît dans le Summary
- ✅ Tags qui se déclenchent : "Ads – Purchase"
- ✅ Paramètres dataLayer : 
  - `event`: "purchase"
  - `transaction_id`: "REF-xxxxx"
  - `value`: 129.80
  - `currency`: "EUR"
  - `email`: "test@example.com" (récupéré depuis sessionStorage)
  - `phone`: "+33612345678" (récupéré depuis sessionStorage)
- ✅ Enhanced Conversions : email, phone transmis au tag Ads
- ✅ Valeur de conversion : 129.80 EUR

**Console navigateur** :
```
📊 GTM: purchase event pushed to dataLayer {event: 'purchase', transaction_id: 'REF-xxxxx', value: 129.80, currency: 'EUR', email: 'test@example.com', phone: '+33612345678'}
```

---

### Validation globale avec Tag Assistant

**Ce que vous DEVEZ voir** :
- ✅ **Conversion Linker** : Se déclenche sur toutes les pages
- ✅ **Google Tag (GT-MJKTJGCK)** : Chargé PAR GTM uniquement
- ✅ **GA4 (G-VJSY5MXCY7)** : Chargé PAR GTM uniquement
- ✅ **Tags Google Ads** : Form Start, Form Submit, Purchase

**Ce que vous NE DEVEZ PAS voir** :
- ❌ Erreurs de tags
- ❌ Doublons de gtag.js ou GA4
- ❌ Warnings "duplicate instances"

---

## 📝 Note pour l'Admin Google Ads

### Configuration Google Tag (GT-MJKTJGCK)

**Action requise dans Google Ads :**

1. Aller dans **Google Ads > Outils et paramètres > Gestion Google Tag**
2. Trouver votre Google Tag `GT-MJKTJGCK`
3. Cliquer sur "Gérer le Google Tag"

**Nettoyer les destinations** :
- Supprimer toutes les destinations SAUF :
  - ✅ GA4 `G-VJSY5MXCY7` (conserver)
  - ✅ Compte Google Ads (conserver si actif)
  
**Activer "Ignore duplicate instances"** :
- ✅ Cocher "Ignorer les instances en double de configuration sur la page"
- Cela évite les conflits si GTM charge plusieurs fois le tag

**Résultat attendu** :
- Google Tag GT-MJKTJGCK chargé UNE SEULE FOIS via GTM
- GA4 G-VJSY5MXCY7 chargé PAR le Google Tag
- Pas de scripts directs dans le code HTML

---

## 🔍 Vérification Finale en Production

### Console navigateur (F12) :

**Au chargement de la page** :
```javascript
// Vérifier que GTM est le seul script analytics
window.dataLayer
// Devrait retourner un array avec les événements GTM

window.gtag
// Devrait retourner undefined (pas de gtag direct)

// Vérifier les fonctions helper
typeof window.trackFormStart
// Devrait retourner "function"

typeof window.trackFormSubmit
// Devrait retourner "function"

typeof window.trackPurchase
// Devrait retourner "function"
```

**Tester manuellement un événement** :
```javascript
// Test form_start
window.trackFormStart('test@example.com', '+33612345678')

// Vérifier le dataLayer
window.dataLayer
// Le dernier élément doit contenir {event: 'form_start', email: 'test@example.com', phone: '+33612345678'}
```

---

## ⚠️ Points d'Attention

### Sécurité Enhanced Conversions
- ✅ Email/phone stockés dans **sessionStorage** (sécurisé)
- ✅ Email/phone **NON transmis dans l'URL**
- ✅ sessionStorage nettoyé après l'événement purchase
- ❌ Ne JAMAIS mettre email/phone dans les paramètres URL

### Flux de données
1. **Formulaire** → sessionStorage.setItem('ec_email', email)
2. **Form Submit** → dataLayer.push({email, phone})
3. **Redirection paiement** → sessionStorage conserve les données
4. **Page merci** → sessionStorage.getItem('ec_email')
5. **Purchase event** → dataLayer.push({email, phone})
6. **Cleanup** → sessionStorage.removeItem('ec_email')

### Conformité RGPD
- Enhanced Conversions compatible RGPD
- Email/phone transmis UNIQUEMENT à Google Ads
- Données non persistantes (sessionStorage)
- Pas de cookies tiers

---

## 📊 Résumé de l'Implémentation

| Élément | Avant | Après |
|---------|-------|-------|
| Scripts analytics | gtag.js + GTM | GTM uniquement |
| Google Tag | Direct HTML | Via GTM |
| GA4 | Direct HTML | Via GTM |
| Events | gtag() calls | dataLayer.push() |
| Enhanced Conversions | SHA-256 hash | Données brutes (GTM hash) |
| Email/phone transfer | URL params ❌ | sessionStorage ✅ |

---

## ✅ Prochaines Étapes

1. **Configurer GTM Workspace** (variables, triggers, tags)
2. **Tester avec Tag Assistant** (3 événements)
3. **Nettoyer Google Tag GT-MJKTJGCK** (admin Google Ads)
4. **Publier GTM** en production
5. **Monitorer les conversions** dans Google Ads (24-48h)

---

**Date de mise à jour** : 2025-10-08
**Version** : 1.0 - Migration GTM complète avec Enhanced Conversions
