import { Message } from './types';

class AIHandler {
  private context: string[] = [];
  private readonly MAX_CONTEXT = 10;

  private responses = [
    "I can assist you with various tasks including problem-solving, analysis, and content creation. What specific area would you like to explore?",
    "My capabilities include data analysis, code review, system optimization, and creative tasks. How can I help you today?",
    "I'm equipped to handle complex queries, technical challenges, and creative projects. What would you like to work on?",
    "I can help with programming, system design, data analysis, or any other technical challenges you're facing.",
    "As a decentralized AI, I can assist with various tasks while ensuring data privacy and security. What's on your mind?"
  ];

  private getRandomResponse(): string {
    return this.responses[Math.floor(Math.random() * this.responses.length)];
  }

  public async processMessage(message: string): Promise<string> {
    // Add message to context
    this.context.push(message);
    if (this.context.length > this.MAX_CONTEXT) {
      this.context.shift();
    }

    // For now, return a random response
    // In a real implementation, this would process the message and generate a contextual response
    return this.getRandomResponse();
  }

  public clearContext() {
    this.context = [];
  }
}

export const aiHandler = new AIHandler();