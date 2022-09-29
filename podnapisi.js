const tmdb = require('./tmdb');
var podnapisiApi = require('./lib/podnapisi-api');
const config = require('./config');
require('dotenv').config();
const languages = require('./languages.json');
const NodeCache = require("node-cache");
const Cache = new NodeCache();
const MetaCache = new NodeCache();
const subtitlesCache = new NodeCache();



async function subtitles(type, imdbid, lang) {
    let [id, season, episode] = imdbid.split(':');
    console.log(id, season, episode)
    let meta = MetaCache.get(id);
    if (!meta) {
        meta = await tmdb(type, id);
        if (meta) {
            MetaCache.set(id, meta);
        }
    }

    console.log(meta.title, meta.year, type, season, episode)
    const cachID = `${id}_${season}_${episode}_${lang}`;
    console.log(cachID)
    let cached = Cache.get(cachID);
    if (cached) {
        console.log('cached main', cachID, cached);
        return cached
    } else {
        const subtitlescachID = cachID;
        let subtitlesList = subtitlesCache.get(subtitlescachID);
        if (!subtitlesList) {
            subtitlesList = await podnapisiApi(meta.title, meta.year, type, season, episode,languages[lang].code);
            if (subtitlesList) {
                subtitlesCache.set(subtitlescachID, subtitlesList);
            }
        }

        let subs = [];
        if (subtitlesList) {
            subtitles = subtitlesList;
            for (let i = 0; i < subtitles.length; i++) {
                let subtitle = subtitles[i];
                /*
                let options = `d=${encodeURIComponent(config.BaseURL)}&h=origin:${encodeURIComponent(config.BaseURL)}&h=referer:${encodeURIComponent(config.BaseURL)}`;
                let url = `http://127.0.0.1:11470/proxy/${options}${subtitle.url}`;
                */
                subs.push({
                    lang: languages[lang].iso || languages[lang].id,
                    id: `${cachID}_${i}`,
                    url: `http://127.0.0.1:11470/subtitles.vtt?from=${encodeURIComponent(subtitle.url+"?.zip")}`,
                });
            }
            console.log('subs', subs);
            console.log("Cache keys", Cache.keys());
            let cached = Cache.set(cachID, subs);
            console.log("cached", cached)
            return subs;
        }
    }

}


module.exports = subtitles;
