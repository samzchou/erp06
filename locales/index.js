import EnElement from 'element-ui/lib/locale/lang/en'
import CnElement from 'element-ui/lib/locale/lang/zh-CN'
import EnLocale from './en_us.json'
import CnLocale from './zh_cn.json'

export default {
    en_us: Object.assign(EnLocale, EnElement),
    zh_cn: Object.assign(CnLocale, CnElement),
}