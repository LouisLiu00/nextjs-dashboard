import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
// 凭据提供程序允许用户使用用户名和密码登录。https://authjs.dev/getting-started/authentication/credentials
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';

// 根据邮箱查询用户
async function getUser(email: string): Promise<User | undefined> {
    try {
      const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
      return user.rows[0];
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw new Error('Failed to fetch user.');
    }
}

export const { auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            // 使用authorize函数来处理身份验证逻辑。与服务器操作类似，您可以使用zod验证电子邮件和密码，然后再检查数据库中是否存在用户：
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);
                    if (parsedCredentials.success) {
                        const { email, password } = parsedCredentials.data;
                        const user = await getUser(email);
                        if (!user) return null;
                        // 调用bcrypt.compare检查密码是否匹配：
                        const passwordsMatch = await bcrypt.compare(password, user.password);
                        // 如果匹配，返回用户：
                        if (passwordsMatch) return user;
                    }
                    // 如果密码匹配则返回用户，否则返回null以阻止用户登录。
                    console.log('Invalid credentials');
                    return null;
                },
          }),
    ],
});