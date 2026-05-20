declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        image?: string | null;
        emailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
      };
      session?: any;
      googleAccessToken?: string;
      spreadsheetId?: string;
    }
  }
}

export {};
