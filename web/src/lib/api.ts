import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://space-timeline-server.vercel.app/',
  // baseURL: 'http://localhost:3333/',
})
