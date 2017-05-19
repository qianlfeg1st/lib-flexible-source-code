// 使用立即执行函数表达式(IIFE)，避免污染全局作用域
// 通过传入 window对象，可以使 window对象变为局部变量
// 这样在代码中访问 window对象时，就不需要将作用域链退回到顶层作用域，从而可以更快的访问 window对象
// 将window对象作为参数传入，还可以在代码压缩时进行优化
;( function( window, lib ) {
      // Document对象
  let doc = window.document,
      // 文档根节点
      docEl = doc.documentElement,
      // name="viewport"的 meta节点
      metaEl = doc.querySelector( 'meta[name="viewport"]' ),
      // 获取到'content'的属性值，并用正则进行模式匹配
      match = metaEl && metaEl.getAttribute( 'content' ).match( /initial\-scale=([\d\.]+)/ ),
      // 设备独立像素(用来区分'普通屏幕'和'视网膜屏')
      dip = window.devicePixelRatio,
      // 是否为iPhone
      isIphone = window.navigator.appVersion.match( /iphone/gi ),
      // 将flexible对象暴露给全局作用域，这样一来我们就可以在外部调用内部的一些方法和变量
      flexible = lib.flexible || ( lib.flexible = {} ),
      // 文档宽度
      width = docEl.getBoundingClientRect().width,
      // 缩放比例
      scale = 0,
      // DPR
      dpr = 0,
      // 定时器ID
      tid,
      // 基准像素
      rem;

  function refreshRem() {
    // width / dpr的到 'CSS像素'
    // '普通屏幕'一个CSS像素 => 一个物理像素
    // '视网膜屏'一个CSS像素 => 四个物理像素
    if ( width / dpr > 540 ) {
      // 'CSS像素'最高是540(这里相当于限制了整个页面的宽度不能大于540(如果大于540的话就不会对页面进行缩放)，超过540的话要设置成左右居中，不然巨丑)
      width = 540 * dpr;
    }
    // 计算出基准像素
    rem = width / 10;
    // 设置文档的基准像素
    docEl.style.fontSize = rem + 'px';
    // 这里又隐晦的定义了一个全局变量'rem',可以通过window.rem 或 lib.flexible.rem来获取基准像素
    flexible.rem = window.rem = rem;
  }

  // 文档中已经设置了'viewport'
  if ( metaEl ) {
    console.info('文档中已经设置了viewport，将根据已有的参数设置缩放比例');
    // 在'content'属性中设置了'缩放比例'
    if ( match ) {
      // 获取 缩放比例
      scale = match[ 1 ];
      // 获取 DPR
      dpr = parseInt( 1/scale );
    }
  }

  // DPR和缩放比例都没有设置
  if ( !dpr && !scale ) {
    // 苹果设备
    if ( isIphone ) {
      // 根据 dip和dpr来设置 缩放比例
      if ( dip >= 3 && ( !dpr || dpr >= 3 ) ) {
        // dpr = 3 => scale = 0.33333
        dpr = 3;
      } else if ( dip >= 2 && ( !dpr || dpr >= 2 ) ) {
        // dpr = 2 => scale = 0.5
        dpr = 2
      } else {
        // dpr = 1 => scale = 1
        dpr = 1;
      }
    // 其他设备(包括Android和iPad都不会进行缩放)
    } else {
      // dpr = 1 => scale = 1
      dpr = 1;
    }
    // 获取 缩放比例
    scale = 1 / dpr;
  }

  // 在根节点上设置'data-dpr'属性，这个属性非常重要
  // 有这个属性我们就可以，设置不同缩放比例下的字体大小(px)，布局仍然使用rem
  docEl.setAttribute( 'data-dpr', dpr );

  // 文档中没有设置'viewport'
  if ( !metaEl ) {
    // 创建一个'meta'节点
    metaEl = doc.createElement( 'meta' )
    // 设置'meta'节点的'name'属性
    metaEl.setAttribute( 'name', 'viewport' );
    // 设置'meta'节点的'content'属性
    metaEl.setAttribute( 'content', 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no' );
    // 将'meta'节点注入到head标签中
    doc.head.appendChild( metaEl );
  }

  //要等 wiewport 设置好后才能执行 refreshRem，不然 refreshRem 会执行2次
  refreshRem();

  // 视窗大小发生变化时触发
  window.addEventListener( 'resize', ()=> {
    // 清空定时器，防止执行两次refreshRem函数
    clearTimeout( tid );
    // 延迟300毫秒，重新计算并设置html的'font-size'
    tid = setTimeout( refreshRem, 300 );
  }, false );

  // 重载页面时触发
  window.addEventListener( 'pageshow', ( e )=> {
    // 从缓存中加载页面(浏览器自带的后退功能)
    if ( e.persisted ) {
      // 清空定时器，防止执行两次refreshRem函数
      clearTimeout( tid );
      // 延迟300毫秒，重新计算并设置html的'font-size'
      tid = setTimeout( refreshRem, 300 );
    }
  }, false );

  // DOM构建完成后触发
  doc.addEventListener( 'DOMContentLoaded', ()=> {
    // 设置body的默认字体大小
    doc.body.style.fontSize = 12 * dpr + 'px';
  }, false );

  // 这里又隐晦的定义了一个全局变量'dpr',可以通过 window.dpr 或 lib.flexible.dpr来获取
  flexible.dpr = window.dpr = dpr;

  // 将refreshRem方法暴露给全局作用域
  flexible.refreshRem = refreshRem;

  // 将rem值转换为px值
  flexible.rem2px = ( num )=> {
      // this.rem是指基准像素
      let val = parseFloat( num ) * this.rem;
      // 参数传入的是字符串，并且在末尾带上了'rem'单位
      if ( typeof num === 'string' && num.match( /rem$/ ) ) {
        // 将值转换为字符串，并带上'px'单位
        val += 'px';
      }
      return val;
  }

  // 将px值转换为rem值
  flexible.px2rem = ( num )=> {
      // this.rem是指基准像素
      let val = parseFloat( num ) / this.rem;
      // 参数传入的是字符串，并且在末尾带上了'px'单位
      if ( typeof num === 'string' && num.match( /px$/ ) ) {
        // 将值转换为字符串，并带上'rem'单位
        val += 'rem';
      }
      return val;
  }

// window[ 'lib' ] = {} 等同于 var lib = {} 这里很隐晦的定义了一个全局变量'lib'
} )( window, window[ 'lib' ] || ( window[ 'lib' ] = {} ) );
