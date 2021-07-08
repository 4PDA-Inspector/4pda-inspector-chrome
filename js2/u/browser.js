class Browser {

    action_button

    constructor() {
        this.action_button = new ActionButton()
    }

    async focus_window(window) {
        return new Promise((resolve, reject) => {
            let upd = {
                focused: true
            }
            if (window.state === "minimized") {
                upd.state = "normal"
            }
            chrome.windows.update(window.id, upd, () => {
                return resolve()
            })
        })
    }

    async open_url(url, set_active, set_window_focus) {
        if (!/\w+:\/\/.+/.test(url)) {
            url = chrome.extension.getURL(url)
        }
        set_active = set_active || inspector.vars.data.toolbar_open_theme_hide

        return new Promise((resolve, reject) => {
            chrome.tabs.query({
                url: url
            }, (tabs) => {
                if (tabs && tabs.length) {
                    let current_tab = tabs[0]
                    chrome.tabs.highlight({
                        tabs: current_tab.index,
                        windowId: current_tab.windowId
                    }, (window) => {
                        if (!window.focused) {
                            this.focus_window(window)
                        }
                        return resolve(current_tab)
                    })
                } else {
                    if (inspector.vars.data.open_in_current_tab) {
                        chrome.tabs.query({
                            active: true,
                            //currentWindow: true
                        }, (tabs) => {
                            chrome.tabs.update(
                                tabs[0].id, {
                                    url: url
                                }, (tab) => {
                                    if (set_window_focus) {
                                        chrome.windows.get(tab.windowId, (window => {
                                            if (!window.focused) {
                                                this.focus_window(window)
                                            }
                                        }))
                                    }
                                    return resolve(tab)
                                }
                            )
                        })
                    } else {
                        chrome.tabs.create({
                            url: url,
                            active: set_active
                        }, (tab) => {
                            if (set_window_focus) {
                                chrome.windows.get(tab.windowId, (window => {
                                    if (!window.focused) {
                                        this.focus_window(window)
                                    }
                                }))
                            }
                            return resolve(tab)
                        })
                    }
                }
            })
        })
    }

    async get_cookie(cookie_name) {
        return new Promise((resolve, reject) => {
            chrome.cookies.get({
                url: inspector.vars.BASE_URL,
                name: cookie_name
            }, cookie => {
                if (cookie) {
                    return resolve(cookie.value)
                } else {
                    return reject()
                }
            })
        })
    }
}

class ActionButton {

    icons = {
        default: '/icons/icon_19.png',
        has_qms: '/icons/icon_19_qms.png',
        logout: '/icons/icon_19_out.png'
    }
    colors = {
        default: [63, 81, 181, 255],
        has_qms: [76, 175, 80, 255],
        logout: [158, 158, 158, 255],
    }

    set icon(path) {
        chrome.browserAction.setIcon({path: path});
    }
    set badge_text(text) {
        chrome.browserAction.setBadgeText({'text': String(text)}, () => {});
    }
    set title(text) {
        chrome.browserAction.setTitle({'title': text.toString()}, () => {});
    }
    set badge_bg_color(color) {
        chrome.browserAction.setBadgeBackgroundColor({'color': color }, () => {});
    }

    print_default() {
        this.badge_text = ''
        this.badge_bg_color = this.colors.default
        this.icon = this.icons.default
        this.title = '4PDA - В сети'
    }
    print_logout() {
        this.badge_text = 'login'
        this.badge_bg_color = this.colors.logout
        this.icon = this.icons.logout
        this.title = '4PDA - Не в сети'
    }
    print_unavailable() {
        this.badge_text = 'N/A'
        this.badge_bg_color = this.colors.logout
        this.icon = this.icons.logout
        this.title = '4PDA - Сайт недоступен'
    }

    print_count() {

        if (inspector.user.id) {
            let q_count = inspector.qms.count,
                f_count = inspector.favorites.count

            if (q_count) {
                this.icon = this.icons.has_qms
                this.badge_bg_color = this.colors.has_qms
            } else {
                this.icon = this.icons.default
                this.badge_bg_color = this.colors.default
            }

            this.badge_text = f_count || ''
            this.title = `4PDA - В сети\nНепрочитанных тем: ${f_count}\nНепрочитанных диалогов: ${q_count}`

        } else {
            this.print_logout()
        }

    }
}