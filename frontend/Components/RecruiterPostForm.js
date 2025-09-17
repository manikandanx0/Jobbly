import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/Toast';

const schema = z.object({
  title: z.string().min(3),
  company: z.string().min(2),
  location: z.string().min(2).optional().or(z.literal('')),
  pay: z.string().min(1).optional().or(z.literal('')),
  description: z.string().min(10),
  skills: z.string().optional().or(z.literal(''))
});

export default function RecruiterPostForm({ previewEnabled = false, onPosted }) {
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });
  const { notify } = useToast();
  async function submit(values){
    const payload = {
      title: values.title,
      company: values.company,
      location: values.location || '',
      description: values.description,
      skills: (values.skills || '').split(',').map(s=>s.trim()).filter(Boolean)
    };
    try {
      await fetch('/api/internships', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
      reset();
      notify('Internship posted', 'success');
      onPosted?.();
    } catch(e){ notify('Failed to post', 'error'); }
  }
  const values = watch();
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <form onSubmit={handleSubmit(submit)} className="rounded-xl p-5 md:p-6 motion-ready space-y-3 glass">
        <h3 className="text-h3 font-semibold">Post Job</h3>
        <div>
          <input className="input" placeholder="Title" {...register('title')} />
          {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <input className="input" placeholder="Company" {...register('company')} />
          {errors.company && <p className="text-xs text-red-600 mt-1">{errors.company.message}</p>}
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <input className="input" placeholder="Location" {...register('location')} />
            {errors.location && <p className="text-xs text-red-600 mt-1">{errors.location.message}</p>}
          </div>
          <div>
            <input className="input" placeholder="Pay (optional)" {...register('pay')} />
            {errors.pay && <p className="text-xs text-red-600 mt-1">{errors.pay.message}</p>}
          </div>
        </div>
        <div>
          <textarea rows={4} className="textarea" placeholder="Description" {...register('description')} />
          {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
        </div>
        <div>
          <input className="input" placeholder="Skills (comma separated)" {...register('skills')} />
          {errors.skills && <p className="text-xs text-red-600 mt-1">{errors.skills.message}</p>}
        </div>
        <button disabled={isSubmitting} className="btn-primary" type="submit">Submit</button>
      </form>
      {previewEnabled && (
        <div className="rounded-xl p-5 md:p-6 glass">
          <div className="text-h3 font-semibold">Preview</div>
          <div className="mt-2"><span className="font-medium">{values.title || 'Title'}</span> — {values.company || 'Company'} • {values.location || 'Location'}</div>
          <div className="mt-2 text-sm text-textSecondary">{values.description || 'Description will appear here.'}</div>
          <div className="mt-3 flex gap-2 flex-wrap">
            {(values.skills || '').split(',').map(s => s.trim()).filter(Boolean).map(s => (
              <span key={s} className="inline-flex items-center justify-center h-7 px-3 text-xs bg-white/70 text-textPrimary rounded-full border border-white/60">{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
