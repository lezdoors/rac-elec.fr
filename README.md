# rac-elec.FR

**rac-elec.FR** est une plateforme web professionnelle permettant aux particuliers, promoteurs immobiliers, lotisseurs, et entreprises en France de gérer facilement leurs demandes de **raccordement électrique Enedis**, qu’il s’agisse de raccordement provisoire, définitif, collectif ou d’augmentation de puissance.

---

## 🚀 Fonctionnalités clés

- 🧾 Formulaire utilisateur en plusieurs étapes (React)  
- 📞 Vérification des coordonnées (email, téléphone FR uniquement)  
- 🧠 Génération de référence unique + récapitulatif  
- 💳 Intégration Stripe pour paiement sécurisé  
- 📂 Back-office CRM pour traitement des demandes  
- 📬 Envoi d’emails automatiques via SMTP (Namecheap)  
- 🔍 Suivi des conversions via Google Ads & Analytics (GCLID inclus)  
- ⚙️ Préparation pour automatisation avec n8n

---

## 👥 Utilisateurs ciblés

- Particuliers souhaitant viabiliser un terrain ou faire raccorder leur logement
- Promoteurs immobiliers gérant des chantiers de construction
- Professionnels et artisans ayant besoin de raccordements provisoires
- Entreprises de rénovation ou d’aménagement foncier

---

## 🛠️ Stack technique

| Composant       | Tech utilisée                      |
|----------------|------------------------------------|
| Frontend       | React + TypeScript (Vite)          |
| Backend        | Node.js + Express                  |
| Base données   | JSON/CSV (option DB prévue)        |
| Envoi Email    | SMTP via Namecheap (port 587)      |
| Paiement       | Stripe                             |
| Hosting        | Replit (dev) / Vercel (prod)       |
| Automatisation | n8n (API, Email, Google Sheets)    |

---

## ⚙️ Variables d’environnement à configurer

```bash
# Stripe
STRIPE_SECRET=sk_live_xxx
STRIPE_PUBLIC=pk_live_xxx

# SMTP
SMTP_HOST=mail.raccordement-elec.fr
SMTP_PORT=587
SMTP_USER=Bonjour@raccordement-elec.fr
SMTP_PASS=motdepasse

# Divers
VITE_API_URL=/api