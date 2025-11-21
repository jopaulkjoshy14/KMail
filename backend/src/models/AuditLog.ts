import { db } from '../config/database';

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: any;
  created_at: Date;
}

export interface AuditLogCreate {
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details?: any;
}

export class AuditLogModel {
  static async create(logData: AuditLogCreate): Promise<AuditLog> {
    const [log] = await db('audit_logs')
      .insert({
        ...logData,
        created_at: new Date(),
      })
      .returning('*');
    
    return log;
  }

  static async findByUserId(
    userId: string, 
    options: { page?: number; limit?: number } = {}
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 20));
    const offset = (page - 1) * limit;

    const logs = await db('audit_logs')
      .where({ user_id: userId })
      .select('*')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const totalResult = await db('audit_logs')
      .where({ user_id: userId })
      .count('* as count')
      .first();

    const total = parseInt(totalResult?.count as string) || 0;

    return { logs, total };
  }

  static async logSecurityEvent(
    userId: string, 
    action: string, 
    details?: any
  ): Promise<void> {
    await this.create({
      user_id: userId,
      action,
      resource_type: 'security',
      resource_id: userId,
      details,
    });
  }
}
