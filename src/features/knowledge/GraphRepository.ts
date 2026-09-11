import { getDb } from '../../database/db';
import { Concept, Relationship, RelationshipType } from './models/Graph';
import { generateId } from '../../shared/utils/id';

export class GraphRepository {
  async addConcept(name: string, description?: string): Promise<Concept> {
    const db = await getDb();
    const id = generateId();
    const concept: Concept = { id, name, description };
    await db.runAsync(
      'INSERT OR IGNORE INTO concepts (id, name, description) VALUES (?, ?, ?)',
      [id, name, description || null]
    );
    return concept;
  }

  async addRelationship(sourceId: string, targetId: string, type: RelationshipType): Promise<Relationship> {
    const db = await getDb();
    const id = generateId();
    const rel: Relationship = { id, sourceId, targetId, type, strength: 1.0 };
    await db.runAsync(
      'INSERT INTO relationships (id, sourceId, targetId, type, strength, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [id, sourceId, targetId, type, 1.0, new Date().toISOString()]
    );
    return rel;
  }

  async getGraphData() {
    const db = await getDb();
    const nodes = await db.getAllAsync<any>('SELECT * FROM concepts');
    const links = await db.getAllAsync<any>('SELECT * FROM relationships');
    return { nodes, links };
  }
}

export const graphRepository = new GraphRepository();
