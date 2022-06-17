import http from 'k6/http'
import { sleep, check } from 'k6'
import { Counter } from 'k6/metrics'

export const requests = new Counter('http_reqs')
export const options = {
  vus: 100,
  duration: '30s'
}

const baseUrl = 'http://localhost:8080/reviews'

const generateRandomProductId = () => Math.floor(Math.random() * (1000011 - 900000) + 900000)

// const generateRandomProductId = () => Math.floor(Math.random() * (1000 - 1) + 1000)

export default function () {
  const url = `${baseUrl}/${generateRandomProductId()}`
  const res = http.get(url)
  sleep(0.1)
  check(res, {
    'is status 200': r => r.status === 200,
    'transaction time < 200ms': r => r.timings.duration < 200,
    'transaction time < 500ms': r => r.timings.duration < 500,
    'transaction time < 1000ms': r => r.timings.duration < 1000,
    'transaction time < 2000ms': r => r.timings.duration < 2000
  })
}
