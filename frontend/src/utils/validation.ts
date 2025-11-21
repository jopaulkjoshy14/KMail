import { CryptoUtils } from './crypto';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class ValidationUtils {
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    
    if (!email) {
      errors.push('Email is required');
    } else if (!CryptoUtils.isValidEmail(email)) {
      errors.push('Please enter a valid email address');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validatePassword(password: string, fieldName: string = 'Password'): ValidationResult {
    const errors: string[] = [];
    
    if (!password) {
      errors.push(`${fieldName} is required`);
    } else {
      const strengthCheck = CryptoUtils.isStrongPassword(password);
      errors.push(...strengthCheck.errors);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateName(name: string): ValidationResult {
    const errors: string[] = [];
    
    if (!name) {
      errors.push('Name is required');
    } else if (name.length < 2) {
      errors.push('Name must be at least 2 characters long');
    } else if (name.length > 50) {
      errors.push('Name must be less than 50 characters long');
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
      errors.push('Name can only contain letters and spaces');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateMessage(message: string): ValidationResult {
    const errors: string[] = [];
    
    if (!message) {
      errors.push('Message is required');
    } else if (message.length > 10000) {
      errors.push('Message must be less than 10,000 characters');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateSubject(subject: string): ValidationResult {
    const errors: string[] = [];
    
    if (subject.length > 200) {
      errors.push('Subject must be less than 200 characters');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateConfirmPassword(password: string, confirmPassword: string): ValidationResult {
    const errors: string[] = [];
    
    if (password !== confirmPassword) {
      errors.push('Passwords do not match');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateProfileUpdate(data: {
    name: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }): ValidationResult {
    const errors: string[] = [];
    
    // Validate name
    const nameValidation = this.validateName(data.name);
    if (!nameValidation.valid) {
      errors.push(...nameValidation.errors);
    }
    
    // Validate password change if provided
    if (data.newPassword) {
      if (!data.currentPassword) {
        errors.push('Current password is required to change password');
      }
      
      const passwordValidation = this.validatePassword(data.newPassword, 'New password');
      if (!passwordValidation.valid) {
        errors.push(...passwordValidation.errors);
      }
      
      if (data.newPassword !== data.confirmPassword) {
        errors.push('New passwords do not match');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
