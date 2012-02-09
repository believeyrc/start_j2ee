/**   *    * @param {} conf   * @param {} url   *    * @extend isExpandAllNode true 展开全部森林以及子   * @extend maskCfg  {scope:xxx,msg:xxx}   屏蔽罩 配置   *    * @extend syncMaskTree 同步屏蔽罩 目标树的引用   * @extend syncAimTree 设置目标同步树的 this['syncMaskTree'] 该属性   *                      该属性为 true 则保留开关屏蔽罩逻辑 但不拥有开关权利   */  TreePanelFil = function(conf, url,params) {             var scope = this;              this['tpStack'] = -1 ;//用于 mask 屏蔽罩的控制 标识树完全展开时 为-1       this['maskLock'] = false ; //用于 mask 屏蔽罩的控制  树还在屏蔽中为 true             /*1.用于 mask 屏蔽罩的控制 为true时 表示该组件被其他 对象同步了屏蔽罩 哪么 开启关闭效果由对方操作       *2.本组件 仍保留 开启关闭 屏蔽罩的逻辑 由this['tpStack'] this['maskLock']两参数体现出      *3.屏蔽罩的 关闭 应由所有      */      this['syncAimTree'] = false ;              var src = url == null ? '#' : url;       var treeData = new Ext.tree.TreeLoader({   		url : src,   		requestMethod : 'POST',   		baseParams:params   	});         var config = {             width : '100%',           split : true,           border : false,           folderSort : true,           autoScroll : true,           loader : treeData,           rootVisible : false,           root : new Ext.tree.AsyncTreeNode({   			text : '过滤器类型',   			url : src,   			expanded : true  		})       }         Ext.apply(config, conf);         TreePanelFil.superclass.constructor.call(this, config);                  treeData.on('beforeload', function(treeLoader, node) {   			if( conf.maskCfg!=null && conf.isExpandAllNode==true ){   				 scope.startupListenMask(conf.maskCfg);   			}   			if( conf.maskCfg!=null && conf.isExpandAllNode==false ){   				 scope.openMask(conf.maskCfg);   			}      			   			var id = node.attributes.id;   			var para = {id:id};   			   			Ext.apply(treeLoader.baseParams , para);   			if( treeLoader.baseParams == null ){   				treeLoader.baseParams = para;   			}   			   			treeLoader.url = node.attributes.url;   			   			return true;           }, treeData);                          treeData.on('load' , function(treeLoader,node,response){   			if(conf.isExpandAllNode){          					scope.expandNodeAll( scope.getRootNode(),0 );   					scope.noteChangeBeforeRoots();   			}   			   			if( conf.maskCfg!=null && conf.isExpandAllNode==false ){   				scope.closeMask(conf.maskCfg);   			}           },treeData);                  }     Ext.extend(TreePanelFil, Ext.tree.TreePanel, {     	//重新加载数据    	reloadData : function(params) {   		var scope = this;   		var root = this.getRootNode();   		var treeLoad = this.getLoader();   			   		if( params!=null )   		treeLoad.baseParams = params;   		   		treeLoad.load(root, function(){});   		   		this.expandAll();   	},   	/**  	 * @private  	 * 监听 屏蔽罩 在适当的时候关闭  	 * 1.在树完全展开后关闭  	 * @param {} mask  	 * @param {} msg  	 */  	startupListenMask : function( maskCfg){   						var scope = this;   		this['tpStack'] = 0 ;   		scope.openMask(maskCfg);   		var interval = setInterval(function() {   			if ( scope['tpStack'] == -1 ) {   				   					scope.closeMask(maskCfg);   					scope['maskLock'] = false;   					clearInterval(interval);   			}   		}, 200);   	},   	/**  	 * @private  	 * 开启屏蔽罩  	 * @param {} maskCfg  	 */  	openMask : function(maskCfg){   		   		this['maskLock'] = true;   		if( this['syncAimTree']!=true ){   			maskCfg.scope.el.mask( maskCfg.msg );   		}   	},   	/**  	 * @private  	 * 关闭屏蔽罩  	 * @param {} maskCfg  	 */  	closeMask : function(maskCfg){   		   		var scope = this ;    		if( scope['syncMaskTree']!=null ){     			var interval = setInterval(function() {   					if ( scope['syncMaskTree'].isRescindLockMask() ) {   						   if( this['syncAimTree']!=true ){   							maskCfg.scope.el.unmask(true);   						   }   							clearInterval(interval);   					}   				}, 200);   		}else{   			if( this['syncAimTree']!=true ){   				maskCfg.scope.el.unmask(true);   			}   			this['maskLock'] = false;   		}   	},   	   	/**  	 * @public  	 * 获取 该树是否已经解除 屏蔽罩  	 */  	isRescindLockMask : function(){   		   		if( this['tpStack']==-1 && this['maskLock'] == false ){   			return true ;   		}else{   			return false ;   		}   		   	},   	   	/**  	 * @public  	 * 与其他树组件 同步屏蔽罩  	 * @param {} tree  	 * @param {} maskCfg  	 */  	syncListenMask : function(tree){   					 this['syncMaskTree'] = tree;   		 tree.setAmiSynListenMask();   	},   	   	/**  	 * 设置目标同步树的 this['syncMaskTree'] 该属性  	 * 该属性为 true 则保留开关屏蔽罩逻辑 但不拥有开关权利  	 *   	 */  	setAmiSynListenMask : function(){   		   		this['syncAimTree'] = true ;   	},   	   	/**  	 * 展开所有的 节点  	 */  	expandNodeAll : function(rootNode,index) {   			   		this['tpStack'] =  this.setTpStack(index);   		   		var scope = this;   		rootNode.expand(true);   		var childs = rootNode.childNodes;   		for (var i = 0; i < childs.length; i++) {   			this['tpStack'] = scope.expandNodeAll(childs[i], (index+1)  );   		}   		   		this['tpStack'] =  this.setTpStack(index);   		if( this['tpStack'] ==  0 )   			this['tpStack'] = -1;   	},   	   	setTpStack : function(inx){   		   		var tmp = this['tpStack'];   		this['tpStack'] = inx ;   		return this['tpStack'];   	},   	/**  	 * 过滤显示节点  	 *   	 * @param {}  	 *            text  	 */  	filterNodeByText : function(text) {   		var scope = this;   		if (this[this.id + 'filterNode'] == null) {   			this[this.id + 'filterNode'] = new Ext.tree.TreeFilter(   					this, {   						clearBlank : true,   						autoClear : true  					});   		}   		var filter = this[this.id + 'filterNode'];   		this.expandAll();   		filter.filterBy(function(n) {   			if (text == null)   				return true;   			if (text == "")   				return true;   			var str = n.attributes.text;   			var newStr = str.substring(0, text.length);   			if (newStr == text)   				return n;   			if (n.childNodes != null && n.childNodes.length > 0) {   				return scope.filterParse(n, text);   			} else  				return false;   		});   	},   	/**  	 * 该方法必须配合 Ext.tree.TreeFilter 组件使用 递归过滤解析 like 匹配 如果所有子及无限级下级的子  	 * 没有匹配则返回false  	 *   	 * @return 返回  	 */  	filterParse : function(node, text) {   		var str = node.attributes.text;   		var newStr = str.substring(0, text.length);   		if (newStr == text)   			return node;   		var nodes = node.childNodes;   		if (nodes == null)   			return false;   		var tNode = null;   		for (var i = 0; i < nodes.length; i++) {   			if ((tNode = this.filterParse(nodes[i], text))) {   				return tNode;   			}   		}   		return false;   	}   });  