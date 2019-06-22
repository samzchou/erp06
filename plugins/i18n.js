import Vue from 'vue';
import VueI18n from 'vue-i18n';
import Locale from '~/locales';

Vue.use(VueI18n);

export default ({ app, store }, inject) => {
	app.i18n = new VueI18n({
		locale: store.state.user && store.state.user.language,
		fallbackLocale: 'zh_cn',
		messages: Locale,
		silentTranslationWarn: true
	})
}
