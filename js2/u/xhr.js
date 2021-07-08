class XHR {
    url
    timeoutTime = 10000

    constructor(url) {
        this.url = url
    }

    async send() {
        let self = this
        return new Promise((resolve, reject) => {
            let req = new XMLHttpRequest()
            req.onreadystatechange = function () {
                if (req.readyState == 4) {
                    if (req.status == 200) {
                        return resolve(req);
                    } else {
                        console.debug('XHR - no 200', req.status)
                        return reject(req)
                    }
                }
            };

            req.onerror = function () {
                console.debug('XHR - error')
                return reject(req)
            };

            if (self.timeoutTime) {
                req.timeout = self.timeoutTime;
                req.ontimeout = function () {
                    console.debug('XHR - timeout')
                    return reject(req)
                }
            }

            req.open("GET", self.url, true);
            req.send(null);
        })
    }
}