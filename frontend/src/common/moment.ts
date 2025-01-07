import moment from "moment-timezone"
import "moment/locale/nb.js"

moment.locale("nb")
moment.tz.setDefault("Europe/Oslo")

export default moment
