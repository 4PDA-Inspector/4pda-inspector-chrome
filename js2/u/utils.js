const PARSE_STRING_REGEXP = /([^\s"']+|"([^"]*)"|'([^']*)')/g

class Utils {

    static parse(str) {
        let parsed = str.match(PARSE_STRING_REGEXP);
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
        /* todo
        Unsafe assignment to innerHTML
        Предупреждение: Due to both security and performance concerns, this may not be set using dynamic values which have not been adequately sanitized. This can lead to security issues or fairly serious performance degradation.
         */
        return txt.value
    }
}