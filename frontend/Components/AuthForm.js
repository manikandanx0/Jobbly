import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export default function AuthForm({ mode = 'login', onSubmit }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card motion-ready space-y-2">
      <h3 className="text-h3 font-semibold">{mode === 'login' ? 'Login' : 'Sign Up'}</h3>
      <div>
        <input className="border p-2 rounded w-full" type="email" placeholder="Email" {...register('email')} />
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <input className="border p-2 rounded w-full" type="password" placeholder="Password" {...register('password')} />
        {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
      </div>
      <button disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded" type="submit">{mode === 'login' ? 'Login' : 'Create account'}</button>
    </form>
  );
}
