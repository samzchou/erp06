import Vue from 'vue';
import Element from 'element-ui';

export default ({ app, store }) => {
	Vue.use(Element, { 
		size: 'small',
		i18n: (key, val) => app.i18n.t(key,val)
	})
}
