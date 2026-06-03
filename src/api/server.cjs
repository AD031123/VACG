const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');

const BASE_URL = 'https://www.agedm.io';
const PORT = process.env.PORT || 3000;

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
};

function parseVideoListBox($, selector) {
    const items = [];
    $(`${selector} .video_item`).each((i, el) => {
        const $el = $(el);
        const $link = $el.find('.video_item-title a');
        const $img = $el.find('.video_thumbs');

        const name = $link.text().trim();
        const detailUrl = $link.attr('href') || '';
        const imageUrl = $img.attr('data-original') || $img.attr('src') || '';
        const episodeInfo = $el.find('.video_item--info').text().trim();

        if (name) {
            items.push({ name, imageUrl, detailUrl, episodeInfo });
        }
    });
    return items;
}

function parseDetailPage($) {
    // Title
    const title = $('.video_detail_title').first().text().trim();

    // Cover
    const cover = $('.video_detail_cover img').attr('data-original') ||
        $('.video_detail_cover img').attr('src') || '';

    // Description
    const description = $('.video_detail_desc').first().html()
        ? $('.video_detail_desc').first().html().replace(/<br\s*\/?>/g, '\n').trim()
        : '';

    // Basic info — key-value pairs in .detail_imform_list
    const info = {};
    $('.detail_imform_list li').each((i, el) => {
        const key = $(el).find('.detail_imform_tag').text().replace(/：$/, '').trim();
        const value = $(el).find('.detail_imform_value').text().trim();
        if (key) info[key] = value;
    });

    // Stats — views, comments, likes
    const stats = [];
    $('.video_detail_extra_item').each((i, el) => {
        stats.push($(el).text().trim());
    });

    // Episodes — collect from the first (VIP) source tab, which has the most complete list
    const episodes = [];
    const $firstPlaylist = $('#playlist-source-xigua .video_detail_episode').first();
    if ($firstPlaylist.length === 0) {
        // Fallback: any first .video_detail_episode
        $('.video_detail_episode').first().find('a.video_detail_spisode_link').each((i, el) => {
            episodes.push({
                name: $(el).text().trim(),
                url: $(el).attr('href') || '',
            });
        });
    } else {
        $firstPlaylist.find('a.video_detail_spisode_link').each((i, el) => {
            episodes.push({
                name: $(el).text().trim(),
                url: $(el).attr('href') || '',
            });
        });
    }

    return { title, cover, description, info, stats, episodes, recommendations: parseVideoListBox($, '.video_detail_recommend_wrapper') };
}

async function fetchDetailPage(id) {
    const { data: html } = await axios.get(`${BASE_URL}/detail/${id}`, {
        headers: HEADERS,
        timeout: 15000,
    });
    return cheerio.load(html);
}

async function fetchPlayPage(id, source, ep) {
    const { data: html } = await axios.get(`${BASE_URL}/play/${id}/${source}/${ep}`, {
        headers: HEADERS,
        timeout: 15000,
    });
    return cheerio.load(html);
}

async function fetchSearchPage(query, page = 1) {
    const { data: html } = await axios.get(`${BASE_URL}/search`, {
        params: { query, page },
        headers: HEADERS,
        timeout: 15000,
    });
    return cheerio.load(html);
}

function parseSearchPage($) {
    const items = [];
    $('#search_results_wrapper .cata_video_item').each((i, el) => {
        const $el = $(el);
        const $link = $el.find('.card-title a');
        const $img = $el.find('.video_cover img');
        const $playBtn = $el.find('.video_btns a.btn-danger');

        const name = $link.text().trim();
        const detailUrl = $link.attr('href') || '';
        const imageUrl = $img.attr('data-original') || $img.attr('src') || '';
        const playUrl = $playBtn.attr('href') || '';
        const status = $el.find('.video_play_status').text().trim();

        const info = {};
        $el.find('.video_detail_info').each((j, infoEl) => {
            const $info = $(infoEl);
            if ($info.hasClass('desc')) return;
            const raw = $info.text().trim();
            const m = raw.match(/^(.+?)：(.+)$/);
            if (m) info[m[1]] = m[2];
        });
        const description = $el.find('.video_detail_info.desc').text().replace(/^简介：/, '').trim();

        items.push({ name, imageUrl, detailUrl, playUrl, status, info, description });
    });

    // Pagination
    const pagination = { total: 0, current: 1, totalPages: 1 };
    const paginationText = $('.pagination .page-item.disabled .page-link').first().text();
    const totalMatch = paginationText.match(/共\s*(\d+)\s*条/);
    const pageMatch = paginationText.match(/当前\s*(\d+)\/(\d+)\s*页/);
    if (totalMatch) pagination.total = parseInt(totalMatch[1], 10);
    if (pageMatch) {
        pagination.current = parseInt(pageMatch[1], 10);
        pagination.totalPages = parseInt(pageMatch[2], 10);
    }

    return { items, pagination };
}

function parsePlayPage($, id, source, ep) {
    const title = $('.card-title').first().text().trim();
    const iframeSrc = $('#iframeForVideo').attr('src') || '';

    // Cover
    const cover = $('.video_cover_wrapper img').attr('src') || '';

    // Description
    const description = $('.video_detail_desc').first().html()
        ? $('.video_detail_desc').first().html().replace(/<br\s*\/?>/g, '\n').trim()
        : '';

    // Basic info
    const info = {};
    $('.video_detail_info').each((i, el) => {
        const raw = $(el).text().trim();
        const m = raw.match(/^(.+?)：(.+)$/);
        if (m) info[m[1]] = m[2];
    });

    // Stats
    const stats = [];
    $('.video_detail_meta').each((i, el) => {
        stats.push($(el).text().trim());
    });

    // Episodes from current source tab
    const episodes = [];
    $('.video_detail_episode').first().find('a.video_detail_spisode_link').each((i, el) => {
        const $a = $(el);
        episodes.push({ name: $a.text().trim(), url: $a.attr('href') || '' });
    });

    // Current episode name
    const currentName = $(`.video_detail_episode a[href="/play/${id}/${source}/${ep}"]`)
        .first().text().trim();

    return { title, episode: currentName, iframeSrc, cover, description, info, stats, episodes };
}

function parseWeeklySchedule($) {
    const days = [];
    // week-0 = Sunday, week-1 = Monday, ..., week-6 = Saturday
    for (let d = 0; d < 7; d++) {
        const items = [];
        $(`#week-${d}-pane .text_list_item li`).each((i, el) => {
            const $a = $(el).find('a');
            const name = $a.text().trim();
            const detailUrl = $a.attr('href') || '';
            const subText = $(el).find('.title_sub').text().trim();
            if (name) {
                items.push({ name, detailUrl, info: subText });
            }
        });
        days.push(items);
    }
    return days;
}

function parseCatalogPage($) {
    // Filters
    const filters = [];
    $('.filter_field').each((i, el) => {
        const $el = $(el);
        const typeName = $el.find('.filter_type_name').text().trim();
        const items = [];
        $el.find('.filter_list_item').each((j, itemEl) => {
            const $item = $(itemEl);
            const name = $item.text().trim();
            const href = $item.attr('href') || '';
            if (name) items.push({ name, href });
        });
        if (typeName) filters.push({ name: typeName, items });
    });

    // Anime items
    const items = [];
    $('#cata_video_list .cata_video_item').each((i, el) => {
        const $el = $(el);
        const $link = $el.find('.card-title a');
        const $img = $el.find('.video_cover img');
        const $playBtn = $el.find('.video_btns a.btn-danger');

        const name = $link.text().trim();
        const detailUrl = $link.attr('href') || '';
        const imageUrl = $img.attr('data-original') || $img.attr('src') || '';
        const playUrl = $playBtn.attr('href') || '';
        const status = $el.find('.video_play_status').text().trim();

        const info = {};
        $el.find('.video_detail_info').each((j, infoEl) => {
            const $info = $(infoEl);
            if ($info.hasClass('desc')) return;
            const raw = $info.text().trim();
            const m = raw.match(/^(.+?)：(.+)$/);
            if (m) info[m[1]] = m[2];
        });
        const description = $el.find('.video_detail_info.desc').text().replace(/^简介：/, '').trim();

        if (name) items.push({ name, imageUrl, detailUrl, playUrl, status, info, description });
    });

    // Pagination
    const pagination = { total: 0, current: 1, totalPages: 1 };
    const paginationText = $('.common_pagination .page-item.disabled .page-link').first().text();
    const totalMatch = paginationText.match(/共\s*(\d+)\s*条/);
    const pageMatch = paginationText.match(/当前\s*(\d+)\/(\d+)\s*页/);
    if (totalMatch) pagination.total = parseInt(totalMatch[1], 10);
    if (pageMatch) {
        pagination.current = parseInt(pageMatch[1], 10);
        pagination.totalPages = parseInt(pageMatch[2], 10);
    }

    return { filters, items, pagination };
}

async function fetchCatalogPage(segment, page) {
    const url = `${BASE_URL}/catalog/${segment}-${page}`;
    const { data: html } = await axios.get(url, {
        headers: HEADERS,
        timeout: 15000,
    });
    return cheerio.load(html);
}

async function fetchHomePage() {
    const { data: html } = await axios.get(BASE_URL, {
        headers: HEADERS,
        timeout: 15000,
    });
    return cheerio.load(html);
}

// Cache
let cache = { recentUpdates: [], todayRecommends: [], weeklySchedule: [], crawlTime: null };
let lastFetch = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function refreshCache() {
    if (Date.now() - lastFetch < CACHE_TTL) return;
    const $ = await fetchHomePage();
    cache = {
        recentUpdates: parseVideoListBox($, '.recent_update'),
        todayRecommends: parseVideoListBox($, '.recommend_list'),
        weeklySchedule: parseWeeklySchedule($),
        crawlTime: new Date().toISOString(),
    };
    lastFetch = Date.now();
}

async function fetchWeeklyUpdatePage() {
    const { data: html } = await axios.get(`${BASE_URL}/update`, {
        headers: HEADERS,
        timeout: 15000,
    });
    return cheerio.load(html);
}

function parseWeeklyUpdatePage($) {
    const days = [];
    $('#recent_update_video_wrapper .video_list_box.recent_update').each((i, section) => {
        const $section = $(section);
        const dayLabel = $section.find('.btn-danger.rounded-pill').text().trim();
        const items = [];
        $section.find('.video_item').each((j, el) => {
            const $el = $(el);
            const $link = $el.find('.video_item-title a');
            const $img = $el.find('.video_thumbs');
            const name = $link.text().trim();
            const detailUrl = $link.attr('href') || '';
            const imageUrl = $img.attr('data-original') || $img.attr('src') || '';
            const episodeInfo = $el.find('.video_item--info').text().trim();
            if (name) items.push({ name, imageUrl, detailUrl, episodeInfo });
        });
        if (dayLabel && items.length) days.push({ label: dayLabel, items });
    });
    return days;
}

// ---- Express API ----

const app = express();

// GET /api/update — 最近更新
app.get('/api/update', async (req, res) => {
    try {
        await refreshCache();
        res.json({
            code: 0,
            message: 'ok',
            data: {
                crawlTime: cache.crawlTime,
                list: cache.recentUpdates,
            },
        });
    } catch (err) {
        res.status(500).json({ code: -1, message: err.message });
    }
});

// GET /api/recommend — 今日推荐
app.get('/api/recommend', async (req, res) => {
    try {
        await refreshCache();
        res.json({
            code: 0,
            message: 'ok',
            data: {
                crawlTime: cache.crawlTime,
                list: cache.todayRecommends,
            },
        });
    } catch (err) {
        res.status(500).json({ code: -1, message: err.message });
    }
});

// GET /api/weekly — 本周放送列表
app.get('/api/weekly', async (req, res) => {
    try {
        await refreshCache();
        res.json({
            code: 0,
            message: 'ok',
            data: {
                crawlTime: cache.crawlTime,
                days: cache.weeklySchedule,
            },
        });
    } catch (err) {
        res.status(500).json({ code: -1, message: err.message });
    }
});

async function fetchRankPage() {
    const { data: html } = await axios.get(`${BASE_URL}/rank`, {
        headers: HEADERS,
        timeout: 15000,
    });
    return cheerio.load(html);
}

function parseRankPage($) {
    const result = {};
    $('#rank_list_wrapper .row .col-4').each((i, col) => {
        const $col = $(col);
        const title = $col.find('.text-danger').first().text().trim();
        const items = [];
        $col.find('.rank_list_item').each((j, el) => {
            const $el = $(el);
            const rank = $el.find('.rank_list_item_no').text().trim();
            const $a = $el.find('.rank_list_item_title a');
            const name = $a.text().trim();
            const detailUrl = $a.attr('href') || '';
            if (name) items.push({ rank, name, detailUrl });
        });
        // 周榜→weekly, 月榜→monthly, 总榜→total
        let key = `col_${i}`;
        if (title.includes('周榜')) key = 'weekly';
        else if (title.includes('月榜')) key = 'monthly';
        else if (title.includes('总榜')) key = 'total';
        result[key] = { title, items };
    });
    return result;
}

// GET /api/update-page — 一周更新（/update 页面）
app.get('/api/update-page', async (req, res) => {
    try {
        const $ = await fetchWeeklyUpdatePage();
        const data = parseWeeklyUpdatePage($);
        res.json({ code: 0, message: 'ok', data: { days: data } });
    } catch (err) {
        res.status(500).json({ code: -1, message: err.message });
    }
});

// GET /api/rank — 排行榜
app.get('/api/rank', async (req, res) => {
    try {
        const $ = await fetchRankPage();
        const data = parseRankPage($);
        res.json({ code: 0, message: 'ok', data });
    } catch (err) {
        res.status(500).json({ code: -1, message: err.message });
    }
});

// GET /api/detail/:id — 番剧详情
app.get('/api/detail/:id', async (req, res) => {
    try {
        const $ = await fetchDetailPage(req.params.id);
        const detail = parseDetailPage($);
        res.json({ code: 0, message: 'ok', data: detail });
    } catch (err) {
        res.status(500).json({ code: -1, message: err.message });
    }
});

// GET /api/play/:id/:source/:ep — 获取视频播放地址
app.get('/api/play/:id/:source/:ep', async (req, res) => {
    try {
        const { id, source, ep } = req.params;
        const $ = await fetchPlayPage(id, source, ep);
        const data = parsePlayPage($, id, source, ep);
        res.json({ code: 0, message: 'ok', data });
    } catch (err) {
        res.status(500).json({ code: -1, message: err.message });
    }
});

// GET /api/catalog — 目录/筛选
app.get('/api/catalog', async (req, res) => {
    try {
        const segment = req.query.segment || 'all-all-all-all-all-time';
        const page = parseInt(req.query.page, 10) || 1;
        const $ = await fetchCatalogPage(segment, page);
        const data = parseCatalogPage($);
        res.json({ code: 0, message: 'ok', data });
    } catch (err) {
        res.status(500).json({ code: -1, message: err.message });
    }
});

// GET /api/search — 搜索番剧
app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.query || '';
        const page = parseInt(req.query.page, 10) || 1;
        if (!query) return res.status(400).json({ code: -1, message: '请提供 query 参数' });
        const $ = await fetchSearchPage(query, page);
        const data = parseSearchPage($);
        res.json({ code: 0, message: 'ok', data });
    } catch (err) {
        res.status(500).json({ code: -1, message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`);
    console.log(`  GET /api/update    — 最近更新`);
    console.log(`  GET /api/recommend — 今日推荐`);
    console.log(`  GET /api/weekly   — 本周放送列表`);
    console.log(`  GET /api/detail/:id — 番剧详情`);
    console.log(`  GET /api/play/:id/:source/:ep — 视频播放地址`);
    console.log(`  GET /api/search?query=xxx&page=1 — 搜索番剧`);
    console.log(`  GET /api/catalog?segment=xxx&page=1 — 目录筛选`);
    console.log(`  GET /api/update-page — 一周更新`);
    console.log(`  GET /api/rank       — 排行榜`);
});
