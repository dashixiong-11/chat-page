import axios, { AxiosInstance } from 'axios'

const service = axios.create({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`
  },
  baseURL: '',
})

service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token') || ''
    config.headers['Authorization'] = `Bearer ${token}`
    return config
  }, error => {
    return Promise.reject(error)
  })

service.interceptors.response.use(response => {
  const res = response.data
  if (res.code === 0) {
    return res
  } else {
    return Promise.reject(res)
  }

}, error => {
  return Promise.reject(error)
})

function post(url: string, param = {}) {
  return new Promise((resolve, reject) => {
    service({
      method: 'POST',
      url,
      data: param,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=UTF-8'
      }
    }).then(res => resolve(res)).catch(error => reject(error))
  })

}

function get(url: string, param = {}) {
  return new Promise((resolve, reject) => {
    service.get(url, param).then(res => {
      resolve(res)
    }).catch(error => reject(error))

  })
}




export { get, post }
