module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 351:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const os = __importStar(__nccwpck_require__(87));
const utils_1 = __nccwpck_require__(278);
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 186:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const command_1 = __nccwpck_require__(351);
const file_command_1 = __nccwpck_require__(717);
const utils_1 = __nccwpck_require__(278);
const os = __importStar(__nccwpck_require__(87));
const path = __importStar(__nccwpck_require__(622));
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = utils_1.toCommandValue(val);
    process.env[name] = convertedVal;
    const filePath = process.env['GITHUB_ENV'] || '';
    if (filePath) {
        const delimiter = '_GitHubActionsFileCommandDelimeter_';
        const commandValue = `${name}<<${delimiter}${os.EOL}${convertedVal}${os.EOL}${delimiter}`;
        file_command_1.issueCommand('ENV', commandValue);
    }
    else {
        command_1.issueCommand('set-env', { name }, convertedVal);
    }
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    const filePath = process.env['GITHUB_PATH'] || '';
    if (filePath) {
        file_command_1.issueCommand('PATH', inputPath);
    }
    else {
        command_1.issueCommand('add-path', {}, inputPath);
    }
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 */
function error(message) {
    command_1.issue('error', message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 */
function warning(message) {
    command_1.issue('warning', message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 717:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


// For internal use, subject to change.
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
const fs = __importStar(__nccwpck_require__(747));
const os = __importStar(__nccwpck_require__(87));
const utils_1 = __nccwpck_require__(278);
function issueCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
    }
    fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: 'utf8'
    });
}
exports.issueCommand = issueCommand;
//# sourceMappingURL=file-command.js.map

/***/ }),

/***/ 278:
/***/ ((__unused_webpack_module, exports) => {


// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 348:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



/* eslint camelcase: [error, {properties: "never"}] */

const core = __nccwpck_require__(186)

const createParams = inputs => {
  const params = {
    owner: inputs.owner,
    repo: inputs.repo,
  }

  if (inputs.per_page) {
    if (inputs.max_entries) {
      params.per_page = Math.min(inputs.per_page, inputs.max_entries)
      core.info(`pagination: set ${params.per_page} entries per page`)
    } else {
      params.per_page = inputs.per_page
      core.info(`pagination: set ${params.per_page} entries per page`)
    }
  } else {
    if (inputs.max_entries && inputs.max_entries < 100) {
      params.per_page = inputs.max_entries
      core.info(`pagination: set ${params.per_page} entries per page`)
    }
  }

  return params
}

const setOutputs = (inputs, entries) => {
  core.info(`setOutputs: preparing for ${entries.length} entries`)

  const processor = new require('./processor').Processor(inputs)
  const array = processor.process(entries)
  const json = JSON.stringify(array)
  const ascii = Buffer.from(json).toString('base64')

  core.info(`setOutputs: setting outputs for ${array.length} entries`)
  core.setOutput('json', json)
  core.setOutput('base64', ascii)
  core.setOutput('count', array.length)
}

async function run() {
  const inputs = __nccwpck_require__(229).getInputs()
  const octokit = new require('@octokit/rest').Octokit({
    auth: inputs.token,
  })
  const params = createParams(inputs)

  core.info(`inputs: ${JSON.stringify(inputs, null, 2)}`)

  let remain
  if (inputs.max_entries) {
    remain = inputs.max_entries
    core.info(`pagination: setting number of remaing entries to ${remain}`)
  } else {
    remain = Number.MAX_SAFE_INTEGER
  }

  try {
    const entries = await octokit.paginate(
      octokit.repos.listReleases,
      params,
      ({data}, done) => {
        core.info(`pagination: retrieved page of ${data.length} entries`)
        remain -= data.length
        if (remain <= 0) {
          core.info(`pagination: last page with ${-remain} surplus entries`)
          if (remain < 0) {
            data = data.slice(0, data.length + remain)
          }
          core.info(
            `pagination: retaining ${data.length} of the retrieved entries`
          )
          done()
        } else if (inputs.max_entries) {
          core.info(`pagination: ${remain} entries remain to be retrieved`)
        }
        return data
      }
    )
    setOutputs(inputs, entries)
  } catch (error) {
    core.setFailed(error.stack)
  }
}

module.exports = {run}

// vim: set ft=javascript ts=2 sw=2 sts=2:


/***/ }),

/***/ 229:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



/* eslint camelcase: [error, {properties: "never"}] */

const core = __nccwpck_require__(186)

class ValidationError extends Error {
  static make(key, value) {
    return new ValidationError(
      `validation failed for input ${key}: ${JSON.stringify(value)}`
    )
  }
}

class InternalError extends Error {}

const validate = {
  sortable: [
    'url',
    'assets_url',
    'upload_url',
    'htlm_url',
    'id',
    'node_id',
    'tag_name',
    'target_commitish',
    'name',
    'draft',
    'prerelease',
    'created_at',
    'published_at',
    'tarball_url',
    'zipball_url',
    'body',
  ],

  selectable: [
    'url',
    'assets_url',
    'upload_url',
    'htlm_url',
    'id',
    'author',
    'node_id',
    'tag_name',
    'target_commitish',
    'name',
    'draft',
    'prerelease',
    'created_at',
    'published_at',
    'assets',
    'tarball_url',
    'zipball_url',
    'body',
  ],

  stringOrRegexp(value) {
    const re = /^(?:\/(.*)\/([a-z]*))$/
    const match = value.match(re)
    if (match) {
      return new RegExp(match[1], match[2])
    }
    return ['', '*'].includes(value) ? null : value
  },

  intOrNull(value, key) {
    const re = /^\s*(\d+|)\s*$/
    const match = value.match(re)
    if (!match) {
      throw ValidationError.make(key, value)
    }
    return match[1] ? parseInt(match[1]) : null
  },

  bool(value, key) {
    const choices = {'': null, '*': null, true: true, false: false}
    if (choices.hasOwnProperty(value)) {
      return choices[value]
    }
    throw ValidationError.make(key, value)
  },

  testWithRegExp(re, value, key) {
    if (!re.test(value)) {
      throw ValidationError.make(key, value)
    }
    return value
  },

  token(value) {
    return value ? value : null
  },

  owner(value) {
    const re = /^(?:[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38})$/i
    return this.testWithRegExp(re, value, 'owner')
  },

  repo(value) {
    const re = /^(?:(?:\.?[_a-z\d-][_a-z\d.-]*)|(?:.\.[_a-z\d.-]+))$/i
    return this.testWithRegExp(re, value, 'repo')
  },

  per_page(value) {
    const num = this.intOrNull(value, 'per_page')
    if (num > 100) {
      throw ValidationError.make('per_page', value)
    }
    return num
  },

  max_entries(value) {
    return this.intOrNull(value, 'max_entries')
  },

  name(value) {
    return this.stringOrRegexp(value)
  },

  tag_name(value) {
    return this.stringOrRegexp(value)
  },

  draft(value) {
    return this.bool(value, 'draft')
  },

  prerelease(value) {
    return this.bool(value, 'prerelease')
  },

  sort(value, defaultOrder = 'A') {
    const trimmed = value.trim()

    if (!trimmed) {
      return null
    }

    const re = new RegExp(
      `^(${this.sortable.join(
        '|'
      )})(?:(?:\\s+|\\s*=\\s*)(A(?:SC)?|D(?:E?SC)?))?$`,
      'i'
    )
    const sep = /\s*,\s*/
    const strings = trimmed.split(sep)

    const fields = []
    for (const string of strings) {
      const match = string.match(re)
      if (!match) {
        throw ValidationError.make('sort', value)
      }
      const key = match[1].toLowerCase()
      const ord = (match[2] ? match[2] : defaultOrder)
        .substring(0, 1)
        .toUpperCase()
      fields.push([key, ord])
    }
    return fields
  },

  order(value) {
    const re = /^\s*(A(?:SC)?|D(?:E?SC)?|)\s*$/i
    const match = value.match(re)

    if (!match) {
      throw ValidationError.make('order', value)
    }

    return (match[1] ? match[1] : 'A').substring(0, 1).toUpperCase()
  },

  select(value) {
    const trimmed = value.trim()

    if (!trimmed || trimmed === '*') {
      return null
    }

    const sep = /(?:\s*,\s*)|\s+/
    const strings = trimmed.split(sep)
    const invalid = strings.filter(string => !this.selectable.includes(string))

    if (invalid.length > 0) {
      throw ValidationError.make('select', value)
    }

    return strings
  },

  slice(value) {
    const re = new RegExp(
      '^\\s*(' +
        '(?:(?<all>A)(?:LL)?)' +
        '|' +
        '(?:(?:(?:(?<first>F)(?:I?RST)?)|(?:(?<last>L)(?:AST)?))(?:(?:\\s+|\\s*=\\s*)(?<count>\\d+))?)' +
        '|' +
        '(?:(?<from>\\d+)\\s*\\.\\.\\.\\s*(?<to>\\d+|))' +
        '|' +
        '' +
        ')\\s*$',
      'i'
    )
    const match = value.match(re)

    if (!match) {
      throw ValidationError.make('slice', value)
    }

    const groups = match.groups

    if (!match[1] || groups.all) {
      return {type: 'A'}
    }

    for (const type of [groups.first, groups.last]) {
      if (type) {
        const count = groups.count
        return {
          type: type.toUpperCase(),
          count: count ? parseInt(count) : 1,
        }
      }
    }

    if (groups.from) {
      return {
        type: 'R',
        from: parseInt(groups.from),
        to: groups.to ? parseInt(groups.to) : null,
      }
    }

    /* istanbul ignore next */
    throw new InternalError(`slice: ${JSON.stringify(value)}`)
  },
}

const getInputs = () => {
  const order = validate.order(core.getInput('order'))
  return {
    token: validate.token(core.getInput('token')),
    owner: validate.owner(core.getInput('owner')),
    repo: validate.repo(core.getInput('repo')),
    name: validate.name(core.getInput('name')),
    per_page: validate.per_page(core.getInput('per_page')),
    max_entries: validate.max_entries(core.getInput('max_entries')),
    tag_name: validate.tag_name(core.getInput('tag_name')),
    draft: validate.draft(core.getInput('draft')),
    prerelease: validate.prerelease(core.getInput('prerelease')),
    sort: validate.sort(core.getInput('sort'), order),
    order,
    slice: validate.slice(core.getInput('slice')),
    select: validate.select(core.getInput('select')),
  }
}

module.exports = {getInputs, validate, ValidationError, InternalError}

// vim: set ft=javascript ts=2 sw=2 sts=2:


/***/ }),

/***/ 713:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __nccwpck_require__) => {



const action = __nccwpck_require__(348)

action.run()

// vim: set ft=javascript ts=2 sw=2 sts=2:


/***/ }),

/***/ 747:
/***/ ((module) => {

module.exports = require("fs");;

/***/ }),

/***/ 87:
/***/ ((module) => {

module.exports = require("os");;

/***/ }),

/***/ 622:
/***/ ((module) => {

module.exports = require("path");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	__nccwpck_require__.ab = __dirname + "/";/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __nccwpck_require__(713);
/******/ })()
;