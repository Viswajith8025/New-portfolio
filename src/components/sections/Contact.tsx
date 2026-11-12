import { useState, type FormEvent } from 'react'
import { profile } from '../../data/site'
import { VenomButton } from '../VenomButton'

export function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      setStatus('error')
      setError('Please fill in all fields before sending.')
      return
    }
    setStatus('sending')
    setError('')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = (await response.json().catch(() => ({}))) as { error?: string }
      if (!response.ok) throw new Error(data.error || 'Failed to send message. Please try again later.')
      setStatus('sent')
      setForm({ name: '', phone: '', message: '' })
      window.setTimeout(() => setStatus('idle'), 4000)
    } catch (reason) {
      setStatus('error')
      setError(reason instanceof Error ? reason.message : 'Failed to send message. Please try again later.')
    }
  }

  return (
    <section id="contact" className="border-t border-white/5 px-5 py-20 md:px-12 md:py-28 lg:px-20">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col items-center text-center">
          <p className="flex items-center gap-2 text-sm font-bold tracking-[0.2em] text-[#a31515] uppercase">
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="2" fill="#a31515" /></svg>
            Get In Touch
          </p>
          <h2 className="mt-3 text-5xl font-black tracking-tight text-white uppercase md:text-7xl">Contact.</h2>
          <div className="mt-3 h-1.5 w-20 rounded-full bg-[#a31515]" />
        </div>
        <a href={profile.whatsapp.url} target="_blank" rel="noreferrer" className="whatsapp-card glass glass-hover mt-10 mb-8 flex items-center gap-4 rounded-3xl px-4 py-5 sm:px-6 md:px-8">
          <span className="whatsapp-icon grid h-12 w-12 place-items-center rounded-2xl">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
              <path d="M20.5 3.5A11 11 0 0 0 2.1 17.8L1 23l5.4-1.1A11 11 0 0 0 20.5 3.5Zm-8.5 17a9.1 9.1 0 0 1-4.6-1.3l-.3-.2-3.2.7.7-3.1-.2-.3A9.1 9.1 0 1 1 12 20.5Zm5-6.8c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.5.2-.3a.5.5 0 0 0 0-.5c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4 15 15 0 0 0 1.5.6 3.6 3.6 0 0 0 1.7.1 2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3Z" />
            </svg>
          </span>
          <span>
            <span className="block text-xs font-bold tracking-[0.2em] text-gray-400">WHATSAPP</span>
            <span className="text-sm font-extrabold whitespace-nowrap text-white sm:text-base md:text-xl">{profile.whatsapp.number}</span>
          </span>
        </a>
        <div className="relative">
          <div className="red-halo" />
          <form onSubmit={onSubmit} className="glass glass-panel-card relative rounded-3xl p-5 sm:p-8 md:p-14">
            {status === 'sent' ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
                <span className="glass-red grid h-16 w-16 animate-bounce place-items-center rounded-full text-2xl text-white">✓</span>
                <p className="text-2xl font-black text-white">Message Sent!</p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold tracking-wider text-gray-400 uppercase md:text-base">
                  Full Name
                  <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="glass-input rounded-3xl px-6 py-5 text-lg text-white md:text-xl" />
                </label>
                <label className="grid gap-2 text-sm font-bold tracking-wider text-gray-400 uppercase md:text-base">
                  Number
                  <input required type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="glass-input rounded-3xl px-6 py-5 text-lg text-white md:text-xl" />
                </label>
                <label className="grid gap-2 text-sm font-bold tracking-wider text-gray-400 uppercase md:col-span-2 md:text-base">
                  Your Message
                  <textarea required rows={6} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} className="glass-input rounded-3xl px-6 py-5 text-lg text-white md:text-xl" />
                </label>
                <div className="flex justify-center md:col-span-2">
                  <VenomButton type="submit">{status === 'sending' ? 'SENDING' : 'SEND MESSAGE'}</VenomButton>
                </div>
                {status === 'error' && <p className="text-center text-sm text-red-300 md:col-span-2">{error}</p>}
              </div>
            )}
          </form>
        </div>
        <div className="mt-8 grid gap-3 text-sm text-gray-300 md:grid-cols-3">
          <a href={`mailto:${profile.email}`} className="break-all hover:text-white">{profile.email}</a>
          <a href={profile.phoneHref} className="hover:text-white">{profile.phone}</a>
          <span>{profile.location}</span>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm font-bold tracking-widest text-gray-400 uppercase">
          <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-red-500">LinkedIn</a>
          <a href={profile.github} target="_blank" rel="noreferrer" className="hover:text-red-500">GitHub</a>
        </div>
      </div>
    </section>
  )
}
