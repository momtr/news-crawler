const fetch = require('node-fetch');
const fs = require('fs');

/** crawl websites listed in file */
const links = require('./websites.json').links;
let viewedLinks = [];
let stack = links.map(i => i.link);
const keys = links.map(i => i.key);
let pages = {};

(async function() {
    while(stack.length > 0) {
        if(viewedLinks.length % 120 === 0) 
            fs.writeFileSync('./data/pages.json', JSON.stringify(pages), { encoding: 'utf-8' });
        let link = stack.pop();
        if(viewedLinks.indexOf(link) === -1) {
            console.log(link);
            viewedLinks.push(link);
            try {
                let data = await fetch(link);
                let html = await data.text();
                pages[link] = html;
                writeToFile(link, html);
                let newLinks = getLinksFromHTML(html)
                    .filter(i => viewedLinks.indexOf(i) == -1)
                    .filter(i => {
                        let anz = 0;
                        for(let key of keys) 
                            anz += i.indexOf(key)
                        return anz >= -2;
                    })
                    .filter(i => i[0] != '/');
                for(let i of newLinks) {
                    stack.push(i);
                }
            } catch(err) {}
            fs.writeFileSync('./data/pages.json', JSON.stringify(pages), { encoding: 'utf-8' });
        }
    }
})();

function getLinksFromHTML(html) {
    let ar = html.split('href="');
    return ar
        .map(i => i.slice(0, i.indexOf('"')))
        .slice(1, ar.length);
}

function writeToFile(path, html) {
    fs.writeFileSync(`./data/pages/${path.split('/').join('_')}.html`, html, { encoding: 'utf-8' });
}