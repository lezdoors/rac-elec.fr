import{u as A,a as W,r as n,j as e,E as D,J as L,G as T,B as l,H as J,M as O,K,m as N,l as X,N as Y}from"./index-wpH2S-4F.js";import{C as Q,a as Z,b as ee,c as te,d as se,e as ae}from"./card-CXo0ZU1C.js";import{b as re}from"./analytics-D0bcXdPk.js";import{C}from"./circle-alert-iuWx85jf.js";import{H as M}from"./house-CUxiaxmq.js";import{C as ie}from"./circle-x-l2i4SrRf.js";import{C as ne}from"./circle-check-CHb7XIV4.js";import{L as oe}from"./lock-BJ-zqmML.js";import{C as ce}from"./credit-card-CmSC9pq4.js";function le({page:h,triggerEvent:u="load",variables:P={}}){return console.log("Google Snippets system disabled, ready for new implementation"),null}function we(){A();const{toast:h}=W(),[,u]=A(),[P,R]=n.useState(!1),p=new URLSearchParams(window.location.search),s=p.get("reference"),o=p.get("status"),g=p.get("payment_intent"),f=p.get("multiplier"),q=p.get("amount"),[x,c]=n.useState(o==="success"?"success":"unknown"),[t,V]=n.useState(null),[de,S]=n.useState(!0),[me,v]=n.useState(!0),[ue,F]=n.useState(null),[b,U]=n.useState(0),[j,_]=n.useState(null),E=f&&parseInt(f)>1,k=129.8,d=E?k*parseInt(f):q?parseFloat(q):k,z=d.toFixed(2).replace(".",","),[y,B]=n.useState(!1),w=(i,a=129.8,r)=>{if(y)return!1;const m=re(i,a,r);return m&&B(!0),m};if(n.useEffect(()=>{if(o==="success"&&s&&!y)if(c("success"),v(!1),t){console.log("✅ Paiement réussi - tag déclenché avec données utilisateur complètes");const i=(t.name||"").split(" "),a=i[0]||"",r=i.slice(1).join(" ")||"";w(s,d,{email:t.email,phone:t.phone,firstName:a,lastName:r,city:t.city,postalCode:t.postalCode,country:"FR"})}else console.log("✅ URL indique paiement réussi - tag déclenché (sans données utilisateur)"),w(s,d)},[o,s,d,t,y]),n.useEffect(()=>{if(o==="success"){console.log("ℹ️ Statut succès confirmé par URL, pas besoin de vérifier via API");return}if(!s)return;(async()=>{try{v(!0);const a=await N("GET",`/api/payment-status/${s}`);if(!a.ok)throw new Error("Impossible de vérifier le statut du paiement");const r=await a.json();console.log("Statut du paiement vérifié via API:",r),r.status==="paid"||r.status==="succeeded"?(c("success"),console.log("Paiement CONFIRMÉ comme réussi par l'API"),w(s,d)):r.status==="failed"||r.status==="canceled"?(c("failed"),console.log("Paiement CONFIRMÉ comme échoué par l'API"),r.errorDetails&&_(r.errorDetails)):r.status==="processing"?(c("processing"),b<10?setTimeout(()=>{U(m=>m+1)},2e3):c("unknown")):c("unknown")}catch(a){console.error("Erreur lors de la vérification du paiement:",a),c("unknown")}finally{v(!1)}})()},[s,b,o]),n.useEffect(()=>{if(!s)return;(async()=>{try{S(!0);const a=await N("GET",`/api/service-requests/${s}`);if(!a.ok)throw new Error(a.status===404?"Cette référence de demande n'existe pas":"Impossible de récupérer les détails de la demande");const r=await a.json();V(r.serviceRequest)}catch(a){F(a instanceof Error?a.message:"Une erreur est survenue"),h({title:"Erreur",description:a instanceof Error?a.message:"Une erreur est survenue lors du chargement des détails",variant:"destructive"})}finally{S(!1)}})()},[s,h]),n.useEffect(()=>{o==="success"&&s&&g&&(async()=>{try{await N("POST","/api/payment-confirmed",{referenceNumber:s,paymentIntentId:g}),console.log("Confirmation serveur envoyée pour le paiement réussi")}catch(a){console.error("Erreur lors de la confirmation au serveur:",a)}})()},[o,s,g]),!s)return e.jsx("div",{className:"min-h-screen bg-gray-50",children:e.jsxs("div",{className:"container max-w-4xl mx-auto py-10",children:[e.jsxs(D,{variant:"destructive",className:"mb-8",children:[e.jsx(C,{className:"h-4 w-4"}),e.jsx(L,{children:"Erreur"}),e.jsx(T,{children:"Numéro de référence manquant. Impossible de vérifier votre paiement."})]}),e.jsxs(l,{onClick:()=>u("/"),children:[e.jsx(M,{className:"mr-2 h-4 w-4"}),"Retour à l'accueil"]})]})});const I=i=>{switch(i){case"new_connection":return"Nouveau raccordement";case"power_upgrade":return"Augmentation de puissance";case"temporary_connection":return"Raccordement temporaire";case"meter_installation":return"Installation de compteur";default:return i}},G=()=>{switch(x){case"success":return e.jsxs("div",{className:"bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden max-w-2xl mx-auto mb-8 animate-in fade-in-50 duration-500",children:[e.jsxs("div",{className:"bg-gradient-to-r from-green-600 to-green-500 px-6 py-8 text-center",children:[e.jsx("div",{className:"inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-md mb-4",children:e.jsx(ne,{className:"h-10 w-10 text-green-600"})}),e.jsx("h2",{className:"text-2xl md:text-3xl font-bold text-white mb-2",children:"Paiement confirmé"}),e.jsx("p",{className:"text-green-100 text-sm md:text-base",children:"Votre transaction a été traitée avec succès"})]}),e.jsxs("div",{className:"p-6 md:p-8",children:[e.jsx("div",{className:"bg-gray-50 rounded-xl p-4 md:p-6 mb-6",children:e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-500 mb-1",children:"Montant payé"}),e.jsxs("p",{className:"text-2xl md:text-3xl font-bold text-gray-900",children:[z," €"]}),E&&e.jsxs("p",{className:"text-xs text-gray-500 mt-1",children:["Paiement multiple x",f]})]}),e.jsxs("div",{className:"text-left sm:text-right",children:[e.jsx("p",{className:"text-sm text-gray-500 mb-1",children:"Référence"}),e.jsx("p",{className:"text-base md:text-lg font-semibold text-gray-900 font-mono",children:s})]})]})}),e.jsxs("div",{className:"flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6",children:[e.jsx(O,{className:"h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-medium text-blue-900",children:"Confirmation par email"}),e.jsx("p",{className:"text-sm text-blue-700",children:"Un email récapitulatif vous sera envoyé dans les prochaines minutes."})]})]}),e.jsxs("div",{className:"grid grid-cols-3 gap-3 md:gap-4",children:[e.jsxs("div",{className:"flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg",children:[e.jsx(Y,{className:"h-5 w-5 md:h-6 md:w-6 text-green-600 mb-2"}),e.jsx("span",{className:"text-xs text-gray-600 leading-tight",children:"Transaction sécurisée"})]}),e.jsxs("div",{className:"flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg",children:[e.jsx(oe,{className:"h-5 w-5 md:h-6 md:w-6 text-green-600 mb-2"}),e.jsx("span",{className:"text-xs text-gray-600 leading-tight",children:"Données chiffrées"})]}),e.jsxs("div",{className:"flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg",children:[e.jsx(ce,{className:"h-5 w-5 md:h-6 md:w-6 text-green-600 mb-2"}),e.jsx("span",{className:"text-xs text-gray-600 leading-tight",children:"Paiement vérifié"})]})]})]})]});case"failed":return e.jsxs("div",{className:"bg-red-50 border border-red-100 rounded-xl p-8 text-center max-w-2xl mx-auto mb-8 animate-in shake-x-3 duration-200",children:[e.jsx(ie,{className:"h-16 w-16 text-red-600 mx-auto mb-6"}),e.jsx("h2",{className:"text-2xl font-bold text-red-800 mb-4",children:"Échec du paiement"}),e.jsx("p",{className:"text-lg text-red-700 mb-6",children:"Nous n'avons pas pu traiter votre paiement"}),j&&e.jsxs(D,{variant:"destructive",className:"mb-6 max-w-md mx-auto",children:[e.jsx(L,{children:"Erreur de paiement"}),e.jsx(T,{children:j.message||j.code})]}),e.jsxs("div",{className:"bg-amber-50 border border-amber-100 rounded-md p-4 max-w-md mx-auto mb-6 text-left",children:[e.jsxs("h3",{className:"font-medium text-amber-800 mb-2 flex items-center",children:[e.jsx(C,{className:"h-4 w-4 mr-2"}),"Problème avec votre carte bancaire"]}),e.jsxs("ul",{className:"text-sm text-amber-700 space-y-2 list-disc pl-5",children:[e.jsx("li",{children:"Vérifiez que le numéro de carte est correct"}),e.jsx("li",{children:"Assurez-vous que la date d'expiration est valide"}),e.jsx("li",{children:"Confirmez que vous avez bien saisi le code CVV au dos de votre carte"}),e.jsx("li",{children:"Contactez votre banque pour vérifier si la transaction a été bloquée"})]})]}),e.jsx(l,{onClick:()=>u(`/paiement/${s}`),className:"bg-blue-600 hover:bg-blue-700",children:"Réessayer le paiement"})]});case"processing":return e.jsxs("div",{className:"bg-blue-50 border border-blue-100 rounded-xl p-8 text-center max-w-2xl mx-auto mb-8",children:[e.jsx("div",{className:"flex items-center justify-center mb-6",children:e.jsx(X,{className:"h-12 w-12 text-blue-600 animate-spin"})}),e.jsx("h2",{className:"text-2xl font-bold text-blue-800 mb-4",children:"Traitement en cours"}),e.jsx("p",{className:"text-lg text-blue-700 mb-6",children:"Veuillez patienter pendant que nous vérifions le statut de votre paiement. Cela peut prendre quelques instants..."}),e.jsxs("p",{className:"text-sm text-blue-600",children:["Référence : ",s]}),e.jsx("div",{className:"w-full max-w-md mx-auto mt-6 bg-blue-100 rounded overflow-hidden",children:e.jsx("div",{className:"h-2 bg-blue-500 animate-pulse",style:{width:`${Math.min(b*10,90)}%`}})}),e.jsx("p",{className:"text-xs text-blue-500 mt-2",children:"Vérification en cours"})]});default:return e.jsxs("div",{className:"bg-gray-50 border border-gray-200 rounded-xl p-8 text-center max-w-2xl mx-auto mb-8",children:[e.jsx(C,{className:"h-16 w-16 text-gray-500 mx-auto mb-6"}),e.jsx("h2",{className:"text-2xl font-bold text-gray-700 mb-4",children:"Statut du paiement indéterminé"}),e.jsx("p",{className:"text-lg text-gray-600 mb-6",children:"Nous n'avons pas pu déterminer avec certitude le statut de votre paiement."}),e.jsxs("div",{className:"space-y-4 mb-6",children:[e.jsx("p",{className:"text-sm text-gray-500",children:"Si vous avez effectué un paiement, il est possible qu'il soit toujours en cours de traitement. Voici ce que vous pouvez faire :"}),e.jsx("div",{className:"bg-gray-100 p-4 rounded text-left max-w-md mx-auto",children:e.jsxs("ul",{className:"text-sm space-y-2 list-disc pl-5",children:[e.jsx("li",{children:"Vérifiez votre boîte mail pour un reçu de paiement"}),e.jsx("li",{children:"Attendez quelques minutes et rafraîchissez cette page"}),e.jsx("li",{children:"Vérifiez que votre carte bancaire a été débitée"}),e.jsx("li",{children:"Si nécessaire, essayez de procéder à un nouveau paiement"})]})})]}),e.jsxs("div",{className:"flex flex-col sm:flex-row gap-4 justify-center",children:[e.jsx(l,{onClick:()=>u(`/paiement/${s}`),children:"Réessayer le paiement"}),e.jsx(l,{onClick:()=>window.location.reload(),variant:"outline",children:"Rafraîchir la page"})]})]})}},H=()=>{var $;if(!t)return;const i=window.open("","_blank");if(!i)return;const a=(($=t.name)==null?void 0:$.split(" "))||[],r=t.firstName||a[0]||"",m=t.lastName||a.slice(1).join(" ")||"";i.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Récapitulatif de paiement - ${s}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1f2937; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #10b981; }
          .success-badge { display: inline-flex; align-items: center; gap: 8px; background: #ecfdf5; color: #059669; padding: 8px 16px; border-radius: 20px; font-weight: 600; margin-bottom: 16px; }
          .success-badge svg { width: 20px; height: 20px; }
          h1 { font-size: 24px; color: #111827; margin-bottom: 8px; }
          .reference { font-size: 14px; color: #6b7280; }
          .amount-box { background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 32px; text-align: center; }
          .amount-label { font-size: 14px; color: #6b7280; margin-bottom: 4px; }
          .amount { font-size: 32px; font-weight: 700; color: #111827; }
          .section { margin-bottom: 24px; }
          .section-title { font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .info-item { }
          .info-label { font-size: 12px; color: #9ca3af; margin-bottom: 2px; }
          .info-value { font-size: 14px; color: #111827; font-weight: 500; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #9ca3af; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-badge">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              Paiement réussi
            </div>
            <h1>Récapitulatif de votre demande</h1>
            <p class="reference">Référence : ${s}</p>
          </div>
          
          <div class="amount-box">
            <p class="amount-label">Montant payé</p>
            <p class="amount">${z} €</p>
          </div>
          
          <div class="section">
            <h2 class="section-title">Informations personnelles</h2>
            <div class="info-grid">
              <div class="info-item">
                <p class="info-label">Nom</p>
                <p class="info-value">${m||"-"}</p>
              </div>
              <div class="info-item">
                <p class="info-label">Prénom</p>
                <p class="info-value">${r||"-"}</p>
              </div>
              <div class="info-item">
                <p class="info-label">Email</p>
                <p class="info-value">${t.email||"-"}</p>
              </div>
              <div class="info-item">
                <p class="info-label">Téléphone</p>
                <p class="info-value">${t.phone||"-"}</p>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">Détails de la demande</h2>
            <div class="info-grid">
              <div class="info-item">
                <p class="info-label">Type</p>
                <p class="info-value">${I(t.requestType)}</p>
              </div>
              <div class="info-item">
                <p class="info-label">Puissance</p>
                <p class="info-value">${t.powerRequired||"-"} kVA</p>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">Adresse du projet</h2>
            <div class="info-item">
              <p class="info-value">${t.address||"-"}</p>
              <p class="info-value">${t.postalCode||""} ${t.city||""}</p>
            </div>
          </div>
          
          <div class="footer">
            <p>Date : ${new Date().toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}</p>
          </div>
        </div>
        <script>window.onload = function() { window.print(); }<\/script>
      </body>
      </html>
    `),i.document.close()};return e.jsxs("div",{className:"min-h-screen bg-gray-50",children:[e.jsxs(J,{children:[e.jsx("title",{children:"Confirmation de Paiement | Raccordement Électrique Enedis"}),e.jsx("meta",{name:"description",content:"Confirmation de votre paiement pour votre demande de raccordement électrique Enedis. Suivez le statut de votre demande et recevez des mises à jour en temps réel."}),e.jsx("meta",{name:"keywords",content:"confirmation paiement, raccordement enedis, suivi demande, branchement électrique, raccordement électrique, paiement raccordement"}),e.jsx("link",{rel:"canonical",href:"https://www.demande-raccordement.fr/paiement-confirmation"}),e.jsx("meta",{property:"og:title",content:"Confirmation de Paiement | Raccordement Électrique Enedis"}),e.jsx("meta",{property:"og:description",content:"Confirmation du traitement de votre demande de raccordement électrique et de votre paiement. Suivez l'avancement de votre dossier en temps réel."}),e.jsx("meta",{property:"og:type",content:"website"}),e.jsx("meta",{property:"og:url",content:"https://www.demande-raccordement.fr/paiement-confirmation"}),e.jsx("script",{type:"application/ld+json",children:`
            {
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Confirmation de Paiement pour Raccordement Électrique",
              "description": "Page de confirmation de paiement pour une demande de raccordement électrique Enedis",
              "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Accueil",
                    "item": "https://www.demande-raccordement.fr/"
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Raccordement Électrique",
                    "item": "https://www.demande-raccordement.fr/raccordement-enedis"
                  },
                  {
                    "@type": "ListItem",
                    "position": 3,
                    "name": "Confirmation de Paiement",
                    "item": "https://www.demande-raccordement.fr/paiement-confirmation"
                  }
                ]
              },
              "mainEntity": {
                "@type": "Order",
                "orderStatus": "${x==="success"?"https://schema.org/OrderDelivered":"https://schema.org/OrderProcessing"}",
                "acceptedOffer": {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Service de Raccordement Électrique Enedis",
                    "description": "Traitement de demande de raccordement électrique auprès d'Enedis",
                    "provider": {
                      "@type": "Organization",
                      "name": "RaccordementElec",
                      "url": "https://demande-raccordement.fr"
                    }
                  },
                  "price": "${d}",
                  "priceCurrency": "EUR"
                },
                "paymentMethodId": "CreditCard",
                "confirmationNumber": "${s||""}"
              }
            }
          `})]}),x==="success"&&s&&e.jsx(le,{page:"/paiement-confirmation",triggerEvent:"load",variables:{reference:s}}),e.jsxs("div",{className:"container max-w-5xl mx-auto py-10",children:[G(),x==="success"&&t&&e.jsxs(Q,{className:"mt-8 mb-8 max-w-2xl mx-auto",children:[e.jsxs(Z,{children:[e.jsx(ee,{children:"Récapitulatif de votre demande"}),e.jsxs(te,{children:["Référence: ",s]})]}),e.jsx(se,{children:e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"font-medium mb-2",children:"Informations personnelles"}),e.jsxs("div",{className:"space-y-1 text-sm",children:[e.jsx("p",{children:t.firstName&&t.lastName?`${t.firstName} ${t.lastName}`:t.name}),e.jsx("p",{children:t.email}),e.jsx("p",{children:t.phone})]})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-medium mb-2",children:"Détails de la demande"}),e.jsxs("div",{className:"space-y-1 text-sm",children:[e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Type:"})," ",I(t.requestType)]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Puissance:"})," ",t.powerRequired," kVA"]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Adresse:"})," ",t.address,", ",t.postalCode," ",t.city]})]})]})]})}),e.jsxs(ae,{className:"flex flex-col sm:flex-row justify-between gap-2",children:[e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Date de création: ",new Date(t.createdAt).toLocaleDateString("fr-FR")]}),e.jsx(l,{variant:"outline",size:"sm",onClick:H,children:"Imprimer le récapitulatif"})]})]}),x==="success"&&e.jsxs("div",{className:"flex flex-col sm:flex-row justify-center gap-3 max-w-2xl mx-auto mt-6",children:[e.jsxs(l,{onClick:()=>u("/"),className:"w-full sm:w-auto",children:[e.jsx(M,{className:"mr-2 h-4 w-4"}),"Retour à l'accueil"]}),e.jsxs(l,{variant:"outline",onClick:()=>R(!0),className:"w-full sm:w-auto",children:[e.jsx(O,{className:"mr-2 h-4 w-4"}),"Nous contacter"]})]})]}),e.jsx(K,{defaultOpen:P,onOpenChange:R,source:"payment_confirmation"})]})}export{we as default};
