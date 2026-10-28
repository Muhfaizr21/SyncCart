import { useEffect, useState } from 'react'

export function OnboardingModal({ isOpen, initialMode = 'trial', selectedPlanName, onClose }) {
  const [mode, setMode] = useState(initialMode)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [storeName, setStoreName] = useState('')
  const [channels, setChannels] = useState(['Shopee', 'Tokopedia', 'TikTok Shop'])
  const [submitState, setSubmitState] = useState('idle') // idle | loading | error | success
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  function toggleChannel(channelName) {
    setChannels((prev) =>
      prev.includes(channelName)
        ? prev.filter((item) => item !== channelName)
        : [...prev, channelName]
    )
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!fullName.trim() || !email.trim() || !email.includes('@')) {
      setSubmitState('error')
      setErrorMessage('Mohon isi nama lengkap dan alamat email aktif yang valid (contoh: nama@tokoanda.id).')
      return
    }
    if (channels.length === 0) {
      setSubmitState('error')
      setErrorMessage('Pilih minimal 1 marketplace yang ingin Anda hubungkan.')
      return
    }

    setSubmitState('loading')
    setErrorMessage('')

    setTimeout(() => {
      setSubmitState('success')
    }, 650)
  }

  function handleResetForm() {
    setFullName('')
    setEmail('')
    setStoreName('')
    setChannels(['Shopee', 'Tokopedia', 'TikTok Shop'])
    setSubmitState('idle')
    setErrorMessage('')
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111612]/75 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-[#161816] text-white border border-white/20 p-6 sm:p-8 shadow-2xl my-8">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-[#D9F951] text-[#111612] text-xs font-bold">
              {selectedPlanName
                ? `Paket Dipilih: ${selectedPlanName}`
                : mode === 'trial'
                  ? 'Promo Early Adopter: Trial 30 Hari'
                  : 'Sesi Konsultasi & Demo Live'}
            </span>
            <h2
              id="onboarding-modal-title"
              className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white mt-2"
            >
              {mode === 'trial'
                ? 'Mulai Workspace SyncCart Anda'
                : 'Jadwalkan Demo Bersama Tim Kami'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela pendaftaran"
            className="min-h-[44px] min-w-[44px] rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer shrink-0"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 6L18 18M6 18L18 6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#111612] border border-white/10 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('trial')
              setSubmitState('idle')
              setErrorMessage('')
            }}
            className={`min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              mode === 'trial'
                ? 'bg-[#D9F951] text-[#111612]'
                : 'text-[#B8C2B8] hover:text-white'
            }`}
          >
            Akses Gratis 30 Hari
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('demo')
              setSubmitState('idle')
              setErrorMessage('')
            }}
            className={`min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              mode === 'demo'
                ? 'bg-[#D9F951] text-[#111612]'
                : 'text-[#B8C2B8] hover:text-white'
            }`}
          >
            Jadwalkan Demo Video
          </button>
        </div>

        {submitState === 'success' ? (
          <div className="p-6 rounded-2xl bg-[#145A43] border border-[#D9F951]/40 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D9F951] text-[#111612] text-xs font-bold">
              Permintaan Tercatat
            </div>
            <h3 className="text-xl font-bold text-white">
              Halo {fullName}, ruang kerja untuk {storeName || 'Toko Anda'} siap disiapkan!
            </h3>
            <p className="text-sm text-white/90 leading-relaxed">
              {mode === 'trial'
                ? `Kami telah menyiapkan panduan aktivasi OAuth untuk ${channels.join(', ')} ke email ${email}. Anda mendapatkan masa uji coba penuh 30 hari tanpa kartu kredit.`
                : `Jadwal sesi demo 1-on-1 dan konsultasi alur toko untuk ${channels.join(', ')} telah dikirim ke ${email}. Tim onboarding kami akan merespon maksimal dalam 2 jam kerja.`}
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-5 py-2.5 rounded-full bg-[#D9F951] text-[#111612] font-bold text-sm cursor-pointer"
              >
                Selesai & Kembali ke Halaman
              </button>
              <button
                type="button"
                onClick={handleResetForm}
                className="min-h-[44px] px-4 py-2.5 rounded-full bg-white/15 text-white font-semibold text-sm hover:bg-white/25 cursor-pointer"
              >
                Isi Data Lain
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {submitState === 'error' && (
              <div
                role="alert"
                className="p-4 rounded-2xl bg-[#5C1A1B] border border-[#FCA5A5] text-white text-xs sm:text-sm font-medium"
              >
                <p className="font-bold text-[#FCA5A5] mb-1">Periksa Kembali Input Anda:</p>
                <p>{errorMessage}</p>
              </div>
            )}

            <div>
              <label htmlFor="modal-fullname" className="block text-xs font-bold uppercase tracking-wider text-[#B8C2B8] mb-1.5">
                Nama Lengkap Anda *
              </label>
              <input
                id="modal-fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ketik nama lengkap Anda"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#111612] border border-white/25 text-white placeholder:text-[#8E9B8E] text-sm"
              />
            </div>

            <div>
              <label htmlFor="modal-email" className="block text-xs font-bold uppercase tracking-wider text-[#B8C2B8] mb-1.5">
                Email Aktif Toko / Bisnis *
              </label>
              <input
                id="modal-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@tokoanda.id"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#111612] border border-white/25 text-white placeholder:text-[#8E9B8E] text-sm"
              />
            </div>

            <div>
              <label htmlFor="modal-store" className="block text-xs font-bold uppercase tracking-wider text-[#B8C2B8] mb-1.5">
                Nama Toko Online (Opsional)
              </label>
              <input
                id="modal-store"
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Nama toko Anda di marketplace"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#111612] border border-white/25 text-white placeholder:text-[#8E9B8E] text-sm"
              />
            </div>

            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-[#B8C2B8] mb-2">
                Marketplace yang Ingin Dihubungkan *
              </span>
              <div className="flex flex-wrap gap-2">
                {['Shopee', 'Tokopedia', 'TikTok Shop'].map((ch) => {
                  const selected = channels.includes(ch)
                  return (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => toggleChannel(ch)}
                      aria-pressed={selected}
                      className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-colors cursor-pointer ${
                        selected
                          ? 'bg-[#145A43] border-[#D9F951] text-white'
                          : 'bg-[#111612] border-white/20 text-[#B8C2B8] hover:text-white'
                      }`}
                    >
                      {selected ? `[Aktif] ${ch}` : ch}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                disabled={submitState === 'loading'}
                className="w-full min-h-[48px] px-6 py-3 rounded-full bg-[#D9F951] text-[#111612] font-bold text-sm hover:brightness-95 transition-all cursor-pointer disabled:opacity-60"
              >
                {submitState === 'loading'
                  ? 'Menyiapkan Workspace Toko...'
                  : mode === 'trial'
                    ? 'Aktifkan Trial 30 Hari (Tanpa Kartu Kredit)'
                    : 'Kirim Permintaan Jadwal Demo'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
