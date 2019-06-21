
import VueCookies from 'vue-cookies';
export const state = () => ({
    //user: this.app.$storage.session.get('user')?this.app.$storage.session.get('user'):null,
    user:null,
    lang:'zh-cn',
    sidebar: {
        opened: process.server ? true : !+VueCookies.get('sidebarStatus'),
        withoutAnimation: false
    },
	warningCount:1,
	storeSource:[{id:1,name:'货品采购'},{id:2,name:'产品入库'}],
    storeTarget:[{id:1,name:'车间生产'},{id:2,name:'出厂销售'},{id:3,name:'报废售卖'},{id:4,name:'已送货'}],
});

export const mutations = {
    UPDATE_USER(state, data) {
        state.user = data;
        //console.log('UPDATE_USER', data);
        //this.app.$storage.session.set('user', data);
    },
    SET_MENU_ACTIVE(state, index){
        state.menuActive = index;
    },
    UPDATE_LANGUAGE(state, lans) {
        state.lang = lans;
    },
    TOGGLE_SIDEBAR: state => {
        if (state.sidebar.opened) {
            VueCookies.set('sidebarStatus', 1)
        } else {
            VueCookies.set('sidebarStatus', 0)
        }
        state.sidebar.opened = !state.sidebar.opened;
        state.sidebar.withoutAnimation = false;
    },
    CLOSE_SIDEBAR: (state, withoutAnimation) => {
        VueCookies.set('sidebarStatus', 1);
        state.sidebar.opened = false;
        state.sidebar.withoutAnimation = withoutAnimation;
    },
};

export const actions = {
	async nuxtServerInit ({ commit }, {req, app}) {
        let user = null;
        if (req.cookies.token) {
            user = await this.$axios.$post('mock/db', {
                data: { 
                    type: 'getData',
                    collectionName: 'user',
                    data:{
                        token:req.cookies.token
                    }
                }
            });
            commit('UPDATE_USER', user);
        }
		//this.$axios.$post('mock/db',{data:{type:'initDB'}});
    },
    INIT(state){
		if(!process.server){
			console.log('storage',this.$storage)  
		}
		
	},

};

export const getters = {
    /* setDataState : state => state.setData,
    enginerState : state => state.enginer,
    tagsViewState : state => state.tagsView, */
}
