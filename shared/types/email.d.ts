// Déclarations de types pour les bibliothèques sans définition de types

declare module 'mailparser' {
  export function simpleParser(source: string | Buffer): Promise<{
    from?: { value: Array<{ name?: string; address: string }> };
    to?: { value: Array<{ name?: string; address: string }> };
    cc?: { value: Array<{ name?: string; address: string }> };
    subject?: string;
    text?: string;
    html?: string;
    date?: Date;
    attachments?: Array<{
      filename?: string;
      contentType?: string;
      size?: number;
      contentId?: string;
      content?: Buffer;
    }>;
    messageId?: string;
    inReplyTo?: string;
    references?: string[];
  }>;
}

declare module 'imap-simple' {
  export interface ImapSimple {
    openBox(boxName: string, readOnly?: boolean): Promise<any>;
    search(searchCriteria: any[], fetchOptions: any): Promise<any[]>;
    end(): void;
    getBoxes(): Promise<any>;
    moveMessage(uid: number, destination: string): Promise<void>;
    addFlags(uid: number, flags: string): Promise<void>;
    delFlags(uid: number, flags: string): Promise<void>;
  }

  export function connect(config: {
    imap: {
      user: string;
      password: string;
      host: string;
      port: number;
      tls: boolean;
      tlsOptions?: { rejectUnauthorized: boolean };
      authTimeout?: number;
    };
  }): Promise<ImapSimple>;
}

declare module 'node-imap' {
  export default class Imap {
    constructor(config: {
      user: string;
      password: string;
      host: string;
      port: number;
      tls: boolean;
      tlsOptions?: { rejectUnauthorized: boolean };
    });
  }
}
