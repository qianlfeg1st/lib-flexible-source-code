# lib-flexible-source-code

1.用ES6重写了手淘的lib-flexible

2.修改了lib-flexible里大量不严谨

例如:
   <br/>
   【1】没有在当前作用域顶部声明变量，而是直接在判断语句中声明变量并赋值;
   <br/>
   【2】isAndroid 这个变量声明并赋值了，但是从未使用过....不知道作者怎么想的
   <br/>
   【3】等等，总之就是各种不合理不合逻辑

3.删除了源码中，通过'meta[name="flexible"]'手动设置缩放的功能(个人认为这个很鸡肋)
