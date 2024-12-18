// 不同操作的密码配置
const PASSWORDS = {
  gallery: 'password',    // 访问精选图库的密码
  delete: 'delete123',    // 删除操作的密码
}

// 不同操作的过期时间（毫秒）
const EXPIRATION_TIMES = {
  gallery: 900 * 1000,    // 精选图库密码15分钟过期
  delete: 300 * 1000,     // 删除密码5分钟过期
}

// 验证密码
export const verifyPassword = (type, password) => {
  return password === PASSWORDS[type]
}

// 检查权限是否有效
export const checkAuth = (type) => {
  const isAuthenticated = localStorage.getItem(`${type}Auth`) === 'true'
  if (!isAuthenticated) return false

  const authTime = parseInt(localStorage.getItem(`${type}AuthTime`) || '0')
  const currentTime = Date.now()
  const expirationTime = EXPIRATION_TIMES[type]

  if (currentTime - authTime > expirationTime) {
    localStorage.removeItem(`${type}Auth`)
    localStorage.removeItem(`${type}AuthTime`)
    return false
  }

  return true
}

// 设置权限
export const setAuth = (type) => {
  localStorage.setItem(`${type}Auth`, 'true')
  localStorage.setItem(`${type}AuthTime`, Date.now().toString())
}

// 清除权限
export const clearAuth = (type) => {
  localStorage.removeItem(`${type}Auth`)
  localStorage.removeItem(`${type}AuthTime`)
}
