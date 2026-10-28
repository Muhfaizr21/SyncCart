import { useState } from 'react'
import { DoodleBird, DoodleCloud, DoodleWings } from '../../components/doodles/WinglyDoodles'
import { loginUser, registerUser } from '../../services/api/authApi'

export function AuthPage({ initialTab = 'login', onAuthSuccess, onNavigate }) {
  const [tab, setTab] = useState(initialTab) // login | register
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [storeName, setStoreName] = useState('')
  const [selectedChannels, setSelectedChannels] = useState(['Shopee', 'Tokopedia', 'TikTok Shop'])
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [errorMessage, setErrorMessage] = useState('')

  function toggleChannel(channel) {
    setSelectedChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    )
  }

  async function handleQuickLogin(presetEmail, presetPassword) {
    setTab('login')
    setEmail(presetEmail)
    setPassword(presetPassword)
    setStatus('loading')
    setErrorMessage('')

    try {
      const result = await loginUser({ email: presetEmail, password: presetPassword })
      setStatus('idle')
      onAuthSuccess(result.user)
    } catch (err) {
      setStatus('error')
      setErrorMessage(err.message)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorMessage('')

    if (tab === 'login') {
      if (!email.trim() || !password) {
        setStatus('error')
        setErrorMessage('Mohon masukkan alamat email dan password akun Anda.')
        return
      }

      setStatus('loading')
      try {
        const result = await loginUser({ email, password })
        setStatus('idle')
        onAuthSuccess(result.user)
      } catch (err) {
        setStatus('error')
        setErrorMessage(err.message)
      }
      return
    }

    // Registration validation
    if (!fullName.trim() || !email.trim() || !email.includes('@')) {
      setStatus('error')
      setErrorMessage('Nama lengkap dan alamat email aktif wajib diisi.')
      return
    }
    if (password.length < 6) {
      setStatus('error')
      setErrorMessage('Password minimal terdiri dari 6 karakter.')
      return
    }
    if (selectedChannels.length === 0) {
      setStatus('error')
      setErrorMessage('Pilih minimal 1 marketplace yang ingin dihubungkan.')
      return
    }

    setStatus('loading')
    try {
      const result = await registerUser({
        fullName,
        email,
        password,
        storeName: storeName.trim() || `Toko ${fullName.trim()}`,
        channels: selectedChannels.join(','),
      })
      setStatus('idle')
      onAuthSuccess(result.user)
    } catch (err) {
      setStatus('error')
      setErrorMessage(err.message)
    }
  }

  return (
    <section
      aria-labelledby="auth-page-heading"
      className="relative py-10 sm:py-16 px-4 sm:px-6 lg:px-10"
    >
      <div className="pointer-events-none select-none hidden lg:block">
        <div className="absolute top-12 left-[8%] z-0">
          <DoodleCloud className="w-24 h-16" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* LEFT COLUMN: Wingly Identity + 2 Seeded PostgreSQL Accounts (SuperAdmin & Seller) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-[#161816] text-[#D9F951] text-xs font-extrabold uppercase tracking-wider">
              Autentikasi PostgreSQL + JWT
            </span>
            <h1
              id="auth-page-heading"
              className="font-display font-black uppercase text-[#D9F951] tracking-tight leading-[0.92] text-[clamp(2.8rem,6vw,5rem)] mt-3"
            >
              MASUK ATAU DAFTAR WORKSPACE TOKO
            </h1>
            <p className="mt-3 text-white text-sm sm:text-base leading-relaxed max-w-xl">
              Terhubung langsung ke database PostgreSQL <code className="font-mono-tabular px-1.5 py-0.5 rounded bg-[#161816] text-[#D9F951]">synccart</code>.
              Pilih salah satu dari 2 akun bawaan di bawah untuk langsung masuk, atau daftarkan
              akun seller baru.
            </p>
          </div>

          {/* 2 Default Accounts Card */}
          <div className="relative p-6 rounded-3xl bg-[#161816] text-white border border-white/15 shadow-2xl space-y-4">
            <div className="hidden sm:block absolute -top-[50px] right-8 pointer-events-none">
              <DoodleBird className="w-14 h-12" />
            </div>

            <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/15">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  2 Akun Siap Pakai (Database PostgreSQL)
                </h2>
                <p className="text-xs text-[#B8C2B8]">
                  Klik tombol di bawah untuk isi otomatis & langsung login ke sistem:
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#D9F951] text-[#111612] text-xs font-extrabold">
                Aktif
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Account 1: Super Admin */}
              <div className="p-4 rounded-2xl bg-[#111612] border border-white/15 flex flex-col justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#D9F951] text-[#111612] text-[11px] font-extrabold uppercase">
                      1. Super Admin
                    </span>
                    <span className="font-mono-tabular text-[11px] text-[#B8C2B8]">
                      role: super_admin
                    </span>
                  </div>
                  <p className="font-mono-tabular text-xs font-bold text-white break-all pt-1">
                    superadmin@synccart.id
                  </p>
                  <p className="font-mono-tabular text-xs text-[#B8C2B8]">
                    Pass: <strong className="text-[#D9F951]">Password123!</strong>
                  </p>
                  <p className="text-[11px] text-[#B8C2B8] pt-1">
                    Akses penuh: pantau seluruh akun & toko yang terdaftar di PostgreSQL.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={status === 'loading'}
                  onClick={() => handleQuickLogin('superadmin@synccart.id', 'Password123!')}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#D9F951] text-[#111612] font-extrabold text-xs hover:brightness-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  Masuk sebagai Super Admin
                </button>
              </div>

              {/* Account 2: Seller / User */}
              <div className="p-4 rounded-2xl bg-[#111612] border border-white/15 flex flex-col justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#145A43] text-white border border-[#D9F951]/40 text-[11px] font-extrabold uppercase">
                      2. User / Seller
                    </span>
                    <span className="font-mono-tabular text-[11px] text-[#B8C2B8]">
                      role: seller
                    </span>
                  </div>
                  <p className="font-mono-tabular text-xs font-bold text-white break-all pt-1">
                    seller@synccart.id
                  </p>
                  <p className="font-mono-tabular text-xs text-[#B8C2B8]">
                    Pass: <strong className="text-[#D9F951]">Password123!</strong>
                  </p>
                  <p className="text-[11px] text-[#B8C2B8] pt-1">
                    Akses toko: Toko Nusantara Official (Shopee, Tokopedia, TikTok Shop).
                  </p>
                </div>

                <button
                  type="button"
                  disabled={status === 'loading'}
                  onClick={() => handleQuickLogin('seller@synccart.id', 'Password123!')}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#145A43] hover:bg-[#1E8E6E] border border-[#D9F951]/40 text-white font-extrabold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  Masuk sebagai Seller
                </button>
              </div>
            </div>
          </div>

          <div className="hidden lg:block max-w-xs mx-auto opacity-95 pointer-events-none pt-2">
            <DoodleWings />
          </div>
        </div>

        {/* RIGHT COLUMN: Login / Register Form Card */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-[#161816] text-white border border-white/20 shadow-2xl space-y-6">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#111612] border border-white/10">
            <button
              type="button"
              onClick={() => {
                setTab('login')
                setStatus('idle')
                setErrorMessage('')
              }}
              aria-pressed={tab === 'login'}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                tab === 'login'
                  ? 'bg-[#D9F951] text-[#111612]'
                  : 'text-[#B8C2B8] hover:text-white'
              }`}
            >
              Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register')
                setStatus('idle')
                setErrorMessage('')
              }}
              aria-pressed={tab === 'register'}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                tab === 'register'
                  ? 'bg-[#D9F951] text-[#111612]'
                  : 'text-[#B8C2B8] hover:text-white'
              }`}
            >
              Daftar Akun Baru
            </button>
          </div>

          <div>
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-white">
              {tab === 'login'
                ? 'Masuk ke Dashboard SyncCart'
                : 'Buat Akun Seller & Toko Baru'}
            </h2>
            <p className="text-xs sm:text-sm text-[#B8C2B8] mt-1">
              {tab === 'login'
                ? 'Masukkan email dan password yang terdaftar di database.'
                : 'Akun baru otomatis tersimpan di tabel users & stores pada PostgreSQL.'}
            </p>
          </div>

          {status === 'error' && (
            <div
              role="alert"
              className="p-4 rounded-2xl bg-[#5C1A1B] border border-[#FCA5A5] text-white text-xs sm:text-sm"
            >
              <p className="font-bold text-[#FCA5A5] mb-1">Autentikasi Gagal:</p>
              <p>{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {tab === 'register' && (
              <div>
                <label
                  htmlFor="auth-fullname"
                  className="block text-xs font-bold uppercase tracking-wider text-[#B8C2B8] mb-1.5"
                >
                  Nama Lengkap Anda *
                </label>
                <input
                  id="auth-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ketik nama lengkap Anda"
                  className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-[#111612] border border-white/25 text-white placeholder:text-[#8E9B8E] text-sm"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-bold uppercase tracking-wider text-[#B8C2B8] mb-1.5"
              >
                Alamat Email *
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@tokoanda.id"
                className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-[#111612] border border-white/25 text-white placeholder:text-[#8E9B8E] text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="auth-password"
                  className="block text-xs font-bold uppercase tracking-wider text-[#B8C2B8]"
                >
                  Password *
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-xs font-semibold text-[#D9F951] hover:underline cursor-pointer"
                >
                  {showPassword ? 'Sembunyikan' : 'Tampilkan Password'}
                </button>
              </div>
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-[#111612] border border-white/25 text-white placeholder:text-[#8E9B8E] text-sm"
              />
            </div>

            {tab === 'register' && (
              <>
                <div>
                  <label
                    htmlFor="auth-storename"
                    className="block text-xs font-bold uppercase tracking-wider text-[#B8C2B8] mb-1.5"
                  >
                    Nama Toko Utama
                  </label>
                  <input
                    id="auth-storename"
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Contoh: Toko Berkah Official"
                    className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-[#111612] border border-white/25 text-white placeholder:text-[#8E9B8E] text-sm"
                  />
                </div>

                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-[#B8C2B8] mb-2">
                    Marketplace yang Ingin Dihubungkan *
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {['Shopee', 'Tokopedia', 'TikTok Shop'].map((ch) => {
                      const active = selectedChannels.includes(ch)
                      return (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => toggleChannel(ch)}
                          aria-pressed={active}
                          className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#145A43] border-[#D9F951] text-white'
                              : 'bg-[#111612] border-white/20 text-[#B8C2B8]'
                          }`}
                        >
                          {active ? `[Aktif] ${ch}` : ch}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full min-h-[52px] px-6 py-3 rounded-full bg-[#D9F951] text-[#111612] font-extrabold text-sm sm:text-base hover:brightness-95 transition-all cursor-pointer disabled:opacity-60"
              >
                {status === 'loading'
                  ? 'Memverifikasi ke Server PostgreSQL...'
                  : tab === 'login'
                    ? 'Masuk ke Workspace Sekarang'
                    : 'Daftarkan Akun & Buka Workspace'}
              </button>
            </div>
          </form>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#B8C2B8]">
            <button
              type="button"
              onClick={() => onNavigate('beranda')}
              className="min-h-[44px] text-white hover:text-[#D9F951] font-semibold cursor-pointer"
            >
              Kembali ke Beranda
            </button>
            <span>Enkripsi Bcrypt + JWT HS256</span>
          </div>
        </div>
      </div>
    </section>
  )
}

