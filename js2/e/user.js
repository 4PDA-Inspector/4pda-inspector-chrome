class User {

    id = 0
    name
    COOKIE_NAME = 'member_id'

    get rURL() {
        return inspector.vars.doForumURL('act=inspector&CODE=id')
    }

    async check_user() {
        return new Promise((resolve, reject) => {
            this.check_cookie_member_id().then(uid => {
                console.debug('uid from cookie = ' + uid)
                this.request().then(() => {
                    return resolve()
                }).catch((reason) => {
                    return reject(reason)
                })
            }).catch(() => {
                console.debug('no logged')
                return reject(1)
            })
        })
    }

    async check_cookie_member_id() {
        // fast way to check is logged
        return new Promise((resolve, reject) => {
            inspector.browser.get_cookie(this.COOKIE_NAME).then(value => {
                return resolve(parseInt(value));
            }).catch(() => {
                return reject()
            })
        })
    }

    async request() {
        return new Promise((resolve, reject) => {
            new XHR(this.rURL).send().then(resp => {
                let res = Utils.parse(resp.responseText)
                if (res && res.length == 2) {
                    this.id = parseInt(res[0])
                    this.name = Utils.decode_special_chars(res[1])
                    return resolve()
                }
                return reject(1)
            }).catch(() => {
                return reject(0)
            })
        })
    }

    open_page(id) {
        id = id || this.id
        let url_params = id ? 'showuser=' + id : 'act=login'
        inspector.browser.open_url(inspector.vars.doForumURL(url_params), true).then();
    }

    clear_data() {
        this.id = 0;
        this.name = '';
    }
}