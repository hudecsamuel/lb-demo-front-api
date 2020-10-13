require('newrelic');
const Koa = require('koa');
const app = new Koa();
const https = require('https')

const port = process.env.PORT || 3000

const getUtil = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if(res.statusCode !== 200) {
                reject(res.statusCode)
            } else {
                res.setEncoding('utf8');
                let rawData = '';
                res.on('data', (chunk) => { rawData += chunk; });
                res.on('end', () => {
                    try {
                        const parsedData = JSON.parse(rawData);
                        resolve(parsedData)
                    } catch (e) {
                        reject(e)
                    }
                });
            }
        })
    })
}

const fetchHelloWorld = async () => {
    const label = Math.random()
    console.time(label)
    const result = await getUtil(`https://lb-demo-api.herokuapp.com?callId=${label}`)
    console.timeEnd(label)
    return result
}

app.use(async ctx => {
    ctx.res.setHeader('content-type', 'application/json')
    const results = await Promise.all([
        fetchHelloWorld(),
        fetchHelloWorld(),
        fetchHelloWorld(),
        fetchHelloWorld(),
        fetchHelloWorld(),
    ])
    ctx.body = JSON.stringify({results});
});

app.listen(port);
