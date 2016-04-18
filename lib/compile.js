'use strict';
/**
 * Created by Adrian on 18-Apr-16.
 * performs the LESS-compiler on the given input-output-options tuplet
 */
const less = require('less'),
  path = require('path'),
  fs = require('fs');

module.exports = function(thorin, opt) {
  const logger = thorin.logger(opt.logger);
  /*
  * Do the actual compiler.
  * */
  return function compile(item, done) {
    let compileOpt = thorin.util.extend({
      paths: [path.dirname(item.input)],
      filename: path.basename(item.input),
      compress: true
    }, opt.options);
    if(item.options) {
      compileOpt = thorin.util.extend(compileOpt, item.options);
    }
    fs.readFile(item.input, { encoding: 'utf8' }, (e, content) => {
      if(e) {
        return done && done(thorin.error('LESS.NOT_FOUND', `Input file ${item.input} does not exist.`), e);
      }
      less.render(content, compileOpt, (e, output) => {
        if(e) {
          logger.warn(`Failed to compile file ${e.filename}, line ${e.line}, col ${e.column}, index ${e.index}: ${e.message}`);
          return done && done(thorin.error(e));
        }
        fs.writeFile(item.output, output.css, { encoding: 'utf8' }, (e) => {
          if(e) {
            logger.trace(`Failed to write output to ${item.output}`, e);
            return done && done(e);
          }
          logger.trace(`Compiled ${path.basename(item.output)}`);
          done && done();
        });
      });
    });
  }
};