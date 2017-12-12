function screnWH(){
  var scrW, scrH;
  if (window.innerHeight && !isNaN(window.scrollMaxY)) {
    // Mozilla
    scrW = window.innerWidth + window.scrollMaxX;
    scrH = window.innerHeight + window.scrollMaxY;
  } else if (document.body.scrollHeight > document.body.offsetHeight) {
    // all but IE Mac
    scrW = document.body.scrollWidth;
    scrH = document.body.scrollHeight;
  } else if (document.body) { // IE Mac
    scrW = document.body.offsetWidth;
    scrH = document.body.offsetHeight;
  }

  var windowW, windowH;
  if (window.innerHeight) { // all except IE
    windowW = window.innerWidth;
    windowH = window.innerHeight;
  } else if (document.documentElement
      && document.documentElement.clientHeight) {
    // IE 6 Strict Mode
    windowW = document.documentElement.clientWidth;
    windowH = document.documentElement.clientHeight;
  } else if (document.body) { // other
    windowW = document.body.clientWidth;
    windowH = document.body.clientHeight;
  }

  // for small pages with total size less then the viewport
  return {
    winW : (scrW < windowW) ? windowW : scrW,
    winH : (scrH < windowH) ? windowH : scrH
  }

}

var current;//存激活状态的框体
var moduleAll = [];//已生成的所有框体
/*******    点击桌面  **********/
function creatWindow(obj){
  var list = obj.list;
  var isMoreWin = false;
  if(!list.icon){//没有icon
    list.icon = '/images/6.png';
  }
  this.module = moduleBox(this, isMoreWin, list);
  this.nav = navBox(this,isMoreWin,list);
  this.module.nav = this.nav;
  this.nav.module = this.module;

  /*点击桌面图标*/
  if(current){//再次点击创建新的module，让前一个失去激活状态
    loseForce();
  }

  this.module.show = true;//属性:是否显示
  this.module.removeClass('notShow');

  current = this.module;
  Force();
}

/*******    创建窗口函数  **********/
var winS = {}, navS = {};
function moduleBox(deskIcon, isMore, list) {
  var ID = 'window' + list.id;
  var cadcWin;
  if (isMore) {//能创建多个窗口
      cadcWin = new Cadc(list);//.title,list.icon,ID
      moduleAll.push(cadcWin);
  } else {//不能创建多个窗口
    if (!winS[ID]) {//不存在
        cadcWin = new Cadc(list);
        deskIcon.module = cadcWin;
        winS[ID] = cadcWin;
        moduleAll.push(cadcWin);
    }else{
        deskIcon.module = winS[ID];
    }

  }

  return cadcWin || deskIcon.module;
}

/*******    创建导航栏函数  **********/
function navBox(deskIcon,isMore,list) {
  var cadcNav;
  var ID = 'window' + list.id;
  if(isMore){
     cadcNav = new navCadc(list);
  }else{
    if(!navS[ID]){//不存在
      cadcNav = new navCadc(list);
      deskIcon.nav = cadcNav;
      navS[ID] = cadcNav;
    }else{
      deskIcon.nav = navS[ID];
    }
  }
  return cadcNav || deskIcon.nav;
}

/*******    窗口遮罩层函数  **********/
function whChange() {
  $('.modleBlock').width(innerWidth).height(innerHeight);
  $('.desk').height(innerHeight - 40 - 39);//减去nav39
}

var mask = $('<div  class="modleBlock"></div>');
mask.css("display", "none");
whChange()
$(document.body).append(mask);

/*******    生成窗口函数  **********/
var Cadc = function(list){//titles,icon,ID
  var title = list.title,logo = list.icon,ID = 'window'+list.id;
  var winW = 0,winH = 0;//屏幕尺寸
  var gapH = 30,gapW = 2,gapT = 39;//iframe距离框图的差值，框图距离屏幕上方差值
  var minH = 600,minW = 680; //框图初始化最小尺寸
  var gapLR = 120,gapB = 30; //移动边缘框图大小

  var clickX = 0,clickY = 0; //点击时，鼠标基准值
  var baseH = 0,baseW = 0, baseLeft = 0,baseTop = 39; //点击或移动时，保存框图的基准值

  var minTAdd = 0,maxTAdd = 0; //向上拉伸尺寸，鼠标拖动的偏移量
  var minRAdd = 0,maxRAdd = 0; //向右拉伸尺寸，鼠标拖动的偏移量
  var minBAdd = 0,maxBAdd = 0; //向下拉伸尺寸，鼠标拖动的偏移量
  var minLAdd = 0,maxLAdd = 0; //向左拉伸尺寸，鼠标拖动的偏移量
  var moveLeft = 0,moveRight = 0,moveTop = 0,moveBottom = 0; //拖动框图，鼠标移动的偏移量
  var regH = 0,regW = 0, regLeft = 0,regTop = 0; //点击或移动后，保存框图各项值

    var scren = screnWH();
    winW = scren.winW; winH = scren.winH;//屏幕尺寸

    var initH = winH-gapT,initW = winW;//框图初始化尺寸
    var initLeft = 0,initTop = gapT;//框图初始化位置
    var initRleft = 100,initRtop = 100;//框图还原初始化位置
    var root = $('<div>',{'class':'allWindow'});
    root.addClass(ID);

    root.height(initH).width(initW);
    root.css({'left':initLeft,'top':initTop});
    root.fullScreen = true;
    var btnType = {
      'minus':'最小化',
      'plus':'最大化',
      'paste':'还原',
      'close':'关闭'
    };



    $(window).on("resize",function(){//屏幕高宽随时改变
      screnWH();
    });

    function CreateBox(className) {//8方向
      var dragbox = $("<div>",{'class':className});
      root.append(dragbox);
      return dragbox;
    }

    function CreateBtn(className,type) {//按钮
      var dragbtn = $("<a>",{'class':className,'title':btnType[type]});
      dragbtn.append('<i class="block fa fa-'+type+'">'+'</i>');

      if(btnType[type] == '最大化'){
          var dragbtnMax = $("<div>",{'class':'winBtnSet winmax','title':btnType[type]});
          dragbtnMax.append(dragbtn);
          dragbtn[0].style.display = 'none';
          winCenterbtn.append(dragbtnMax);
      }else if(btnType[type] == '还原'){
          var dragbtnReg = $("<div>",{'class':'winBtnSet winreg','title':btnType[type]});
          dragbtnReg.append(dragbtn);
          winCenterbtn.append(dragbtnReg);
      }else{
            winCenterbtn.append(dragbtn);
      }
      return dragbtn;
    }

  var winTop = CreateBox("window-top");
  var winBottom = CreateBox("window-bottom");
  var winLeft = CreateBox("window-left");
  var winRight = CreateBox("window-right");
  var winleftTop = CreateBox("window-leftTop");
  var winrightTop = CreateBox("window-rightTop");
  var winleftBottom = CreateBox("window-leftBottom");
  var winrightBottom = CreateBox("window-rightBottom");

  var winCenter = CreateBox("window-center");
  $(document.body).append(root);
  root.animate({'opacity':1},'fast',function(){});
  /*按钮*/
  var winCenterbtn = $("<div>",{'class':'buttons'});
  var winMin = CreateBtn('win-min-btn','minus');
  var winMax = CreateBtn('win-max-btn','plus');
  var winReg = CreateBtn('win-max-reg','paste');
  var winClose = CreateBtn('win-close-btn','close');
  /*top*/
  var winConTop = $("<div>",{'class':'win-con-top'});
  winConTop.append(winCenterbtn);
  var winTitle = $('<div class="title">'+title+'</div>');

  /*winConTop.css({'overflow':'hidden','position':'relative'});
  var winMove = $('<div class="move" style="padding-left:30px;height:100%;width: 100%;position: absolute;top:0;left:0;right:0;box-sizing: border-box;background: transparent;" draggable="true"></div>');
  winConTop.append(winMove);*/

  winConTop.append(winTitle);
  winConTop.append(
    '<div class="winIcon">'+
      '<img src="'+logo+'">'+
    '</div>'
  );
  /*内容*/
  var winContent = $("<div class='window-content'>");
  winContent.height(initH-gapH);
  winContent.width(initW-gapW);
  var winContainer = $("<div class='window-container'>");
  winContent.append(
    '<iframe src="http://baidu.com" style="width:100%;height:100%;" frameborder="0">' +
    '</iframe>'
  );
  root.next  = winContent;
  root.nextTop  = winConTop;
  winContainer.append(winContent);
  winCenter.append(winConTop);
  winCenter.append(winContainer);


  winTop.on('mousedown',DragTop);
  winRight.on('mousedown',DragRight);
  winBottom.on('mousedown',DragBottom);
  winLeft.on('mousedown',DragLeft);

  winleftTop.on('mousedown',DragLeft);
  winleftTop.on('mousedown',DragTop);
  winrightTop.on('mousedown',DragRight);
  winrightTop.on('mousedown',DragTop);
  winleftBottom.on('mousedown',DragLeft);
  winleftBottom.on('mousedown',DragBottom);
  winrightBottom.on('mousedown',DragRight);
  winrightBottom.on('mousedown',DragBottom);
  winMax.on('click',winChange);
  winReg.on('click',winChange);
  //winConTop.on('mousedown',DragMove);

  /* 阻止被选中 */
  root[0].unselectable = "on";
  root[0].onselectstart = function () { return false; };

  /*******  选中  ***************/
  root.on('mousedown',function(){
    if(!root.active){//当前不是被激活状态
      /*前一个失去激活*/
      loseForce();
      /*激活当前*/
      current = root;
      Force();
    }
  });

  /*******  缩小  ***************/
  winMin.on('click',function(){
    /*隐藏*/
    root.addClass('notShow');
    root.show=false;

    if(root.active){//点击的是激活状态，找下一个激活状态，要求show=true；
      /*root失去激活状态*/
      loseForce();
      /*找下一个激活状态*/
      for(var i=0;i<moduleAll.length;i++){
          if(moduleAll[i].show){//显示状态
            current = moduleAll[i];//找到当前激活状态,激活
            Force();
            break;
          }//没有显示的则不找激活状态了
      }
    }
  });

  /*******  关闭  ***************/
  winClose.on('click',function(){
    /*销毁,并从数组中删除*/
    root.remove();
    root.nav.remove();
    delete winS[ID];delete navS[ID];//单选时

    var index = moduleAll.indexOf(root);
    moduleAll.splice(index,1);//从数组中删除

    if(root.active){//点击的是激活状态
      for(var i=0;i<moduleAll.length;i++){
        if(moduleAll[i].show){//显示状态
          current = moduleAll[i];//找到当前激活状态,激活
          Force();
          break;
        }//没有显示的则不找激活状态了
      }

    }
  });

  /*******  放大/还原   ***************/
  function winChange(){

    //放大状态 - 还原
    console.log('还原')
    if(root.fullScreen){
      console.log('还原')
        root.fullScreen = false;
        winReg.css({'display':'none'});
        winMax.css({'display':'block'});
        root.css({'left':regLeft || initRleft});
        root.css({'top':regTop || initRtop});
        var regHeight,regWidth;
        if(regH){
          regHeight = regH;
        }else{
          if((initH*0.7)>=minH){
            regHeight = initH*0.7;
          }else{
            regHeight = minH;
          }
        }

        if(regW){
          regWidth = regW;
        }else{
          if((initW*0.7)>=minW){
            regWidth = initW*0.7;
          }else{
            regWidth = minW;
          }
        }

        root.height(regHeight);
        root.next.height(regHeight-gapH);
        root.width(regWidth);
        root.next.width(regWidth-gapW);
    }
    //还原状态 -- 放大
    else{
        root.fullScreen = true;
        winMax.css({'display':'none'});
        winReg.css({'display':'block'});
        root.height(winH-gapT);//减去nav
        root.width(winW);
        root.css({'left':0});
        root.css({'top':gapT});
        root.next.height(winH-gapT-gapH);
        root.next.width(winW-gapW);
    }
    if(!root.active){//当前不是激活状态，将其激活，前一个激活失效
      //前一个激活失效
      loseForce();
      //当前激活，
      current = root;
      Force();
    }
  }

  /*******  移动 ***************/
  //判断双击
  winTitle.on('mousedown',function(e){
      clickX = e.clientX;
      clickY = e.clientY;
      DragMove();
      var self = this;
      if(self.clicked){//双击
        self.clicked = false;
        winChange();
      }else{
        self.clicked = true;
        setTimeout(function(){
          self.clicked = false;
        },200)
      }
  });

  var minForce,maxForce;
  function DragMove(e){
    window.mask.css("display", "block");
    //if(e.target.className != "title") return false;
    baseW = root.width();
    baseH = root.height();
    baseLeft = parseInt(root.css('left'));
    baseTop = parseInt(root.css('top'));
    moveTop = root[0].offsetTop-gapT;
    /*moveLeft = root[0].offsetLeft;
    moveRight = winW-root[0].offsetLeft-baseW;
    moveBottom = winH-root[0].offsetTop-baseH;*/

    moveLeft = root[0].offsetLeft+baseW-gapLR;
    moveRight = winW-root[0].offsetLeft-gapLR;//winW-root[0].offsetLeft-baseW+(baseW-120)
    moveBottom = winH-root[0].offsetTop-gapB;//winH-root[0].offsetTop-baseH+(base-30)

    minForce = winW-(baseW+5);
    maxForce = winW-(baseW-5);

    $(window).bind('mouseup',EndDragMove);
    if(!root.fullScreen){//全屏不移动
      $(window).bind('mousemove',DoDragMove);
    }
  }
  function DoDragMove(e){
    var addX = e.clientX  - clickX;
    var addY = e.clientY  - clickY;
    var left = 0, top = 0;
    if(addY<0){//上移 addLength负值
      addY*=(-1);//上移，偏移量-100；
      if(addY>moveTop){//上边越界
        top = gapT;
      }else{
        top = baseTop-addY;
      }
    }else{//下移 addLength正值
      if(addY>moveBottom){//下边越界
        top = winH-gapB;//top = winH-baseH;
      }else{
        top = baseTop+addY;
      }
    }
    root.css({'top':top+'px'});
    regTop = top;

    if(addX<0){//左移 addLength负值
        addX*=(-1);//左移，偏移量-100；
        if(addX>moveLeft){//左边越界
          left = (baseW-gapLR)*(-1);//left = 0;
        }else{
          left = baseLeft-addX;
        }
    }else{//右移 addLength正值
        if(addX>moveRight){//右边越界
          left = winW-gapLR;//left = winW-baseW;
        }else{
          left = baseLeft+addX;
        }
    }

    /*左右5px 吸附*/
    if(left>=(-5) && left<=5){
      left = 0;
    }
    if(left >= minForce && left <= maxForce){
      left = winW-baseW;
    }
    root.css({'left':left+'px'});
    regLeft = left;
  }

  function EndDragMove(){
    window.mask.css("display", "none");
    $(window).unbind('mousemove',DoDragMove);
    $(window).unbind('mouseup',EndDragMove);
  }

  /*******  下 ***************/
  function DragBottom(e){
    if(root.fullScreen){
      return false;
    }
    window.mask.css("display", "block");
    clickY = e.clientY;
    baseH = root.height();
    minBAdd = clickY-(minH+root[0].offsetTop);//偏移量最小值
    maxBAdd = winH-(baseH+root[0].offsetTop);//偏移量最大值+20
    $(window).bind('mousemove',DoDragBottom);
    $(window).bind('mouseup',EndDragBottom);
  }
  function DoDragBottom(e){
      var addLength = e.clientY  - clickY;
      var length = 0;
      if(addLength>0){//下拉
        if(addLength>maxBAdd){//下边越界
          length = baseH+maxBAdd;
        }else{
          length = baseH+addLength;
        }
      }else{//上移
        addLength*=(-1);//左移，偏移量-100；
        if(addLength>minBAdd){//超过最小高
          length = minH;
        }else{
          length = baseH-addLength;
        }
      }
      root.height(length);
      root.next.height(length-gapH);
      regH = length;
  }
  function EndDragBottom(){
    window.mask.css("display", "none");
    $(window).unbind('mousemove',DoDragBottom);
    $(window).unbind('mouseup',EndDragBottom);
  }

  /*******  右 ***************/
  function DragRight(e){
    if(root.fullScreen){
      return false;
    }
    window.mask.css("display", "block");
    clickX = e.clientX;
    baseW = root.width();
    minRAdd = clickX-(minW+root[0].offsetLeft);//偏移量最小值
    maxRAdd = winW-(baseW+root[0].offsetLeft);//偏移量最大值,不越过滚轮+20
    $(window).bind('mousemove',DoDragRight);
    $(window).bind('mouseup',EndDragRight);
  }
  function DoDragRight(e){
    var addLength = e.clientX  - clickX;
    var length = 0;
    if(addLength>0){//右移
        if(addLength>maxRAdd){//右边越界
            length = baseW+maxRAdd;
        }else{
            length = baseW+addLength;
        }
    }else{//左移
        addLength*=(-1);//左移，偏移量-100；
        if(addLength>minRAdd){//超过最小宽
            length = minW;
        }else{
            length = baseW-addLength;
        }
    }
    root.width(length);
    root.next.width(length-gapW);
    regW = length;
  }
  function EndDragRight(){
    window.mask.css("display", "none");
    $(window).unbind('mousemove',DoDragRight);
    $(window).unbind('mouseup',EndDragRight);
  }

  /*******  左  ***************/
  function DragLeft(e){
    if(root.fullScreen){
      return false;
    }
    window.mask.css("display", "block");
    clickX = e.clientX;
    baseW = root.width();
    minLAdd = baseW-minW;//偏移量最小值
    maxLAdd = root[0].offsetLeft;//偏移量最大值
    baseLeft = parseInt(root.css('left'));
    $(window).bind('mousemove',DoDragLeft);
    $(window).bind('mouseup',EndDragLeft);
  }
  function DoDragLeft(e){
    var addLength = e.clientX  - clickX;
    var length = 0;
    var left = 0;
    if(addLength<0){//左移 addLength负值
      addLength*=(-1);//左移，偏移量-100；
      if(addLength>maxLAdd){//左边越界
        length = baseW+maxLAdd;//length = baseW+maxLAdd-10
        left = 0;
      }else{
        length = baseW+addLength;
        left = baseLeft-addLength
      }
    }else{//右移 addLength正值
      if(addLength>minLAdd){//超过最小宽
        length = minW;
        left = minLAdd+maxLAdd;
      }else{
        length = baseW-addLength;
        left = baseLeft+addLength
      }
    }
    root.width(length);
    root.css({'left':left+'px'});
    root.next.width(length-gapW);
    regW = length;
    regLeft = left;
  }
  function EndDragLeft(){
    window.mask.css("display", "none");
    $(window).unbind('mousemove',DoDragLeft);
    $(window).unbind('mouseup',EndDragLeft);
  }

  /*******  上  ***************/
  function DragTop(e){
    if(root.fullScreen){
      return false;
    }
    window.mask.css("display", "block");
    clickY = e.clientY;
    baseH = root.height();
    minTAdd = baseH-minH;//偏移量最小值
    maxTAdd = root[0].offsetTop-gapT;//偏移量最大值
    baseTop = parseInt(root.css('top'));
    $(window).bind('mousemove',DoDragTop);
    $(window).bind('mouseup',EndDragTop);
  }
  function DoDragTop(e){
    var addLength = e.clientY  - clickY;
    var length = 0;
    var top = 0;
    if(addLength<0){//上移 addLength负值
      addLength*=(-1);//上移，偏移量-100；
      if(addLength>maxTAdd){//上边越界
        length = baseH+maxTAdd;//length = baseH+maxTAdd-10;
        top = gapT;
      }else{
        length = baseH+addLength;
        top = baseTop-addLength
      }
    }else{//下移 addLength正值
      if(addLength>minTAdd){//超过最小偏移量
        length = minH;
        top = minTAdd+maxTAdd+gapT;//最大偏移量减去的nav高度加上
      }else{
        length = baseH-addLength;
        top = baseTop+addLength;
      }
    }
    root.css({'top':top+'px'});
    root.height(length);
    root.next.height(length-gapH);
    regH = length;
    regTop = top;
  }
  function EndDragTop(){
    window.mask.css("display", "none");
    $(window).unbind('mousemove',DoDragTop);
    $(window).unbind('mouseup',EndDragTop);
  }

  return root;

};

/*******    生成导航栏函数  **********/
var navCadc = function(list){
  var logo = list.icon,ID = 'window'+list.id;
  var  bombIcon = $('<div>',{'class':'bombIcon'});
  //bombIcon.addClass(ID);

  var closeIcon = $('<i>',{'class':'fa fa-close'});
  bombIcon.append(
    '<img src="'+logo+'" alt=""/>'
  );
  bombIcon.append(closeIcon);
  $('#controlBomb').append(bombIcon);

  bombIcon.on('click',bombIconFun);
  closeIcon.on('click',closeIconFun);

  //nav点击事件
  function bombIconFun(){
    if(bombIcon.module.active){//点击的是激活状态
        //当前隐藏
        bombIcon.module.addClass('notShow');
        bombIcon.module.show=false;
        /*当前失去激活状态*/
         loseForce();
        /*找下一个激活状态*/
        for(var i=0;i<moduleAll.length;i++){
          if(moduleAll[i].show){//显示状态
            current = moduleAll[i];//找到当前激活状态,激活
            Force();
            break;
          }//没有显示的则不找激活状态了
        }

    }else{
        /*current失去激活状态*/
        loseForce();
        /*当前变成激活状态*/
        current = bombIcon.module;
        Force();
        if(!bombIcon.module.show){//窗口是隐藏状态--显示
          bombIcon.module.show = true;
          bombIcon.module.removeClass('notShow');
        }////窗口是显示状态--不变
    }


  }

  //nav关闭事件
  function closeIconFun(){
    /*销毁,并从数组中删除*/
    bombIcon.remove();
    bombIcon.module.remove();
    delete winS[ID];delete navS[ID];//单选时
    var index = moduleAll.indexOf(bombIcon.module);
    moduleAll.splice(index,1);//从数组中删除

    if(bombIcon.module.active){//点击的是激活状态
      for(var i=0;i<moduleAll.length;i++){
        if(moduleAll[i].show){//显示状态
          current = moduleAll[i];//找到当前激活状态,激活
          Force();
          break;
        }//没有显示的则不找激活状态了
      }

    }

  }
  return bombIcon;
};
function Force(){
  current.active = true;//属性:是否激活：
  current.addClass('activeWin');
  current.nav.addClass('activeNav');
  current.nextTop.addClass('winActive');
}
function loseForce(){
  current.active = false;//属性:失去激活
  current.removeClass('activeWin');
  current.nav.removeClass('activeNav');
  current.nextTop.removeClass('winActive');
}

window.onkeydown=function(event){
  if(event.keyCode == 116 && !event.ctrlKey){
    event.preventDefault();
    return false;
  }
}