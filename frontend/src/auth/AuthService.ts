import { api } from "../api"

interface AuthInfo {
  logged_in: boolean
  user_roles: string[]
  user: {
    id: number
    username: string
    email: string
    realname: string
  }
  csrf_token: string
  is_dev: boolean
  is_vipps_test: boolean
  is_admin: boolean
}

let authData: Promise<AuthInfo> | undefined

// all the functions return promises as we need to
// fetch details from the server first

export const authService = {
  async getAuthData(renew = false) {
    if (!authData || renew) {
      authData = fetch(api("me"), {
        credentials: "include",
      }).then((response) => response.json() as unknown as AuthInfo)
    }

    return await authData
  },

  async isLoggedIn() {
    const authData = await this.getAuthData()
    return authData.logged_in
  },

  async hasRole(role: string) {
    // TODO: check for actual role, not 'all'
    const authData = await this.getAuthData()
    return authData.user_roles.includes("all")
  },

  async getUser() {
    const authData = await this.getAuthData()
    return authData.user
  },

  async getCsrfToken() {
    const authData = await this.getAuthData()
    return authData.csrf_token
  },

  async isDevPage() {
    const authData = await this.getAuthData()
    return authData.is_dev
  },

  async isVippsTest() {
    const authData = await this.getAuthData()
    return authData.is_vipps_test
  },
}
