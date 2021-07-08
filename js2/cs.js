class CS {

    browser
    vars

    user
    favorites
    qms
    mentions
    notifications

    timeout_updater = 0
    last_event = 0

    forum_available = true
    logged_in = true

    constructor() {
        console.debug('init CS', new Date())
        this.vars = new Vars()
        this.browser = new Browser()
        this.notifications = new Notifications()
        this.user = new User()
        this.favorites = new Favorites()
        this.qms = new QMS()
        this.mentions = new Mentions()

        this.vars.read_storage().then(() => {
            this.check_forum_available()
        }).catch(() => {
            throw 'Can\'t init inspector'
        })
    }

    get rURL() {
        return this.vars.APP_URL + '/er/u' + this.user.id + '/s' + this.last_event;
    }

    check_forum_available() {
        this.vars.check_urls().then(() => {
            this.site_available()
            this.update_all_data().catch(() => {
                console.error('Can\'t update data')
            })
        }).catch(() => {
            console.error('4PDA is not available')
            this.site_unavailable()
        })
    }
    start_new_check_forum_timeout() {
        console.debug('check_forum_timeout', new Date())
        clearTimeout(this.timeout_updater)
        this.timeout_updater = setTimeout(() => {
            this.check_forum_available()
        }, this.vars.interval_ms)
    }

    async update_all_data(first_request) {
        if (first_request) {
            this.notifications.silent = true
        }
        console.debug('request', new Date())
        return new Promise((resolve, reject) => {
            this.user.check_user().then(() => {
                console.debug('user update - OK')
                this.logged_in = true
                this.favorites.update_list().then(() => {
                    console.debug('favorites update - OK')
                    this.qms.update_dialogs().then(() => {
                        console.debug('qms update - OK')
                        this.mentions.update_list().then(() => {
                            console.debug('mentions update - OK')
                            console.debug('all updated')
                            this.browser.action_button.print_count()
                            this.notifications.show_all()
                            this.start_new_request_timeout()
                            return resolve()
                        }).catch(() => {
                            console.error('mentions update - bad')
                            this.site_unavailable()
                            return reject()
                        })
                    }).catch(() => {
                        console.error('qms update - bad')
                        this.site_unavailable()
                        return reject()
                    })
                }).catch(() => {
                    console.error('favorites update - bad')
                    this.site_unavailable()
                    return reject()
                })
            }).catch((reason) => {
                if (reason) {
                    this.site_logout()
                } else {
                    this.site_unavailable()
                }
                console.error('user update - bad')
                return reject()
            })
        })
    }

    start_new_request_timeout() {
        clearTimeout(this.timeout_updater)
        this.timeout_updater = setTimeout(() => {
            this.check_need_update()
        }, this.vars.interval_ms)
    }

    check_need_update() {
        this.user.check_cookie_member_id().then(uid => {
            if (uid) {
                if (uid === this.user.id) {
                    // check update
                    this.request_last_event().then(() => {
                        //this.start_new_request_timeout()
                    }).catch(() => {
                        console.debug('bad request')
                    })
                } else {
                    console.debug('new user:' + uid)
                    this.update_all_data(true).then()
                }
            } else {
                this.site_logout()
            }
        }).catch(() => {
            this.site_logout()
        })
    }

    async request_last_event() {
        console.debug('request_last_event', new Date())
        return new Promise((resolve, reject) => {
            new XHR(this.rURL).send().then(resp => {
                let last_event = Utils.app_parse_last_event(resp.responseText)
                if (last_event) {
                    console.debug('has new events')
                    this.last_event = last_event
                    this.update_all_data().catch(() => {
                        console.error('Can\'t update data')
                    })
                } else {
                    console.debug('no new events')
                    this.start_new_request_timeout()
                }
                return resolve()
            }).catch(() => {
                this.site_unavailable()
                return reject()
            })
        })
    }

    site_unavailable() {
        if (this.forum_available) {
            this.notifications.show_site_unavailable()
            this.browser.action_button.print_unavailable()
            this.forum_available = false
        }
        this.start_new_check_forum_timeout()
    }
    site_available() {
        if (!this.forum_available) {
            this.notifications.show_site_available()
            //this.browser.action_button.print_default()
            this.forum_available = true
        }
    }

    site_logout() {
        if (this.logged_in) {
            console.debug('logout')
            this.browser.action_button.print_logout()
            this.user.clear_data()
            this.logged_in = false
        }
        this.start_new_request_timeout()
    }
}

var inspector = new CS()
