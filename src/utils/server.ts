import axios, { AxiosResponse } from 'axios';
import { showLoading, hideLoading } from './loading';

interface ResponseType<T> {
  code: number;
  data: T;
  message: string;
}

const url = import.meta.env.VITE_IP_VALUE;
console.log(url);
const service = axios.create({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`
  },
  baseURL: url,
})


service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token') || ''
    config.headers['Authorization'] = `Bearer ${token}`
    showLoading()
    return config
  }, error => {
    hideLoading()
    return Promise.reject(error)
  })

service.interceptors.response.use((response) => {
  hideLoading()
  if (response.data.code === 0) {
    return Promise.resolve(response)
  } else {
    return Promise.reject(response.data)
  }
}, error => {
  hideLoading()
  return Promise.reject(error.response.data)
})


function post<T>(url: string, param = {}): Promise<ResponseType<T>> {
  return new Promise((resolve, reject) => {
    service({
      method: 'POST',
      url,
      data: param,
    }).then((response: AxiosResponse<ResponseType<T>>) => resolve(response.data)).catch(error => reject(error))
  })

}

function get<T>(url: string, param = {}): Promise<ResponseType<T>> {
  return new Promise((resolve, reject) => {
    service.get(url, param).then((response: AxiosResponse<ResponseType<T>>) => {
      resolve(response.data)
    }).catch(error => reject(error))
  })
}




export { get, post }
