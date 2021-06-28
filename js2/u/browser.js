class Browser {

    action_button
    notifications

    notification_icons = {
        default: "/icons/icon_80.png",
        qms: "/icons/icon_80_message.png",
        theme: "/icons/icon_80_favorite.png",
        mention: "/icons/icon_80_mention.png",
        out: "/icons/icon_80_out.png",
    }

    constructor() {
        this.action_button = new ActionButton()
        this.notifications = new Notifications()
    }

    async focus_window(window) {
        return new Promise((resolve, reject) => {
            let upd = {
                focused: true
            };
            if (window.state === "minimized") {
                upd.state = "normal";
            }
            chrome.windows.update(window.id, upd, () => {
                return resolve()
            })
        })
    }

    async open_url(url, set_active) {
        if (!/\w+:\/\/.+/.test(url)) {
            url = chrome.extension.getURL(url)
        }

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
                        return resolve()
                    });
                } else {
                    if (inspector.vars.data.open_in_current_tab) {
                        chrome.windows.getCurrent((win) => {
                            chrome.tabs.query({
                                windowId: win.id,
                                active: true
                            }, function (tabArray) {
                                chrome.tabs.update(
                                    tabArray[0].id, {
                                        url: url
                                    }, (tab) => {
                                        return resolve()
                                    }
                                )
                            });
                        });
                    } else {
                        chrome.tabs.create({
                            url: url,
                            active: set_active
                        }, (tab) => {
                            return resolve()
                        });
                    }
                }
            })
        })

        /*chrome.tabs.query({
            url: url
        }).then((tabs) => {
            console.log(tabs)
        }).catch(error => {
            console.log(error)
        })*/
    }

}

class Notifications {
    notification_sound
    icons = {
        default: "/icons/icon_80.png",
        qms: "/icons/icon_80_message.png",
        theme: "/icons/icon_80_favorite.png",
        mention: "/icons/icon_80_mention.png",
        out: "/icons/icon_80_out.png",
    }

    constructor() {
        this.notification_sound = new Audio('/sound/sound3.ogg')
        //chrome.notifications.onClicked.addListener(this.bgClass.cScript.notificationClick);
    }

    play_sound() {
        this.notification_sound.play()
    }

    show(params) {
        let defaultParams = {
            id: '4pda_inspector_test_' + (Utils.now()),
            title: "4PDA Инспектор",
            message: 'Оповещения успешно включены',
            iconUrl: this.icons.default
        };
        params = {...defaultParams, ...params}

        chrome.notifications.create(params.id, {
            type: "basic",
            title: params.title,
            message: params.message,
            iconUrl: params.iconUrl,

            //eventTime: Utils.now() - 3600,
            //contextMessage: 'context',
            /*buttons: [
                {title: 'test1'},
                {title: 'test2'},
            ]*/
        });
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