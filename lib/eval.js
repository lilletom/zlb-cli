const chalk = require("chalk");
// 计算指定对象下的表达式的值
module.exports = function evaluate(exp, data) {
  const fn = new Function("data", "with (data) { return " + exp + "}");
  try {
    return fn(data);
  } catch (e) {
    console.error(chalk.red("Error when evaluating filter condition: " + exp));
  }
};