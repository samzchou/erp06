import Vue from 'vue'

const digitsRE = /(\d{3})(?=\d)/g;

Vue.filter('currency', (value, currency = '￥', decimals = 2) => {
    value = parseFloat(value);
    if (!isFinite(value) || (!value && value !== 0)) return '';
    let stringified = Math.abs(value).toFixed(decimals);
    let _int = stringified.slice(0, -1 - decimals);
    let i = _int.length % 3;
    let head = i > 0 ? (_int.slice(0, i) + (_int.length > 3 ? ',' : '')) : '';
    let _float = stringified.slice(-1 - decimals);
    let sign = value < 0 ? '-' : '';
    return sign + currency + head + _int.slice(i).replace(digitsRE, '$1,') + _float;
})
