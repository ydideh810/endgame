import Dexie, { Table } from 'dexie';
import { Prompt, LicenseRecord } from './types';

class NidamDatabase extends Dexie {
  prompts!: Table<Prompt>;
  licenses!: Table<LicenseRecord>;

  constructor() {
    super('NidamDB');
    
    this.version(1).stores({
      prompts: '++id, category, userId, createdAt, title',
      licenses: '++id, licenseKey, productId, timestamp'
    });

    // Add initial prompts
    this.on('populate', () => {
      this.prompts.bulkAdd([
        // Creative Writing Prompts
        {
          id: 'c1',
          title: 'Cyberpunk Story Generator',
          content: 'Write a short story set in a cyberpunk world where AI and humans coexist. Include themes of technology dependence and moral ambiguity.',
          category: 'creative',
          tags: ['writing', 'cyberpunk', 'sci-fi'],
          userId: 'system',
          createdAt: Date.now(),
          upvotes: 5
        },
        {
          id: 'c2',
          title: 'Character Development',
          content: 'Create a complex character profile including backstory, motivations, and internal conflicts.',
          category: 'creative',
          tags: ['writing', 'character', 'storytelling'],
          userId: 'system',
          createdAt: Date.now(),
          upvotes: 3
        },

        // Technical Prompts
        {
          id: 't1',
          title: 'Code Review Assistant',
          content: 'Review this code for potential security vulnerabilities, performance issues, and suggest improvements following best practices.',
          category: 'technical',
          tags: ['coding', 'security', 'review'],
          userId: 'system',
          createdAt: Date.now(),
          upvotes: 7
        },
        {
          id: 't2',
          title: 'System Architecture Design',
          content: 'Design a scalable microservices architecture for a real-time data processing system. Include considerations for security, performance, and maintainability.',
          category: 'technical',
          tags: ['architecture', 'design', 'microservices'],
          userId: 'system',
          createdAt: Date.now(),
          upvotes: 4
        },

        // Brainstorming Prompts
        {
          id: 'b1',
          title: 'Startup Idea Generator',
          content: 'Generate innovative startup ideas combining AI and sustainable technology. Include market analysis and potential challenges.',
          category: 'brainstorming',
          tags: ['business', 'innovation', 'ai'],
          userId: 'system',
          createdAt: Date.now(),
          upvotes: 6
        },
        {
          id: 'b2',
          title: 'Problem-Solution Mapping',
          content: 'Analyze a complex problem and generate multiple solution approaches, considering pros and cons of each.',
          category: 'brainstorming',
          tags: ['problem-solving', 'analysis', 'strategy'],
          userId: 'system',
          createdAt: Date.now(),
          upvotes: 4
        },

        // Roleplay Prompts
        {
          id: 'r1',
          title: 'AI Ethics Debate',
          content: 'Engage in a philosophical debate about AI consciousness and rights from different perspectives: AI researcher, ethicist, and AI entity.',
          category: 'roleplay',
          tags: ['ethics', 'debate', 'ai'],
          userId: 'system',
          createdAt: Date.now(),
          upvotes: 8
        },
        {
          id: 'r2',
          title: 'Tech Support Scenario',
          content: 'Simulate a technical support interaction to debug and resolve a complex system issue, maintaining professionalism and clarity.',
          category: 'roleplay',
          tags: ['support', 'troubleshooting', 'communication'],
          userId: 'system',
          createdAt: Date.now(),
          upvotes: 5
        }
      ]);
    });
  }

  async isLicenseUsed(licenseKey: string): Promise<boolean> {
    const record = await this.licenses.where('licenseKey').equals(licenseKey).first();
    return !!record;
  }

  async saveLicense(record: Omit<LicenseRecord, 'id'>): Promise<void> {
    await this.licenses.add(record);
  }

  async getLicenseHistory(): Promise<LicenseRecord[]> {
    return await this.licenses.orderBy('timestamp').reverse().toArray();
  }

  async addPrompt(prompt: Omit<Prompt, 'id'>): Promise<string> {
    const id = await this.prompts.add(prompt as any);
    return id.toString();
  }

  async getPrompts(category?: string): Promise<Prompt[]> {
    if (category && category !== 'all') {
      return await this.prompts
        .where('category')
        .equals(category)
        .reverse()
        .sortBy('createdAt');
    }
    return await this.prompts.orderBy('createdAt').reverse().toArray();
  }

  async upvotePrompt(promptId: string): Promise<void> {
    const prompt = await this.prompts.get(promptId);
    if (prompt) {
      await this.prompts.update(promptId, {
        upvotes: (prompt.upvotes || 0) + 1
      });
    }
  }

  async searchPrompts(query: string): Promise<Prompt[]> {
    return await this.prompts
      .filter(prompt => 
        prompt.title.toLowerCase().includes(query.toLowerCase()) ||
        prompt.content.toLowerCase().includes(query.toLowerCase()) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )
      .toArray();
  }
}

// Delete existing database to force repopulation
if (typeof window !== 'undefined') {
  indexedDB.deleteDatabase('NidamDB');
}

export const db = new NidamDatabase();