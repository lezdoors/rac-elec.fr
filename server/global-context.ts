/**
 * GlobalContext - Utilitaire pour stocker le contexte global de la requête en cours
 * Permet de récupérer des informations sur l'utilisateur actuellement connecté
 * dans différentes parties de l'application, ainsi que des références globales comme WebSocket
 */

import { WebSocketServer } from 'ws';

type RequestingUser = {
  id: number;
  username: string;
  role: string;
  permissions?: any[];
};

class GlobalContextClass {
  private static instance: GlobalContextClass;
  private requestingUser: RequestingUser | null = null;
  public wss: WebSocketServer | null = null;

  private constructor() {
    // Constructeur privé pour Singleton
  }

  public static getInstance(): GlobalContextClass {
    if (!GlobalContextClass.instance) {
      GlobalContextClass.instance = new GlobalContextClass();
    }
    return GlobalContextClass.instance;
  }

  public setRequestingUser(user: RequestingUser): void {
    this.requestingUser = user;
  }

  public getRequestingUser(): RequestingUser | null {
    return this.requestingUser;
  }

  public clearRequestingUser(): void {
    this.requestingUser = null;
  }

  public setWebSocketServer(webSocketServer: WebSocketServer): void {
    this.wss = webSocketServer;
    console.log('WebSocketServer stored in GlobalContext');
  }
}

const GlobalContext = GlobalContextClass.getInstance();
export default GlobalContext;
