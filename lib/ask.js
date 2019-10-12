const async = require("async");
const inquirer = require("inquirer");
const evaluate = require("./eval");

/**
 * 向用户问题，并返回用户的回答
 *
 * @param {Object} prompts questions 数组对象
 * @param {Object} data metalsmith 的 metadata对象
 * @param {Function} done metalsmith 的回调函数
 */

module.exports = function ask(prompts, data, done) {
  // async.eachSeries 可以异步串行的方式遍历对象或数组
  async.eachSeries(
    Object.keys(prompts),
    (key, next) => {
      prompt(data, key, prompts[key], next);
    },
    done
  );
};

/**
 * 使用 Inquirer 向用户询问问题
 *
 * @param {Object} data
 * @param {String} key
 * @param {Object} prompt
 * @param {Function} done
 */
// 将用户的输入信息添加到 metadata 上，用来渲染模板。
function prompt(data, key, prompt, done) {
  // 条件不满足的话跳过该问题
  if (prompt.when && !evaluate(prompt.when, data)) {
    return done();
  }

  // 如果默认值是函数类型，将函数执行结果返回。
  let promptDefault = prompt.default;
  if (typeof prompt.default === "function") {
    promptDefault = function() {
      return prompt.default.bind(this)(data);
    };
  }

  inquirer
    .prompt([
      {
        type: prompt.type,
        name: key,
        message: prompt.message || key,
        default: promptDefault,
        choices: prompt.choices || [],
        validate: prompt.validate || (() => true)
      }
    ])
    .then(answers => {
      if (Array.isArray(answers[key])) {
        data[key] = {};
        answers[key].forEach(multiChoiceAnswer => {
          data[key][multiChoiceAnswer] = true;
        });
      } else if (typeof answers[key] === "string") {
        data[key] = answers[key].replace(/"/g, '\\"');
      } else {
        data[key] = answers[key];
      }
      done();
    })
    .catch(done);
}