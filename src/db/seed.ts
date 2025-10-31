import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { user, userRole } from './schema';
import { hashPassword } from '../utils/password.util';
import { UserModel } from '../models/user.model';
import { config } from '../config/env';
import * as schema from './schema';

const main = async () => {

    const client = new Pool({
        connectionString: config.database.url,
    });

    const db = drizzle(client, { schema });


    console.log('⏳ Seeding started...');

    const hashedPassword = await hashPassword("adminDg@6547");

    const user = await UserModel.create({
        name: "Admin",
        password: hashedPassword,
    });

    // db.insert(userRole).values({
    //     name:"admin",
    // })

    console.log('✅ Seeding finished!');

    await client.end();
};

main().catch((err) => {
    console.error('❌ Seed failed!');
    console.error(err);
    process.exit(1);
});
