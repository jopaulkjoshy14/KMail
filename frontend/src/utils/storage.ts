export class StorageUtils {
  private static readonly TOKEN_KEY = 'token';
  private static readonly USER_KEY = 'user';
  private static readonly THEME_KEY = 'theme';

  // Token management
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // User data management
  static getUser(): any {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  static setUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  // Theme management
  static getTheme(): string {
    return localStorage.getItem(this.THEME_KEY) || 'light';
  }

  static setTheme(theme: string): void {
    localStorage.setItem(this.THEME_KEY, theme);
  }

  // Clear all storage
  static clear(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    // Don't clear theme preference
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Store temporary data (session storage)
  static setSession(key: string, value: any): void {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  static getSession(key: string): any {
    const value = sessionStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  static removeSession(key: string): void {
    sessionStorage.removeItem(key);
  }

  // Encryption key storage (for future use)
  static setEncryptionKey(key: string): void {
    // In a real app, this would use more secure storage
    sessionStorage.setItem('encryption_key', key);
  }

  static getEncryptionKey(): string | null {
    return sessionStorage.getItem('encryption_key');
  }

  static removeEncryptionKey(): void {
    sessionStorage.removeItem('encryption_key');
  }
}
