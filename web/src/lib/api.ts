import axios from 'axios'

const api = axios.create({
  baseURL: 'https://space-timeline-server.vercel.app/',
  // baseURL: 'http://localhost:3333/',
})

api.interceptors.request.use(
  (config) => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('tkk='))
    const tokenValue = token ? token.split('=')[1] : null

    if (tokenValue) {
      config.headers.Authorization = `Bearer ${tokenValue}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

export { api }
