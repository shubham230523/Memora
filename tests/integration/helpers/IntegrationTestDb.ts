import { logger } from '../../../src/core/logging/Logger';

class IntegrationTestDb {
  public tables: Record<string, any[]> = {
    users: [],
    knowledge_items: [],
    tags: [],
    item_tags: [],
    concepts: [],
    relationships: [],
    chunks: [],
    conversations: [],
    messages: [],
    sync_queue: [],
    flashcards: [],
    quizzes: [],
  };

  public reset() {
    for (const key of Object.keys(this.tables)) {
      this.tables[key] = [];
    }
  }

  async openDatabaseAsync(name: string) {
    return this;
  }

  async execAsync(source: string): Promise<void> {
    // Schema creation or simple setup PRAGMA, do nothing since structure is pre-defined
    return;
  }

  async withTransactionAsync(callback: () => Promise<void>): Promise<void> {
    await callback();
  }

  async runAsync(source: string, params: any[] = []): Promise<{ lastInsertRowId: number; changes: number }> {
    const query = source.trim();

    // 1. INSERT OR IGNORE INTO / INSERT INTO
    if (query.toUpperCase().startsWith('INSERT')) {
      const match = query.match(/INSERT\s+(?:OR\s+\w+\s+)?INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
      if (match) {
        const tableName = match[1].toLowerCase();
        const columns = match[2].split(',').map(c => c.trim().replace(/['"`]/g, ''));

        // Handle INSERT OR IGNORE check for duplicates
        if (query.toUpperCase().includes('IGNORE')) {
          if (tableName === 'concepts') {
            const nameIdx = columns.indexOf('name');
            if (nameIdx !== -1 && this.tables[tableName].some(r => r.name === params[nameIdx])) {
              return { lastInsertRowId: 1, changes: 0 };
            }
          }
          if (tableName === 'tags') {
            const nameIdx = columns.indexOf('name');
            if (nameIdx !== -1 && this.tables[tableName].some(r => r.name === params[nameIdx])) {
              return { lastInsertRowId: 1, changes: 0 };
            }
          }
          if (tableName === 'item_tags') {
            const itemIdIdx = columns.indexOf('itemId');
            const tagIdIdx = columns.indexOf('tagId');
            if (this.tables[tableName].some(r => r.itemId === params[itemIdIdx] && r.tagId === params[tagIdIdx])) {
              return { lastInsertRowId: 1, changes: 0 };
            }
          }
        }

        const row: Record<string, any> = {};
        columns.forEach((col, idx) => {
          row[col] = params[idx];
        });

        if (!this.tables[tableName]) {
          this.tables[tableName] = [];
        }
        this.tables[tableName].push(row);
        return { lastInsertRowId: this.tables[tableName].length, changes: 1 };
      }
    }

    // 2. UPDATE table SET ... WHERE ...
    if (query.toUpperCase().startsWith('UPDATE')) {
      const updateMatch = query.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i);
      if (updateMatch) {
        const tableName = updateMatch[1].toLowerCase();
        const setClause = updateMatch[2];
        const whereClause = updateMatch[3] || '';

        // Extract assignments
        const assignments = setClause.split(',').map(a => a.trim().split('=')[0].trim());

        // Determine targets based on WHERE clause
        let targetRows = this.tables[tableName] || [];
        if (whereClause.toUpperCase().includes('ID = ?')) {
          const idVal = params[params.length - 1];
          targetRows = targetRows.filter(r => r.id === idVal);
        }

        targetRows.forEach(row => {
          if (query.includes('sync_queue SET status = ?, error = ?, retryCount = retryCount + 1')) {
            row['status'] = params[0];
            row['error'] = params[1];
            row['retryCount'] = typeof row['retryCount'] === 'number' ? row['retryCount'] + 1 : 1;
          } else if (query.includes('sync_queue SET status = ?, error = NULL')) {
            row['status'] = params[0];
            row['error'] = null;
          } else {
            assignments.forEach((col, idx) => {
              if (col !== 'updatedAt' || assignments.length === params.length) {
                row[col] = params[idx];
              } else {
                // updatedAt is appended separately sometimes
                row['updatedAt'] = params[assignments.length];
              }
            });
          }
          // Extra explicit handling for specific repo update structures
          if (query.includes('lastMessageAt = ?')) {
            row['lastMessageAt'] = params[0];
          }
          if (query.includes('nextReviewAt = ?')) {
            row['nextReviewAt'] = params[0];
            row['interval'] = params[1];
          }
        });

        return { lastInsertRowId: 0, changes: targetRows.length };
      }
    }

    // 3. DELETE FROM table WHERE ...
    if (query.toUpperCase().startsWith('DELETE')) {
      const deleteMatch = query.match(/DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?$/i);
      if (deleteMatch) {
        const tableName = deleteMatch[1].toLowerCase();
        const initialCount = this.tables[tableName]?.length || 0;
        if (params.length > 0) {
          const idVal = params[0];
          this.tables[tableName] = (this.tables[tableName] || []).filter(r => r.id !== idVal);
        } else {
          this.tables[tableName] = [];
        }
        return { lastInsertRowId: 0, changes: initialCount - (this.tables[tableName]?.length || 0) };
      }
    }

    return { lastInsertRowId: 0, changes: 0 };
  }

  async getFirstAsync<T>(source: string, params: any[] = []): Promise<T | null> {
    const results = await this.getAllAsync<T>(source, params);
    return results.length > 0 ? results[0] : null;
  }

  async getAllAsync<T>(source: string, params: any[] = []): Promise<T[]> {
    const query = source.trim();

    // Determine target table
    let tableName = 'knowledge_items';
    if (query.toUpperCase().includes('FROM MESSAGES')) tableName = 'messages';
    else if (query.toUpperCase().includes('FROM CONVERSATIONS')) tableName = 'conversations';
    else if (query.toUpperCase().includes('FROM CHUNKS')) tableName = 'chunks';
    else if (query.toUpperCase().includes('FROM CONCEPTS')) tableName = 'concepts';
    else if (query.toUpperCase().includes('FROM RELATIONSHIPS')) tableName = 'relationships';
    else if (query.toUpperCase().includes('FROM TAGS')) tableName = 'tags';
    else if (query.toUpperCase().includes('FROM ITEM_TAGS')) tableName = 'item_tags';
    else if (query.toUpperCase().includes('FROM FLASHCARDS')) tableName = 'flashcards';
    else if (query.toUpperCase().includes('FROM QUIZZES')) tableName = 'quizzes';
    else if (query.toUpperCase().includes('FROM SYNC_QUEUE')) tableName = 'sync_queue';

    let rows = [...(this.tables[tableName] || [])];

    // Handle JOIN query for item_tags/tags specifically
    if (query.toUpperCase().includes('JOIN ITEM_TAGS')) {
      const itemId = params[0];
      const links = this.tables['item_tags'] || [];
      const itemTagIds = links.filter(l => l.itemId === itemId).map(l => l.tagId);
      rows = (this.tables['tags'] || []).filter(t => itemTagIds.includes(t.id));
    }

    // Apply Filters
    if (tableName === 'knowledge_items') {
      if (query.includes('type = ?')) {
        const typeVal = params[0];
        rows = rows.filter(r => r.type === typeVal);
      }
      if (query.includes('isFavorite = ?')) {
        const favVal = params[params.length - 1];
        rows = rows.filter(r => r.isFavorite === (favVal === 1 || favVal === true));
      }
      if (query.includes('title LIKE ? OR content LIKE ?')) {
        // e.g. %search%
        const searchStr = String(params[params.length - 1]).replace(/%/g, '').toLowerCase();
        if (searchStr) {
          rows = rows.filter(r =>
            String(r.title || '').toLowerCase().includes(searchStr) ||
            String(r.content || '').toLowerCase().includes(searchStr)
          );
        }
      }
    } else if (tableName === 'messages') {
      if (query.includes('conversationId = ?')) {
        rows = rows.filter(r => r.conversationId === params[0]);
      }
    } else if (tableName === 'chunks') {
      if (query.includes('knowledgeItemId = ?')) {
        rows = rows.filter(r => r.knowledgeItemId === params[0]);
      }
    } else if (tableName === 'tags') {
      if (query.includes('name = ?')) {
        rows = rows.filter(r => r.name === params[0]);
      }
    } else if (tableName === 'flashcards') {
      if (query.includes('nextReviewAt IS NULL OR nextReviewAt <= ?')) {
        const nowStr = params[0];
        rows = rows.filter(r => !r.nextReviewAt || r.nextReviewAt <= nowStr);
      }
    } else if (tableName === 'sync_queue') {
      if (query.includes('status = ?')) {
        rows = rows.filter(r => r.status === params[0] || (r.status === params[1] && (r.retryCount || 0) < 3));
      }
    }

    // Apply Sorting
    if (query.toUpperCase().includes('ORDER BY UPDATEDAT DESC')) {
      rows.sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
    } else if (query.toUpperCase().includes('ORDER BY CREATEDAT DESC')) {
      rows.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    } else if (query.toUpperCase().includes('ORDER BY CREATEDAT ASC')) {
      rows.sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')));
    } else if (query.toUpperCase().includes('ORDER BY "INDEX" ASC')) {
      rows.sort((a, b) => Number(a.index || 0) - Number(b.index || 0));
    } else if (query.toUpperCase().includes('ORDER BY NAME ASC')) {
      rows.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
    }

    return rows as T[];
  }
}

export const integrationTestDb = new IntegrationTestDb();
