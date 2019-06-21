export default {
  splitSerial(serial){
    let s = serial.split('-');
    return s.length?s[1]:serial;
  },
	toDecimal(x){
		var f = parseFloat(x);
		if (isNaN(f)) {
			return;
		}
		f = Math.round(x*100)/100;
		return f;
	},
	difference(o1, o2) {
        let props1 = Object.getOwnPropertyNames(o1);
        let props2 = Object.getOwnPropertyNames(o2);
        if (props1.length != props2.length) {
            return false;
        }
        for (var i = 0,max = props1.length; i < max; i++) {
            var propName = props1[i];
            if (o1[propName] !== o2[propName]) {
                return false;
            }
        }
        return true;
    },
    guid(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c)=>{
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        })
	},
	setItem(node){
        let pl = '请输入', val = '';
        let item = {};
        if(node.field.widgetType == 'checkbox'){
            pl = '请选择';
            val = [];
            item.options = [];
        }else if(['radio'].indexOf(node.field.widgetType)>-1){
            item.options = [];
        }else if(node.field.widgetType == 'cascader'){
            item.hidearea = node.field.hidearea?true:false;
            item['only-province'] = node.field['only-province']?true:false;
            val = null;
        }else if(node.field.widgetType == 'date'){
            item.valueFormat = node.field.format;
            pl = '请选择';
        }else if(node.field.widgetType == 'select'){
            item.multiple = node.field.multiple;
            pl = '请选择';
            val = !item.multiple?'':[];
            item.options = [];
        }else if(node.field.widgetType == 'switch'){
            val = node.field.default;
        }
        item = _.assign({
            "type":node.field.widgetType,
            "subtype":node.field.subtype,
            "label": node.label,
            "value": val,
            "disable": false,
            "placeholder":pl+node.label,
            "key": this.guid(),
            "keyname": node.fieldName
        }, item);
        return item;
    },
    // 检测碰撞
    hit(source, targets){
        const sourceRect = source.getBoundingClientRect();
        //console.log('sourceRect', sourceRect);
        let arr = [];
        let maxIndex = {xIndex:0, yIndex:0};
        targets.forEach((element,i) => {
            let eleRect = element.childNodes[0].getBoundingClientRect();
            if(Math.round(eleRect.left) >= Math.round(sourceRect.left) && Math.round(eleRect.left)<=Math.round(sourceRect.right) && Math.round(eleRect.top)>=Math.round(sourceRect.top) && Math.round(eleRect.top)<Math.round(sourceRect.bottom)){
                //console.log('eleRect',element, eleRect);
                arr.push(element);
            }
        });
        return arr;
    },
	siblings(elem){
		let nodes = [];
		let previ = elem.previousSibling;
		while(previ){
			if(previ.nodeType === 1){
				nodes.push(previ);
			}
			previ = previ.previousSibling;
		}
		nodes.reverse();
		let nexts = elem.nextSibling;
		while(nexts){
			if(nexts.nodeType === 1){
				nodes.push(nexts);
			}
			nexts = nexts.nextSibling;
		}
		return nodes;
	},

	getX(obj){
		let parObj = obj;
		let left = obj.offsetLeft;
		while(parObj = parObj.offsetParent){
			left += parObj.offsetLeft;
		}
		return left;
	},
	getY(obj){
		let parObj = obj;
		let top = obj.offsetTop;
		while(parObj = parObj.offsetParent){
			top += parObj.offsetTop;
		}
		return top;
	},
	hasClass(ele,cls){
		cls = cls || '';
		if(cls.replace(/\s/g, '').length == 0 || !ele.className) return false; //当cls没有参数时，返回false
		return new RegExp(' ' + cls + ' ').test(' ' + ele.className + ' ');
	},
	addClass(ele, cls){
		if(!this.hasClass(ele, cls)) {
			ele.className = ele.className == '' ? cls : ele.className + ' ' + cls;
		}
	},
	removeClass(ele, cls){
		if(this.hasClass(ele, cls)){
			let newClass = ' ' + ele.className.replace(/[\t\r\n]/g, '') + ' ';
			while(newClass.indexOf(' ' + cls + ' ') >= 0){
				newClass = newClass.replace(' ' + cls + ' ', ' ');
			}
			ele.className = newClass.replace(/^\s+|\s+$/g, '');
		}
	},
	toggleClass(ele, cls){
		if(!this.hasClass(ele, cls)) {
			ele.className = ele.className == '' ? cls : ele.className + ' ' + cls;
		}else{
			this.removeClass(ele, cls);
		}
	},
	inArray(value, array){
		for(var i in array){
			if(array[i] == value){
				return true;
			}
		}
		return false;
	},
	removeAllChild(ele){
		while(ele.hasChildNodes()){
			ele.removeChild(ele.firstChild);
		}
	},
	addEvent(el, type, fn, capture){
		el.addEventListener(type, fn, !!capture);
	},
	removeEvent(el, type, fn, capture){
		el.removeEventListener(type, fn, !!capture);
	},
	randomNum(minNum,maxNum){
		switch(arguments.length){
			case 1:
				return parseInt(Math.random()*minNum+1,10);
			break;
			case 2:
				return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10);
			break;
			default:
				return 0;
			break;
		}
	}
}
