import axios from 'axios'
import lodash from 'lodash'

const { defaults } = lodash

class WaniKaniClient {
  constructor (apiToken) {
    this.apiToken = apiToken
  }

  get apiUrl () {
    return 'https://api.wanikani.com/v2'
  }

  get headers () {
    return { Authorization: `Bearer ${this.apiToken}` }
  }

  async request (endpoint, queryOptions = {}) {
    const opts = defaults({}, queryOptions)
    const query = Object.entries(opts).map((pair) => {
      const [key, value] = pair
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    }).join('&')
    const result = await axios.get(`${this.apiUrl}/${endpoint}?${query}`, { headers: this.headers })
    return result.data
  }

  async assignments (queryOptions) {
    return this.request('/assignments', queryOptions)
  }

  async subjects (queryOptions) {
    return this.request('/subjects', queryOptions)
  }

  async user () {
    return this.request('/user')
  }

  async levelProgressions () {
    return this.request('/level_progressions')
  }
}

async function lessonsBeforeNewRadicals (client) {
  const result = await client.user()
  const user = result.data
  const currentLevel = user.level
  const lastLevel = currentLevel - 1
  const assignments = await client.assignments({
    levels: lastLevel,
    immediately_available_for_lessons: true
  })
  console.log(`You have ${assignments.total_count} lessons to finish before new kanji and radicals!`)
}

async function main (argv, apiToken) {
  const client = new WaniKaniClient(apiToken)
  await lessonsBeforeNewRadicals(client)
}

main(process.argv, process.env.WANIKANI_API_TOKEN)
