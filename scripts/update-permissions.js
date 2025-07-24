/**
 * Script pour mettre à jour les permissions des utilisateurs existants
 * Exécuter avec: node scripts/update-permissions.js
 */

import { db } from '../server/db.js';
import { users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

async function updateKevinPermissions() {
  try {
    console.log('Mise à jour des permissions de Kevin...');
    
    // Récupérer l'utilisateur Kevin
    const [kevin] = await db.select().from(users).where(eq(users.username, 'Kevin'));
    
    if (!kevin) {
      console.error('Utilisateur Kevin non trouvé dans la base de données');
      return;
    }
    
    console.log('Permissions actuelles de Kevin:', kevin.permissions);
    
    // Ajouter la permission notifications
    let updatedPermissions = Array.isArray(kevin.permissions) ? [...kevin.permissions] : [];
    
    // Vérifier si la permission notifications existe déjà
    const hasNotificationPermission = updatedPermissions.some(p => p.page === 'notifications');
    
    if (!hasNotificationPermission) {
      // Ajouter la permission notifications
      updatedPermissions.push({
        page: 'notifications',
        canView: true,
        canEdit: false
      });
      
      // Mettre à jour l'utilisateur
      await db.update(users)
        .set({ permissions: updatedPermissions })
        .where(eq(users.id, kevin.id));
      
      console.log('Permissions de Kevin mises à jour avec succès');
    } else {
      console.log('Kevin a déjà la permission pour les notifications');
    }
    
    // Vérifier la mise à jour
    const [updatedKevin] = await db.select().from(users).where(eq(users.id, kevin.id));
    console.log('Nouvelles permissions de Kevin:', updatedKevin.permissions);
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour des permissions de Kevin:', error);
  }
}

async function updateAllAgentsPermissions() {
  try {
    console.log('Mise à jour des permissions de tous les agents...');
    
    // Récupérer tous les agents
    const agents = await db.select().from(users).where(eq(users.role, 'agent'));
    
    console.log(`${agents.length} agents trouvés`);
    
    for (const agent of agents) {
      // Ajouter la permission notifications
      let updatedPermissions = Array.isArray(agent.permissions) ? [...agent.permissions] : [];
      
      // Vérifier si la permission notifications existe déjà
      const hasNotificationPermission = updatedPermissions.some(p => p.page === 'notifications');
      
      if (!hasNotificationPermission) {
        // Ajouter la permission notifications
        updatedPermissions.push({
          page: 'notifications',
          canView: true,
          canEdit: false
        });
        
        // Mettre à jour l'utilisateur
        await db.update(users)
          .set({ permissions: updatedPermissions })
          .where(eq(users.id, agent.id));
        
        console.log(`Permissions de l'agent ${agent.username} mises à jour avec succès`);
      } else {
        console.log(`L'agent ${agent.username} a déjà la permission pour les notifications`);
      }
    }
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour des permissions des agents:', error);
  }
}

async function main() {
  try {
    await updateKevinPermissions();
    await updateAllAgentsPermissions();
    console.log('Script terminé avec succès');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de l\'exécution du script:', error);
    process.exit(1);
  }
}

main();
