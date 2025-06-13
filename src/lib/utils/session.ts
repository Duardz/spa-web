// lib/utils/session.ts
export class SessionManager {
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private static lastActivity: number = Date.now();
  
  static updateActivity() {
    this.lastActivity = Date.now();
  }
  
  static checkSession(): boolean {
    const now = Date.now();
    if (now - this.lastActivity > this.SESSION_TIMEOUT) {
      // Session expired
      return false;
    }
    return true;
  }
  
  static startSessionMonitor(onExpire: () => void) {
    setInterval(() => {
      if (!this.checkSession()) {
        onExpire();
      }
    }, 60000); // Check every minute
  }
}