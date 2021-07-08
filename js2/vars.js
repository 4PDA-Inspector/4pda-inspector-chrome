class Vars {

    current_build = 20210701

    data = {
        interval: 10,
        open_themes_limit: 0,

        notification_sound_volume: 1,

        notification_themes_sound: true,
        notification_themes_popup: true,
        notification_themes_all_comments: false,

        notification_qms_sound: true,
        notification_qms_popup: true,
        notification_qms_all_messages: false,

        notification_mentions_sound: true,
        notification_mentions_popup: true,

        toolbar_pin_color: true,
        toolbar_pin_up: false,
        toolbar_only_pin: false,
        toolbar_open_theme_hide: true,
        toolbar_simple_list: false,

        toolbar_button_open_all: true,
        toolbar_button_read_all: true,

        toolbar_width_fixed: false,
        toolbar_width: 400,
        toolbar_theme: 'auto',

        open_in_current_tab: false,
        user_links: [],

        build: 0
    }

    _base_url = null
    _app_url = null

    get BASE_URL() {
        if (this._base_url == undefined) {
            throw 'Empty BASE_URL'
        }
        return this._base_url
    }
    get APP_URL() {
        if (this._app_url == undefined) {
            throw 'Empty BASE_URL'
        }
        return this._app_url
    }

    get interval_ms() {
        return this.data.interval * 1000
    }

    async check_urls() {
        return new Promise(async(resolve, reject) => {
            let checkXHR = new XHR()
            checkXHR.timeoutTime = 1000
            for (let url of ['https://4pda.to', 'https://4pda.ru']) {
                if (this._base_url) {
                    break
                }
                checkXHR.url = url
                await checkXHR.send().then(() => {
                    this._base_url = url
                    console.debug(url, 'OK!')
                }).catch(() => {
                    console.debug(url, 'error!')
                })
            }
            for (let url of ['https://appbk.4pda.to', 'https://app.4pda.ru']) {
                if (this._app_url) {
                    break
                }
                checkXHR.url = url
                await checkXHR.send().then(() => {
                    this._app_url = url
                    console.debug(url, 'OK!')
                }).catch(() => {
                    console.debug(url, 'error!')
                })
            }
            if (this._base_url && this._app_url) {
                return resolve()
            } else {
                return reject()
            }
        })
    }

    async read_storage() {
        return new Promise((resolve, reject) => {
            // todo use storage.sync
            chrome.storage.local.get(null,  (items) => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError)
                }
                for (let i in items) {
                    this.set_value(i, items[i], false)
                }
                this.check_new_build()
                return resolve()
            });
        })
    }

    check_new_build() {
        if (!this.data.build || this.data.build < this.current_build) {
            inspector.browser.open_url('html/whatsnew.html').then()
            this.set_value('build', this.current_build)
        }
    }

    set_value(field, value, save=true) {

        switch (typeof this.data[field]) {
            case 'boolean':
                value = ((value === true) || (value === 'true') || (value === 1))
                break
            case 'number':
                value = Number(value) || 0
                break
            case 'string':
                value = String(value)
                break
            case 'undefined':
                console.error('Set value:', field, value)
                return false
        }

        switch (field) {
            case 'interval': // 5 sec < interval < 5 min
                value = Math.max( value, 5)
                value = Math.min( value, 300)
                break
            case 'toolbar_width':
                value = Math.max( value, 400)
                value = Math.min( value, 800)
                break
            case 'open_themes_limit':
                value = Math.max( value, 0)
                break
        }

        this.data[field] = value

        if (save) {
            chrome.storage.local.set({
                [field]: value
            });

            switch (field) {
                case 'interval':
                    inspector.check_need_update()
                    break
                case 'toolbar_only_pin':
                    inspector.update_all_data(true).then()
                    break
            }

        }
    }

    doForumURL(params, loFi = false) {
        return this.BASE_URL + (loFi ? '/forum/lofiversion/index.php' : '/forum/index.php') + (params ? '?' + params : '');
    }

}