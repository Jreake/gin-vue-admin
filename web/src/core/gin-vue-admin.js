/*
 * gin-vue-admin web框架组
 *
 * */
// 加载网站配置文件夹
import { register } from "./global";

export default {
  install: (app) => {
    register(app);
    console.log(
      [
        "%c",
        "                   _ooOoo_",
        "                  o8888888o",
        '                  88" . "88',
        "                  (| -_- |)",
        "                  O\\  =  /O",
        "               ____/`---'\\____",
        "             .'  \\\\|     |//  `.",
        "            /  \\\\|||  :  |||//  \\",
        "           /  _||||| -:- |||||-  \\",
        "           |   | \\\\\\  -  /// |   |",
        "           | \\_|  ''\\---/''  |   |",
        "           \\  .-\\__  `-`  ___/-. /",
        "         ___`. .'  /--.--\\  `. . __",
        '      ."" \'<  `.___\\_<|>_/___.\'  >\'"".',
        "     | | :  `- \\`.;`\\ _ /`;.`/ - ` : | |",
        "     \\  \\ `-.   \\_ __\\ /__ _/   .-` /  /",
        "======`-.____`-.___\\_____/___.-`____.-'======",
        "                   `=---='",
        "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^",
        "         佛祖保佑       永无BUG",
      ].join("\n"),
      "color:red"
    );
  },
};
