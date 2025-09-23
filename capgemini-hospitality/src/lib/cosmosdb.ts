import { CosmosClient, Database, Container } from '@azure/cosmos';

class CosmosDBClient {
  private client: CosmosClient;
  private database: Database | null = null;
  private container: Container | null = null;

  constructor() {
    const endpoint = process.env.COSMOS_DB_ENDPOINT;
    const key = process.env.COSMOS_DB_KEY;

    if (!endpoint || !key) {
      throw new Error('Cosmos DB endpoint and key must be set in environment variables');
    }

    this.client = new CosmosClient({ endpoint, key });
  }

  async getDatabase(): Promise<Database> {
    if (!this.database) {
      const databaseName = process.env.COSMOS_DB_DATABASE_NAME || 'capgemini-hospitality';
      const { database } = await this.client.databases.createIfNotExists({
        id: databaseName
      });
      this.database = database;
    }
    return this.database;
  }

  async getContainer(): Promise<Container> {
    if (!this.container) {
      const database = await this.getDatabase();
      const containerName = process.env.COSMOS_DB_CONTAINER_NAME || 'users';
      const { container } = await database.containers.createIfNotExists({
        id: containerName,
        partitionKey: '/id'
      });
      this.container = container;
    }
    return this.container;
  }

  async createItem(item: any): Promise<any> {
    const container = await this.getContainer();
    const { resource } = await container.items.create(item);
    return resource;
  }

  async getItem(id: string): Promise<any> {
    const container = await this.getContainer();
    try {
      const { resource } = await container.item(id, id).read();
      return resource;
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      throw error;
    }
  }

  async getItems(query?: string): Promise<any[]> {
    const container = await this.getContainer();
    const querySpec = query ? { query } : { query: 'SELECT * FROM c' };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources;
  }

  async updateItem(id: string, item: any): Promise<any> {
    const container = await this.getContainer();
    const { resource } = await container.item(id, id).replace(item);
    return resource;
  }

  async deleteItem(id: string): Promise<void> {
    const container = await this.getContainer();
    await container.item(id, id).delete();
  }
}

// Export a singleton instance
export const cosmosDB = new CosmosDBClient();