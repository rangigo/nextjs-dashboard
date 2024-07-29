'use server';

import { signIn } from '@/auth';
import { sql } from '@vercel/postgres';
import { AuthError, CredentialsSignin } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const InvoiceFormSchema = z.object({
  id: z.string(),
  customerId: z.string({ invalid_type_error: 'Please select a customer.' }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than 0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.'
  }),
  date: z.string()
});

export type InvoiceErrorState = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const CreateInvoice = InvoiceFormSchema.omit({ id: true, date: true });
const UpdateInvoice = InvoiceFormSchema.omit({ id: true, date: true });

export async function createInvoice(
  prevState: InvoiceErrorState,
  formData: FormData
) {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = CreateInvoice.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.'
    };
  }
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];
  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date});
  `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice'
    };
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(
  id: string,
  prevState: InvoiceErrorState,
  formData: FormData
) {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = UpdateInvoice.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.'
    };
  }
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id};
  `;
  } catch (error) {
    return {
      message: `Database Error: Failed to Update Invoice with id ${id}`
    };
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  try {
    await sql`
      DELETE FROM invoices WHERE id = ${id};
    `;
    revalidatePath('/dashboard/invoices');
  } catch (error) {
    return {
      message: `Database Error: Failed to Delete Invoice with id ${id}`
    };
  }
}

const CustomerFormSchema = z.object({
  id: z.string(),
  name: z
    .string({
      invalid_type_error: 'Name must be a string.'
    })
    .min(1, { message: 'Please enter a name for the customer.' }),
  email: z
    .string({ invalid_type_error: 'Email must be a string.' })
    .min(1, { message: 'Please enter an email for the customer.' })
    .email({ message: 'Invalid email address.' }),
  image_url: z.string()
});

export type CustomerErrorState = {
  errors?: {
    name?: string[];
    email?: string[];
  };
  message?: string | null;
};

const CreateCustomer = CustomerFormSchema.omit({ id: true, image_url: true });
const UpdateCustomer = CustomerFormSchema.omit({ id: true, image_url: true });

export async function createCustomer(
  prevState: CustomerErrorState,
  formData: FormData
) {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = CreateCustomer.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to Create Customer.'
    };
  }

  const { name, email } = validatedFields.data;
  const imageUrl = `https://ui-avatars.com/api/?name=${name
    .split(' ')
    .join('+')}`;
  try {
    await sql`
      INSERT INTO customers (name, email, image_url)
      VALUES (${name}, ${email}, ${imageUrl})
    `;
  } catch (error) {
    return {
      message: 'Database Error. Failed to Create Customer.'
    };
  }
  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

export async function updateCustomer(
  id: string,
  prevState: CustomerErrorState,
  formData: FormData
) {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = UpdateCustomer.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to Update Customer.'
    };
  }

  const { name, email } = validatedFields.data;

  try {
    await sql`
      UPDATE customers
      SET name = ${name}, email = ${email}
      WHERE id = ${id};
    `;
  } catch (error) {
    return {
      message: `Database Error. Failed to Update Customer with id ${id}`
    };
  }
  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

export async function deleteCustomer(id: string) {
  try {
    await sql`
    DELETE FROM customers WHERE id = ${id};`;
    revalidatePath('/dashboard/customers');
  } catch (error) {
    return {
      message: `Database Error. Failed to Delete Customer with id ${id}.`
    };
  }
}

export async function authenticate(
  callbackUrl?: string,
  prevState: string | undefined,
  formData: FormData
) {
  try {
    const email = formData.get('email');
    const password = formData.get('password');
    await signIn('credentials', {
      email,
      password,
      ...(callbackUrl
        ? { redirectTo: callbackUrl }
        : { redirectTo: '/dashboard' })
    });
  } catch (error) {
    if (error instanceof AuthError) {
      console.log('This is error', error);
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          if (error.cause?.err instanceof CredentialsSignin) {
            return 'Invalid credentials.';
          }
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

const SignupFormSchema = z
  .object({
    name: z.string().min(1, { message: 'Please enter your name.' }),
    email: z.string().min(1, { message: 'Please enter an email.' }).email(),
    password: z.string().min(6, {
      message: 'Please enter a password with at least 6 characters.'
    }),
    confirmPassword: z.string().min(6, {
      message: 'Please enter a password with at least 6 characters.'
    })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords did not match.',
    path: ['confirmPassword']
  });

export type SignupErrorState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
  message?: string | null;
};

export async function signup(prevState: SignupErrorState, formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = SignupFormSchema.safeParse(rawFormData);
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to Sign up.'
    };
  }
  const { name, email, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
    `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to sign up.'
    };
  }

  redirect('/login');
}
