import { useAuth } from '@/features/auth'
import { useRouting } from '@/shared/routing'

export interface UseUserActionsReturn {
  handleProfileClick: () => void
  handleLogout: () => Promise<void>
}

export function useUserActions(): UseUserActionsReturn {
  const { logout } = useAuth()
  const { goToSettingsProfile, goToLogin } = useRouting()

  const handleProfileClick = () => {
    goToSettingsProfile()
  }

  const handleLogout = async () => {
    await logout()
    goToLogin()
  }

  return {
    handleProfileClick,
    handleLogout,
  }
}
