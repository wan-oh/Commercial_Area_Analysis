import axios from 'axios'

export default axios.create({
  baseURL: 'http://localhost:8080',
  // baseURL: 'local://13.125.20.125:8081',
  // baseURL: 'http://70.12.246.137:8080',
  // baseURL: 'http://70.12.247.78:8080',
  // headers: {
  //   'Content-type': 'application/json'
  // }
})