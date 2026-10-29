import React from 'react'

export function SettingsPage({
  settingsForm,
  setSettingsForm,
  onSavePlatformSettings,
  busyAction = false,
}) {
  if (!settingsForm) return null

  return (
    <form
      onSubmit={onSavePlatformSettings}
      className="max-w-3xl space-y-6 rounded-2xl border border-[#E5E7EB] bg-[#FAFBFD] p-6"
    >
      <div>
        <h3 className="text-[14px] font-bold text-[#14181F]">
          1. General Platform Branding & Contact
        </h3>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-semibold text-[#374151]">
              Platform Brand Name
            </label>
            <input
              type="text"
              value={settingsForm.platform_name || ''}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, platform_name: e.target.value })
              }
              className="mt-1.5 w-full rounded-lg border border-[#D1D5DB] bg-white px-3.5 py-2 text-[13px]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#374151]">
              Support Hotline Email
            </label>
            <input
              type="email"
              value={settingsForm.support_email || ''}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, support_email: e.target.value })
              }
              className="mt-1.5 w-full rounded-lg border border-[#D1D5DB] bg-white px-3.5 py-2 text-[13px]"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-[#ECEEF2] pt-4">
        <h3 className="text-[14px] font-bold text-[#14181F]">
          2. Marketplace Master API Rate Limit & Sync Engine
        </h3>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[12px] font-semibold text-[#374151]">
              Webhook Rate Limit (req/min)
            </label>
            <input
              type="number"
              value={settingsForm.webhook_rate_limit_per_min || 1200}
              onChange={(e) =>
                setSettingsForm({
                  ...settingsForm,
                  webhook_rate_limit_per_min: Number(e.target.value),
                })
              }
              className="mt-1.5 w-full rounded-lg border border-[#D1D5DB] bg-white px-3.5 py-2 font-mono text-[13px]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#374151]">
              Max Sync Workers
            </label>
            <input
              type="number"
              value={settingsForm.max_concurrent_sync_workers || 16}
              onChange={(e) =>
                setSettingsForm({
                  ...settingsForm,
                  max_concurrent_sync_workers: Number(e.target.value),
                })
              }
              className="mt-1.5 w-full rounded-lg border border-[#D1D5DB] bg-white px-3.5 py-2 font-mono text-[13px]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#374151]">
              Default Free Trial (Days)
            </label>
            <input
              type="number"
              value={settingsForm.default_trial_days || 14}
              onChange={(e) =>
                setSettingsForm({
                  ...settingsForm,
                  default_trial_days: Number(e.target.value),
                })
              }
              className="mt-1.5 w-full rounded-lg border border-[#D1D5DB] bg-white px-3.5 py-2 font-mono text-[13px]"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[12px] font-semibold text-[#374151]">
          Global Announcement Banner
        </label>
        <input
          type="text"
          value={settingsForm.global_announcement_banner || ''}
          onChange={(e) =>
            setSettingsForm({
              ...settingsForm,
              global_announcement_banner: e.target.value,
            })
          }
          className="mt-1.5 w-full rounded-lg border border-[#D1D5DB] bg-white px-3.5 py-2 text-[13px]"
        />
      </div>

      <div className="flex flex-wrap items-center gap-6 pt-2">
        <label className="flex items-center gap-2 text-[12.5px] font-medium text-[#14181F]">
          <input
            type="checkbox"
            checked={Boolean(settingsForm.allow_new_registrations)}
            onChange={(e) =>
              setSettingsForm({
                ...settingsForm,
                allow_new_registrations: e.target.checked,
              })
            }
            className="h-4 w-4 accent-[#14181F]"
          />
          <span>Izinkan Registrasi Seller Baru</span>
        </label>

        <label className="flex items-center gap-2 text-[12.5px] font-medium text-[#14181F]">
          <input
            type="checkbox"
            checked={Boolean(settingsForm.enforce_admin_2fa)}
            onChange={(e) =>
              setSettingsForm({
                ...settingsForm,
                enforce_admin_2fa: e.target.checked,
              })
            }
            className="h-4 w-4 accent-[#14181F]"
          />
          <span>Wajib 2FA untuk SuperAdmin</span>
        </label>

        <label className="flex items-center gap-2 text-[12.5px] font-medium text-[#D64545]">
          <input
            type="checkbox"
            checked={Boolean(settingsForm.maintenance_mode)}
            onChange={(e) =>
              setSettingsForm({
                ...settingsForm,
                maintenance_mode: e.target.checked,
              })
            }
            className="h-4 w-4 accent-[#D64545]"
          />
          <span>Maintenance Mode Global</span>
        </label>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={busyAction}
          className="rounded-lg bg-[#14181F] px-5 py-2.5 text-[12.5px] font-semibold text-white hover:bg-[#262D3B] transition"
        >
          Simpan Pengaturan Platform
        </button>
      </div>
    </form>
  )
}

