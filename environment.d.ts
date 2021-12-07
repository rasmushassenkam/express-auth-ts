declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGO_URI: string;
      REDIS_TLS_URL: string;
      SESSION_SECRET: string;
      NODE_ENV: "development" | "production" | "staging";
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
