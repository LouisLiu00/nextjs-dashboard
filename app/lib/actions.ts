'use server';

// 使用静态类型推断进行 TypeScript 优先模式验证 https://zod.dev/
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.',
    }),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// 错误状态类型定义
export type State = {
    errors?: {
      customerId?: string[];
      amount?: string[];
      status?: string[];
    };
    message?: string | null;
};

// 创建发票
export async function createInvoice(prevState: State, formData: FormData) {

    // const rawFormData1 = Object.fromEntries(formData.entries())
    // console.log(rawFormData1);

    // Validate form using Zod
    // Zod parse()函数更改为safeParse()而不是parse()
    // safeParse()将返回一个包含success或error字段的对象。这将有助于更优雅地处理验证，而无需将此逻辑放入try/catch块中。
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    console.log(validatedFields)
    // If form validation fails, return errors early. Otherwise, continue.
    // 在将信息发送到数据库之前，请检查表单字段是否已使用条件正确验证：
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }
    // Prepare data for insertion into the database
    const { customerId, amount, status } = validatedFields.data;
    // 通常最好的做法是在数据库中存储以美分为单位的货币值，以消除 JavaScript 浮点错误并确保更高的准确性。让我们将金额转换为美分：
    const amountInCents = amount * 100;
    // 我们为发票的创建日期创建一个格式为“YYYY-MM-DD”的新日期：
    const date = new Date().toISOString().split('T')[0];
    try {
        // Insert data into the database
        await sql`INSERT INTO invoices (customer_id, amount, status, date) VALUES (${customerId}, ${amountInCents}, ${status}, ${date})`;
    } catch (error) {
        return {
          // If a database error occurs, return a more specific error.
          message: 'Database Error: Failed to Create Invoice.',
        };
    }
    // 由于您要更新发票路由中显示的数据，因此您希望清除此缓存并向服务器触发新请求。您可以使用 Next.js 中的revalidatePath函数来执行此操作：
    // 数据库更新后， /dashboard/invoices路径将重新验证，并从服务器获取新数据。
    revalidatePath('/dashboard/invoices');

    // 此时，您还希望将用户重定向回/dashboard/invoices页面。您可以使用 Next.js 中的redirect功能来执行此操作：
    redirect('/dashboard/invoices');
}

// 更新发票
export async function updateInvoice(id: string, prevState: State, formData: FormData) {
    const validatedFields = UpdateInvoice.safeParse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });
   
    if (!validatedFields.success) {
        return {
          errors: validatedFields.error.flatten().fieldErrors,
          message: 'Missing Fields. Failed to Update Invoice.',
        };
    }

    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
   
    try {
        await sql`UPDATE invoices SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status} WHERE id = ${id}`;
    } catch (error) {
        return { message: 'Database Error: Failed to Update Invoice.' };
    }
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

// 根据主键删除发票
export async function deleteInvoice(id: string) {
    throw new Error('Failed to Delete Invoice');
    
    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
        return { message: 'Deleted Invoice.' };
    } catch (error) {
        return { message: 'Database Error: Failed to Delete Invoice.' };
    }
}
