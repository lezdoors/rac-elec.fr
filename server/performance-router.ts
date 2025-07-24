import { Request, Response, Router } from 'express';
import { performanceService } from './performance-service';
import { requireAuth, requireAdmin } from './auth';

const router = Router();

// Middleware pour les routes d'administration
const adminMiddleware = requireAdmin;

// Récupérer les métriques récentes
router.get('/recent', requireAuth, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const metrics = await performanceService.getRecentMetrics();
    res.json({ success: true, metrics });
  } catch (error) {
    console.error('Erreur lors de la récupération des métriques récentes:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Récupérer les statistiques globales
router.get('/stats', requireAuth, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const stats = await performanceService.getPerformanceStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Récupérer les informations sur la base de données
router.get('/database-info', requireAuth, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const dbInfo = await performanceService.getDatabaseInfo();
    res.json({ success: true, dbInfo });
  } catch (error) {
    console.error('Erreur lors de la récupération des informations de la base de données:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Activer/désactiver la collecte de métriques
router.post('/toggle', requireAuth, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { enabled } = req.body;
    const isEnabled = performanceService.toggleCollection(enabled);
    res.json({ 
      success: true, 
      enabled: isEnabled,
      message: `Collecte de métriques ${isEnabled ? 'activée' : 'désactivée'}`
    });
  } catch (error) {
    console.error('Erreur lors de la modification de la collecte de métriques:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Nettoyer les anciennes métriques
router.post('/cleanup', requireAuth, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const deletedCount = await performanceService.cleanupOldMetrics();
    res.json({ 
      success: true, 
      deletedCount,
      message: `${deletedCount} métriques anciennes ont été supprimées`
    });
  } catch (error) {
    console.error('Erreur lors du nettoyage des anciennes métriques:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

export const performanceRouter = router;
