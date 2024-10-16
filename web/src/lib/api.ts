import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://spacetimeline-server.vercel.app/',
  // baseURL: 'http://localhost:3333/',
})
