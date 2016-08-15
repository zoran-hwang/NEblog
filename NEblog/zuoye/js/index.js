(function(){
	/******************************************************************工具函数***********************************************************/
	/* 缓存getELementsByClassName方法并解决IE低版本不支持此方法 */
	function getByClass(elem, className){
		if(document.getElementsByClassName){
			return elem.getElementsByClassName(className);
		}else{
			var children = (elem || document).getElementsByTagName('*');
			var result = new Array();
			for (var i = 0; i < children.length; i++){
				var child = children[i];
				var classNames = child.className.split(' ');
				for (var j = 0; j<classNames.length; j++){
					if (classNames[j] == className){ 
						result.push(child);
						break;
					}
				}
			}
			return result;
		}
	}

	/* 浏览器能力检测为其添加对应的事件绑定方法 */
	function addhandler (element,type,handler){
		if(element.addEventListener){
			element.addEventListener(type, handler, false);
		}else if(element.attachEvent){
			element.attachEvent("on"+type, handler);
		}else{
			element["on"+type] = handler;
		}
	}

	/* 调整日期格式，大于10则显示。否则在之前补0 */
	function format_number(number) {
	    return number< 10 ? '0' + number : number;
	}

	/* 更新博客后获取当前时间 */
	//y:年, m:月, d:日, nows:事件戳, h:小时, t:分钟, s:秒
	var y, m, d, nows, h, t, s;
	function getTimes(){
		var myDate = new Date();
		y = myDate.getFullYear(); 
		m = format_number(myDate.getMonth()+1);
		d = format_number(myDate.getDate());
		nows = myDate.getTime();
		h = format_number(myDate.getHours());
		t = format_number(myDate.getMinutes());
		s = format_number(myDate.getSeconds());
	}

	/* 获取随机数 */
	function getRandomStr() {
	    return '' + Math.random();
	}

	/* 判断浏览器是否支持Placeholder属性 */
	function isPlaceholderSupport() {  
	    return 'placeholder' in document.createElement('input');  
	}

	/* 获取触发事件的目标 */
	function getTarget(e){
		var e = e || window.event;
	    e.target = e.target || e.srcElement;
	    return e.target;
	}

	/* 完成字符串拼接 */
	var merge = function(){
	    var args = Array.prototype.slice.call(arguments,0),
	        tpl = args.shift();
	    if(tpl){
	        return tpl.replace(/{(\d+)}/g, function($1,$2){
	            return $2<args.length?args[$2]: $1;
	        });
	    }
	    return '';
	};

	/* 博客模板 */
	function createNewdata(ARR, topStr){
		//私有日志标志
		var privateImg = ARR.allowView == 10000 ? '<img src="./images/people.png" style="display:inline;margin-right: 5px;">' : '';
		return merge('<li class="u-box bd-3 bd-6 f-pr style="z-index:'+zIndex+'"><div class="u-hd-1 f-cb"><div class="u-cb f-fl"><input check-id={0} type="checkbox" name="choice"/></div>'+
			'<div class="u-tt f-fl">{1}<a class="f-ib" href="">{2}</a></div><div class="u-more cl-2 f-fr f-pr " more-id={3}><a class="u-more-1">更多</a>'+
			'<span class="u-btnsel f-ib f-oh f-vam"></span><div class="u-more-2 bg-0 f-dn "><a class = "delete" delete-id={4}>删除</a>'+ topStr +'</div></div>'+
			'<div class="u-ed f-fr"><a class="u-ed-1" edit-id={5}>'+'编辑</a></div></div><div class="u-hd-2 cl-4"><span class="u-time f-ib"><span class="u-time-1 f-ib">'+
			'{6}</span>&nbsp;<span class="u-time-2 f-ib">{7}</span></span><span class="u-read f-ib">阅读{8}</span><span class="u-com f-ib">评论{9}</span></div></li>',
			ARR._id, privateImg, ARR.title, ARR._id, ARR._id, ARR._id, ARR.shortPublishDateStr, ARR.publishTimeStr, ARR.accessCount, ARR.commentCount); 
	}

	//包含博客内容的盒子
	var box = getByClass(document, "m-po")[0];

	/* 取消显示下拉项 */
	function toNone(i){
		var moreLabel = getByClass(box, "u-more");
		var moredropdown = getByClass(box, "u-more-2");
		moreLabel[i].className = "u-more cl-2 f-fr f-pr";
		moredropdown[i].className = "u-more-2 bg-0 f-dn";
	}

	/* 刷新更新博客数据 */
	var topArr = [];
	function refresh(topValues){ 
		var newdata = '';
		for(var i = 0, l = topArr.length; i<l; i++){
			var topStr1;
			topStr1 = '<a class = "untop" cancel-id="' + topValues[i] +'">取消置顶</a>';
			newdata += createNewdata(topArr[i], topStr1);
		}
		for(var i = 0, l = arr1.length;i<l;i++){
			if(arr1[i].rank == 0){
				var topStr2 = '<a class = "top" top-id="' + arr1[i]._id +'">置顶</a>';
				newdata += createNewdata(arr1[i], topStr2);
			}
		}
		return newdata;
	}

	/* 生成xhr对象，兼容低版本IE浏览器 */
	function createXHR() {  
	    if (typeof XMLHttpRequest != "undefined") {
	        return new XMLHttpRequest();
	    }else if(typeof ActiveXObject != "undefined"){    	
	    	if (typeof arguments.callee.activeXString != "string") {
	    		var versions = ["MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp"];
	    		var i,len;
	    		for(i = 0, len=versions.length; i<len; i++){
	    			try{
	    				new ActiveXObject(versions[i]);
	    				arguments.callee.activeXString = versions[i];	    				
	    				break;
	    			}catch(ex){	   
	    				console.log(ex); 				
	    			}
	    		}
	    	}
	    	return new ActiveXObject(arguments.callee.activeXString);
		}else{
			throw new Error("No XHR object available.");
		}
	}

	/* 封装的ajax方法 */
	function ajax(url, callback) {
	    var xhr = createXHR();
	    xhr.open("GET", url, true);  
	    xhr.onreadystatechange = function () {
	        if (xhr.readyState === 4 ){
				if ((xhr.status >= 200 && xhr.status <300) || xhr.status == 304) {
					callback(xhr.responseText);
				} else {
					alert('GET (' + url + '): ERROR');
				}
			}
	    };
	    xhr.send(null);
	}

/************************************************************************页面逻辑部分*******************************************************************/	

	var oBox1 = document.getElementById("ul2");
	var oBox2 = document.getElementById("u-srb");
	var data1 = '';
	var data2 = '';
	var arr1, arr2;
	//currentBlog是判断当前是修改博客还是发布新的博客
	var currentBlog = false;
	var newArr1;
	var MultiDelete = getByClass(box, "u-btn-4")[0];
	var currentI;
	//topValues当前置顶博客_id值
	var topValues = [];
	var blockValue;
	//更多是否存在块级显示
	var blockFlag = false;
	//新发布多少篇博客
	var publishValue = 0;
	//IE低版本z-index失效
	var zIndex = 90;
	/* 选项卡切换 */
	var oUl1 = getByClass(box, "ul1")[0];
	var oLi = oUl1.getElementsByTagName('li');			
	var oDiv = getByClass(box, "liDiv");
	for(var i = 0, l = 2; i<l; i++){
		oLi[i].index = i;
		oLi[i].onclick = function(){
			for(var i = 0;i<2;i++){
				oLi[i].className = "liNone";
				oDiv[i].className = "liDiv f-dn";
	        }
			this.className = "liBlock";
			oDiv[this.index].className = "liDiv f-db";
		};
	}

	/* 检测文本框的值并对其进行处理 */
	var uIpt1 = getByClass(box, "u-ipt-1")[0];
	var uIpt2 = getByClass(box, "u-ipt-2")[0];	
	//兼容IE低版本不支持placeholder
	if(!isPlaceholderSupport()){
		if(uIpt1.value != '日志标题'){
			uIpt1.value = '日志标题';
		}
		uIpt2.value = '这里可以写日志哦~';
	}
	var onCLICK = function(){
		if(isPlaceholderSupport()){
			if(this.placeholder == '日志标题' || '这里可以写日志哦~'){
				this.placeholder = '';
			}	
		}else{
			if(this.value == '日志标题' || '这里可以写日志哦~'){
				this.value = '';
			}
		}				
	}
	var onBLUR = function(){
		if((this.value == '') && (this == uIpt1)){
			if(isPlaceholderSupport()){
				this.placeholder = '日志标题';
			}else{
				this.value = '日志标题';
			}
		}
		if((this.value == '') && (this == uIpt2)){
			if(isPlaceholderSupport()){
				this.placeholder = '这里可以写日志哦~';
			}else{
				this.value = '这里可以写日志哦~';
			}
		}
	}
	addhandler(uIpt1, 'click', onCLICK);
	addhandler(uIpt1, 'blur', onBLUR);
	addhandler(uIpt2, 'click', onCLICK);
	addhandler(uIpt2, 'blur', onBLUR);

	/* 发布文章 */ 
	var uBtn1 = getByClass(box, "u-btn-1")[0];
	addhandler(uBtn1, "click", function(e){
		if(uIpt1.value == "" || uIpt2.value == "" || uIpt1.value == '日志标题' || uIpt2.value == '这里可以写日志哦~'){
			alert("日志标题与内容均不能为空！");
			return;
		}else{
			ajax("http://fed.hz.netease.com/api/addBlog",function(obj){
				if(obj == 1){
			    	if(currentBlog){
			    		//修改博客
			    		newArr1.title = uIpt1.value;
			    		newArr1.content = uIpt2.value;
			    		newArr1.modifyTime += 1;
			    		getTimes();		    		
			    		newArr1.publishTime = nows;
			    		newArr1.shortPublishDateStr = y + "-" + m + "-" + d;
			    		newArr1.publishTimeStr = h + ":" + t + ":" + s;
			    		for(var i = 0, l = arr1.length; i < l; i++){
							if (arr1[i]._id == newArr1._id) {
								arr1.splice(i, 1);
								break;
							}
						}
						arr1.unshift(newArr1);
						oBox1.innerHTML = refresh(topValues);
			    	}else{
			    		var newArr2 = {
					        accessCount: "0",
					        allowView: "-100",
					        classId: "fks_087070087083080074084082074065092095088064093",
					        className: "默认分类",
					        commentCount: "0",
					        comments: "null",
					        content: uIpt2.value,
					        id: getRandomStr(),
					        ip: "114.113.197.132",
					        isPublished: "1",
					        lastAccessCountUpdateTime: "0",
					        modifyTime: "0",
					        publisherId: "0",
					        publisherNickname: "null",
					        publisherUsername: "null",
					        rank: "0",
					        recomBlogHome: "false",
					        title: uIpt1.value,
					        userId: "289939",
					        userName: "force2002",
					        userNickname: "悟空空",
					        _id: -1-publishValue
					    };
					    getTimes();
			    		newArr2.publishTime = nows;
			    		newArr2.shortPublishDateStr = y + "-" + m + "-" + d;
			    		newArr2.publishTimeStr = h + ":" + t + ":" + s;	
						arr1.unshift(newArr2);
						oBox1.innerHTML = refresh(topValues);
						publishValue++;
			    	}
			    	if(isPlaceholderSupport()){
			    		uIpt1.value = "";
						uIpt2.value = "";
						uIpt1.placeholder = '日志标题';
						uIpt2.placeholder = '这里可以写日志哦~';
					}else{
						uIpt1.value = "日志标题";
						uIpt2.value = "这里可以写日志哦~";
					}		    	
				}else{
					alert("发布失败");
				}
			});
	    }
	})
	/* 发布文章结束 */ 

	/* 清空文本框 */
	var uBtn2 = getByClass(box, "u-btn-2")[0];
	var onCLEAR = function(){
		uIpt1.value = '';
		uIpt2.value = '';
		if(isPlaceholderSupport()){
			uIpt1.placeholder = '日志标题';
			uIpt2.placeholder = '这里可以写日志哦~';
		}else{
			uIpt1.value = '日志标题';
			uIpt2.value = '这里可以写日志哦~';
		}
	}
	addhandler(uBtn2,'click',onCLEAR);
	/* 清空文本框结束 */

	/* 获取博客信息 */
	var createLi = function(res){
		if(window.JSON){
			arr1 = JSON.parse(res);
		}else{
			arr1 = eval('(' + res + ')');
		}
		for(var i = 0, l = arr1.length; i<l; i++){
			arr1[i]._id = i;
		}
		for(var i = 0, l = arr1.length; i < l; i++){
			//生成私有日志标志
			var privateImg = arr1[i].allowView == 10000 ? '<img src="./images/people.png" style="display:inline;margin-right: 5px;">' : '';
			data1 += merge('<li class="u-box bd-3 bd-6 f-pr" style="z-index:'+zIndex+'"><div class="u-hd-1 f-cb"><div class="u-cb f-fl"><input check-id={0} type="checkbox" name="choice"/>'+
				'</div><div class="u-tt f-fl">{1}<a class="f-ib" href="">{2}</a></div><div class="u-more cl-2 f-fr f-pr " more-id={3}><a class="u-more-1">更多</a>'+
				'<span class="u-btnsel f-ib f-oh f-vam"></span><div class="u-more-2 bg-0 f-dn "><a class = "delete" delete-id={4}>删除</a><a class = "top" top-id={5}>'+
				'置顶</a></div></div><div class="u-ed f-fr"><a class="u-ed-1" edit-id={6}>'+'编辑</a></div></div><div class="u-hd-2 cl-4"><span class="u-time f-ib">'+
				'<span class="u-time-1 f-ib">{7}</span>&nbsp;<span class="u-time-2 f-ib">{8}</span></span><span class="u-read f-ib">阅读{9}</span><span class="u-com f-ib">'+
				'评论{10}</span></div></li>', arr1[i]._id, privateImg, arr1[i].title, arr1[i]._id, arr1[i]._id, arr1[i]._id, arr1[i]._id, arr1[i].shortPublishDateStr, 
				arr1[i].publishTimeStr, arr1[i].accessCount, arr1[i].commentCount);
			zIndex--;
		} 		
		oBox1.innerHTML += data1;
	}
	/* 获取博客信息结束 */	

	/* 好友动态 */
	var createDiv = function(res){
		if(window.JSON){
			arr2 = JSON.parse(res);
		}else{
			arr2 = eval('(' + res + ')');
		}
		for(var i = 0, l = arr2.length; i < l; i++){
			data2 += merge('<div class="u-rcm bg-1 f-fl"><div class="f-fl"><a href=""><img style="width:40px;height:40px;" src="./images/friend_pic.png"/>'+
				'</a></div><div class="f-fl"><strong class="u-rtt f-db"><a >{0}</a></strong><div class="u-rcon f-oh"><span class="cl-5 f-toe" href="">'+
				'{1}</span></div></div></div>',arr2[i].userName, arr2[i].title);
		}
		oBox2.innerHTML = data2;
	}
	/* 好友动态结束 */

	/* 博客部分事件代理 */
	addhandler(oBox1, "click", function(e){
		getTarget(e);
		if(e.target && e.target.className == "u-ed-1"){
			edit(e);
		}
		if(e.target && e.target.className == "u-more-1"){	
			moreBlock(e);
		}
		if(e.target && e.target.className == "top"){
			topBlog(e);
		}
		if(e.target && e.target.className == "untop"){
			untopBlog(e);
		}
		if(e.target && e.target.className == "delete"){
			deleteBlog(e);
		}
	});

	/* 编辑文章 */
	function edit(e){
		ajax("http://fed.hz.netease.com/api/editBlog",function(obj){
			if(obj == 1){
				for(var i = 0, l = arr1.length; i < l; i++){
					if (arr1[i]._id == e.target.getAttribute("edit-id")) {
						uIpt1.value = arr1[i].title;
						uIpt2.value = arr1[i].content;
						currentBlog = true;
						newArr1 = arr1[i];
						break;
					}				
				}
			}else{
				alert("编辑失败");
			}
		});	
	}
	/* 编辑文章结束 */

	/* 更多，下拉选项 */		
	function moreBlock(e){
		var pattern=/u-more-block/;
		var parentsNode = e.target.parentNode;
		for(var i = 0, l = arr1.length; i<l; i++){
			toNone(i);
		}
		for(var j = 0, l = arr1.length; j < l; j++){
			var moreLabel = getByClass(box, "u-more");
			var moredropdown = getByClass(box, "u-more-2");
			if (arr1[j]._id == parentsNode.getAttribute("more-id")) {
				if(!pattern.test(moreLabel[j].className)){
					parentsNode.className = "u-more cl-2 f-fr f-pr u-more-block";
					parentsNode.childNodes[2].className = "u-more-2 bg-0 f-db";
					for(var i = 0, l = moreLabel.length; i<l; i++){
						if(parentsNode.getAttribute("more-id") == moreLabel[i].getAttribute("more-id")){
							blockValue = i;
							break;
						}
					}
					blockFlag = true;
					break;
				}
			}	
		}
	}
	/* 更多,下拉选项结束 */

	/* 取消块级显示 */
	addhandler(document, "click", function(e){
		getTarget(e);
		if (blockFlag) {
			if (e.target && e.target.className != "u-more-1") {
				toNone(blockValue);
				blockFlag = false;
			}
		}
	})
	/* 取消块级显示结束 */

	/* 置顶显示 */
	function topBlog(e){
		for(var i = 0, l = arr1.length; i < l; i++){
			if (arr1[i]._id == e.target.getAttribute("top-id")) {				
				arr1[i].rank = 5;
				topValues.unshift(arr1[i]._id);
				topArr.unshift(arr1[i]);
				topBlogAJAX();
				break;
			}	
			toNone(i);
		}
	}
	function topBlogAJAX(){
		ajax("http://fed.hz.netease.com/api/topBlog",function(obj){
			if(obj == 1){
				oBox1.innerHTML = refresh(topValues);
			}else{
				alert("置顶失败");
			}
		});
	}
	/* 置顶显示结束 */

	/* 取消博客置顶 */
	function untopBlog(e){
		for(var i = 0, l = arr1.length; i < l; i++){
			if (arr1[i]._id == e.target.getAttribute("cancel-id")) {
				for(var j = 0, l = topArr.length; j<l; j++){
					if (topArr[j]._id == arr1[i]._id) {
						topArr.splice(j, 1);
						topValues.splice(j,1);
						break;
					}
				}		
				arr1[i].rank = 0;				
				untopBlogAJAX();
				break;
			}
		}
	}
	function untopBlogAJAX(){
		ajax("http://fed.hz.netease.com/api/untopBlog",function(obj){
			if(obj == 1){
				var newData4;
				oBox1.innerHTML = refresh(topValues);
			}else{ 
				alert("取消置顶失败");
			}
		});
	}
	/* 取消置顶结束 */

	/* 删除文章 */
	function deleteBlog(e){
		for(var i = 0, l = arr1.length; i < l; i++){
			if (arr1[i]._id == e.target.getAttribute("delete-id")) {
				ajax("http://fed.hz.netease.com/api/deleteBlogs",function(obj){
					if(obj == 1){
						deleteBlogs(i);
					}else{
						alert("删除失败");
					}	
				});
				toNone(i);
				break;
			}				
		}
	}
	var deleteBlogs = function(ids){	
		if(ids !== null && ids !== "" && ids !== []){
			//单个删除
			if(!isNaN(ids)){
				if(arr1[ids].rank == 0){
					arr1.splice(ids, 1);
				}else{
					for(var i = 0, l = topArr.length; i<l; i++){
						if(arr1[ids]._id == topArr[i]._id){
							topArr.splice(i, 1);
							arr1.splice(ids, 1);
						}
					}
				}			
			}else{
			//多选删除
				var k = 0, kk = 0;
				var ll = 0;
				if(topValues != []){
					ll = topArr.length;
				}
				for(var j = 0, l = topArr.length; j < l; j++){		
					if(ids[j-kk] <= ll && allvalue[j].checked == true){
						topArr.splice(j-kk, 1);
						topValues.splice(j, 1);
						ids.splice(j-kk, 1);
						kk++;
					}			
				}
				for(var i = 0, l = (ids.length+ll); i < l; i++){		
					if(arr1[i-k].rank == 0 && allvalue[i+ll].checked == true){		
						arr1.splice(ids[i-k]-ll, 1);				
						k++;
					}
				}
			}
			oBox1.innerHTML = refresh(topValues);
		}	
	}
	/* 删除文章结束 */

	/* 底部多选删除 */
	var zIndexValue = 0;
	addhandler(MultiDelete,"click",function(e){
		var ids = [];	
		for (var i = 0, l = allvalue.length; i < l; i++) {     
	        if (allvalue[i].type == "checkbox" && allvalue[i].checked == true){
	    		ids.push(i);        	
	        }
	    }
	    deleteBlogs(ids);
	})
	/* 底部多选删除结束 */

	/* 博客部分事件代理结束 */

	/* 多选框全选反选功能 */
	var allvalue = document.getElementsByName("choice"); 
	var checkFlag = false;  
	var allCheck = function() {  	    
	    for (var i = 0, l = allvalue.length; i<l; i++) {     
		    if (allvalue[i].type == "checkbox"){
		    	if(checkFlag == false){
		    		for (var i = 0, l = allvalue.length; i<l; i++) { 
		    			allvalue[i].checked = true;  
		    		}
		    		checkFlag = true;
		    	}else{
		    		for (var i = 0, l = allvalue.length; i<l; i++) { 
		    			allvalue[i].checked = false; 
		    		}
		    		checkFlag = false;
		    	}
		    } 
		}
	} 
	var checkAll = document.getElementById("checkall");
	addhandler(checkAll, 'click', allCheck);
	/* 多选框全选反选功能结束 */

	var xhr1 = ajax("http://fed.hz.netease.com/api/getblogs",createLi); 
	var xhr2 = ajax("http://fed.hz.netease.com/api/getFriendsLatestBlogs",createDiv);

	/* 好友列表滚动显示 */
	function startScroll(topHeight, interval, delay){ 
		var timer; 
		var flag = false;
		oBox2.onmouseover = function(){
			flag = true;
		} 
		oBox2.onmouseout = function(){
			flag = false;
		} 
		oBox2.scrollTop = 0; 
		function start(){ 
			if(!flag){ 
				oBox2.scrollTop += 1;
			} 
			timer = setInterval(scrolling, interval); 		
		} 
		function scrolling(){
			if((oBox2.scrollTop%topHeight != 0) && !flag){
				oBox2.scrollTop += 1; 
				if(oBox2.scrollTop >= oBox2.scrollHeight/2){
					oBox2.scrollTop = 0;
				} 
			}else{
				clearInterval(timer); 
				setTimeout(start,delay); 
			} 
		} 
		setTimeout(start, delay); 
	}
	/* 好友列表滚动显示结束 */

	//每40ms向上移动1px，移动距离等于51px之后，暂停定时器，2000ms之后再调用
	startScroll(51, 40, 2000);
})()
