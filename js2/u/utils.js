class Utils {
    static parseStringRegexp = /([^\s"']+|"([^"]*)"|'([^']*)')/g

    static parse(str) {
        let parsed = str.match(this.parseStringRegexp);
        for (let i = 0; i < parsed.length; i++) {
            let pq = parsed[i].match(/"(.*)"/);
            if (pq) {
                parsed[i] = pq[1];
            }
        }
        return parsed;
    }

    static app_parse_last_event(str) {
        if (!str) {
            return false;
        }
        let pq = str.split(':');
        if (pq && pq.length === 4) {
            return parseInt(pq[3])
        }
        return false
    }

    static now() {
        return new Date().getTime();
    }

    static decode_special_chars(string) {
        let txt = document.createElement("textarea");
        txt.innerHTML = string;
        return txt.value
    }
}