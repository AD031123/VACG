const BASE = '/api'

async function request(url) {
  const res = await fetch(BASE + url)
  const json = await res.json()
  if (json.code !== 0) throw new Error(json.message)
  return json.data
}

/** 提取番剧 ID：/detail/20260147 → 20260147 */
export function extractId(detailUrl) {
  const m = detailUrl.match(/\/detail\/(\d+)/)
  return m ? m[1] : ''
}

/** 最近更新 */
export function fetchRecentUpdates() {
  return request('/update')
}

/** 今日推荐 */
export function fetchTodayRecommends() {
  return request('/recommend')
}

/** 番剧详情 */
export function fetchDetail(id) {
  return request(`/detail/${id}`)
}

/** 视频播放地址 */
export function fetchPlay(id, source, ep) {
  return request(`/play/${id}/${source}/${ep}`)
}

/** 搜索 */
export function fetchSearch(query, page = 1) {
  return request(`/search?query=${encodeURIComponent(query)}&page=${page}`)
}

/** 本周放送列表 */
export function fetchWeeklySchedule() {
  return request('/weekly')
}

/** 一周更新页面 */
export function fetchWeeklyUpdate() {
  return request('/update-page')
}

/** 排行榜 */
export function fetchRank() {
  return request('/rank')
}

/** 目录/筛选 */
export function fetchCatalog(segment = 'all-all-all-all-all-time', page = 1) {
  return request(`/catalog?segment=${encodeURIComponent(segment)}&page=${page}`)
}
