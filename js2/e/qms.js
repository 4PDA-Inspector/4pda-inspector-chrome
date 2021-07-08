class QMS {
    list = {}

    get rURL() {
        return inspector.vars.doForumURL('act=inspector&CODE=qms')
    }

    get count() {
        return Object.keys(this.list).length
    }

    async update_dialogs() {
        return new Promise((resolve, reject) => {
            new XHR(this.rURL).send().then(resp => {
                let lines = resp.responseText.split(/\r\n|\n/),
                    new_list = {}
                lines.forEach(line => {
                    if (line) {
                        try {
                            let dialog = new Dialog(line)
                            new_list[dialog.id] = dialog
                            if (!(dialog.id in this.list)) {
                                console.debug('new_dialog:', dialog.opponent_name, dialog.title)
                                inspector.notifications.add('new_dialog', dialog)
                            } else if (this.list[dialog.id].last_msg_ts < dialog.last_msg_ts) {
                                console.debug('new_message_in_dialog:', dialog.opponent_name, dialog.title)
                                inspector.notifications.add('new_message_in_dialog', dialog)
                            }
                        } catch (e) {

                        }
                    }
                })
                this.list = new_list
                return resolve()
            }).catch(() => {
                return reject()
            })
        })
    }

    open_page() {
        inspector.browser.open_url(inspector.vars.doForumURL('act=qms'), true).then();
    }
}

class Dialog {

    id = 0
    title = ''
    opponent_id = ''
    opponent_name = ''
    last_msg_ts = ''
    unread_msgs = 0
    last_msg_id = ''

    get URL() {
        return inspector.vars.doForumURL(`act=qms&mid=${this.opponent_id}&t=${this.id}`)
    }
    /*get API_URL() {
        return inspector.vars.doForumURL(`act=inspector&CODE=qms&t=${this.id}`)
    }*/

    constructor(text_line) {
        let obj = Utils.parse(text_line)

        this.id = obj[0]
        this.title = Utils.decode_special_chars(obj[1])
        this.opponent_id = obj[2]
        this.opponent_name = Utils.decode_special_chars(obj[3])
        this.last_msg_ts = obj[4]
        this.unread_msgs = parseInt(obj[5])
        this.last_msg_id = obj[6]
    }
}