// import { eq } from 'drizzle-orm';
// import { db } from '../db';
// import { user, UserRole, userRole } from '../db/schema';

// export class UserRoleModel {

//     static async create(userData: { name: string; }) {

//         const roles: UserRole = {
//             name: userData.name
//         };

//         const result = await db.insert(userRole).values(roles).returning();
//         return result[0];
//     }

// }