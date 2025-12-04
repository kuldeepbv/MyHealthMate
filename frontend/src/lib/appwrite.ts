import { Client, Account } from "appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

if (!endpoint || !projectId) {
  // This will show in the browser devtools console if config is wrong
  console.warn(
    "Appwrite config missing. Check NEXT_PUBLIC_APPWRITE_ENDPOINT and NEXT_PUBLIC_APPWRITE_PROJECT_ID in .env.local"
  );
}

const client = new Client();

client
  .setEndpoint(endpoint || "") // Appwrite API endpoint
  .setProject(projectId || ""); // Project ID

export const account = new Account(client);
