// Generated by CoffeeScript 1.6.2
(function() {
  "use strict";
  var debug, error, root, _, _ref, _ref1, _ref2,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('../vendor/_.js');

  _ref = require('./logging'), error = _ref.error, debug = _ref.debug;

  root = typeof exports !== "undefined" && exports !== null ? exports : (_ref1 = window.exceptions) != null ? _ref1 : window.exceptions = {};

  root.HaltException = (function() {
    function HaltException(exit_code) {
      this.exit_code = exit_code;
    }

    HaltException.prototype.toplevel_catch_handler = function() {
      if (this.exit_code !== 0) {
        return error("\nExited with code " + this.exit_code);
      }
    };

    return HaltException;

  })();

  root.ReturnException = 'RETURNEXCEPTION';

  root.YieldException = (function() {
    function YieldException(condition) {
      this.condition = condition;
    }

    return YieldException;

  })();

  root.YieldIOException = (function(_super) {
    __extends(YieldIOException, _super);

    function YieldIOException() {
      _ref2 = YieldIOException.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    return YieldIOException;

  })(root.YieldException);

  root.JavaException = (function() {
    function JavaException(exception) {
      this.exception = exception;
    }

    JavaException.prototype.method_catch_handler = function(rs, cf, top_of_stack) {
      var ecls, exception_handlers, handler, method, _ref3, _ref4,
        _this = this;

      method = cf.method;
      if (!top_of_stack && method.has_bytecode) {
        cf.pc -= 3;
        while (!(cf.pc <= 0 || ((_ref3 = method.code.opcodes[cf.pc]) != null ? _ref3.name.match(/^invoke/) : void 0))) {
          --cf.pc;
        }
      }
      if (cf["native"]) {
        if (cf.error != null) {
          cf.runner = function() {
            return cf.error(_this);
          };
          return true;
        }
        return false;
      }
      exception_handlers = (_ref4 = method.code) != null ? _ref4.exception_handlers : void 0;
      ecls = this.exception.cls;
      handler = _.find(exception_handlers, function(eh) {
        var _ref5;

        return (eh.start_pc <= (_ref5 = cf.pc) && _ref5 < eh.end_pc) && (method.cls.loader.get_resolved_class(eh.catch_type, true) != null) && (eh.catch_type === "<any>" || ecls.is_castable(method.cls.loader.get_resolved_class(eh.catch_type)));
      });
      if (handler != null) {
        debug("caught " + (this.exception.cls.get_type()) + " in " + (method.full_signature()) + " as subclass of " + handler.catch_type);
        cf.stack = [this.exception];
        cf.pc = handler.handler_pc;
        return true;
      }
      debug("exception not caught, terminating " + (method.full_signature()));
      return false;
    };

    JavaException.prototype.toplevel_catch_handler = function(rs) {
      var msg, thread_cls;

      debug("\nUncaught " + (this.exception.cls.get_type()));
      msg = this.exception.get_field(rs, 'Ljava/lang/Throwable;detailMessage');
      if (msg != null) {
        debug("\t" + (msg.jvm2js_str()));
      }
      rs.push2(rs.curr_thread, this.exception);
      thread_cls = rs.get_bs_class('Ljava/lang/Thread;');
      return thread_cls.method_lookup(rs, 'dispatchUncaughtException(Ljava/lang/Throwable;)V').setup_stack(rs);
    };

    return JavaException;

  })();

}).call(this);