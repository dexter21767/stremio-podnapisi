var langs = require('langs'),
    axios = require('axios').default,
    { parse } = require('fast-html-parser')
    , { wrapper } = require('axios-cookiejar-support'),
    { CookieJar } = require('tough-cookie')
    ;
const BaseURL = 'https://www.podnapisi.net';




const jar = new CookieJar();

const client = wrapper(axios.create({
    baseURL: BaseURL,
    timeout: 50000,
    jar: jar,
    withCredentials: true,
    headers: {
        'Referer': BaseURL,
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': `Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:88.0) Gecko/20100101 Firefox/88.0`,
        'Accept': `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8`
    }
}));

function search(title, year, type, season, episode,lang) {
    let args = `/subtitles/search/advanced?keywords=${encodeURIComponent(title)}&year=${year}&language=${lang}`;
    if (type == "series") {
        args += `&seasons=${season}&episodes=${episode}`;
    }
    //console.log(BaseURL + args)
    return client.get(BaseURL + args).then(function (res) {
        if (res.data.data) {
            const subs = [];
            let subs_list = res.data.data;
            for (let i = 0; i < subs_list.length; i++) {
                let sub = subs_list[i];                
                subs.push({
                    title: sub.movie.title,
                    file_name: sub.custom_releases[0],
                    url: BaseURL + sub.download,
                    lang: sub.language,
                    downloads: sub.stats.downloads
                })
            }
            //console.log(subs)
            return subs

        } else {
            console.log('[Search] error: No result.');
            return [];
        }
    }).catch(searchError);
}




function searchError(err) {
    console.log(err);
    return console.log('[Search] error', err.statusCode, err.options && err.options.qs.search);
}

module.exports = search;
