import { query } from '@/database';
import { IUser } from '@/types/database';

export const userRepository = {
  /**
   * Finds a user by Email OR Phone.
   * Explicitly selects columns to avoid over-fetching (No SELECT *).
   * @param identity - The email or phone number.
   */
  findByIdentity: async (identity: string): Promise<IUser | undefined> => {
    const sql = `
      SELECT 
        u.id, u.email, u.phone, u.password_hash, u.is_active, u.role_id,
        r.slug as role_slug 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.email = ? OR u.phone = ? 
      LIMIT 1
    `;
    const rows = await query<IUser[]>(sql, [identity, identity]);
    return rows[0];
  },
};