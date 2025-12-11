'use server';

import { signIn } from '@/auth';
import { sql } from '@vercel/postgres';
import { AuthError, CredentialsSignin } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { User } from './definitions';

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

const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

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
  image_url: z.string(),
  avatar: z
    .instanceof(File)
    .refine((file) => {
      if (file.size === 0 || file.name === undefined) return true;
      return ACCEPTED_IMAGE_TYPES.includes(file?.type);
    }, '.jpg, .jpeg, .png and .webp files are accepted.')
    .refine((file) => file.size <= 5000000, `Max file size is 5MB.`)
});

export type CustomerErrorState = {
  errors?: {
    name?: string[];
    email?: string[];
    avatar?: string[];
  };
  message?: string | null;
};

const CreateCustomer = CustomerFormSchema.omit({ id: true, image_url: true });
const UpdateCustomer = CustomerFormSchema.omit({ id: true, image_url: true });

const Bucket = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME;
const s3 = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY as string
  }
});

export async function createCustomer(
  prevState: CustomerErrorState,
  formData: FormData
) {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = CreateCustomer.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Fields have errors. Failed to Create Customer.'
    };
  }

  const { name, email, avatar } = validatedFields.data;
  let imageUrl = `https://ui-avatars.com/api/?name=${name
    .split(' ')
    .join('+')}`;

  if (avatar.size > 0) {
    const ext = avatar?.name.split('.').at(-1);
    const uuid = randomUUID().replace(/-/g, '');
    const fileName = `${uuid}${ext ? '.' + ext : ''}`;
    const arrayBuffer = await avatar.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    try {
      const uploadToS3 = new PutObjectCommand({
        Bucket,
        Key: fileName,
        Body: buffer
      });
      await s3.send(uploadToS3);
    } catch (error) {
      console.error(error);
      return {
        message: 'S3 error. Failed to upload image to S3.'
      };
    }

    imageUrl = `https://nextjs-dashboard-pv.s3.eu-north-1.amazonaws.com/${fileName}`;
  }

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

  const { name, email, avatar } = validatedFields.data;
  if (avatar.size > 0 && avatar.name !== undefined) {
    const ext = avatar?.name.split('.').at(-1);
    const uuid = randomUUID().replace(/-/g, '');
    const fileName = `${uuid}${ext ? '.' + ext : ''}`;
    const arrayBuffer = await avatar.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    try {
      const uploadToS3 = new PutObjectCommand({
        Bucket,
        Key: fileName,
        Body: buffer
      });
      await s3.send(uploadToS3);
    } catch (error) {
      console.error(error);
      return {
        message: 'S3 error. Failed to upload image to S3.'
      };
    }
    const imageUrl = `https://nextjs-dashboard-pv.s3.eu-north-1.amazonaws.com/${fileName}`;
    try {
      await sql`
        UPDATE customers
        SET name = ${name}, email = ${email}, image_url = ${imageUrl}
        WHERE id = ${id};
      `;
    } catch (error) {
      console.log(error);
      return {
        message: `Database Error. Failed to Update Customer with id ${id}`
      };
    }
  } else {
    try {
      await sql`
        UPDATE customers
        SET name = ${name}, email = ${email}
        WHERE id = ${id};
      `;
    } catch (error) {
      console.log(error);
      return {
        message: `Database Error. Failed to Update Customer with id ${id}`
      };
    }
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
  callbackUrl: string | undefined,
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
  const existingUser = (await sql<User>`SELECT * FROM users WHERE email=${email}`).rows[0];
  
  if (existingUser) {
    return {
      message: `Failed to sign up. User with email ${email} already existed.`
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
    `;
  } catch (error) {
    console.log(error)
    return {
      message: 'Database Error: Failed to sign up.'
    };
  }

  redirect('/login');
}

export async function signInOAuth(providerId: string) {
  try {
    await signIn(providerId);
  } catch (error) {
    if (error instanceof AuthError) {
      console.log('This is error', error);
      switch (error.type) {
        default:
          return `Can not log in. Something went wrong.`;
      }
    }
    throw error;
  }
}
