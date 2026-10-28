import { useEffect, useState } from 'react'
import { Footer } from './components/layout/Footer'
import { Navbar } from './components/layout/Navbar'
import { OnboardingModal } from './components/modals/OnboardingModal'
import { NAV_PAGES } from './data/landingData'
import { FeaturesPage } from './pages/FeaturesPage'
import { HomePage } from './pages/HomePage'
import { HowItWorksPage } from './pages/HowItWorksPage'
import { PricingPage } from './pages/PricingPage'
import { UseCasesFaqPage } from './pages/UseCasesFaqPage'
import { AuthPage } from './pages/auth/AuthPage'
import { WorkspacePage } from './pages/dashboard/WorkspacePage'
import {
  getStoredToken,
  getStoredUser,
  logoutUser,
  saveAuthSession,
} from './services/api/authApi'

const VALID_PAGE_IDS = [...NAV_PAGES.map((p) => p.id), 'auth', 'workspace']

function parseRouteHash() {
  const raw = window.location.hash.replace('#', '').trim()
  if (!raw) return { page: 'beranda', subRoute: 'dashboard' }

  if (raw.startsWith('workspace') || raw.startsWith('seller')) {
    const parts = raw.split('/')
    return {
      page: 'workspace',
      subRoute: parts[1] || 'dashboard',
    }
  }

  return {
    page: VALID_PAGE_IDS.includes(raw) ? raw : 'beranda',
    subRoute: 'dashboard',
  }
}

export function App() {
  const [routeState, setRouteState] = useState(parseRouteHash)
  const [isDark, setIsDark] = useState(false)
  const [currentUser, setCurrentUser] = useState(getStoredUser)
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    mode: 'trial',
    planName: null,
  })

  const activePage = routeState.page
  const activeSubRoute = routeState.subRoute

  useEffect(() => {
    function handleHashChange() {
      setRouteState(parseRouteHash())
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  function handleNavigate(pageId) {
    if (pageId === 'workspace') {
      window.location.hash = 'workspace/dashboard'
      setRouteState({ page: 'workspace', subRoute: 'dashboard' })
    } else if (pageId.startsWith('workspace/')) {
      const sub = pageId.split('/')[1] || 'dashboard'
      window.location.hash = `workspace/${sub}`
      setRouteState({ page: 'workspace', subRoute: sub })
    } else {
      window.location.hash = pageId
      setRouteState({ page: pageId, subRoute: 'dashboard' })
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSelectSubRoute(subRouteId) {
    window.location.hash = `workspace/${subRouteId}`
    setRouteState({ page: 'workspace', subRoute: subRouteId })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleOpenModal(mode = 'trial', planName = null) {
    setModalConfig({
      isOpen: true,
      mode,
      planName,
    })
  }

  function handleCloseModal() {
    setModalConfig((prev) => ({ ...prev, isOpen: false }))
  }

  function handleAuthSuccess(user) {
    setCurrentUser(user)
    handleNavigate('workspace')
  }

  function handleUserUpdated(freshUser) {
    const token = getStoredToken()
    if (token && freshUser) {
      saveAuthSession(token, freshUser)
    }
    setCurrentUser(freshUser)
  }

  async function handleLogout() {
    await logoutUser()
    setCurrentUser(null)
    handleNavigate('auth')
  }

  // Dedicated Full-Bleed App Shell when inside Seller Workspace
  if (activePage === 'workspace') {
    return (
      <WorkspacePage
        currentUser={currentUser}
        activeSubRoute={activeSubRoute}
        onSelectSubRoute={handleSelectSubRoute}
        onUserUpdated={handleUserUpdated}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />
    )
  }

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isDark ? 'wingly-sky-dark text-white' : 'wingly-sky-light text-[#111612]'
      }`}
    >
      {/* Skip Link for Keyboard Accessibility */}
      <a
        href="#main-page-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-[#D9F951] focus:text-[#111612] focus:font-bold"
      >
        Langsung ke konten utama
      </a>

      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenModal={handleOpenModal}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main id="main-page-content" className="flex-1">
        {activePage === 'beranda' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenModal={handleOpenModal}
            isDark={isDark}
          />
        )}
        {activePage === 'fitur' && (
          <FeaturesPage
            onNavigate={handleNavigate}
            onOpenModal={handleOpenModal}
            isDark={isDark}
          />
        )}
        {activePage === 'cara-kerja' && (
          <HowItWorksPage
            onNavigate={handleNavigate}
            onOpenModal={handleOpenModal}
            isDark={isDark}
          />
        )}
        {activePage === 'harga' && (
          <PricingPage
            onNavigate={handleNavigate}
            onOpenModal={handleOpenModal}
            isDark={isDark}
          />
        )}
        {activePage === 'studi-kasus-faq' && (
          <UseCasesFaqPage
            onNavigate={handleNavigate}
            onOpenModal={handleOpenModal}
            isDark={isDark}
          />
        )}
        {activePage === 'auth' && (
          <AuthPage
            onAuthSuccess={handleAuthSuccess}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      <Footer
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenModal={handleOpenModal}
      />

      <OnboardingModal
        key={`${modalConfig.mode}-${modalConfig.planName || 'default'}-${modalConfig.isOpen}`}
        isOpen={modalConfig.isOpen}
        initialMode={modalConfig.mode}
        selectedPlanName={modalConfig.planName}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default App
