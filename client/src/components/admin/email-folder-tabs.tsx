import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Inbox,
  Send,
  AlertTriangle,
  Trash2,
  Folder
} from "lucide-react";
import { INBOX_FOLDER, SENT_FOLDER, SPAM_FOLDER, TRASH_FOLDER } from "@/lib/constants";
import { useEmailUnreadCount } from "@/hooks/use-email-unread-count";
import { Badge } from "@/components/ui/badge";

interface EmailFolderTabsProps {
  currentFolder: string;
  onFolderChange: (folder: string) => void;
  userId?: number;
}

/**
 * Composant affichant les onglets de navigation entre les dossiers d'emails
 */
export function EmailFolderTabs({
  currentFolder,
  onFolderChange,
  userId = 1
}: EmailFolderTabsProps) {
  const inboxEmailCount = useEmailUnreadCount(userId, INBOX_FOLDER);
  const spamEmailCount = useEmailUnreadCount(userId, SPAM_FOLDER);
  
  return (
    <Tabs
      defaultValue={currentFolder}
      value={currentFolder}
      onValueChange={onFolderChange}
      className="w-full"
    >
      <TabsList className="grid grid-cols-4 mb-4">
        <TabsTrigger value={INBOX_FOLDER} className="flex items-center justify-center">
          <Inbox className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Boîte de réception</span>
          <span className="inline sm:hidden">Réception</span>
          {inboxEmailCount.unreadCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {inboxEmailCount.unreadCount}
            </Badge>
          )}
        </TabsTrigger>
        
        <TabsTrigger value={SENT_FOLDER} className="flex items-center justify-center">
          <Send className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Messages envoyés</span>
          <span className="inline sm:hidden">Envoyés</span>
        </TabsTrigger>
        
        <TabsTrigger value={SPAM_FOLDER} className="flex items-center justify-center">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <span>Spam</span>
          {spamEmailCount.unreadCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {spamEmailCount.unreadCount}
            </Badge>
          )}
        </TabsTrigger>
        
        <TabsTrigger value={TRASH_FOLDER} className="flex items-center justify-center">
          <Trash2 className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Corbeille</span>
          <span className="inline sm:hidden">Corbeille</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
