new class {

    //todo regexp by base_url
    url_regexp = /^(https?:\/\/)4pda\.to([\/\w.-?=&#]*)*\/?$/
    bg

    constructor() {
        this.bg = chrome.extension.getBackgroundPage().inspector
        this.add_event_listeners()
        this.print_values()
    }

    add_event_listeners() {
        let self = this,
            inputs = document.getElementById('mainDiv').getElementsByTagName('input')
        for (let input of inputs) {
            if (input.name) {
                input.addEventListener('change', function() {
                    switch (this.type) {
                        case "checkbox":
                            self.set_value(this.name, this.checked)
                            break
                        case "text":
                        case "number":
                        case "range":
                        case "radio":
                            self.set_value(this.name, this.value)
                            break
                    }
                })
            }
        }

        document.getElementById('notification_sound_volume').addEventListener('input', function() {
            self.print_notification_sound_volume(this.value)
        })

        document.getElementById('notification_qms_popup').addEventListener('change', function() {
            if (this.checked) {
                self.bg.notifications.show({
                    title: "Изменение настроек",
                    message: "Оповещения о QMS успешно включены",
                    iconUrl: self.bg.notifications.icons.qms
                })
            }
        })
        document.getElementById('notification_themes_popup').addEventListener('change', function() {
            if (this.checked) {
                self.bg.notifications.show({
                    title: "Изменение настроек",
                    message: "Оповещения о темах успешно включены",
                    iconUrl: self.bg.notifications.icons.favorite
                })
            }
        })
        document.getElementById('notification_mentions_popup').addEventListener('change', function() {
            if (this.checked) {
                self.bg.notifications.show({
                    title: "Изменение настроек",
                    message: "Оповещения об упоминаниях успешно включены",
                    iconUrl: self.bg.notifications.icons.mention
                })
            }
        })
        document.getElementById('testNotifications').addEventListener('click', function() {
            self.bg.notifications.play_sound()
        })
        document.getElementById('addUserLink').addEventListener('click', function() {
            self.add_user_link_row()
        })
    }

    print_values() {
        let vars = this.bg.vars.data
        for (let i in vars) {
            if (i == 'user_links') {
                this.print_user_links(vars[i])
            } else {
                let inputs = document.getElementsByName(i)
                if (inputs.length) {
                    let input = inputs[0]
                    switch (input.type) {
                        case "checkbox":
                            input.checked = vars[i]
                            break
                        case "radio":
                            document.querySelector(`input[name="${i}"][value="${vars[i]}"]`).checked = true
                            break
                        default:
                            input.value = vars[i]
                    }
                    if (i == 'notification_sound_volume') {
                        this.print_notification_sound_volume(vars[i])
                    }
                }
            }
        }
    }

    print_notification_sound_volume(value) {
        document.getElementById('inspector4pda_notificationSoundVolumeLabel').textContent = Math.round(value * 100) + '%'
    }

    set_value(name, value) {
        this.bg.vars.set_value(name, value)
    }

    add_user_link_row(values) {
        let self = this,
            div = document.getElementById('userLinkDivTemplate').cloneNode(true),
            inputs = div.getElementsByTagName('input')
        for (let input of inputs) {
            input.value = ''
            input.addEventListener('change', function() {
                self.save_user_links()
            })
        }
        if (values) {
            inputs[0].value = values.url
            inputs[1].value = values.title
        }
        div.getElementsByClassName('deleteRow')[0].addEventListener('click', function () {
            this.parentElement.remove()
            self.save_user_links()
        })
        div.removeAttribute('id')
        div.classList.add('userLinkDiv')
        document.getElementById('userLinksDiv').insertBefore(div, document.getElementById('addUserLink'))
    }

    print_user_links(links) {
        let self = this
        try {
            if (Array.isArray(links) && links.length) {
                for (let link of links) {
                    self.add_user_link_row(link)
                }
            } else {
                self.add_user_link_row()
            }
        } catch (e) {
            self.add_user_link_row()
        }
    }

    save_user_links() {
        let result = [],
            user_link_divs = document.getElementsByClassName('userLinkDiv')
        for (let user_link_div of user_link_divs) {
            if (
                (user_link_div.getElementsByClassName('userLinkUrl').length)
                && (user_link_div.getElementsByClassName('userLinkUrlTitle').length)
            ) {
                let $urlInput = user_link_div.getElementsByClassName('userLinkUrl')[0],
                    $titleInput = user_link_div.getElementsByClassName('userLinkUrlTitle')[0],
                    new_user_link = {
                        url  : $urlInput.value,
                        title: $titleInput.value
                    },
                    has_errors = false
                if (new_user_link.url && this.url_regexp.test(new_user_link.url)) {
                    $urlInput.classList.remove('error')
                } else {
                    $urlInput.classList.add('error')
                    has_errors = true
                }

                if (new_user_link.title) {
                    $titleInput.classList.remove('error')
                } else {
                    $titleInput.classList.add('error')
                    has_errors = true
                }
                if (!has_errors) {
                    result.push(new_user_link)
                }
            }
        }
        this.set_value('user_links', result)
    }

}
