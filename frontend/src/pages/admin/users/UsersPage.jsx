import React from 'react'

export function UsersPage({ users = [], busyAction = false, onChangeUserRole }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#ECEEF2] bg-white shadow-sm">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-[#ECEEF2] bg-[#FAFBFD] text-[11.5px] font-medium text-[#8C94A4]">
            <th className="py-3 pl-4 pr-3">User ID</th>
            <th className="py-3 px-3">Full Name & Email</th>
            <th className="py-3 px-3">Primary Store</th>
            <th className="py-3 px-3">Current Role</th>
            <th className="py-3 px-3">Channels</th>
            <th className="py-3 pl-3 pr-4">RBAC Authority Switch</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F1F3F6] text-[13px]">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-[#FAFBFD]">
              <td className="py-3.5 pl-4 pr-3 font-mono text-[12px] text-[#525A68]">
                #USR-0{u.id}
              </td>
              <td className="py-3.5 px-3">
                <p className="font-semibold text-[#14181F]">{u.full_name}</p>
                <p className="text-[11.5px] text-[#8C94A4]">{u.email}</p>
              </td>
              <td className="py-3.5 px-3 text-[#374151]">{u.store_name || '-'}</td>
              <td className="py-3.5 px-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                    u.role === 'super_admin'
                      ? 'bg-[#14181F] text-white'
                      : 'bg-[#E8F5EE] text-[#2F6F4E]'
                  }`}
                >
                  {u.role}
                </span>
              </td>
              <td className="py-3.5 px-3 text-[12px] text-[#525A68]">
                {u.channels || 'Shopee, Tokopedia'}
              </td>
              <td className="py-3.5 pl-3 pr-4">
                <button
                  type="button"
                  disabled={busyAction || u.email === 'superadmin@synccart.id'}
                  onClick={() =>
                    onChangeUserRole(
                      u.id,
                      u.role === 'super_admin' ? 'seller' : 'super_admin'
                    )
                  }
                  className="rounded-lg border border-[#DCE0E8] px-3 py-1 text-[11.5px] font-semibold text-[#14181F] hover:bg-[#F3F4F6] disabled:opacity-40"
                >
                  {u.role === 'super_admin' ? 'Set as Seller' : 'Promote SuperAdmin'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

