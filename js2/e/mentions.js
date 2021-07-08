class Mentions {

    list = {}

    get count() {
        return Object.keys(this.list).length
    }

    get rURL() {
        return inspector.vars.doForumURL('act=inspector&CODE=mentions-list')
    }
    get vURL() {
        return inspector.vars.doForumURL('act=mentions')
    }

    async update_list() {
        return new Promise((resolve, reject) => {
            new XHR(this.rURL).send().then(resp => {
                let lines = resp.responseText.split(/\r\n|\n/),
                    new_keys = []

                lines.forEach(line => {
                    if (line) {
                        try {
                            let mention = new Mention(line),
                                m_key = mention.key
                            new_keys.push(m_key)

                            if (m_key in this.list) {

                            } else {
                                inspector.notifications.add('new_mention', mention)
                                this.list[m_key] = mention
                            }
                        } catch (e) {

                        }
                    }
                })
                for (let list_key in this.list) {
                    if (!new_keys.includes(list_key)) {
                        delete this.list[list_key]
                    }
                }
                return resolve()
            }).catch(() => {
                return reject()
            })
        })
    }

    open_page() {
        inspector.browser.open_url(this.vURL, true).then();
    }
}

class Mention {
    from = 0 // 0 = forum, 1 = site
    topic_id //or post_id
    post_id //or comment_id
    title
    timestamp
    poster_id
    poster_name

    get key() {
        return `${this.timestamp}_${this.topic_id}_${this.post_id}`
    }

    get URL() {
        switch (this.from) {
            case 0:
                return inspector.vars.doForumURL('showtopic='+this.topic_id+'&view=findpost&p='+this.post_id)
            /*case 1:
                return false*/
        }
        return false
    }

    constructor(text_line) {
        let obj = Utils.parse(text_line)

        this.from = parseInt(obj[0])
        if (this.from !== 0) {
            throw 'Mention: Bad from'
        }
        /*if (![0,1].includes(this.from)) {
            throw 'Mention: Bad from'
        }*/
        this.topic_id = parseInt(obj[1])
        this.post_id = parseInt(obj[2])
        this.title = Utils.decode_special_chars(obj[3])
        this.timestamp = parseInt(obj[4])
        this.poster_id = parseInt(obj[5])
        this.poster_name = Utils.decode_special_chars(obj[6])
    }

}