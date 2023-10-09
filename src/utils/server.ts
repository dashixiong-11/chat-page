import axios, { AxiosResponse } from 'axios';

interface ResponseType {
  code: number;
  data: any;
  message: string;
}

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

service.interceptors.response.use((response) => {
  if (response.data.code === 0) {
    return Promise.resolve(response)
  } else {
    return Promise.reject(response.data)
  }
}, error => {
  return Promise.reject(error)
})

function post(url: string, param = {}): Promise<ResponseType> {
  return new Promise((resolve, reject) => {
    service({
      method: 'POST',
      url,
      data: param,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=UTF-8'
      }
    }).then((response: AxiosResponse<ResponseType>) => resolve(response.data)).catch(error => reject(error))
  })

}

function get(url: string, param = {}) {
  return new Promise((resolve, reject) => {
    service.get(url, param).then((response: AxiosResponse<ResponseType>) => {
      resolve(response.data)
    }).catch(error => reject(error))
  })
}




export { get, post }
