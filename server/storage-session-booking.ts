/**
 * Session Booking Storage Extension - PKL-278651-SESSION-BOOKING
 * Storage methods for session booking functionality
 */

interface SessionBookingMethods {
  sessionRequests: any[];
  coachingSessions: any[];

  createSessionRequest(data: any): Promise<any>;
  getSessionRequest(requestId: number): Promise<any | undefined>;
  updateSessionRequest(requestId: number, updates: any): Promise<any | undefined>;
  getSessionRequestsByCoach(coachId: number, status?: string): Promise<any[]>;
  getSessionRequestsByStudent(studentId: number, status?: string): Promise<any[]>;
  createCoachingSession(data: any): Promise<any>;
  getCoachingSession(sessionId: number): Promise<any | undefined>;
  updateCoachingSession(sessionId: number, updates: any): Promise<any | undefined>;
  getUpcomingSessions(userId: number): Promise<any[]>;
}

export const sessionBookingMethods: SessionBookingMethods = {
  sessionRequests: [],
  coachingSessions: [],

  async createSessionRequest(data: any): Promise<any> {
    const sessionRequest = {
      id: Math.floor(Math.random() * 1000000),
      ...data,
      coachResponse: null,
      proposedPrice: null,
      respondedAt: null
    };
    
    this.sessionRequests.push(sessionRequest);
    console.log(`[Storage] Created session request ${sessionRequest.id}`);
    return sessionRequest;
  },

  async getSessionRequest(requestId: number): Promise<any | undefined> {
    return this.sessionRequests.find(req => req.id === requestId);
  },

  async updateSessionRequest(requestId: number, updates: any): Promise<any | undefined> {
    const index = this.sessionRequests.findIndex(req => req.id === requestId);
    if (index === -1) return undefined;
    
    this.sessionRequests[index] = { ...this.sessionRequests[index], ...updates };
    console.log(`[Storage] Updated session request ${requestId}`);
    return this.sessionRequests[index];
  },

  async getSessionRequestsByCoach(coachId: number, status?: string): Promise<any[]> {
    let requests = this.sessionRequests.filter(req => req.coachId === coachId);
    if (status) {
      requests = requests.filter(req => req.status === status);
    }
    return requests;
  },

  async getSessionRequestsByStudent(studentId: number, status?: string): Promise<any[]> {
    let requests = this.sessionRequests.filter(req => req.studentId === studentId);
    if (status) {
      requests = requests.filter(req => req.status === status);
    }
    return requests;
  },

  async createCoachingSession(data: any): Promise<any> {
    const session = {
      id: Math.floor(Math.random() * 1000000),
      ...data,
      sessionNotes: '',
      feedbackForStudent: '',
      studentGoals: [],
      sessionSummary: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.coachingSessions.push(session);
    console.log(`[Storage] Created coaching session ${session.id}`);
    return session;
  },

  async getCoachingSession(sessionId: number): Promise<any | undefined> {
    return this.coachingSessions.find(session => session.id === sessionId);
  },

  async updateCoachingSession(sessionId: number, updates: any): Promise<any | undefined> {
    const index = this.coachingSessions.findIndex(session => session.id === sessionId);
    if (index === -1) return undefined;
    
    this.coachingSessions[index] = { 
      ...this.coachingSessions[index], 
      ...updates,
      updatedAt: new Date()
    };
    
    console.log(`[Storage] Updated coaching session ${sessionId}`);
    return this.coachingSessions[index];
  },

  async getUpcomingSessions(userId: number): Promise<any[]> {
    const now = new Date();
    return this.coachingSessions.filter(session => 
      (session.coachId === userId || session.studentId === userId) &&
      session.scheduledAt > now &&
      session.sessionStatus !== 'cancelled' &&
      session.sessionStatus !== 'completed'
    );
  }
};