import { eq } from 'drizzle-orm';
import { db } from '../db';
import { user, userRole, NewUser } from '../db/schema';

export class UserModel {

  static async findByName(name: string) {
    const result = await db
      .select({
        id: user.id,
        name: user.name,
        photo: user.photo,
        password: user.password,
        roleId: user.roleId,
        roleName: userRole.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .leftJoin(userRole, eq(user.roleId, userRole.id))
      .where(eq(user.name, name))
      .limit(1);

    return result[0] || null;
  }

  static async findById(id: number) {
    const result = await db
      .select({
        id: user.id,
        name: user.name,
        photo: user.photo,
        password: user.password,
        roleId: user.roleId,
        roleName: userRole.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .leftJoin(userRole, eq(user.roleId, userRole.id))
      .where(eq(user.id, id))
      .limit(1);

    return result[0] || null;
  }

  static async create(userData: { name: string; password: string; photo?: string | null }) {
    // Get viewer role ID
    const viewerRole = await db
      .select({ id: userRole.id })
      .from(userRole)
      .where(eq(userRole.name, 'viewer'))
      .limit(1);

    const roleId = viewerRole[0]?.id || null;

    const newUser: NewUser = {
      name: userData.name,
      password: userData.password,
      photo: userData.photo || null,
      roleId,
    };

    const result = await db.insert(user).values(newUser).returning();
    return result[0];
  }

  static async update(
    id: number,
    userData: Partial<{ name: string; password: string; photo: string; roleId: number }>
  ) {
    const updateData: any = {};

    if (userData.name !== undefined) updateData.name = userData.name;
    if (userData.password !== undefined) updateData.password = userData.password;
    if (userData.photo !== undefined) updateData.photo = userData.photo;
    if (userData.roleId !== undefined) updateData.roleId = userData.roleId;

    if (Object.keys(updateData).length === 0) {
      throw new Error('No fields to update');
    }

    updateData.updatedAt = new Date();

    const result = await db
      .update(user)
      .set(updateData)
      .where(eq(user.id, id))
      .returning();

    return result[0];
  }

  static async delete(id: number) {
    const result = await db
      .delete(user)
      .where(eq(user.id, id))
      .returning({ id: user.id });

    return result[0];
  }

  static async findAll() {
    const result = await db
      .select({
        id: user.id,
        name: user.name,
        photo: user.photo,
        roleId: user.roleId,
        roleName: userRole.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .leftJoin(userRole, eq(user.roleId, userRole.id))
      .orderBy(user.createdAt);

    return result;
  }
}
