var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// .wrangler/tmp/bundle-m5bCmO/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// node_modules/unenv/dist/runtime/_internal/utils.mjs
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
__name(PerformanceEntry, "PerformanceEntry");
var PerformanceMark = /* @__PURE__ */ __name(class PerformanceMark2 extends PerformanceEntry {
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
}, "PerformanceMark");
var PerformanceMeasure = class extends PerformanceEntry {
  entryType = "measure";
};
__name(PerformanceMeasure, "PerformanceMeasure");
var PerformanceResourceTiming = class extends PerformanceEntry {
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
__name(PerformanceResourceTiming, "PerformanceResourceTiming");
var PerformanceObserverEntryList = class {
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
__name(PerformanceObserverEntryList, "PerformanceObserverEntryList");
var Performance = class {
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
__name(Performance, "Performance");
var PerformanceObserver = class {
  __unenv__ = true;
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
__name(PerformanceObserver, "PerformanceObserver");
__publicField(PerformanceObserver, "supportedEntryTypes", []);
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
import { Socket } from "node:net";
var ReadStream = class extends Socket {
  fd;
  constructor(fd) {
    super();
    this.fd = fd;
  }
  isRaw = false;
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
  isTTY = false;
};
__name(ReadStream, "ReadStream");

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
import { Socket as Socket2 } from "node:net";
var WriteStream = class extends Socket2 {
  fd;
  constructor(fd) {
    super();
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  columns = 80;
  rows = 24;
  isTTY = false;
};
__name(WriteStream, "WriteStream");

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class extends EventEmitter {
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return "";
  }
  get versions() {
    return {};
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  ref() {
  }
  unref() {
  }
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: () => 0 });
  mainModule = void 0;
  domain = void 0;
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};
__name(Process, "Process");

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var { exit, platform, nextTick } = getBuiltinModule(
  "node:process"
);
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  nextTick
});
var {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  finalization,
  features,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  on,
  off,
  once,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = Symbol();

// node_modules/hono/dist/utils/buffer.js
var bufferToFormData = /* @__PURE__ */ __name((arrayBuffer, contentType) => {
  return new Response(arrayBuffer, { headers: { "Content-Type": contentType.replace(/^[^;]+/, (mediaType) => mediaType.toLowerCase()) } }).formData();
}, "bufferToFormData");

// node_modules/hono/dist/utils/body.js
var MAX_NESTED_OBJECTS = 1e4;
var isRawRequest = /* @__PURE__ */ __name((request) => "headers" in request, "isRawRequest");
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const mediaType = (isRawRequest(request) ? request.headers : request.raw.headers).get("Content-Type")?.split(";")[0].trim().toLowerCase();
  if (mediaType === "multipart/form-data" || mediaType === "application/x-www-form-urlencoded")
    return parseFormData(request, {
      all,
      dot
    });
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  if (!isRawRequest(request) && request.bodyCache.formData)
    return convertFormDataToBodyData(await request.bodyCache.formData, options);
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const arrayBuffer = await request.arrayBuffer();
  const formDataPromise = bufferToFormData(arrayBuffer, headers.get("Content-Type") || "");
  if (!isRawRequest(request))
    request.bodyCache.formData = formDataPromise;
  const formData = await formDataPromise;
  if (formData)
    return convertFormDataToBodyData(formData, options);
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  const nestingState = { count: 0 };
  formData.forEach((value, key) => {
    if (!(options.all || key.endsWith("[]")))
      form[key] = value;
    else
      handleParsingAllValues(form, key, value);
  });
  if (options.dot)
    Object.entries(form).forEach(([key, value]) => {
      if (key.includes(".")) {
        handleParsingNestedValues(form, key, value, nestingState);
        delete form[key];
      }
    });
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key]))
      form[key].push(value);
    else
      form[key] = [form[key], value];
  } else if (!key.endsWith("[]"))
    form[key] = value;
  else
    form[key] = [value];
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value, state) => {
  if (/(?:^|\.)__proto__\./.test(key))
    return;
  let nestedForm = form;
  const keys = key.split(".", 34);
  if (keys.length > 33)
    throwNestingLimitExceeded();
  keys.forEach((key2, index) => {
    if (index === keys.length - 1)
      nestedForm[key2] = value;
    else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        if (state.count++ >= MAX_NESTED_OBJECTS)
          throwNestingLimitExceeded();
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");
var throwNestingLimitExceeded = /* @__PURE__ */ __name(() => {
  throw new Error("Nesting limit exceeded");
}, "throwNestingLimitExceeded");

// node_modules/hono/dist/utils/url.js
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "")
    paths.shift();
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return {
    groups,
    path
  };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--)
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label, next) => {
  if (label === "*")
    return "*";
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2])
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [
          cacheKey,
          match2[1],
          new RegExp(`^${match2[2]}(?=/${next})`)
        ] : [
          label,
          match2[1],
          new RegExp(`^${match2[2]}$`)
        ];
      else
        patternCache[cacheKey] = [
          label,
          match2[1],
          true
        ];
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str, decoder2) => {
  try {
    return decoder2(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder2(match2);
      } catch {
        return match2;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name((request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const hashIndex = url.indexOf("#", i);
      const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
      const path = url.slice(start, end);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63 || charCode === 35)
      break;
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var stripPathPrefix = /* @__PURE__ */ __name((rawPath, decodedPath, prefixLength) => {
  if (rawPath.at(-1) === "/" && decodedPath.at(-1) !== "/")
    rawPath = rawPath.slice(0, -1);
  let index = 0;
  for (let i = decodedPath.indexOf("/"); i !== -1 && i < prefixLength; i = decodedPath.indexOf("/", i + 1)) {
    index = rawPath.indexOf("/", index + 1);
    if (index === -1)
      return "/";
  }
  return rawPath.slice(index) || "/";
}, "stripPathPrefix");
var mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
  if (rest.length)
    sub = mergePath(sub, ...rest);
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":"))
    return null;
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment))
      basePath += "/" + segment;
    else if (/\:/.test(segment)) {
      if (segment.charCodeAt(segment.length - 1) === 63) {
        if (results.length === 0 && basePath === "")
          results.push("/");
        else
          results.push(basePath);
        const optionalSegment = segment.slice(0, -1);
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else
        basePath += "/" + segment;
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var tryDecodeURIComponent = /* @__PURE__ */ __name((str) => str.indexOf("%") !== -1 ? tryDecode(str, decodeURIComponent_) : str, "tryDecodeURIComponent");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (value.indexOf("+") !== -1)
    value = value.replace(/\+/g, " ");
  return tryDecodeURIComponent(value);
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  const hashIndex = url.indexOf("#", 8);
  if (hashIndex !== -1)
    url = url.slice(0, hashIndex);
  let encoded;
  if (!multiple && key && key.indexOf("%") === -1 && key.indexOf("+") === -1) {
    const queryIndex = url.indexOf("?", 8);
    let keyIndex2 = queryIndex;
    if (keyIndex2 === -1)
      return;
    if (!url.startsWith(key, keyIndex2 + 1))
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61 || trailingKeyCode === 38 || isNaN(trailingKeyCode)) {
        if (keyIndex2 > queryIndex && /(?:^|&)[^=&]*[%+]/.test(url.slice(queryIndex + 1, keyIndex2)))
          break;
        if (trailingKeyCode === 61) {
          const valueIndex = keyIndex2 + key.length + 2;
          const endIndex = url.indexOf("&", valueIndex);
          return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
        }
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded)
      return;
  }
  const results = /* @__PURE__ */ Object.create(null);
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1)
      valueIndex = -1;
    let name = url.slice(keyIndex + 1, valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex);
    if (encoded)
      name = _decodeURI(name);
    keyIndex = nextKeyIndex;
    if (name === "")
      continue;
    let value;
    if (valueIndex === -1)
      value = "";
    else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded)
        value = _decodeURI(value);
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name])))
        results[name] = [];
      results[name].push(value);
    } else
      results[name] ??= value;
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var HonoRequest = /* @__PURE__ */ __name(class {
  /**
  * `.raw` can get the raw Request object.
  *
  * @see {@link https://hono.dev/docs/api/request#raw}
  *
  * @example
  * ```ts
  * // For Cloudflare Workers
  * app.post('/', async (c) => {
  *   const metadata = c.req.raw.cf?.hostMetadata?
  *   ...
  * })
  * ```
  */
  raw;
  #validatedData;
  #matchResult;
  routeIndex = 0;
  /**
  * `.path` can get the pathname of the request.
  *
  * @see {@link https://hono.dev/docs/api/request#path}
  *
  * @example
  * ```ts
  * app.get('/about/me', (c) => {
  *   const pathname = c.req.path // `/about/me`
  * })
  * ```
  */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex]?.[1][key];
    const param = this.#getParamValue(paramKey);
    return param && tryDecodeURIComponent(param);
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex]?.[1] ?? {});
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0)
        decoded[key] = tryDecodeURIComponent(value);
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name)
      return this.raw.headers.get(name) ?? void 0;
    const headerData = /* @__PURE__ */ Object.create(null);
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody)
      return cachedBody;
    for (const anyCachedKey in bodyCache)
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json")
          body = JSON.stringify(body);
        const contentType = anyCachedKey === "formData" ? void 0 : raw2.headers.get("content-type");
        return new Response(body, { headers: contentType ? { "Content-Type": contentType } : void 0 })[key]();
      });
    return bodyCache[key] = raw2[key]();
  };
  /**
  * `.json()` can parse Request body of type `application/json`
  *
  * @see {@link https://hono.dev/docs/api/request#json}
  *
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.json()
  * })
  * ```
  */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
  * `.text()` can parse Request body of type `text/plain`
  *
  * @see {@link https://hono.dev/docs/api/request#text}
  *
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.text()
  * })
  * ```
  */
  text() {
    return this.#cachedBody("text");
  }
  /**
  * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
  *
  * @see {@link https://hono.dev/docs/api/request#arraybuffer}
  *
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.arrayBuffer()
  * })
  * ```
  */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
  * `.bytes()` parses the request body as a `Uint8Array`.
  *
  * @see {@link https://hono.dev/docs/api/request#bytes}
  *
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.bytes()
  * })
  * ```
  */
  bytes() {
    return this.#cachedBody("arrayBuffer").then((buffer) => new Uint8Array(buffer));
  }
  /**
  * Parses the request body as a `Blob`.
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.blob();
  * });
  * ```
  * @see https://hono.dev/docs/api/request#blob
  */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
  * Parses the request body as `FormData`.
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.formData();
  * });
  * ```
  * @see https://hono.dev/docs/api/request#formdata
  */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
  * Adds validated data to the request.
  *
  * @param target - The target of the validation.
  * @param data - The validated data to add.
  */
  addValidatedData(target, data) {
    (this.#validatedData ??= {})[target] = data;
  }
  valid(target) {
    return this.#validatedData?.[target];
  }
  /**
  * `.url` can get the request url strings.
  *
  * @see {@link https://hono.dev/docs/api/request#url}
  *
  * @example
  * ```ts
  * app.get('/about/me', (c) => {
  *   const url = c.req.url // `http://localhost:8787/about/me`
  *   ...
  * })
  * ```
  */
  get url() {
    return this.raw.url;
  }
  /**
  * `.method` can get the method name of the request.
  *
  * @see {@link https://hono.dev/docs/api/request#method}
  *
  * @example
  * ```ts
  * app.get('/about/me', (c) => {
  *   const method = c.req.method // `GET`
  * })
  * ```
  */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
  * `.matchedRoutes` can return a matched route in the handler
  *
  * @deprecated
  *
  * Use matchedRoutes helper defined in "hono/route" instead.
  *
  * @see {@link https://hono.dev/docs/api/request#matchedroutes}
  *
  * @example
  * ```ts
  * app.use('*', async function logger(c, next) {
  *   await next()
  *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
  *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
  *     console.log(
  *       method,
  *       ' ',
  *       path,
  *       ' '.repeat(Math.max(10 - path.length, 0)),
  *       name,
  *       i === c.req.routeIndex ? '<- respond from here' : ''
  *     )
  *   })
  * })
  * ```
  */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
  * `.routePath` can retrieve the path registered within the handler
  *
  * @deprecated
  *
  * Use routePath helper defined in "hono/route" instead.
  *
  * @see {@link https://hono.dev/docs/api/request#routepath}
  *
  * @example
  * ```ts
  * app.get('/posts/:id', (c) => {
  *   return c.json({ path: c.req.routePath })
  * })
  * ```
  */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
}, "HonoRequest");

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context2, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise))
      str = str.toString();
    if (str instanceof Promise)
      str = await str;
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length)
    return Promise.resolve(str);
  if (buffer)
    buffer[0] += str;
  else
    buffer = [str];
  const resStr = Promise.all(callbacks.map((c) => c({
    phase,
    buffer,
    context: context2
  }))).then((res) => Promise.all(res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context2, buffer))).then(() => buffer[0]));
  if (preserveCallbacks)
    return raw(await resStr, callbacks);
  else
    return resStr;
}, "resolveCallback");

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var createResponseInstance = /* @__PURE__ */ __name((body, init) => new Response(body, init), "createResponseInstance");
var Context = /* @__PURE__ */ __name(class {
  #rawRequest;
  #req;
  /**
  * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
  *
  * @see {@link https://hono.dev/docs/api/context#env}
  *
  * @example
  * ```ts
  * // Environment object for Cloudflare Workers
  * app.get('*', async c => {
  *   const counter = c.env.COUNTER
  * })
  * ```
  */
  env = {};
  #var;
  finalized = false;
  /**
  * `.error` can get the error object from the middleware if the Handler throws an error.
  *
  * @see {@link https://hono.dev/docs/api/context#error}
  *
  * @example
  * ```ts
  * app.use('*', async (c, next) => {
  *   await next()
  *   if (c.error) {
  *     // do something...
  *   }
  * })
  * ```
  */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
  * Creates an instance of the Context class.
  *
  * @param req - The Request object.
  * @param options - Optional configuration options for the context.
  */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
  * `.req` is the instance of {@link HonoRequest}.
  */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
  * @see {@link https://hono.dev/docs/api/context#event}
  * The FetchEvent associated with the current request.
  *
  * @throws Will throw an error if the context does not have a FetchEvent.
  */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx)
      return this.#executionCtx;
    else
      throw Error("This context has no FetchEvent");
  }
  /**
  * @see {@link https://hono.dev/docs/api/context#executionctx}
  * The ExecutionContext associated with the current request.
  *
  * @throws Will throw an error if the context does not have an ExecutionContext.
  */
  get executionCtx() {
    if (this.#executionCtx)
      return this.#executionCtx;
    else
      throw Error("This context has no ExecutionContext");
  }
  /**
  * @see {@link https://hono.dev/docs/api/context#res}
  * The Response object for the current request.
  */
  get res() {
    return this.#res ||= createResponseInstance(null, { headers: this.#preparedHeaders ??= new Headers() });
  }
  /**
  * Sets the Response object for the current request.
  *
  * @param _res - The Response object to set.
  */
  set res(_res) {
    if (this.#res && _res) {
      _res = createResponseInstance(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type")
          continue;
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies)
            _res.headers.append("set-cookie", cookie);
        } else
          _res.headers.set(k, v);
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
  * `.render()` can create a response within a layout.
  *
  * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
  *
  * @example
  * ```ts
  * app.get('/', (c) => {
  *   return c.render('Hello!')
  * })
  * ```
  */
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  /**
  * Sets the layout for the response.
  *
  * @param layout - The layout to set.
  * @returns The layout function.
  */
  setLayout = (layout) => this.#layout = layout;
  /**
  * Gets the current layout for the response.
  *
  * @returns The current layout function.
  */
  getLayout = () => this.#layout;
  /**
  * `.setRenderer()` can set the layout in the custom middleware.
  *
  * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
  *
  * @example
  * ```tsx
  * app.use('*', async (c, next) => {
  *   c.setRenderer((content) => {
  *     return c.html(
  *       <html>
  *         <body>
  *           <p>{content}</p>
  *         </body>
  *       </html>
  *     )
  *   })
  *   await next()
  * })
  * ```
  */
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  /**
  * `.header()` can set headers.
  *
  * @see {@link https://hono.dev/docs/api/context#header}
  *
  * @example
  * ```ts
  * app.get('/welcome', (c) => {
  *   // Set headers
  *   c.header('X-Message', 'Hello!')
  *   c.header('Content-Type', 'text/plain')
  *
  *   // Append multiple headers using the append option (e.g. Vary)
  *   c.header('Vary', 'Accept-Encoding', { append: true })
  *   c.header('Vary', 'User-Agent', { append: true })
  *
  *   return c.body('Thank you for coming')
  * })
  * ```
  */
  header = (name, value, options) => {
    if (this.finalized && !this.#res.bodyUsed)
      this.#res = createResponseInstance(this.#res.body, this.#res);
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0)
      headers.delete(name);
    else if (options?.append)
      headers.append(name, value);
    else
      headers.set(name, value);
  };
  status = (status) => {
    this.#status = status;
  };
  /**
  * `.set()` can set the value specified by the key.
  *
  * @see {@link https://hono.dev/docs/api/context#set-get}
  *
  * @example
  * ```ts
  * app.use('*', async (c, next) => {
  *   c.set('message', 'Hono is hot!!')
  *   await next()
  * })
  * ```
  */
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  /**
  * `.get()` can use the value specified by the key.
  *
  * @see {@link https://hono.dev/docs/api/context#set-get}
  *
  * @example
  * ```ts
  * app.get('/', (c) => {
  *   const message = c.get('message')
  *   return c.text(`The message is "${message}"`)
  * })
  * ```
  */
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  /**
  * `.var` can access the value of a variable.
  *
  * @see {@link https://hono.dev/docs/api/context#var}
  *
  * @example
  * ```ts
  * const result = c.var.client.oneMethod()
  * ```
  */
  get var() {
    if (!this.#var)
      return {};
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    let responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders;
    if (typeof arg === "object" && arg.headers) {
      responseHeaders ??= new Headers();
      for (const [key, value] of new Headers(arg.headers))
        if (key === "set-cookie")
          responseHeaders.append(key, value);
        else
          responseHeaders.set(key, value);
    }
    if (headers) {
      if (!responseHeaders) {
        let count3 = 0;
        for (const k in headers)
          if (++count3 > 1 || typeof headers[k] !== "string") {
            responseHeaders = new Headers();
            break;
          }
      }
      if (responseHeaders)
        for (const k in headers) {
          const v = headers[k];
          if (typeof v === "string")
            responseHeaders.set(k, v);
          else {
            responseHeaders.delete(k);
            for (const v2 of v)
              responseHeaders.append(k, v2);
          }
        }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return createResponseInstance(data, {
      status,
      headers: responseHeaders ?? headers
    });
  }
  newResponse = (...args) => this.#newResponse(...args);
  /**
  * `.body()` can return the HTTP response.
  * You can set headers with `.header()` and set HTTP status code with `.status`.
  * This can also be set in `.text()`, `.json()` and so on.
  *
  * @see {@link https://hono.dev/docs/api/context#body}
  *
  * @example
  * ```ts
  * app.get('/welcome', (c) => {
  *   // Set headers
  *   c.header('X-Message', 'Hello!')
  *   c.header('Content-Type', 'text/plain')
  *   // Set HTTP status code
  *   c.status(201)
  *
  *   // Return the response body
  *   return c.body('Thank you for coming')
  * })
  * ```
  */
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  /**
  * `.text()` can render text as `Content-Type:text/plain`.
  *
  * @see {@link https://hono.dev/docs/api/context#text}
  *
  * @example
  * ```ts
  * app.get('/say', (c) => {
  *   return c.text('Hello!')
  * })
  * ```
  */
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(text, arg, setDefaultContentType(TEXT_PLAIN, headers));
  };
  /**
  * `.json()` can render JSON as `Content-Type:application/json`.
  *
  * @see {@link https://hono.dev/docs/api/context#json}
  *
  * @example
  * ```ts
  * app.get('/api', (c) => {
  *   return c.json({ message: 'Hello!' })
  * })
  * ```
  */
  json = (object, arg, headers) => {
    return this.#newResponse(JSON.stringify(object), arg, setDefaultContentType("application/json", headers));
  };
  html = (html, arg, headers) => {
    const res = /* @__PURE__ */ __name((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  };
  /**
  * `.redirect()` can Redirect, default status code is 302.
  *
  * @see {@link https://hono.dev/docs/api/context#redirect}
  *
  * @example
  * ```ts
  * app.get('/redirect', (c) => {
  *   return c.redirect('/')
  * })
  * app.get('/redirect-permanently', (c) => {
  *   return c.redirect('/', 301)
  * })
  * ```
  */
  redirect = (location, status) => {
    const locationString = String(location);
    this.header("Location", !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString));
    return this.newResponse(null, status ?? 302);
  };
  /**
  * `.notFound()` can return the Not Found Response.
  *
  * @see {@link https://hono.dev/docs/api/context#notfound}
  *
  * @example
  * ```ts
  * app.get('/notfound', (c) => {
  *   return c.notFound()
  * })
  * ```
  */
  notFound = () => {
    this.#notFoundHandler ??= () => createResponseInstance();
    return this.#notFoundHandler(this);
  };
}, "Context");

// node_modules/hono/dist/compose.js
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context2, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index)
        throw new Error("next() called multiple times");
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context2.req.routeIndex = i;
      } else
        handler = i === middleware.length && next || void 0;
      if (handler)
        try {
          res = await handler(context2, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context2.error = err;
            res = await onError(err, context2);
            isError = true;
          } else
            throw err;
        }
      else if (context2.finalized === false && onNotFound)
        res = await onNotFound(context2);
      if (res && (context2.finalized === false || isError))
        context2.res = res;
      return context2;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// node_modules/hono/dist/router.js
var METHODS = [
  "get",
  "post",
  "put",
  "delete",
  "options",
  "patch",
  "query"
];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = /* @__PURE__ */ __name(class extends Error {
}, "UnsupportedPathError");

// node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/utils/mount.js
var getPathPrefixLength = /* @__PURE__ */ __name((c, pathPrefix, routePath) => {
  if (!/[:*]/.test(pathPrefix))
    return pathPrefix.length;
  const path = c.req.path;
  const matchResult = c.req[GET_MATCH_RESULT];
  const paramNames = /* @__PURE__ */ new Set();
  let length = 0;
  for (const part of splitRoutingPath(pathPrefix)) {
    const pattern = getPattern(part);
    if (pattern && pattern !== "*") {
      const name = pattern[1];
      if (paramNames.has(name))
        throw new Error(`mount(): Duplicate path parameter "${name}" in "${routePath}".`);
      paramNames.add(name);
    }
    if (pattern && pattern !== "*" && pattern[2] !== true) {
      const value = matchResult.length === 2 ? matchResult[1][matchResult[0][c.req.routeIndex][1][pattern[1]]] : matchResult[0][c.req.routeIndex][1][pattern[1]];
      length += value.length + 1;
    } else if (pattern || part.endsWith("*")) {
      const end = path.indexOf("/", length + 1);
      length = end === -1 ? path.length : end;
    } else
      length += part.length + 1;
  }
  return length;
}, "getPathPrefixLength");
var createMountedRequest = /* @__PURE__ */ __name((c, pathPrefix, routePath) => {
  if (/[^/]\*$/.test(routePath))
    throw new Error(`mount(): Wildcard must follow "/" in "${routePath}".`);
  const url = new URL(c.req.raw.url);
  url.pathname = stripPathPrefix(url.pathname, c.req.path, getPathPrefixLength(c, pathPrefix, routePath));
  return new Request(url, c.req.raw);
}, "createMountedRequest");

// node_modules/hono/dist/hono-base.js
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = /* @__PURE__ */ __name(class Hono2 {
  get;
  post;
  put;
  delete;
  options;
  patch;
  query;
  all;
  on;
  use;
  router;
  getPath;
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    [...METHODS, "all"].forEach((method) => {
      this[method] = (args1, ...args) => {
        const methodName = method.toUpperCase();
        if (typeof args1 === "string")
          this.#path = args1;
        else
          this.#addRoute(methodName, this.#path, args1);
        args.forEach((handler) => {
          this.#addRoute(methodName, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          const methodName = m.toUpperCase();
          for (const handler of handlers)
            this.#addRoute(methodName, this.#path, handler);
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string")
        this.#path = arg1;
      else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute("ALL", this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new Hono2({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  errorHandler = errorHandler;
  /**
  * `.route()` allows grouping other Hono instance in routes.
  *
  * @see {@link https://hono.dev/docs/api/routing#grouping}
  *
  * @param {string} path - base Path
  * @param {Hono} app - other Hono instance
  * @returns {Hono} routed Hono instance
  *
  * @example
  * ```ts
  * const app = new Hono()
  * const app2 = new Hono()
  *
  * app2.get("/user", (c) => c.text("user"))
  * app.route("/api", app2) // GET /api/user
  * ```
  */
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler)
        handler = r.handler;
      else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler, r.basePath);
    });
    return this;
  }
  /**
  * `.basePath()` allows base paths to be specified.
  *
  * @see {@link https://hono.dev/docs/api/routing#base-path}
  *
  * @param {string} path - base Path
  * @returns {Hono} changed Hono instance
  *
  * @example
  * ```ts
  * const api = new Hono().basePath('/api')
  * ```
  */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
  * `.onError()` handles an error and returns a customized Response.
  *
  * @see {@link https://hono.dev/docs/api/hono#error-handling}
  *
  * @param {ErrorHandler} handler - request Handler for error
  * @returns {Hono} changed Hono instance
  *
  * @example
  * ```ts
  * app.onError((err, c) => {
  *   console.error(`${err}`)
  *   return c.text('Custom Error Message', 500)
  * })
  * ```
  */
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  /**
  * `.notFound()` allows you to customize a Not Found Response.
  *
  * @see {@link https://hono.dev/docs/api/hono#not-found}
  *
  * @param {NotFoundHandler} handler - request handler for not-found
  * @returns {Hono} changed Hono instance
  *
  * @example
  * ```ts
  * app.notFound((c) => {
  *   return c.text('Custom 404 Message', 404)
  * })
  * ```
  */
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  /**
  * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
  *
  * @deprecated Use `mount()` from `hono/mount` instead. `.mount()` will be removed in v5.
  *
  * @see {@link https://hono.dev/docs/api/hono#mount}
  *
  * @param {string} path - base Path
  * @param {Function} applicationHandler - other Request Handler
  * @param {MountOptions} [options] - options of `.mount()`
  * @returns {Hono} mounted Hono instance
  *
  * @example
  * ```ts
  * import { Router as IttyRouter } from 'itty-router'
  * import { Hono } from 'hono'
  * // Create itty-router application
  * const ittyRouter = IttyRouter()
  * // GET /itty-router/hello
  * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
  *
  * const app = new Hono()
  * app.mount('/itty-router', ittyRouter.handle)
  * ```
  *
  * @example
  * ```ts
  * const app = new Hono()
  * // Send the request to another application without modification.
  * app.mount('/app', anotherApp, {
  *   replaceRequest: (req) => req,
  * })
  * ```
  */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function")
        optionHandler = options;
      else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false)
          replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        else
          replaceRequest = options.replaceRequest;
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    const mergedPath = mergePath(this._basePath, path);
    const defaultReplaceRequest = /* @__PURE__ */ __name((c) => createMountedRequest(c, mergedPath.replace(/\/$/, ""), mergePath(mergedPath, "*")), "defaultReplaceRequest");
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest ? replaceRequest(c.req.raw) : defaultReplaceRequest(c), ...getOptions(c));
      if (res)
        return res;
      await next();
    }, "handler");
    this.#addRoute("ALL", mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler, baseRoutePath) {
    path = mergePath(this._basePath, path);
    const r = {
      basePath: baseRoutePath !== void 0 ? mergePath(this._basePath, baseRoutePath) : this._basePath,
      path,
      method,
      handler
    };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error)
      return this.errorHandler(err, c);
    throw err;
  }
  #dispatch(request, executionCtx, env2, method) {
    if (method === "HEAD")
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env2, "GET")))();
    const path = this.getPath(request, { env: env2 });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env: env2,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then((resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context2 = await composed(c);
        if (!context2.finalized)
          throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");
        return context2.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
  * `.fetch()` will be entry point of your app.
  *
  * @see {@link https://hono.dev/docs/api/hono#fetch}
  *
  * @param {Request} request - request Object of request
  * @param {Env} env - env Object
  * @param {ExecutionContext} executionCtx - context of execution
  * @returns {Response | Promise<Response>} response of request
  *
  */
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  /**
  * `.request()` is a useful method for testing.
  * You can pass a URL or pathname to send a GET request.
  * app will return a Response object.
  * ```ts
  * test('GET /hello is ok', async () => {
  *   const res = await app.request('/hello')
  *   expect(res.status).toBe(200)
  * })
  * ```
  * @see https://hono.dev/docs/api/hono#request
  */
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request)
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    input = input.toString();
    return this.fetch(new Request(/^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`, requestInit), Env, executionCtx);
  };
  /**
  * `.fire()` automatically adds a global fetch event listener.
  * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
  * @deprecated
  * Use `fire` from `hono/service-worker` instead.
  * ```ts
  * import { Hono } from 'hono'
  * import { fire } from 'hono/service-worker'
  *
  * const app = new Hono()
  * // ...
  * fire(app)
  * ```
  * @see https://hono.dev/docs/api/hono#fire
  * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
  * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
  */
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
}, "Hono");

// node_modules/hono/dist/router/utils.js
var createNullObject = /* @__PURE__ */ __name(() => /* @__PURE__ */ Object.create(null), "createNullObject");

// node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = /* @__PURE__ */ __name((method2, path2) => {
    const matcher = matchers[method2] || matchers["ALL"];
    const staticMatch = matcher[2][path2];
    if (staticMatch)
      return staticMatch;
    const match3 = path2.match(matcher[0]);
    if (!match3)
      return [[], emptyParam];
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  }, "match");
  this.match = match2;
  return match2(method, path);
}
__name(match, "match");

// node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = "[^]*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/[^]*)";
var PATH_ERROR = Symbol();
var regExpMetaChars = /* @__PURE__ */ new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1)
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  if (b.length === 1)
    return 1;
  if (a === "[^]*" || a === "(?:|/[^]*)")
    return b === "[^]*" ? -1 : 1;
  else if (b === "[^]*" || b === "(?:|/[^]*)")
    return -1;
  if (a === "[^/]+")
    return 1;
  else if (b === "[^/]+")
    return -1;
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = /* @__PURE__ */ __name(class Node2 {
  #index;
  #varIndex;
  #children = createNullObject();
  insert(tokens, index, paramMap, context2, keys) {
    let node = this;
    for (let i = 0, len = tokens.length; i < len; i++) {
      const token = tokens[i];
      const pattern = token.length === 1 ? token === "*" ? i === len - 1 ? [
        "",
        "",
        ONLY_WILDCARD_REG_EXP_STR
      ] : [
        "",
        "",
        LABEL_REG_EXP_STR
      ] : null : token === "/*" ? [
        "",
        "",
        TAIL_WILDCARD_REG_EXP_STR
      ] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
      let nextNode;
      if (pattern) {
        const name = pattern[1];
        let regexpStr = pattern[2] || "[^/]+";
        if (name && pattern[2]) {
          if (new RegExp(regexpStr).test(""))
            throw PATH_ERROR;
          regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
          if (/\((?!\?:)/.test(regexpStr))
            throw PATH_ERROR;
          if (regexpStr.length === 1 && regExpMetaChars.has(regexpStr))
            throw PATH_ERROR;
        }
        keys.push(regexpStr);
        nextNode = node.#children[regexpStr];
        if (!nextNode) {
          if (regexpStr !== "[^]*" && regexpStr !== "(?:|/[^]*)") {
            for (const k in node.#children)
              if ((regexpStr.length > 1 || k.length > 1) && k !== "[^]*" && k !== "(?:|/[^]*)")
                throw PATH_ERROR;
          }
          nextNode = node.#children[regexpStr] = new Node2();
        }
        if (name !== "") {
          nextNode.#varIndex ??= context2.varIndex++;
          paramMap.push([name, nextNode.#varIndex]);
        }
      } else {
        keys.push(token);
        nextNode = node.#children[token];
        if (!nextNode) {
          for (const k in node.#children)
            if (k.length > 1 && k !== "[^]*" && k !== "(?:|/[^]*)")
              throw PATH_ERROR;
          nextNode = node.#children[token] = new Node2();
        }
      }
      node = nextNode;
    }
    if (node.#index !== void 0)
      throw PATH_ERROR;
    node.#index = index;
  }
  buildRegExpStr() {
    const strList = Object.keys(this.#children).sort(compareKey).map((k) => {
      const c = this.#children[k];
      const childStr = c.buildRegExpStr();
      return childStr === "" ? "" : (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + childStr;
    }).filter(Boolean);
    if (typeof this.#index === "number" && this.#index !== -1)
      strList.unshift(`#${this.#index}`);
    if (strList.length === 0)
      return "";
    if (strList.length === 1)
      return strList[0];
    return "(?:" + strList.join("|") + ")";
  }
}, "Node");

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = /* @__PURE__ */ __name(class {
  #context = { varIndex: 0 };
  #root = new Node();
  #index = 0;
  paths = createNullObject();
  insert(path, isStatic) {
    const keys = [];
    if (isStatic) {
      this.#root.insert(path.split(""), -1, [], this.#context, keys);
      this.paths[path] = [
        -1,
        [],
        keys
      ];
      return;
    }
    const paramAssoc = [];
    const groups = [];
    let markedPath = path;
    for (let i = 0; ; ) {
      let replaced = false;
      markedPath = markedPath.replace(/\{(?:\{[\d,]+\}|[^}])+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced)
        break;
    }
    const tokens = markedPath.match(/(?::[^\/]+)|(?:\/\*$)|./gs) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--)
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
    }
    this.#root.insert(tokens, this.#index, paramAssoc, this.#context, keys);
    this.paths[path] = [
      this.#index++,
      paramAssoc,
      keys
    ];
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "")
      return [
        /^$/,
        [],
        []
      ];
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [
      new RegExp(`^${regexp}`),
      indexReplacementMap,
      paramReplacementMap
    ];
  }
}, "Trie");

// node_modules/hono/dist/router/reg-exp-router/router.js
function endsWithWildcard(keys) {
  const tail = keys[keys.length - 1];
  return tail === "[^]*" || tail === "(?:|/[^]*)";
}
__name(endsWithWildcard, "endsWithWildcard");
function covers(wildcard, target) {
  const last = wildcard.length - 1;
  for (let i = 0; i < last; i++)
    if (wildcard[i] !== target[i])
      return false;
  return wildcard[last] === "[^]*" || target.length === last || target[last] === "/";
}
__name(covers, "covers");
var RegExpRouter = /* @__PURE__ */ __name(class {
  name = "RegExpRouter";
  #handlers;
  #tries;
  constructor() {
    this.#handlers = { ["ALL"]: [] };
    this.#tries = { ["ALL"]: new Trie() };
  }
  #insertPath(method, path) {
    try {
      this.#tries[method].insert(path, !/\*|\/:/.test(path));
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
  }
  add(method, path, handler) {
    const handlers = this.#handlers;
    if (!handlers)
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    const tries = this.#tries;
    if (!handlers[method]) {
      tries[method] = new Trie();
      handlers[method] = [...handlers["ALL"]];
      for (const p in tries["ALL"].paths)
        this.#insertPath(method, p);
    }
    if (path === "/*")
      path = "*";
    const methods = method === "ALL" ? Object.keys(handlers) : [method];
    const paths = checkOptionalParameter(path) || [path];
    for (const path2 of paths)
      for (const m of methods) {
        if (!tries[m].paths[path2])
          this.#insertPath(m, path2);
        handlers[m].push([handler, path2]);
      }
  }
  match = match;
  buildAllMatchers() {
    const matchers = createNullObject();
    for (const method of Object.keys(this.#handlers))
      matchers[method] = this.#buildMatcher(method);
    this.#handlers = this.#tries = void 0;
    return matchers;
  }
  #buildMatcher(method) {
    const handlers = this.#handlers[method];
    const trie = this.#tries[method];
    const staticMap = createNullObject();
    const handlerData = [];
    const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
    const own = createNullObject();
    const entries = handlers.map(([h, p], i) => {
      (own[p] ??= []).push(i);
      return [h, trie.paths[p][1].reduceRight((map, [key, varIndex]) => {
        map[key] = paramReplacementMap[varIndex];
        return map;
      }, createNullObject())];
    });
    const wildcards = Object.keys(own).filter((p) => endsWithWildcard(trie.paths[p][2]));
    for (const path in trie.paths) {
      const [index, , keys] = trie.paths[path];
      const indexes = [...own[path]];
      for (const p of wildcards)
        if (p !== path && covers(trie.paths[p][2], keys))
          indexes.push(...own[p]);
      const data = indexes.sort((a, b) => a - b).map((i) => entries[i]);
      if (index === -1) {
        const last = Math.max(-1, ...data.flatMap(([, map]) => Object.values(map)));
        staticMap[path] = [data, last === -1 ? emptyParam : path.match(regexp).slice(0, last + 1)];
      } else
        handlerData[index] = data;
    }
    return [
      regexp,
      indexReplacementMap.map((i) => handlerData[i]),
      staticMap
    ];
  }
}, "RegExpRouter");

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = /* @__PURE__ */ __name(class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes)
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    this.#routes.push([
      method,
      path,
      handler
    ]);
  }
  match(method, path) {
    if (!this.#routes)
      throw new Error("Fatal error");
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++)
          router.add(...routes[i2]);
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError)
          continue;
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len)
      throw new Error("Fatal error");
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1)
      throw new Error("No active router has been determined yet.");
    return this.#routers[0];
  }
}, "SmartRouter");

// node_modules/hono/dist/router/trie-router/node.js
var emptyParams = createNullObject();
var order = 0;
var Node3 = /* @__PURE__ */ __name(class Node4 {
  #methods = [];
  #children = createNullObject();
  #patterns = [];
  #pattern;
  #params = emptyParams;
  insert(method, path, handler) {
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = /* @__PURE__ */ new Set();
    let i = 0;
    for (const p of parts) {
      const nextP = parts[++i];
      const pattern = getPattern(p, nextP) || (nextP === void 0 && p && p.indexOf("*") === p.length - 1 ? p : null);
      const isParam = Array.isArray(pattern);
      const key = isParam ? pattern[0] : pattern || p;
      const child = curNode.#children[key] ||= new Node4();
      if (pattern && !child.#pattern) {
        child.#pattern = pattern;
        curNode.#patterns.push(child);
      }
      curNode = child;
      if (isParam)
        possibleKeys.add(pattern[1]);
    }
    curNode.#methods.push({ [method]: {
      handler,
      possibleKeys: [...possibleKeys],
      score: ++order
    } });
  }
  #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m["ALL"];
      if (handlerSet) {
        handlerSet.params = createNullObject();
        handlerSets.push(handlerSet);
        for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
          const key = handlerSet.possibleKeys[i2];
          handlerSet.params[key] = params?.[key] && !i2 ? params[key] : nodeParams[key] ?? params?.[key];
        }
      }
    }
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    let curNodes = [this];
    const parts = splitPath(path);
    const curNodesQueue = [];
    const len = parts.length;
    let partOffsets = null;
    for (let i = 0; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"])
              this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
            this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
          } else
            tempNodes.push(nextNode);
        }
        for (const child of node.#patterns) {
          const pattern = child.#pattern;
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (typeof pattern === "string") {
            if (pattern === "*" || part.startsWith(pattern.slice(0, -1))) {
              this.#pushHandlerSets(handlerSets, child, method, node.#params);
              if (pattern === "*") {
                child.#params = params;
                tempNodes.push(child);
              }
            }
            continue;
          }
          const [, name, matcher] = pattern;
          if (!part && matcher === true)
            continue;
          if (matcher !== true) {
            if (!partOffsets) {
              partOffsets = [];
              let offset = path[0] === "/" ? 1 : 0;
              for (let p = 0; p < len; p++) {
                partOffsets[p] = offset;
                offset += parts[p].length + 1;
              }
            }
            const restPathString = path.slice(partOffsets[i]);
            const m = matcher.exec(restPathString);
            if (m) {
              if (!Object.hasOwn(params, name))
                params[name] = m[0];
              this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
              if (m[0].length === restPathString.length && child.#children["*"])
                this.#pushHandlerSets(handlerSets, child.#children["*"], method, node.#params, params);
              for (const _ in child.#children) {
                child.#params = params;
                const componentCount = m[0].match(/\//g)?.length ?? 0;
                (curNodesQueue[componentCount] ||= []).push(child);
                break;
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            if (!Object.hasOwn(params, name))
              params[name] = part;
            if (isLast) {
              this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
              if (child.#children["*"])
                this.#pushHandlerSets(handlerSets, child.#children["*"], method, params, node.#params);
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      const shifted = curNodesQueue.shift();
      curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
    }
    if (handlerSets[1])
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
}, "Node");

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = /* @__PURE__ */ __name(class {
  name = "TrieRouter";
  #node = new Node3();
  add(method, path, handler) {
    for (const result of checkOptionalParameter(path) || [path])
      this.#node.insert(method, result, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
}, "TrieRouter");

// node_modules/hono/dist/hono.js
var Hono3 = /* @__PURE__ */ __name(class extends Hono {
  /**
  * Creates an instance of the Hono class.
  *
  * @param options - Optional configuration options for the Hono instance.
  */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({ routers: [new RegExpRouter(), new TrieRouter()] });
  }
}, "Hono");

// node_modules/hono/dist/middleware/cors/index.js
var cors = /* @__PURE__ */ __name((options) => {
  const opts = {
    origin: "*",
    allowMethods: [
      "GET",
      "HEAD",
      "PUT",
      "POST",
      "DELETE",
      "PATCH",
      "QUERY"
    ],
    allowHeaders: [],
    exposeHeaders: [],
    ...options
  };
  const exposeHeadersStr = opts.exposeHeaders?.length ? opts.exposeHeaders.join(",") : void 0;
  const allowHeadersStr = opts.allowHeaders?.length ? opts.allowHeaders.join(",") : void 0;
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*")
        return () => optsOrigin;
      else
        return (origin) => optsOrigin === origin ? origin : null;
    } else if (typeof optsOrigin === "function")
      return optsOrigin;
    else
      return (origin) => optsOrigin.includes(origin) ? origin : null;
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function")
      return async (origin, c) => (await optsAllowMethods(origin, c)).join(",");
    else if (Array.isArray(optsAllowMethods)) {
      const methodsStr = optsAllowMethods.join(",");
      return () => methodsStr;
    } else
      return () => "";
  })(opts.allowMethods);
  return /* @__PURE__ */ __name(async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    __name(set, "set");
    const allowOrigin = await findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin)
      set("Access-Control-Allow-Origin", allowOrigin);
    if (opts.credentials)
      set("Access-Control-Allow-Credentials", "true");
    if (exposeHeadersStr)
      set("Access-Control-Expose-Headers", exposeHeadersStr);
    if (c.req.method === "OPTIONS") {
      if (opts.origin !== "*")
        c.res.headers.append("Vary", "Origin");
      if (opts.maxAge != null)
        set("Access-Control-Max-Age", opts.maxAge.toString());
      const allowMethods = await findAllowMethods(c.req.header("origin") || "", c);
      if (allowMethods)
        set("Access-Control-Allow-Methods", allowMethods);
      let headersStr = allowHeadersStr;
      if (!headersStr) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders)
          headersStr = requestHeaders.split(",").map((h) => h.trim()).join(",");
      }
      if (headersStr) {
        set("Access-Control-Allow-Headers", headersStr);
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
    if (opts.origin !== "*")
      c.header("Vary", "Origin", { append: true });
  }, "cors");
}, "cors");

// src/db/queries.ts
var DatabaseQueries = class {
  db;
  constructor(db) {
    this.db = db;
  }
  // ========================================================
  // USERS
  // ========================================================
  async getUserByUsername(username) {
    return await this.db.prepare("SELECT * FROM users WHERE username = ? AND is_active = 1").bind(username).first();
  }
  async getUserById(id) {
    return await this.db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first();
  }
  async listUsers(roleFilter) {
    if (roleFilter) {
      const res2 = await this.db.prepare("SELECT * FROM users WHERE role = ? ORDER BY nama_lengkap ASC").bind(roleFilter).all();
      return res2.results;
    }
    const res = await this.db.prepare("SELECT * FROM users ORDER BY role ASC, nama_lengkap ASC").all();
    return res.results;
  }
  async createUser(user) {
    await this.db.prepare(`
      INSERT INTO users (
        id, username, password_hash, role, nama_lengkap, nip, pangkat_golongan, jabatan, mapel, nama_sekolah,
        folder_guru_id, folder_dokumentasi_id, folder_dok_laporan_id, folder_template_id, folder_db_id,
        spreadsheet_id, template_doc_id, foto_profil, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      user.username,
      user.password_hash,
      user.role || "guru",
      user.nama_lengkap,
      user.nip || "",
      user.pangkat_golongan || "",
      user.jabatan || "Guru Mata Pelajaran",
      user.mapel || "",
      user.nama_sekolah || "",
      user.folder_guru_id || "",
      user.folder_dokumentasi_id || "",
      user.folder_dok_laporan_id || "",
      user.folder_template_id || "",
      user.folder_db_id || "",
      user.spreadsheet_id || "",
      user.template_doc_id || "",
      user.foto_profil || "",
      user.is_active !== void 0 ? user.is_active : 1
    ).run();
  }
  async updateUser(id, data) {
    const fields = [];
    const values = [];
    const allowed = [
      "nama_lengkap",
      "nip",
      "pangkat_golongan",
      "jabatan",
      "mapel",
      "nama_sekolah",
      "folder_guru_id",
      "folder_dokumentasi_id",
      "folder_dok_laporan_id",
      "folder_template_id",
      "folder_db_id",
      "spreadsheet_id",
      "template_doc_id",
      "foto_profil",
      "is_active",
      "password_hash"
    ];
    for (const key of allowed) {
      if (data[key] !== void 0) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }
    if (fields.length === 0)
      return;
    fields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);
    await this.db.prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`).bind(...values).run();
  }
  async deleteUser(id) {
    await this.db.prepare("DELETE FROM users WHERE id = ?").bind(id).run();
  }
  // ========================================================
  // KELAS GURU (USER_CLASSES)
  // ========================================================
  async getClassesByUserId(userId) {
    const res = await this.db.prepare("SELECT nama_kelas FROM user_classes WHERE user_id = ? ORDER BY nama_kelas ASC").bind(userId).all();
    return res.results.map((r) => r.nama_kelas);
  }
  async setClassesForUser(userId, classes) {
    await this.db.prepare("DELETE FROM user_classes WHERE user_id = ?").bind(userId).run();
    for (const k of classes) {
      if (k && k.trim()) {
        await this.db.prepare("INSERT INTO user_classes (user_id, nama_kelas) VALUES (?, ?)").bind(userId, k.trim()).run();
      }
    }
  }
  // ========================================================
  // CP & TP (USER_CP_TP)
  // ========================================================
  async getCpTpList(userId, namaKelas) {
    if (namaKelas && namaKelas !== "Semua") {
      const res2 = await this.db.prepare("SELECT * FROM user_cp_tp WHERE user_id = ? AND nama_kelas = ? ORDER BY id DESC").bind(userId, namaKelas).all();
      return res2.results;
    }
    const res = await this.db.prepare("SELECT * FROM user_cp_tp WHERE user_id = ? ORDER BY nama_kelas ASC, id DESC").bind(userId).all();
    return res.results;
  }
  async addCpTp(userId, namaKelas, cp, tp, createdBy = "user") {
    const res = await this.db.prepare("INSERT INTO user_cp_tp (user_id, nama_kelas, cp, tp, created_by) VALUES (?, ?, ?, ?, ?)").bind(userId, namaKelas, cp, tp, createdBy).run();
    return res.meta.last_row_id;
  }
  async updateCpTp(id, cp, tp) {
    await this.db.prepare("UPDATE user_cp_tp SET cp = ?, tp = ? WHERE id = ?").bind(cp, tp, id).run();
  }
  async deleteCpTp(id) {
    await this.db.prepare("DELETE FROM user_cp_tp WHERE id = ?").bind(id).run();
  }
  // ========================================================
  // LAPORAN LHK (LHK_RECORDS)
  // ========================================================
  async getLhkRecords(params) {
    let query = "SELECT * FROM lhk_records WHERE 1=1";
    const bindings = [];
    if (params.userId) {
      query += " AND user_id = ?";
      bindings.push(params.userId);
    }
    if (params.bulan && params.bulan !== "semua" && params.bulan !== "terakhir") {
      query += " AND LOWER(bulan) = LOWER(?)";
      bindings.push(params.bulan);
    }
    if (params.tahunAjaran && params.tahunAjaran !== "semua") {
      query += " AND tahun_ajaran = ?";
      bindings.push(params.tahunAjaran);
    }
    if (params.kelas && params.kelas !== "semua") {
      query += " AND kelas = ?";
      bindings.push(params.kelas);
    }
    query += " ORDER BY tanggal DESC, id DESC";
    if (params.limit) {
      query += " LIMIT ?";
      bindings.push(params.limit);
      if (params.offset) {
        query += " OFFSET ?";
        bindings.push(params.offset);
      }
    }
    const res = await this.db.prepare(query).bind(...bindings).all();
    return res.results;
  }
  async getLhkById(id) {
    return await this.db.prepare("SELECT * FROM lhk_records WHERE id = ?").bind(id).first();
  }
  async createLhkRecord(record) {
    await this.db.prepare(`
      INSERT INTO lhk_records (
        id, user_id, tanggal, tanggal_teks, bulan, tahun_ajaran, cp, tp, kelas, non_tatap_muka,
        volume, keterangan, foto_tm_id, foto_ntm1_id, foto_ntm2_id, foto_ntm3_id, foto_ntm4_id, foto_ntm5_id, synced_to_sheet
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      record.id,
      record.user_id,
      record.tanggal,
      record.tanggal_teks,
      record.bulan,
      record.tahun_ajaran,
      record.cp || "",
      record.tp || "",
      record.kelas || "",
      record.non_tatap_muka || "",
      record.volume || 0,
      record.keterangan || "Terlaksana",
      record.foto_tm_id || "",
      record.foto_ntm1_id || "",
      record.foto_ntm2_id || "",
      record.foto_ntm3_id || "",
      record.foto_ntm4_id || "",
      record.foto_ntm5_id || "",
      record.synced_to_sheet || 0
    ).run();
  }
  async updateLhkRecord(id, record) {
    const fields = [];
    const values = [];
    const allowed = [
      "tanggal",
      "tanggal_teks",
      "bulan",
      "tahun_ajaran",
      "cp",
      "tp",
      "kelas",
      "non_tatap_muka",
      "volume",
      "keterangan",
      "foto_tm_id",
      "foto_ntm1_id",
      "foto_ntm2_id",
      "foto_ntm3_id",
      "foto_ntm4_id",
      "foto_ntm5_id",
      "synced_to_sheet"
    ];
    for (const key of allowed) {
      if (record[key] !== void 0) {
        fields.push(`${key} = ?`);
        values.push(record[key]);
      }
    }
    if (fields.length === 0)
      return;
    fields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);
    await this.db.prepare(`UPDATE lhk_records SET ${fields.join(", ")} WHERE id = ?`).bind(...values).run();
  }
  async deleteLhkRecord(id) {
    await this.db.prepare("DELETE FROM lhk_records WHERE id = ?").bind(id).run();
  }
  // ========================================================
  // ARSIP DOKUMEN CETAK (USER_DOCUMENTS)
  // ========================================================
  async getUserDocuments(userId) {
    const res = await this.db.prepare("SELECT * FROM user_documents WHERE user_id = ? ORDER BY id DESC").bind(userId).all();
    return res.results;
  }
  async saveUserDocument(doc) {
    const res = await this.db.prepare(`
      INSERT INTO user_documents (user_id, bulan, tahun_ajaran, format, nama_file, doc_url, view_url, total_kegiatan)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      doc.user_id,
      doc.bulan,
      doc.tahun_ajaran,
      doc.format,
      doc.nama_file,
      doc.doc_url,
      doc.view_url || doc.doc_url,
      doc.total_kegiatan || 0
    ).run();
    return res.meta.last_row_id;
  }
  async deleteUserDocument(id) {
    await this.db.prepare("DELETE FROM user_documents WHERE id = ?").bind(id).run();
  }
  // ========================================================
  // PENGATURAN SISTEM & REKAP
  // ========================================================
  async getAllSettings() {
    const res = await this.db.prepare("SELECT key, value FROM system_settings").all();
    const map = {};
    for (const r of res.results) {
      map[r.key] = r.value;
    }
    return map;
  }
  async updateSetting(key, value) {
    await this.db.prepare("INSERT INTO system_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(key, value).run();
  }
  async getAdminRekap(bulan, tahunAjaran) {
    let query = `
      SELECT 
        u.id, u.nama_lengkap, u.nip, u.mapel, u.spreadsheet_id, u.folder_guru_id,
        COUNT(l.id) as total_hari,
        COALESCE(SUM(l.volume), 0) as total_volume,
        MAX(l.tanggal) as tanggal_terakhir
      FROM users u
      LEFT JOIN lhk_records l ON u.id = l.user_id
    `;
    const bindings = [];
    const conditions = [];
    if (bulan && bulan.trim() !== "" && bulan.toLowerCase() !== "semua") {
      conditions.push("LOWER(l.bulan) = LOWER(?)");
      bindings.push(bulan.trim());
    }
    if (tahunAjaran && tahunAjaran.trim() !== "" && tahunAjaran.toLowerCase() !== "semua") {
      conditions.push("l.tahun_ajaran = ?");
      bindings.push(tahunAjaran.trim());
    }
    if (conditions.length > 0) {
      query += ` AND ${conditions.join(" AND ")}`;
    }
    query += `
      WHERE u.role = 'guru' AND u.is_active = 1
      GROUP BY u.id
      ORDER BY u.nama_lengkap ASC
    `;
    const res = await this.db.prepare(query).bind(...bindings).all();
    return res.results;
  }
  async getTeacherDashboardMetrics(userId, bulan, tahunAjaran) {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const stats = await this.db.prepare(`
      SELECT COUNT(id) as total_hari, COALESCE(SUM(volume), 0) as total_volume
      FROM lhk_records
      WHERE user_id = ? AND LOWER(bulan) = LOWER(?) AND tahun_ajaran = ?
    `).bind(userId, bulan, tahunAjaran).first();
    const todayRecord = await this.db.prepare(`
      SELECT id FROM lhk_records WHERE user_id = ? AND tanggal = ? LIMIT 1
    `).bind(userId, today).first();
    const docsCount = await this.db.prepare(`
      SELECT COUNT(id) as total_dokumen FROM user_documents WHERE user_id = ?
    `).bind(userId).first();
    const classCount = await this.db.prepare(`
      SELECT COUNT(id) as total_kelas FROM user_classes WHERE user_id = ?
    `).bind(userId).first();
    return {
      totalHariBulanIni: stats?.total_hari || 0,
      totalVolumeBulanIni: stats?.total_volume || 0,
      sudahIsiHariIni: !!todayRecord,
      totalDokumen: docsCount?.total_dokumen || 0,
      totalKelas: classCount?.total_kelas || 0
    };
  }
};
__name(DatabaseQueries, "DatabaseQueries");

// node_modules/jose/dist/browser/runtime/webcrypto.js
var webcrypto_default = crypto;
var isCryptoKey = /* @__PURE__ */ __name((key) => key instanceof CryptoKey, "isCryptoKey");

// node_modules/jose/dist/browser/lib/buffer_utils.js
var encoder = new TextEncoder();
var decoder = new TextDecoder();
var MAX_INT32 = 2 ** 32;
function concat(...buffers) {
  const size = buffers.reduce((acc, { length }) => acc + length, 0);
  const buf = new Uint8Array(size);
  let i = 0;
  for (const buffer of buffers) {
    buf.set(buffer, i);
    i += buffer.length;
  }
  return buf;
}
__name(concat, "concat");

// node_modules/jose/dist/browser/runtime/base64url.js
var encodeBase64 = /* @__PURE__ */ __name((input) => {
  let unencoded = input;
  if (typeof unencoded === "string") {
    unencoded = encoder.encode(unencoded);
  }
  const CHUNK_SIZE = 32768;
  const arr = [];
  for (let i = 0; i < unencoded.length; i += CHUNK_SIZE) {
    arr.push(String.fromCharCode.apply(null, unencoded.subarray(i, i + CHUNK_SIZE)));
  }
  return btoa(arr.join(""));
}, "encodeBase64");
var encode = /* @__PURE__ */ __name((input) => {
  return encodeBase64(input).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}, "encode");
var decodeBase64 = /* @__PURE__ */ __name((encoded) => {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}, "decodeBase64");
var decode = /* @__PURE__ */ __name((input) => {
  let encoded = input;
  if (encoded instanceof Uint8Array) {
    encoded = decoder.decode(encoded);
  }
  encoded = encoded.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "");
  try {
    return decodeBase64(encoded);
  } catch {
    throw new TypeError("The input to be decoded is not correctly encoded.");
  }
}, "decode");

// node_modules/jose/dist/browser/util/errors.js
var JOSEError = class extends Error {
  constructor(message2, options) {
    super(message2, options);
    this.code = "ERR_JOSE_GENERIC";
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
};
__name(JOSEError, "JOSEError");
JOSEError.code = "ERR_JOSE_GENERIC";
var JWTClaimValidationFailed = class extends JOSEError {
  constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
    super(message2, { cause: { claim, reason, payload } });
    this.code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
    this.claim = claim;
    this.reason = reason;
    this.payload = payload;
  }
};
__name(JWTClaimValidationFailed, "JWTClaimValidationFailed");
JWTClaimValidationFailed.code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
var JWTExpired = class extends JOSEError {
  constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
    super(message2, { cause: { claim, reason, payload } });
    this.code = "ERR_JWT_EXPIRED";
    this.claim = claim;
    this.reason = reason;
    this.payload = payload;
  }
};
__name(JWTExpired, "JWTExpired");
JWTExpired.code = "ERR_JWT_EXPIRED";
var JOSEAlgNotAllowed = class extends JOSEError {
  constructor() {
    super(...arguments);
    this.code = "ERR_JOSE_ALG_NOT_ALLOWED";
  }
};
__name(JOSEAlgNotAllowed, "JOSEAlgNotAllowed");
JOSEAlgNotAllowed.code = "ERR_JOSE_ALG_NOT_ALLOWED";
var JOSENotSupported = class extends JOSEError {
  constructor() {
    super(...arguments);
    this.code = "ERR_JOSE_NOT_SUPPORTED";
  }
};
__name(JOSENotSupported, "JOSENotSupported");
JOSENotSupported.code = "ERR_JOSE_NOT_SUPPORTED";
var JWEDecryptionFailed = class extends JOSEError {
  constructor(message2 = "decryption operation failed", options) {
    super(message2, options);
    this.code = "ERR_JWE_DECRYPTION_FAILED";
  }
};
__name(JWEDecryptionFailed, "JWEDecryptionFailed");
JWEDecryptionFailed.code = "ERR_JWE_DECRYPTION_FAILED";
var JWEInvalid = class extends JOSEError {
  constructor() {
    super(...arguments);
    this.code = "ERR_JWE_INVALID";
  }
};
__name(JWEInvalid, "JWEInvalid");
JWEInvalid.code = "ERR_JWE_INVALID";
var JWSInvalid = class extends JOSEError {
  constructor() {
    super(...arguments);
    this.code = "ERR_JWS_INVALID";
  }
};
__name(JWSInvalid, "JWSInvalid");
JWSInvalid.code = "ERR_JWS_INVALID";
var JWTInvalid = class extends JOSEError {
  constructor() {
    super(...arguments);
    this.code = "ERR_JWT_INVALID";
  }
};
__name(JWTInvalid, "JWTInvalid");
JWTInvalid.code = "ERR_JWT_INVALID";
var JWKInvalid = class extends JOSEError {
  constructor() {
    super(...arguments);
    this.code = "ERR_JWK_INVALID";
  }
};
__name(JWKInvalid, "JWKInvalid");
JWKInvalid.code = "ERR_JWK_INVALID";
var JWKSInvalid = class extends JOSEError {
  constructor() {
    super(...arguments);
    this.code = "ERR_JWKS_INVALID";
  }
};
__name(JWKSInvalid, "JWKSInvalid");
JWKSInvalid.code = "ERR_JWKS_INVALID";
var JWKSNoMatchingKey = class extends JOSEError {
  constructor(message2 = "no applicable key found in the JSON Web Key Set", options) {
    super(message2, options);
    this.code = "ERR_JWKS_NO_MATCHING_KEY";
  }
};
__name(JWKSNoMatchingKey, "JWKSNoMatchingKey");
JWKSNoMatchingKey.code = "ERR_JWKS_NO_MATCHING_KEY";
var JWKSMultipleMatchingKeys = class extends JOSEError {
  constructor(message2 = "multiple matching keys found in the JSON Web Key Set", options) {
    super(message2, options);
    this.code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
  }
};
__name(JWKSMultipleMatchingKeys, "JWKSMultipleMatchingKeys");
JWKSMultipleMatchingKeys.code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
var JWKSTimeout = class extends JOSEError {
  constructor(message2 = "request timed out", options) {
    super(message2, options);
    this.code = "ERR_JWKS_TIMEOUT";
  }
};
__name(JWKSTimeout, "JWKSTimeout");
JWKSTimeout.code = "ERR_JWKS_TIMEOUT";
var JWSSignatureVerificationFailed = class extends JOSEError {
  constructor(message2 = "signature verification failed", options) {
    super(message2, options);
    this.code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
  }
};
__name(JWSSignatureVerificationFailed, "JWSSignatureVerificationFailed");
JWSSignatureVerificationFailed.code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";

// node_modules/jose/dist/browser/lib/crypto_key.js
function unusable(name, prop = "algorithm.name") {
  return new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`);
}
__name(unusable, "unusable");
function isAlgorithm(algorithm, name) {
  return algorithm.name === name;
}
__name(isAlgorithm, "isAlgorithm");
function getHashLength(hash) {
  return parseInt(hash.name.slice(4), 10);
}
__name(getHashLength, "getHashLength");
function getNamedCurve(alg) {
  switch (alg) {
    case "ES256":
      return "P-256";
    case "ES384":
      return "P-384";
    case "ES512":
      return "P-521";
    default:
      throw new Error("unreachable");
  }
}
__name(getNamedCurve, "getNamedCurve");
function checkUsage(key, usages) {
  if (usages.length && !usages.some((expected) => key.usages.includes(expected))) {
    let msg = "CryptoKey does not support this operation, its usages must include ";
    if (usages.length > 2) {
      const last = usages.pop();
      msg += `one of ${usages.join(", ")}, or ${last}.`;
    } else if (usages.length === 2) {
      msg += `one of ${usages[0]} or ${usages[1]}.`;
    } else {
      msg += `${usages[0]}.`;
    }
    throw new TypeError(msg);
  }
}
__name(checkUsage, "checkUsage");
function checkSigCryptoKey(key, alg, ...usages) {
  switch (alg) {
    case "HS256":
    case "HS384":
    case "HS512": {
      if (!isAlgorithm(key.algorithm, "HMAC"))
        throw unusable("HMAC");
      const expected = parseInt(alg.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "RS256":
    case "RS384":
    case "RS512": {
      if (!isAlgorithm(key.algorithm, "RSASSA-PKCS1-v1_5"))
        throw unusable("RSASSA-PKCS1-v1_5");
      const expected = parseInt(alg.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "PS256":
    case "PS384":
    case "PS512": {
      if (!isAlgorithm(key.algorithm, "RSA-PSS"))
        throw unusable("RSA-PSS");
      const expected = parseInt(alg.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "EdDSA": {
      if (key.algorithm.name !== "Ed25519" && key.algorithm.name !== "Ed448") {
        throw unusable("Ed25519 or Ed448");
      }
      break;
    }
    case "Ed25519": {
      if (!isAlgorithm(key.algorithm, "Ed25519"))
        throw unusable("Ed25519");
      break;
    }
    case "ES256":
    case "ES384":
    case "ES512": {
      if (!isAlgorithm(key.algorithm, "ECDSA"))
        throw unusable("ECDSA");
      const expected = getNamedCurve(alg);
      const actual = key.algorithm.namedCurve;
      if (actual !== expected)
        throw unusable(expected, "algorithm.namedCurve");
      break;
    }
    default:
      throw new TypeError("CryptoKey does not support this operation");
  }
  checkUsage(key, usages);
}
__name(checkSigCryptoKey, "checkSigCryptoKey");

// node_modules/jose/dist/browser/lib/invalid_key_input.js
function message(msg, actual, ...types2) {
  types2 = types2.filter(Boolean);
  if (types2.length > 2) {
    const last = types2.pop();
    msg += `one of type ${types2.join(", ")}, or ${last}.`;
  } else if (types2.length === 2) {
    msg += `one of type ${types2[0]} or ${types2[1]}.`;
  } else {
    msg += `of type ${types2[0]}.`;
  }
  if (actual == null) {
    msg += ` Received ${actual}`;
  } else if (typeof actual === "function" && actual.name) {
    msg += ` Received function ${actual.name}`;
  } else if (typeof actual === "object" && actual != null) {
    if (actual.constructor?.name) {
      msg += ` Received an instance of ${actual.constructor.name}`;
    }
  }
  return msg;
}
__name(message, "message");
var invalid_key_input_default = /* @__PURE__ */ __name((actual, ...types2) => {
  return message("Key must be ", actual, ...types2);
}, "default");
function withAlg(alg, actual, ...types2) {
  return message(`Key for the ${alg} algorithm must be `, actual, ...types2);
}
__name(withAlg, "withAlg");

// node_modules/jose/dist/browser/runtime/is_key_like.js
var is_key_like_default = /* @__PURE__ */ __name((key) => {
  if (isCryptoKey(key)) {
    return true;
  }
  return key?.[Symbol.toStringTag] === "KeyObject";
}, "default");
var types = ["CryptoKey"];

// node_modules/jose/dist/browser/lib/is_disjoint.js
var isDisjoint = /* @__PURE__ */ __name((...headers) => {
  const sources = headers.filter(Boolean);
  if (sources.length === 0 || sources.length === 1) {
    return true;
  }
  let acc;
  for (const header of sources) {
    const parameters = Object.keys(header);
    if (!acc || acc.size === 0) {
      acc = new Set(parameters);
      continue;
    }
    for (const parameter of parameters) {
      if (acc.has(parameter)) {
        return false;
      }
      acc.add(parameter);
    }
  }
  return true;
}, "isDisjoint");
var is_disjoint_default = isDisjoint;

// node_modules/jose/dist/browser/lib/is_object.js
function isObjectLike(value) {
  return typeof value === "object" && value !== null;
}
__name(isObjectLike, "isObjectLike");
function isObject(input) {
  if (!isObjectLike(input) || Object.prototype.toString.call(input) !== "[object Object]") {
    return false;
  }
  if (Object.getPrototypeOf(input) === null) {
    return true;
  }
  let proto = input;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(input) === proto;
}
__name(isObject, "isObject");

// node_modules/jose/dist/browser/runtime/check_key_length.js
var check_key_length_default = /* @__PURE__ */ __name((alg, key) => {
  if (alg.startsWith("RS") || alg.startsWith("PS")) {
    const { modulusLength } = key.algorithm;
    if (typeof modulusLength !== "number" || modulusLength < 2048) {
      throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
    }
  }
}, "default");

// node_modules/jose/dist/browser/lib/is_jwk.js
function isJWK(key) {
  return isObject(key) && typeof key.kty === "string";
}
__name(isJWK, "isJWK");
function isPrivateJWK(key) {
  return key.kty !== "oct" && typeof key.d === "string";
}
__name(isPrivateJWK, "isPrivateJWK");
function isPublicJWK(key) {
  return key.kty !== "oct" && typeof key.d === "undefined";
}
__name(isPublicJWK, "isPublicJWK");
function isSecretJWK(key) {
  return isJWK(key) && key.kty === "oct" && typeof key.k === "string";
}
__name(isSecretJWK, "isSecretJWK");

// node_modules/jose/dist/browser/runtime/jwk_to_key.js
function subtleMapping(jwk) {
  let algorithm;
  let keyUsages;
  switch (jwk.kty) {
    case "RSA": {
      switch (jwk.alg) {
        case "PS256":
        case "PS384":
        case "PS512":
          algorithm = { name: "RSA-PSS", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RS256":
        case "RS384":
        case "RS512":
          algorithm = { name: "RSASSA-PKCS1-v1_5", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RSA-OAEP":
        case "RSA-OAEP-256":
        case "RSA-OAEP-384":
        case "RSA-OAEP-512":
          algorithm = {
            name: "RSA-OAEP",
            hash: `SHA-${parseInt(jwk.alg.slice(-3), 10) || 1}`
          };
          keyUsages = jwk.d ? ["decrypt", "unwrapKey"] : ["encrypt", "wrapKey"];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    case "EC": {
      switch (jwk.alg) {
        case "ES256":
          algorithm = { name: "ECDSA", namedCurve: "P-256" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ES384":
          algorithm = { name: "ECDSA", namedCurve: "P-384" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ES512":
          algorithm = { name: "ECDSA", namedCurve: "P-521" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: "ECDH", namedCurve: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    case "OKP": {
      switch (jwk.alg) {
        case "Ed25519":
          algorithm = { name: "Ed25519" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "EdDSA":
          algorithm = { name: jwk.crv };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    default:
      throw new JOSENotSupported('Invalid or unsupported JWK "kty" (Key Type) Parameter value');
  }
  return { algorithm, keyUsages };
}
__name(subtleMapping, "subtleMapping");
var parse = /* @__PURE__ */ __name(async (jwk) => {
  if (!jwk.alg) {
    throw new TypeError('"alg" argument is required when "jwk.alg" is not present');
  }
  const { algorithm, keyUsages } = subtleMapping(jwk);
  const rest = [
    algorithm,
    jwk.ext ?? false,
    jwk.key_ops ?? keyUsages
  ];
  const keyData = { ...jwk };
  delete keyData.alg;
  delete keyData.use;
  return webcrypto_default.subtle.importKey("jwk", keyData, ...rest);
}, "parse");
var jwk_to_key_default = parse;

// node_modules/jose/dist/browser/runtime/normalize_key.js
var exportKeyValue = /* @__PURE__ */ __name((k) => decode(k), "exportKeyValue");
var privCache;
var pubCache;
var isKeyObject = /* @__PURE__ */ __name((key) => {
  return key?.[Symbol.toStringTag] === "KeyObject";
}, "isKeyObject");
var importAndCache = /* @__PURE__ */ __name(async (cache, key, jwk, alg, freeze = false) => {
  let cached = cache.get(key);
  if (cached?.[alg]) {
    return cached[alg];
  }
  const cryptoKey = await jwk_to_key_default({ ...jwk, alg });
  if (freeze)
    Object.freeze(key);
  if (!cached) {
    cache.set(key, { [alg]: cryptoKey });
  } else {
    cached[alg] = cryptoKey;
  }
  return cryptoKey;
}, "importAndCache");
var normalizePublicKey = /* @__PURE__ */ __name((key, alg) => {
  if (isKeyObject(key)) {
    let jwk = key.export({ format: "jwk" });
    delete jwk.d;
    delete jwk.dp;
    delete jwk.dq;
    delete jwk.p;
    delete jwk.q;
    delete jwk.qi;
    if (jwk.k) {
      return exportKeyValue(jwk.k);
    }
    pubCache || (pubCache = /* @__PURE__ */ new WeakMap());
    return importAndCache(pubCache, key, jwk, alg);
  }
  if (isJWK(key)) {
    if (key.k)
      return decode(key.k);
    pubCache || (pubCache = /* @__PURE__ */ new WeakMap());
    const cryptoKey = importAndCache(pubCache, key, key, alg, true);
    return cryptoKey;
  }
  return key;
}, "normalizePublicKey");
var normalizePrivateKey = /* @__PURE__ */ __name((key, alg) => {
  if (isKeyObject(key)) {
    let jwk = key.export({ format: "jwk" });
    if (jwk.k) {
      return exportKeyValue(jwk.k);
    }
    privCache || (privCache = /* @__PURE__ */ new WeakMap());
    return importAndCache(privCache, key, jwk, alg);
  }
  if (isJWK(key)) {
    if (key.k)
      return decode(key.k);
    privCache || (privCache = /* @__PURE__ */ new WeakMap());
    const cryptoKey = importAndCache(privCache, key, key, alg, true);
    return cryptoKey;
  }
  return key;
}, "normalizePrivateKey");
var normalize_key_default = { normalizePublicKey, normalizePrivateKey };

// node_modules/jose/dist/browser/key/import.js
async function importJWK(jwk, alg) {
  if (!isObject(jwk)) {
    throw new TypeError("JWK must be an object");
  }
  alg || (alg = jwk.alg);
  switch (jwk.kty) {
    case "oct":
      if (typeof jwk.k !== "string" || !jwk.k) {
        throw new TypeError('missing "k" (Key Value) Parameter value');
      }
      return decode(jwk.k);
    case "RSA":
      if ("oth" in jwk && jwk.oth !== void 0) {
        throw new JOSENotSupported('RSA JWK "oth" (Other Primes Info) Parameter value is not supported');
      }
    case "EC":
    case "OKP":
      return jwk_to_key_default({ ...jwk, alg });
    default:
      throw new JOSENotSupported('Unsupported "kty" (Key Type) Parameter value');
  }
}
__name(importJWK, "importJWK");

// node_modules/jose/dist/browser/lib/check_key_type.js
var tag = /* @__PURE__ */ __name((key) => key?.[Symbol.toStringTag], "tag");
var jwkMatchesOp = /* @__PURE__ */ __name((alg, key, usage) => {
  if (key.use !== void 0 && key.use !== "sig") {
    throw new TypeError("Invalid key for this operation, when present its use must be sig");
  }
  if (key.key_ops !== void 0 && key.key_ops.includes?.(usage) !== true) {
    throw new TypeError(`Invalid key for this operation, when present its key_ops must include ${usage}`);
  }
  if (key.alg !== void 0 && key.alg !== alg) {
    throw new TypeError(`Invalid key for this operation, when present its alg must be ${alg}`);
  }
  return true;
}, "jwkMatchesOp");
var symmetricTypeCheck = /* @__PURE__ */ __name((alg, key, usage, allowJwk) => {
  if (key instanceof Uint8Array)
    return;
  if (allowJwk && isJWK(key)) {
    if (isSecretJWK(key) && jwkMatchesOp(alg, key, usage))
      return;
    throw new TypeError(`JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present`);
  }
  if (!is_key_like_default(key)) {
    throw new TypeError(withAlg(alg, key, ...types, "Uint8Array", allowJwk ? "JSON Web Key" : null));
  }
  if (key.type !== "secret") {
    throw new TypeError(`${tag(key)} instances for symmetric algorithms must be of type "secret"`);
  }
}, "symmetricTypeCheck");
var asymmetricTypeCheck = /* @__PURE__ */ __name((alg, key, usage, allowJwk) => {
  if (allowJwk && isJWK(key)) {
    switch (usage) {
      case "sign":
        if (isPrivateJWK(key) && jwkMatchesOp(alg, key, usage))
          return;
        throw new TypeError(`JSON Web Key for this operation be a private JWK`);
      case "verify":
        if (isPublicJWK(key) && jwkMatchesOp(alg, key, usage))
          return;
        throw new TypeError(`JSON Web Key for this operation be a public JWK`);
    }
  }
  if (!is_key_like_default(key)) {
    throw new TypeError(withAlg(alg, key, ...types, allowJwk ? "JSON Web Key" : null));
  }
  if (key.type === "secret") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithms must not be of type "secret"`);
  }
  if (usage === "sign" && key.type === "public") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithm signing must be of type "private"`);
  }
  if (usage === "decrypt" && key.type === "public") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithm decryption must be of type "private"`);
  }
  if (key.algorithm && usage === "verify" && key.type === "private") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithm verifying must be of type "public"`);
  }
  if (key.algorithm && usage === "encrypt" && key.type === "private") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithm encryption must be of type "public"`);
  }
}, "asymmetricTypeCheck");
function checkKeyType(allowJwk, alg, key, usage) {
  const symmetric = alg.startsWith("HS") || alg === "dir" || alg.startsWith("PBES2") || /^A\d{3}(?:GCM)?KW$/.test(alg);
  if (symmetric) {
    symmetricTypeCheck(alg, key, usage, allowJwk);
  } else {
    asymmetricTypeCheck(alg, key, usage, allowJwk);
  }
}
__name(checkKeyType, "checkKeyType");
var check_key_type_default = checkKeyType.bind(void 0, false);
var checkKeyTypeWithJwk = checkKeyType.bind(void 0, true);

// node_modules/jose/dist/browser/lib/validate_crit.js
function validateCrit(Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) {
  if (joseHeader.crit !== void 0 && protectedHeader?.crit === void 0) {
    throw new Err('"crit" (Critical) Header Parameter MUST be integrity protected');
  }
  if (!protectedHeader || protectedHeader.crit === void 0) {
    return /* @__PURE__ */ new Set();
  }
  if (!Array.isArray(protectedHeader.crit) || protectedHeader.crit.length === 0 || protectedHeader.crit.some((input) => typeof input !== "string" || input.length === 0)) {
    throw new Err('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
  }
  let recognized;
  if (recognizedOption !== void 0) {
    recognized = new Map([...Object.entries(recognizedOption), ...recognizedDefault.entries()]);
  } else {
    recognized = recognizedDefault;
  }
  for (const parameter of protectedHeader.crit) {
    if (!recognized.has(parameter)) {
      throw new JOSENotSupported(`Extension Header Parameter "${parameter}" is not recognized`);
    }
    if (joseHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" is missing`);
    }
    if (recognized.get(parameter) && protectedHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
    }
  }
  return new Set(protectedHeader.crit);
}
__name(validateCrit, "validateCrit");
var validate_crit_default = validateCrit;

// node_modules/jose/dist/browser/lib/validate_algorithms.js
var validateAlgorithms = /* @__PURE__ */ __name((option, algorithms) => {
  if (algorithms !== void 0 && (!Array.isArray(algorithms) || algorithms.some((s) => typeof s !== "string"))) {
    throw new TypeError(`"${option}" option must be an array of strings`);
  }
  if (!algorithms) {
    return void 0;
  }
  return new Set(algorithms);
}, "validateAlgorithms");
var validate_algorithms_default = validateAlgorithms;

// node_modules/jose/dist/browser/runtime/subtle_dsa.js
function subtleDsa(alg, algorithm) {
  const hash = `SHA-${alg.slice(-3)}`;
  switch (alg) {
    case "HS256":
    case "HS384":
    case "HS512":
      return { hash, name: "HMAC" };
    case "PS256":
    case "PS384":
    case "PS512":
      return { hash, name: "RSA-PSS", saltLength: alg.slice(-3) >> 3 };
    case "RS256":
    case "RS384":
    case "RS512":
      return { hash, name: "RSASSA-PKCS1-v1_5" };
    case "ES256":
    case "ES384":
    case "ES512":
      return { hash, name: "ECDSA", namedCurve: algorithm.namedCurve };
    case "Ed25519":
      return { name: "Ed25519" };
    case "EdDSA":
      return { name: algorithm.name };
    default:
      throw new JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
  }
}
__name(subtleDsa, "subtleDsa");

// node_modules/jose/dist/browser/runtime/get_sign_verify_key.js
async function getCryptoKey(alg, key, usage) {
  if (usage === "sign") {
    key = await normalize_key_default.normalizePrivateKey(key, alg);
  }
  if (usage === "verify") {
    key = await normalize_key_default.normalizePublicKey(key, alg);
  }
  if (isCryptoKey(key)) {
    checkSigCryptoKey(key, alg, usage);
    return key;
  }
  if (key instanceof Uint8Array) {
    if (!alg.startsWith("HS")) {
      throw new TypeError(invalid_key_input_default(key, ...types));
    }
    return webcrypto_default.subtle.importKey("raw", key, { hash: `SHA-${alg.slice(-3)}`, name: "HMAC" }, false, [usage]);
  }
  throw new TypeError(invalid_key_input_default(key, ...types, "Uint8Array", "JSON Web Key"));
}
__name(getCryptoKey, "getCryptoKey");

// node_modules/jose/dist/browser/runtime/verify.js
var verify = /* @__PURE__ */ __name(async (alg, key, signature, data) => {
  const cryptoKey = await getCryptoKey(alg, key, "verify");
  check_key_length_default(alg, cryptoKey);
  const algorithm = subtleDsa(alg, cryptoKey.algorithm);
  try {
    return await webcrypto_default.subtle.verify(algorithm, cryptoKey, signature, data);
  } catch {
    return false;
  }
}, "verify");
var verify_default = verify;

// node_modules/jose/dist/browser/jws/flattened/verify.js
async function flattenedVerify(jws, key, options) {
  if (!isObject(jws)) {
    throw new JWSInvalid("Flattened JWS must be an object");
  }
  if (jws.protected === void 0 && jws.header === void 0) {
    throw new JWSInvalid('Flattened JWS must have either of the "protected" or "header" members');
  }
  if (jws.protected !== void 0 && typeof jws.protected !== "string") {
    throw new JWSInvalid("JWS Protected Header incorrect type");
  }
  if (jws.payload === void 0) {
    throw new JWSInvalid("JWS Payload missing");
  }
  if (typeof jws.signature !== "string") {
    throw new JWSInvalid("JWS Signature missing or incorrect type");
  }
  if (jws.header !== void 0 && !isObject(jws.header)) {
    throw new JWSInvalid("JWS Unprotected Header incorrect type");
  }
  let parsedProt = {};
  if (jws.protected) {
    try {
      const protectedHeader = decode(jws.protected);
      parsedProt = JSON.parse(decoder.decode(protectedHeader));
    } catch {
      throw new JWSInvalid("JWS Protected Header is invalid");
    }
  }
  if (!is_disjoint_default(parsedProt, jws.header)) {
    throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
  }
  const joseHeader = {
    ...parsedProt,
    ...jws.header
  };
  const extensions = validate_crit_default(JWSInvalid, /* @__PURE__ */ new Map([["b64", true]]), options?.crit, parsedProt, joseHeader);
  let b64 = true;
  if (extensions.has("b64")) {
    b64 = parsedProt.b64;
    if (typeof b64 !== "boolean") {
      throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
    }
  }
  const { alg } = joseHeader;
  if (typeof alg !== "string" || !alg) {
    throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
  }
  const algorithms = options && validate_algorithms_default("algorithms", options.algorithms);
  if (algorithms && !algorithms.has(alg)) {
    throw new JOSEAlgNotAllowed('"alg" (Algorithm) Header Parameter value not allowed');
  }
  if (b64) {
    if (typeof jws.payload !== "string") {
      throw new JWSInvalid("JWS Payload must be a string");
    }
  } else if (typeof jws.payload !== "string" && !(jws.payload instanceof Uint8Array)) {
    throw new JWSInvalid("JWS Payload must be a string or an Uint8Array instance");
  }
  let resolvedKey = false;
  if (typeof key === "function") {
    key = await key(parsedProt, jws);
    resolvedKey = true;
    checkKeyTypeWithJwk(alg, key, "verify");
    if (isJWK(key)) {
      key = await importJWK(key, alg);
    }
  } else {
    checkKeyTypeWithJwk(alg, key, "verify");
  }
  const data = concat(encoder.encode(jws.protected ?? ""), encoder.encode("."), typeof jws.payload === "string" ? encoder.encode(jws.payload) : jws.payload);
  let signature;
  try {
    signature = decode(jws.signature);
  } catch {
    throw new JWSInvalid("Failed to base64url decode the signature");
  }
  const verified = await verify_default(alg, key, signature, data);
  if (!verified) {
    throw new JWSSignatureVerificationFailed();
  }
  let payload;
  if (b64) {
    try {
      payload = decode(jws.payload);
    } catch {
      throw new JWSInvalid("Failed to base64url decode the payload");
    }
  } else if (typeof jws.payload === "string") {
    payload = encoder.encode(jws.payload);
  } else {
    payload = jws.payload;
  }
  const result = { payload };
  if (jws.protected !== void 0) {
    result.protectedHeader = parsedProt;
  }
  if (jws.header !== void 0) {
    result.unprotectedHeader = jws.header;
  }
  if (resolvedKey) {
    return { ...result, key };
  }
  return result;
}
__name(flattenedVerify, "flattenedVerify");

// node_modules/jose/dist/browser/jws/compact/verify.js
async function compactVerify(jws, key, options) {
  if (jws instanceof Uint8Array) {
    jws = decoder.decode(jws);
  }
  if (typeof jws !== "string") {
    throw new JWSInvalid("Compact JWS must be a string or Uint8Array");
  }
  const { 0: protectedHeader, 1: payload, 2: signature, length } = jws.split(".");
  if (length !== 3) {
    throw new JWSInvalid("Invalid Compact JWS");
  }
  const verified = await flattenedVerify({ payload, protected: protectedHeader, signature }, key, options);
  const result = { payload: verified.payload, protectedHeader: verified.protectedHeader };
  if (typeof key === "function") {
    return { ...result, key: verified.key };
  }
  return result;
}
__name(compactVerify, "compactVerify");

// node_modules/jose/dist/browser/lib/epoch.js
var epoch_default = /* @__PURE__ */ __name((date) => Math.floor(date.getTime() / 1e3), "default");

// node_modules/jose/dist/browser/lib/secs.js
var minute = 60;
var hour = minute * 60;
var day = hour * 24;
var week = day * 7;
var year = day * 365.25;
var REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
var secs_default = /* @__PURE__ */ __name((str) => {
  const matched = REGEX.exec(str);
  if (!matched || matched[4] && matched[1]) {
    throw new TypeError("Invalid time period format");
  }
  const value = parseFloat(matched[2]);
  const unit = matched[3].toLowerCase();
  let numericDate;
  switch (unit) {
    case "sec":
    case "secs":
    case "second":
    case "seconds":
    case "s":
      numericDate = Math.round(value);
      break;
    case "minute":
    case "minutes":
    case "min":
    case "mins":
    case "m":
      numericDate = Math.round(value * minute);
      break;
    case "hour":
    case "hours":
    case "hr":
    case "hrs":
    case "h":
      numericDate = Math.round(value * hour);
      break;
    case "day":
    case "days":
    case "d":
      numericDate = Math.round(value * day);
      break;
    case "week":
    case "weeks":
    case "w":
      numericDate = Math.round(value * week);
      break;
    default:
      numericDate = Math.round(value * year);
      break;
  }
  if (matched[1] === "-" || matched[4] === "ago") {
    return -numericDate;
  }
  return numericDate;
}, "default");

// node_modules/jose/dist/browser/lib/jwt_claims_set.js
var normalizeTyp = /* @__PURE__ */ __name((value) => value.toLowerCase().replace(/^application\//, ""), "normalizeTyp");
var checkAudiencePresence = /* @__PURE__ */ __name((audPayload, audOption) => {
  if (typeof audPayload === "string") {
    return audOption.includes(audPayload);
  }
  if (Array.isArray(audPayload)) {
    return audOption.some(Set.prototype.has.bind(new Set(audPayload)));
  }
  return false;
}, "checkAudiencePresence");
var jwt_claims_set_default = /* @__PURE__ */ __name((protectedHeader, encodedPayload, options = {}) => {
  let payload;
  try {
    payload = JSON.parse(decoder.decode(encodedPayload));
  } catch {
  }
  if (!isObject(payload)) {
    throw new JWTInvalid("JWT Claims Set must be a top-level JSON object");
  }
  const { typ } = options;
  if (typ && (typeof protectedHeader.typ !== "string" || normalizeTyp(protectedHeader.typ) !== normalizeTyp(typ))) {
    throw new JWTClaimValidationFailed('unexpected "typ" JWT header value', payload, "typ", "check_failed");
  }
  const { requiredClaims = [], issuer, subject, audience, maxTokenAge } = options;
  const presenceCheck = [...requiredClaims];
  if (maxTokenAge !== void 0)
    presenceCheck.push("iat");
  if (audience !== void 0)
    presenceCheck.push("aud");
  if (subject !== void 0)
    presenceCheck.push("sub");
  if (issuer !== void 0)
    presenceCheck.push("iss");
  for (const claim of new Set(presenceCheck.reverse())) {
    if (!(claim in payload)) {
      throw new JWTClaimValidationFailed(`missing required "${claim}" claim`, payload, claim, "missing");
    }
  }
  if (issuer && !(Array.isArray(issuer) ? issuer : [issuer]).includes(payload.iss)) {
    throw new JWTClaimValidationFailed('unexpected "iss" claim value', payload, "iss", "check_failed");
  }
  if (subject && payload.sub !== subject) {
    throw new JWTClaimValidationFailed('unexpected "sub" claim value', payload, "sub", "check_failed");
  }
  if (audience && !checkAudiencePresence(payload.aud, typeof audience === "string" ? [audience] : audience)) {
    throw new JWTClaimValidationFailed('unexpected "aud" claim value', payload, "aud", "check_failed");
  }
  let tolerance;
  switch (typeof options.clockTolerance) {
    case "string":
      tolerance = secs_default(options.clockTolerance);
      break;
    case "number":
      tolerance = options.clockTolerance;
      break;
    case "undefined":
      tolerance = 0;
      break;
    default:
      throw new TypeError("Invalid clockTolerance option type");
  }
  const { currentDate } = options;
  const now = epoch_default(currentDate || /* @__PURE__ */ new Date());
  if ((payload.iat !== void 0 || maxTokenAge) && typeof payload.iat !== "number") {
    throw new JWTClaimValidationFailed('"iat" claim must be a number', payload, "iat", "invalid");
  }
  if (payload.nbf !== void 0) {
    if (typeof payload.nbf !== "number") {
      throw new JWTClaimValidationFailed('"nbf" claim must be a number', payload, "nbf", "invalid");
    }
    if (payload.nbf > now + tolerance) {
      throw new JWTClaimValidationFailed('"nbf" claim timestamp check failed', payload, "nbf", "check_failed");
    }
  }
  if (payload.exp !== void 0) {
    if (typeof payload.exp !== "number") {
      throw new JWTClaimValidationFailed('"exp" claim must be a number', payload, "exp", "invalid");
    }
    if (payload.exp <= now - tolerance) {
      throw new JWTExpired('"exp" claim timestamp check failed', payload, "exp", "check_failed");
    }
  }
  if (maxTokenAge) {
    const age = now - payload.iat;
    const max = typeof maxTokenAge === "number" ? maxTokenAge : secs_default(maxTokenAge);
    if (age - tolerance > max) {
      throw new JWTExpired('"iat" claim timestamp check failed (too far in the past)', payload, "iat", "check_failed");
    }
    if (age < 0 - tolerance) {
      throw new JWTClaimValidationFailed('"iat" claim timestamp check failed (it should be in the past)', payload, "iat", "check_failed");
    }
  }
  return payload;
}, "default");

// node_modules/jose/dist/browser/jwt/verify.js
async function jwtVerify(jwt, key, options) {
  const verified = await compactVerify(jwt, key, options);
  if (verified.protectedHeader.crit?.includes("b64") && verified.protectedHeader.b64 === false) {
    throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
  }
  const payload = jwt_claims_set_default(verified.protectedHeader, verified.payload, options);
  const result = { payload, protectedHeader: verified.protectedHeader };
  if (typeof key === "function") {
    return { ...result, key: verified.key };
  }
  return result;
}
__name(jwtVerify, "jwtVerify");

// node_modules/jose/dist/browser/runtime/sign.js
var sign = /* @__PURE__ */ __name(async (alg, key, data) => {
  const cryptoKey = await getCryptoKey(alg, key, "sign");
  check_key_length_default(alg, cryptoKey);
  const signature = await webcrypto_default.subtle.sign(subtleDsa(alg, cryptoKey.algorithm), cryptoKey, data);
  return new Uint8Array(signature);
}, "sign");
var sign_default = sign;

// node_modules/jose/dist/browser/jws/flattened/sign.js
var FlattenedSign = class {
  constructor(payload) {
    if (!(payload instanceof Uint8Array)) {
      throw new TypeError("payload must be an instance of Uint8Array");
    }
    this._payload = payload;
  }
  setProtectedHeader(protectedHeader) {
    if (this._protectedHeader) {
      throw new TypeError("setProtectedHeader can only be called once");
    }
    this._protectedHeader = protectedHeader;
    return this;
  }
  setUnprotectedHeader(unprotectedHeader) {
    if (this._unprotectedHeader) {
      throw new TypeError("setUnprotectedHeader can only be called once");
    }
    this._unprotectedHeader = unprotectedHeader;
    return this;
  }
  async sign(key, options) {
    if (!this._protectedHeader && !this._unprotectedHeader) {
      throw new JWSInvalid("either setProtectedHeader or setUnprotectedHeader must be called before #sign()");
    }
    if (!is_disjoint_default(this._protectedHeader, this._unprotectedHeader)) {
      throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
    }
    const joseHeader = {
      ...this._protectedHeader,
      ...this._unprotectedHeader
    };
    const extensions = validate_crit_default(JWSInvalid, /* @__PURE__ */ new Map([["b64", true]]), options?.crit, this._protectedHeader, joseHeader);
    let b64 = true;
    if (extensions.has("b64")) {
      b64 = this._protectedHeader.b64;
      if (typeof b64 !== "boolean") {
        throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
      }
    }
    const { alg } = joseHeader;
    if (typeof alg !== "string" || !alg) {
      throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
    }
    checkKeyTypeWithJwk(alg, key, "sign");
    let payload = this._payload;
    if (b64) {
      payload = encoder.encode(encode(payload));
    }
    let protectedHeader;
    if (this._protectedHeader) {
      protectedHeader = encoder.encode(encode(JSON.stringify(this._protectedHeader)));
    } else {
      protectedHeader = encoder.encode("");
    }
    const data = concat(protectedHeader, encoder.encode("."), payload);
    const signature = await sign_default(alg, key, data);
    const jws = {
      signature: encode(signature),
      payload: ""
    };
    if (b64) {
      jws.payload = decoder.decode(payload);
    }
    if (this._unprotectedHeader) {
      jws.header = this._unprotectedHeader;
    }
    if (this._protectedHeader) {
      jws.protected = decoder.decode(protectedHeader);
    }
    return jws;
  }
};
__name(FlattenedSign, "FlattenedSign");

// node_modules/jose/dist/browser/jws/compact/sign.js
var CompactSign = class {
  constructor(payload) {
    this._flattened = new FlattenedSign(payload);
  }
  setProtectedHeader(protectedHeader) {
    this._flattened.setProtectedHeader(protectedHeader);
    return this;
  }
  async sign(key, options) {
    const jws = await this._flattened.sign(key, options);
    if (jws.payload === void 0) {
      throw new TypeError("use the flattened module for creating JWS with b64: false");
    }
    return `${jws.protected}.${jws.payload}.${jws.signature}`;
  }
};
__name(CompactSign, "CompactSign");

// node_modules/jose/dist/browser/jwt/produce.js
function validateInput(label, input) {
  if (!Number.isFinite(input)) {
    throw new TypeError(`Invalid ${label} input`);
  }
  return input;
}
__name(validateInput, "validateInput");
var ProduceJWT = class {
  constructor(payload = {}) {
    if (!isObject(payload)) {
      throw new TypeError("JWT Claims Set MUST be an object");
    }
    this._payload = payload;
  }
  setIssuer(issuer) {
    this._payload = { ...this._payload, iss: issuer };
    return this;
  }
  setSubject(subject) {
    this._payload = { ...this._payload, sub: subject };
    return this;
  }
  setAudience(audience) {
    this._payload = { ...this._payload, aud: audience };
    return this;
  }
  setJti(jwtId) {
    this._payload = { ...this._payload, jti: jwtId };
    return this;
  }
  setNotBefore(input) {
    if (typeof input === "number") {
      this._payload = { ...this._payload, nbf: validateInput("setNotBefore", input) };
    } else if (input instanceof Date) {
      this._payload = { ...this._payload, nbf: validateInput("setNotBefore", epoch_default(input)) };
    } else {
      this._payload = { ...this._payload, nbf: epoch_default(/* @__PURE__ */ new Date()) + secs_default(input) };
    }
    return this;
  }
  setExpirationTime(input) {
    if (typeof input === "number") {
      this._payload = { ...this._payload, exp: validateInput("setExpirationTime", input) };
    } else if (input instanceof Date) {
      this._payload = { ...this._payload, exp: validateInput("setExpirationTime", epoch_default(input)) };
    } else {
      this._payload = { ...this._payload, exp: epoch_default(/* @__PURE__ */ new Date()) + secs_default(input) };
    }
    return this;
  }
  setIssuedAt(input) {
    if (typeof input === "undefined") {
      this._payload = { ...this._payload, iat: epoch_default(/* @__PURE__ */ new Date()) };
    } else if (input instanceof Date) {
      this._payload = { ...this._payload, iat: validateInput("setIssuedAt", epoch_default(input)) };
    } else if (typeof input === "string") {
      this._payload = {
        ...this._payload,
        iat: validateInput("setIssuedAt", epoch_default(/* @__PURE__ */ new Date()) + secs_default(input))
      };
    } else {
      this._payload = { ...this._payload, iat: validateInput("setIssuedAt", input) };
    }
    return this;
  }
};
__name(ProduceJWT, "ProduceJWT");

// node_modules/jose/dist/browser/jwt/sign.js
var SignJWT = class extends ProduceJWT {
  setProtectedHeader(protectedHeader) {
    this._protectedHeader = protectedHeader;
    return this;
  }
  async sign(key, options) {
    const sig = new CompactSign(encoder.encode(JSON.stringify(this._payload)));
    sig.setProtectedHeader(this._protectedHeader);
    if (Array.isArray(this._protectedHeader?.crit) && this._protectedHeader.crit.includes("b64") && this._protectedHeader.b64 === false) {
      throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
    }
    return sig.sign(key, options);
  }
};
__name(SignJWT, "SignJWT");

// src/utils/crypto.ts
async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, "0")).join("");
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 1e4,
      hash: "SHA-256"
    },
    keyMaterial,
    256
  );
  const hashHex = Array.from(new Uint8Array(derivedBits)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `pbkdf2:10000:${saltHex}:${hashHex}`;
}
__name(hashPassword, "hashPassword");
async function verifyPassword(password, storedHash) {
  try {
    const parts = storedHash.split(":");
    if (parts.length !== 4 || parts[0] !== "pbkdf2") {
      return false;
    }
    const iterations = parseInt(parts[1], 10);
    const saltHex = parts[2];
    const expectedHashHex = parts[3];
    const saltMatch = saltHex.match(/.{1,2}/g);
    if (!saltMatch)
      return false;
    const salt = new Uint8Array(saltMatch.map((byte) => parseInt(byte, 16)));
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations,
        hash: "SHA-256"
      },
      keyMaterial,
      256
    );
    const derivedHashHex = Array.from(new Uint8Array(derivedBits)).map((b) => b.toString(16).padStart(2, "0")).join("");
    return derivedHashHex === expectedHashHex;
  } catch (e) {
    return false;
  }
}
__name(verifyPassword, "verifyPassword");
async function createToken(user, secret) {
  const secretKey = new TextEncoder().encode(secret);
  return await new SignJWT({ ...user }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secretKey);
}
__name(createToken, "createToken");
async function verifyToken(token, secret) {
  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    return {
      id: payload.id,
      username: payload.username,
      role: payload.role,
      nama_lengkap: payload.nama_lengkap,
      nip: payload.nip
    };
  } catch (err) {
    return null;
  }
}
__name(verifyToken, "verifyToken");

// node_modules/hono/dist/helper/factory/index.js
var createMiddleware = /* @__PURE__ */ __name((middleware) => middleware, "createMiddleware");

// src/middleware/authMiddleware.ts
var authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  let token = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else {
    const cookieHeader = c.req.header("Cookie") || "";
    const match2 = cookieHeader.match(/lhk_auth_token=([^;]+)/);
    if (match2) {
      token = match2[1];
    }
  }
  if (!token) {
    return c.json({ sukses: false, pesan: "Akses ditolak: Token autentikasi tidak ditemukan." }, 401);
  }
  const secret = c.env.JWT_SECRET || "LHK_SUPER_SECRET_JWT_KEY_2026_CHANGEME";
  const user = await verifyToken(token, secret);
  if (!user) {
    return c.json({ sukses: false, pesan: "Sesi login telah kedaluwarsa atau tidak valid. Silakan login kembali." }, 401);
  }
  c.set("user", user);
  await next();
});
var requireAdmin = createMiddleware(async (c, next) => {
  const user = c.get("user");
  if (!user || user.role !== "admin") {
    return c.json({ sukses: false, pesan: "Akses ditolak: Menu ini hanya untuk Administrator." }, 403);
  }
  await next();
});

// src/routes/auth.ts
var authRoutes = new Hono3();
authRoutes.post("/login", async (c) => {
  const body = await c.req.json();
  const { username, password } = body;
  if (!username || !password) {
    return c.json({ sukses: false, pesan: "Username dan password wajib diisi." }, 400);
  }
  const db = new DatabaseQueries(c.env.DB);
  const user = await db.getUserByUsername(username.trim());
  if (!user) {
    return c.json({ sukses: false, pesan: "Username atau password salah." }, 401);
  }
  const isMatch = await verifyPassword(password, user.password_hash);
  if (!isMatch) {
    return c.json({ sukses: false, pesan: "Username atau password salah." }, 401);
  }
  const session = {
    id: user.id,
    username: user.username,
    role: user.role,
    nama_lengkap: user.nama_lengkap,
    nip: user.nip
  };
  const secret = c.env.JWT_SECRET || "LHK_SUPER_SECRET_JWT_KEY_2026_CHANGEME";
  const token = await createToken(session, secret);
  const classes = await db.getClassesByUserId(user.id);
  return c.json({
    sukses: true,
    pesan: "Login berhasil!",
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      nama_lengkap: user.nama_lengkap,
      nip: user.nip,
      pangkat_golongan: user.pangkat_golongan,
      jabatan: user.jabatan,
      mapel: user.mapel,
      nama_sekolah: user.nama_sekolah,
      foto_profil: user.foto_profil,
      classes,
      folder_guru_id: user.folder_guru_id,
      spreadsheet_id: user.spreadsheet_id,
      template_doc_id: user.template_doc_id
    }
  });
});
authRoutes.get("/me", authMiddleware, async (c) => {
  const session = c.get("user");
  const db = new DatabaseQueries(c.env.DB);
  const user = await db.getUserById(session.id);
  if (!user) {
    return c.json({ sukses: false, pesan: "Pengguna tidak ditemukan." }, 404);
  }
  const classes = await db.getClassesByUserId(user.id);
  return c.json({
    sukses: true,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      nama_lengkap: user.nama_lengkap,
      nip: user.nip,
      pangkat_golongan: user.pangkat_golongan,
      jabatan: user.jabatan,
      mapel: user.mapel,
      nama_sekolah: user.nama_sekolah,
      foto_profil: user.foto_profil,
      classes,
      folder_guru_id: user.folder_guru_id,
      folder_dokumentasi_id: user.folder_dokumentasi_id,
      folder_dok_laporan_id: user.folder_dok_laporan_id,
      folder_template_id: user.folder_template_id,
      folder_db_id: user.folder_db_id,
      spreadsheet_id: user.spreadsheet_id,
      template_doc_id: user.template_doc_id
    }
  });
});
authRoutes.post("/change-password", authMiddleware, async (c) => {
  const session = c.get("user");
  const body = await c.req.json();
  const { oldPassword, newPassword } = body;
  if (!oldPassword || !newPassword || newPassword.length < 6) {
    return c.json({ sukses: false, pesan: "Kata sandi baru minimal 6 karakter." }, 400);
  }
  const db = new DatabaseQueries(c.env.DB);
  const user = await db.getUserById(session.id);
  if (!user) {
    return c.json({ sukses: false, pesan: "Pengguna tidak ditemukan." }, 404);
  }
  const isMatch = await verifyPassword(oldPassword, user.password_hash);
  if (!isMatch) {
    return c.json({ sukses: false, pesan: "Kata sandi lama salah." }, 400);
  }
  const newHash = await hashPassword(newPassword);
  await db.updateUser(user.id, { password_hash: newHash });
  return c.json({ sukses: true, pesan: "Kata sandi berhasil diperbarui!" });
});

// src/services/gasBridge.ts
var GasBridgeService = class {
  bridgeUrl;
  secretToken;
  constructor(bridgeUrl, secretToken) {
    this.bridgeUrl = bridgeUrl;
    this.secretToken = secretToken;
  }
  static async create(env2) {
    const urlSetting = await env2.DB.prepare("SELECT value FROM system_settings WHERE key = 'gas_bridge_url'").first();
    const tokenSetting = await env2.DB.prepare("SELECT value FROM system_settings WHERE key = 'gas_secret_token'").first();
    const url = urlSetting && urlSetting.value ? urlSetting.value.trim() : "";
    const token = tokenSetting && tokenSetting.value ? tokenSetting.value.trim() : "SECRET_LHK_TOKEN_2026";
    return new GasBridgeService(url, token);
  }
  isConfigured() {
    return !!(this.bridgeUrl && this.bridgeUrl.startsWith("https://script.google.com/"));
  }
  /**
   * 1. Otomasi Inisialisasi Folder Guru & 4 Sub-Folder
   */
  async initGuruDrive(params) {
    if (!this.isConfigured()) {
      return {
        sukses: true,
        pesan: "Mode Simulasi: URL Google Apps Script belum dikonfigurasi. Folder virtual digunakan.",
        folderGuruId: "SIMULASI_FOLDER_" + Date.now(),
        folderGuruUrl: "https://drive.google.com/drive/folders/simulation",
        folderDokumentasiId: "SIMULASI_FOTO_" + Date.now(),
        folderDokLaporanId: "SIMULASI_LAPORAN_" + Date.now(),
        folderTemplateId: "SIMULASI_TEMPLATE_" + Date.now(),
        folderDbId: "SIMULASI_DB_" + Date.now(),
        spreadsheetId: "SIMULASI_SHEET_" + Date.now(),
        spreadsheetUrl: "https://docs.google.com/spreadsheets/d/simulation",
        templateDocId: "SIMULASI_DOC_" + Date.now(),
        templateDocUrl: "https://docs.google.com/document/d/simulation"
      };
    }
    return await this.callGas("init_guru_drive", params);
  }
  /**
   * 2. Simpan Foto ke 'Dokumentasi' & Data Baris ke 'SpreadsheetDB'
   */
  async uploadFotoDanSimpan(params) {
    if (!this.isConfigured()) {
      const fotoIds = params.fotoArr.map((f, i) => f.existingId || (f.base64 ? `SIMULASI_IMG_${Date.now()}_${i + 1}` : ""));
      while (fotoIds.length < 6)
        fotoIds.push("");
      return {
        sukses: true,
        pesan: "Mode Simulasi: Foto dan baris spreadsheet dicatat secara lokal.",
        fotoIds
      };
    }
    return await this.callGas("upload_foto_dan_simpan", params);
  }
  /**
   * 3. Buat Laporan Bulanan (PDF/DOCX) ke 'Dok_Laporan'
   */
  async buatLaporanBulanan(params) {
    if (!this.isConfigured()) {
      const format = params.format || "pdf";
      const namaFile = `Simulasi_Laporan_${params.guru.nama_lengkap}_${params.bulan}.${format}`;
      return {
        sukses: true,
        format,
        namaFile,
        url: "https://docs.google.com/document/d/simulation/export?format=" + format,
        viewUrl: "https://docs.google.com/document/d/simulation/view",
        totalKegiatan: params.records.length,
        pesan: "Mode Simulasi: Berkas laporan berhasil digenerate!"
      };
    }
    return await this.callGas("buat_laporan_bulanan", params);
  }
  /**
   * 4. Hapus Baris di SpreadsheetDB & Hapus File Foto di Google Drive
   */
  async hapusLhk(params) {
    if (!this.isConfigured()) {
      return {
        sukses: true,
        pesan: "Mode Simulasi: Data agenda simulasi dihapus."
      };
    }
    return await this.callGas("hapus_lhk", params);
  }
  /**
   * 5. Update Baris di SpreadsheetDB & Ganti Foto di Google Drive (Hapus Foto Lama)
   */
  async updateLhk(params) {
    if (!this.isConfigured()) {
      return {
        sukses: true,
        pesan: "Mode Simulasi: Data agenda dan foto diperbarui.",
        fotoIds: params.fotoArr.map((f, i) => f?.existingId || `SIMULASI_UPDATED_IMG_${Date.now()}_${i}`)
      };
    }
    return await this.callGas("update_lhk", params);
  }
  /**
   * Helper internal untuk memanggil Apps Script doPost
   */
  async callGas(action, data) {
    try {
      const response = await fetch(this.bridgeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          secretToken: this.secretToken,
          data
        })
      });
      if (!response.ok) {
        throw new Error(`Google Apps Script merespons dengan HTTP ${response.status}`);
      }
      const json = await response.json();
      return json;
    } catch (err) {
      return {
        sukses: false,
        pesan: "Gagal menghubungi Google Apps Script: " + (err.message || String(err))
      };
    }
  }
};
__name(GasBridgeService, "GasBridgeService");

// src/routes/admin.ts
var adminRoutes = new Hono3();
adminRoutes.use("*", authMiddleware, requireAdmin);
adminRoutes.get("/users", async (c) => {
  const db = new DatabaseQueries(c.env.DB);
  const users = await db.listUsers();
  const enrichedUsers = await Promise.all(
    users.map(async (u) => {
      const classes = await db.getClassesByUserId(u.id);
      return {
        id: u.id,
        username: u.username,
        role: u.role,
        nama_lengkap: u.nama_lengkap,
        nip: u.nip,
        pangkat_golongan: u.pangkat_golongan,
        jabatan: u.jabatan,
        mapel: u.mapel,
        nama_sekolah: u.nama_sekolah,
        foto_profil: u.foto_profil,
        folder_guru_id: u.folder_guru_id,
        folder_dokumentasi_id: u.folder_dokumentasi_id,
        folder_dok_laporan_id: u.folder_dok_laporan_id,
        folder_template_id: u.folder_template_id,
        folder_db_id: u.folder_db_id,
        spreadsheet_id: u.spreadsheet_id,
        template_doc_id: u.template_doc_id,
        is_active: u.is_active,
        created_at: u.created_at,
        classes
      };
    })
  );
  return c.json({ sukses: true, users: enrichedUsers });
});
adminRoutes.post("/users", async (c) => {
  const body = await c.req.json();
  const {
    username,
    password,
    nama_lengkap,
    nip,
    pangkat_golongan,
    jabatan,
    mapel,
    nama_sekolah,
    classes,
    auto_provision_drive
  } = body;
  if (!username || !password || !nama_lengkap) {
    return c.json({ sukses: false, pesan: "Username, password, dan nama lengkap wajib diisi." }, 400);
  }
  const db = new DatabaseQueries(c.env.DB);
  const existing = await db.getUserByUsername(username.trim());
  if (existing) {
    return c.json({ sukses: false, pesan: `Username "${username}" sudah digunakan.` }, 400);
  }
  const userId = "usr_" + Date.now();
  const passwordHash = await hashPassword(password);
  let folderGuruId = body.folder_guru_id || "";
  let folderDokumentasiId = body.folder_dokumentasi_id || "";
  let folderDokLaporanId = body.folder_dok_laporan_id || "";
  let folderTemplateId = body.folder_template_id || "";
  let folderDbId = body.folder_db_id || "";
  let spreadsheetId = body.spreadsheet_id || "";
  let templateDocId = body.template_doc_id || "";
  let driveResult = null;
  if (auto_provision_drive !== false) {
    try {
      const gas = await GasBridgeService.create(c.env);
      const settings = await db.getAllSettings();
      const masterFolderId = settings["master_parent_folder_id"] || "1r271Uodmsj9R645hC__yeG-rU15JGexr";
      const masterSheetId = settings["master_template_sheet_id"] || "";
      const masterDocId = settings["master_template_doc_id"] || "";
      driveResult = await gas.initGuruDrive({
        masterParentFolderId: masterFolderId,
        masterTemplateSheetId: masterSheetId,
        masterTemplateDocId: masterDocId,
        namaGuru: nama_lengkap,
        nip
      });
      if (driveResult && driveResult.sukses) {
        folderGuruId = driveResult.folderGuruId || folderGuruId;
        folderDokumentasiId = driveResult.folderDokumentasiId || folderDokumentasiId;
        folderDokLaporanId = driveResult.folderDokLaporanId || folderDokLaporanId;
        folderTemplateId = driveResult.folderTemplateId || folderTemplateId;
        folderDbId = driveResult.folderDbId || folderDbId;
        spreadsheetId = driveResult.spreadsheetId || spreadsheetId;
        templateDocId = driveResult.templateDocId || templateDocId;
      }
    } catch (driveErr) {
      console.error("Gagal inisialisasi Google Drive:", driveErr);
    }
  }
  await db.createUser({
    id: userId,
    username: username.trim(),
    password_hash: passwordHash,
    role: body.role || "guru",
    nama_lengkap: nama_lengkap.trim(),
    nip: nip ? nip.trim() : "",
    pangkat_golongan: pangkat_golongan || "",
    jabatan: jabatan || "Guru Mata Pelajaran",
    mapel: mapel || "",
    nama_sekolah: nama_sekolah || "",
    folder_guru_id: folderGuruId,
    folder_dokumentasi_id: folderDokumentasiId,
    folder_dok_laporan_id: folderDokLaporanId,
    folder_template_id: folderTemplateId,
    folder_db_id: folderDbId,
    spreadsheet_id: spreadsheetId,
    template_doc_id: templateDocId,
    is_active: 1
  });
  if (Array.isArray(classes)) {
    await db.setClassesForUser(userId, classes);
  }
  return c.json({
    sukses: true,
    pesan: "Akun guru berhasil dibuat dan ruang Google Drive berhasil diinisialisasi!",
    userId,
    drive: driveResult
  });
});
adminRoutes.put("/users/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const db = new DatabaseQueries(c.env.DB);
  const existing = await db.getUserById(id);
  if (!existing) {
    return c.json({ sukses: false, pesan: "Pengguna tidak ditemukan." }, 404);
  }
  await db.updateUser(id, {
    nama_lengkap: body.nama_lengkap,
    nip: body.nip,
    pangkat_golongan: body.pangkat_golongan,
    jabatan: body.jabatan,
    mapel: body.mapel,
    nama_sekolah: body.nama_sekolah,
    foto_profil: body.foto_profil !== void 0 ? body.foto_profil : existing.foto_profil,
    folder_guru_id: body.folder_guru_id,
    folder_dokumentasi_id: body.folder_dokumentasi_id,
    folder_dok_laporan_id: body.folder_dok_laporan_id,
    folder_template_id: body.folder_template_id,
    folder_db_id: body.folder_db_id,
    spreadsheet_id: body.spreadsheet_id,
    template_doc_id: body.template_doc_id,
    is_active: body.is_active
  });
  if (Array.isArray(body.classes)) {
    await db.setClassesForUser(id, body.classes);
  }
  return c.json({ sukses: true, pesan: "Data guru berhasil diperbarui!" });
});
adminRoutes.delete("/users/:id", async (c) => {
  const id = c.req.param("id");
  const db = new DatabaseQueries(c.env.DB);
  const existing = await db.getUserById(id);
  if (!existing) {
    return c.json({ sukses: false, pesan: "Pengguna tidak ditemukan." }, 404);
  }
  if (existing.role === "admin") {
    return c.json({ sukses: false, pesan: "Tidak dapat menghapus akun Administrator." }, 400);
  }
  await db.deleteUser(id);
  return c.json({ sukses: true, pesan: "Akun guru berhasil dihapus!" });
});
adminRoutes.post("/users/:id/reset-password", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  const newPassword = body.newPassword || "guru123";
  const db = new DatabaseQueries(c.env.DB);
  const existing = await db.getUserById(id);
  if (!existing) {
    return c.json({ sukses: false, pesan: "Pengguna tidak ditemukan." }, 404);
  }
  const newHash = await hashPassword(newPassword);
  await db.updateUser(id, { password_hash: newHash });
  return c.json({
    sukses: true,
    pesan: `Kata sandi untuk ${existing.nama_lengkap} berhasil direset menjadi "${newPassword}".`
  });
});
adminRoutes.post("/users/:id/provision-drive", async (c) => {
  const id = c.req.param("id");
  const db = new DatabaseQueries(c.env.DB);
  const user = await db.getUserById(id);
  if (!user) {
    return c.json({ sukses: false, pesan: "Pengguna tidak ditemukan." }, 404);
  }
  const gas = await GasBridgeService.create(c.env);
  const settings = await db.getAllSettings();
  const masterFolderId = settings["master_parent_folder_id"] || "1r271Uodmsj9R645hC__yeG-rU15JGexr";
  const masterSheetId = settings["master_template_sheet_id"] || "";
  const masterDocId = settings["master_template_doc_id"] || "";
  const res = await gas.initGuruDrive({
    masterParentFolderId: masterFolderId,
    masterTemplateSheetId: masterSheetId,
    masterTemplateDocId: masterDocId,
    namaGuru: user.nama_lengkap,
    nip: user.nip
  });
  if (res && res.sukses) {
    await db.updateUser(id, {
      folder_guru_id: res.folderGuruId,
      folder_dokumentasi_id: res.folderDokumentasiId,
      folder_dok_laporan_id: res.folderDokLaporanId,
      folder_template_id: res.folderTemplateId,
      folder_db_id: res.folderDbId,
      spreadsheet_id: res.spreadsheetId,
      template_doc_id: res.templateDocId
    });
    return c.json({ sukses: true, pesan: "Ruang Google Drive guru berhasil dibuat!", drive: res });
  }
  return c.json({ sukses: false, pesan: res.pesan || "Gagal membuat ruang Drive." }, 400);
});
adminRoutes.get("/rekap", async (c) => {
  const bulan = c.req.query("bulan");
  const tahunAjaran = c.req.query("tahunAjaran") || "2026/2027";
  const db = new DatabaseQueries(c.env.DB);
  const rekap = await db.getAdminRekap(bulan, tahunAjaran);
  return c.json({ sukses: true, bulan: bulan || "semua", tahunAjaran, rekap });
});
adminRoutes.get("/settings", async (c) => {
  const db = new DatabaseQueries(c.env.DB);
  const settings = await db.getAllSettings();
  return c.json({ sukses: true, settings });
});
adminRoutes.put("/settings", async (c) => {
  const body = await c.req.json();
  const db = new DatabaseQueries(c.env.DB);
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === "string") {
      await db.updateSetting(key, value.trim());
    }
  }
  return c.json({ sukses: true, pesan: "Pengaturan sistem berhasil disimpan!" });
});

// src/routes/classes.ts
var classRoutes = new Hono3();
classRoutes.use("*", authMiddleware);
classRoutes.get("/", async (c) => {
  const session = c.get("user");
  const targetUserId = session.role === "admin" && c.req.query("userId") ? c.req.query("userId") : session.id;
  const db = new DatabaseQueries(c.env.DB);
  const classes = await db.getClassesByUserId(targetUserId);
  return c.json({ sukses: true, userId: targetUserId, classes });
});
classRoutes.post("/", async (c) => {
  const session = c.get("user");
  if (session.role !== "admin") {
    return c.json({ sukses: false, pesan: "Hanya Administrator yang dapat mengatur daftar kelas." }, 403);
  }
  const body = await c.req.json();
  const { userId, classes } = body;
  if (!userId || !Array.isArray(classes)) {
    return c.json({ sukses: false, pesan: "userId dan classes array wajib diisi." }, 400);
  }
  const db = new DatabaseQueries(c.env.DB);
  await db.setClassesForUser(userId, classes);
  return c.json({ sukses: true, pesan: "Daftar kelas berhasil diperbarui!" });
});

// src/routes/cptp.ts
var cptpRoutes = new Hono3();
cptpRoutes.use("*", authMiddleware);
cptpRoutes.get("/", async (c) => {
  const session = c.get("user");
  const targetUserId = session.role === "admin" && c.req.query("userId") ? c.req.query("userId") : session.id;
  const kelas = c.req.query("kelas");
  const db = new DatabaseQueries(c.env.DB);
  const items = await db.getCpTpList(targetUserId, kelas);
  return c.json({ sukses: true, items });
});
cptpRoutes.post("/", async (c) => {
  const session = c.get("user");
  const body = await c.req.json();
  const { nama_kelas, cp, tp, userId } = body;
  if (!nama_kelas || !cp || !tp) {
    return c.json({ sukses: false, pesan: "Kelas, CP, dan TP wajib diisi." }, 400);
  }
  const targetUserId = session.role === "admin" && userId ? userId : session.id;
  const createdBy = session.role;
  const db = new DatabaseQueries(c.env.DB);
  const newId = await db.addCpTp(targetUserId, nama_kelas.trim(), cp.trim(), tp.trim(), createdBy);
  return c.json({ sukses: true, pesan: "CP & TP berhasil ditambahkan!", id: newId });
});
cptpRoutes.put("/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const body = await c.req.json();
  const { cp, tp } = body;
  if (!cp || !tp) {
    return c.json({ sukses: false, pesan: "CP dan TP wajib diisi." }, 400);
  }
  const db = new DatabaseQueries(c.env.DB);
  await db.updateCpTp(id, cp.trim(), tp.trim());
  return c.json({ sukses: true, pesan: "CP & TP berhasil diperbarui!" });
});
cptpRoutes.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const db = new DatabaseQueries(c.env.DB);
  await db.deleteCpTp(id);
  return c.json({ sukses: true, pesan: "CP & TP berhasil dihapus!" });
});

// src/routes/lhk.ts
var lhkRoutes = new Hono3();
lhkRoutes.use("*", authMiddleware);
lhkRoutes.get("/", async (c) => {
  const session = c.get("user");
  const targetUserId = session.role === "admin" && c.req.query("userId") ? c.req.query("userId") : session.id;
  const bulan = c.req.query("bulan");
  const tahunAjaran = c.req.query("tahunAjaran");
  const kelas = c.req.query("kelas");
  const limit = c.req.query("limit") ? parseInt(c.req.query("limit"), 10) : void 0;
  const offset = c.req.query("offset") ? parseInt(c.req.query("offset"), 10) : void 0;
  const db = new DatabaseQueries(c.env.DB);
  const records = await db.getLhkRecords({
    userId: targetUserId,
    bulan: bulan || void 0,
    tahunAjaran: tahunAjaran || void 0,
    kelas: kelas || void 0,
    limit,
    offset
  });
  return c.json({ sukses: true, records });
});
lhkRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const session = c.get("user");
  const db = new DatabaseQueries(c.env.DB);
  const record = await db.getLhkById(id);
  if (!record) {
    return c.json({ sukses: false, pesan: "Data laporan tidak ditemukan." }, 404);
  }
  if (session.role !== "admin" && record.user_id !== session.id) {
    return c.json({ sukses: false, pesan: "Akses ditolak." }, 403);
  }
  return c.json({ sukses: true, record });
});
lhkRoutes.post("/", async (c) => {
  const session = c.get("user");
  const body = await c.req.json();
  const db = new DatabaseQueries(c.env.DB);
  const user = await db.getUserById(session.id);
  if (!user) {
    return c.json({ sukses: false, pesan: "Profil pengguna tidak ditemukan." }, 404);
  }
  const {
    tanggal,
    tanggalTeks,
    bulan,
    tahunAjaran,
    cp,
    tp,
    kelas,
    nonTatapMuka,
    volume,
    keterangan,
    fotoArr
  } = body;
  if (!tanggal || !bulan || !tahunAjaran) {
    return c.json({ sukses: false, pesan: "Tanggal, bulan, dan tahun ajaran wajib diisi." }, 400);
  }
  const lhkId = "AGR-" + Date.now();
  let tglFormat = tanggalTeks;
  if (!tglFormat && tanggal) {
    const bagianTgl = tanggal.split("-");
    const tglObj = new Date(parseInt(bagianTgl[0]), parseInt(bagianTgl[1]) - 1, parseInt(bagianTgl[2]));
    const hArr = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const mArr = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    tglFormat = `${hArr[tglObj.getDay()]}, ${bagianTgl[2]} ${mArr[tglObj.getMonth()]} ${bagianTgl[0]}`;
  }
  let fotoIds = ["", "", "", "", "", ""];
  let syncedToSheet = 0;
  try {
    const gas = await GasBridgeService.create(c.env);
    const gasRes = await gas.uploadFotoDanSimpan({
      folderDokumentasiId: user.folder_dokumentasi_id || "",
      spreadsheetId: user.spreadsheet_id || "",
      fotoArr: Array.isArray(fotoArr) ? fotoArr : [],
      id: lhkId,
      tanggal,
      tanggalTeks: tglFormat,
      bulan,
      tahunAjaran,
      cp: cp || "",
      tp: tp || "",
      kelas: kelas || "",
      nonTatapMuka: nonTatapMuka || "",
      volume: volume || 0,
      keterangan: keterangan || "Terlaksana"
    });
    if (gasRes && gasRes.sukses) {
      if (Array.isArray(gasRes.fotoIds)) {
        fotoIds = gasRes.fotoIds;
      }
      syncedToSheet = 1;
    }
  } catch (gasErr) {
    console.error("Peringatan Apps Script Bridge saat upload:", gasErr);
  }
  const newRecord = {
    id: lhkId,
    user_id: user.id,
    tanggal,
    tanggal_teks: tglFormat || tanggal,
    bulan,
    tahun_ajaran: tahunAjaran,
    cp: cp || "",
    tp: tp || "",
    kelas: kelas || "",
    non_tatap_muka: nonTatapMuka || "",
    volume: parseInt(volume || "0", 10),
    keterangan: keterangan || "Terlaksana",
    foto_tm_id: fotoIds[0] || "",
    foto_ntm1_id: fotoIds[1] || "",
    foto_ntm2_id: fotoIds[2] || "",
    foto_ntm3_id: fotoIds[3] || "",
    foto_ntm4_id: fotoIds[4] || "",
    foto_ntm5_id: fotoIds[5] || "",
    synced_to_sheet: syncedToSheet
  };
  await db.createLhkRecord(newRecord);
  return c.json({
    sukses: true,
    pesan: "Laporan agenda harian berhasil disimpan ke Database & Google Drive!",
    id: lhkId,
    record: newRecord
  });
});
lhkRoutes.put("/:id", async (c) => {
  const id = c.req.param("id");
  const session = c.get("user");
  const body = await c.req.json();
  const db = new DatabaseQueries(c.env.DB);
  const existing = await db.getLhkById(id);
  if (!existing) {
    return c.json({ sukses: false, pesan: "Data laporan tidak ditemukan." }, 404);
  }
  if (session.role !== "admin" && existing.user_id !== session.id) {
    return c.json({ sukses: false, pesan: "Akses ditolak." }, 403);
  }
  let tglFormat = body.tanggalTeks;
  if (!tglFormat && body.tanggal && body.tanggal.includes("-")) {
    const bagianTgl = body.tanggal.split("-");
    const tglObj = new Date(parseInt(bagianTgl[0]), parseInt(bagianTgl[1]) - 1, parseInt(bagianTgl[2]));
    const hArr = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const mArr = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    tglFormat = `${hArr[tglObj.getDay()]}, ${bagianTgl[2]} ${mArr[tglObj.getMonth()]} ${bagianTgl[0]}`;
  }
  const user = await db.getUserById(existing.user_id);
  let updatedFotoIds = [
    existing.foto_tm_id,
    existing.foto_ntm1_id,
    existing.foto_ntm2_id,
    existing.foto_ntm3_id,
    existing.foto_ntm4_id,
    existing.foto_ntm5_id
  ];
  if (user && user.spreadsheet_id && Array.isArray(body.fotoArr)) {
    try {
      const gas = await GasBridgeService.create(c.env);
      const gasRes = await gas.updateLhk({
        id,
        spreadsheetId: user.spreadsheet_id,
        folderDokumentasiId: user.folder_dokumentasi_id || "",
        tanggal: body.tanggal || existing.tanggal,
        tanggalTeks: tglFormat || existing.tanggal_teks,
        bulan: body.bulan || existing.bulan,
        tahunAjaran: body.tahunAjaran || existing.tahun_ajaran,
        cp: body.cp !== void 0 ? body.cp : existing.cp,
        tp: body.tp !== void 0 ? body.tp : existing.tp,
        kelas: body.kelas !== void 0 ? body.kelas : existing.kelas,
        nonTatapMuka: body.nonTatapMuka !== void 0 ? body.nonTatapMuka : existing.non_tatap_muka,
        volume: body.volume !== void 0 ? parseInt(body.volume, 10) : existing.volume,
        keterangan: body.keterangan !== void 0 ? body.keterangan : existing.keterangan,
        fotoArr: body.fotoArr
      });
      if (gasRes && gasRes.sukses && Array.isArray(gasRes.fotoIds)) {
        updatedFotoIds = gasRes.fotoIds;
      }
    } catch (gasErr) {
      console.warn("Gagal sinkronisasi update Drive/Sheet:", gasErr);
    }
  }
  await db.updateLhkRecord(id, {
    tanggal: body.tanggal || existing.tanggal,
    tanggal_teks: tglFormat || existing.tanggal_teks,
    bulan: body.bulan || existing.bulan,
    tahun_ajaran: body.tahunAjaran || existing.tahun_ajaran,
    cp: body.cp !== void 0 ? body.cp : existing.cp,
    tp: body.tp !== void 0 ? body.tp : existing.tp,
    kelas: body.kelas !== void 0 ? body.kelas : existing.kelas,
    non_tatap_muka: body.nonTatapMuka !== void 0 ? body.nonTatapMuka : existing.non_tatap_muka,
    volume: body.volume !== void 0 ? parseInt(body.volume, 10) : existing.volume,
    keterangan: body.keterangan !== void 0 ? body.keterangan : existing.keterangan,
    foto_tm_id: updatedFotoIds[0] || "",
    foto_ntm1_id: updatedFotoIds[1] || "",
    foto_ntm2_id: updatedFotoIds[2] || "",
    foto_ntm3_id: updatedFotoIds[3] || "",
    foto_ntm4_id: updatedFotoIds[4] || "",
    foto_ntm5_id: updatedFotoIds[5] || ""
  });
  return c.json({
    sukses: true,
    pesan: "Data agenda dan foto berhasil diperbarui di Web, Database, dan Google Drive!"
  });
});
lhkRoutes.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const session = c.get("user");
  const db = new DatabaseQueries(c.env.DB);
  const existing = await db.getLhkById(id);
  if (!existing) {
    return c.json({ sukses: false, pesan: "Data laporan tidak ditemukan." }, 404);
  }
  if (session.role !== "admin" && existing.user_id !== session.id) {
    return c.json({ sukses: false, pesan: "Akses ditolak." }, 403);
  }
  const user = await db.getUserById(existing.user_id);
  const fotoIds = [
    existing.foto_tm_id,
    existing.foto_ntm1_id,
    existing.foto_ntm2_id,
    existing.foto_ntm3_id,
    existing.foto_ntm4_id,
    existing.foto_ntm5_id
  ].filter(Boolean);
  if (user && user.spreadsheet_id) {
    try {
      const gas = await GasBridgeService.create(c.env);
      await gas.hapusLhk({
        spreadsheetId: user.spreadsheet_id,
        lhkId: id,
        fotoIds
      });
    } catch (gasErr) {
      console.warn("Gagal sinkronisasi hapus Drive/Sheet:", gasErr);
    }
  }
  await db.deleteLhkRecord(id);
  return c.json({ sukses: true, pesan: "Data agenda berhasil dihapus dari sistem dan Google Drive!" });
});

// src/routes/documents.ts
var documentRoutes = new Hono3();
documentRoutes.use("*", authMiddleware);
documentRoutes.get("/", async (c) => {
  const session = c.get("user");
  const targetUserId = session.role === "admin" && c.req.query("userId") ? c.req.query("userId") : session.id;
  const db = new DatabaseQueries(c.env.DB);
  const docs = await db.getUserDocuments(targetUserId);
  return c.json({ sukses: true, documents: docs });
});
documentRoutes.post("/export", async (c) => {
  const session = c.get("user");
  const body = await c.req.json();
  const { bulan, tahunAjaran, format = "pdf", userId } = body;
  if (!bulan || !tahunAjaran) {
    return c.json({ sukses: false, pesan: "Bulan dan tahun ajaran wajib dipilih." }, 400);
  }
  const targetUserId = session.role === "admin" && userId ? userId : session.id;
  const db = new DatabaseQueries(c.env.DB);
  const user = await db.getUserById(targetUserId);
  if (!user) {
    return c.json({ sukses: false, pesan: "Data guru tidak ditemukan." }, 404);
  }
  const records = await db.getLhkRecords({
    userId: targetUserId,
    bulan,
    tahunAjaran
  });
  if (!records || records.length === 0) {
    return c.json({
      sukses: false,
      pesan: `Tidak ditemukan data agenda kegiatan untuk bulan ${bulan} (${tahunAjaran}).`
    }, 400);
  }
  const gas = await GasBridgeService.create(c.env);
  const gasRes = await gas.buatLaporanBulanan({
    templateDocId: user.template_doc_id || "",
    folderDokLaporanId: user.folder_dok_laporan_id || user.folder_guru_id || "",
    bulan,
    tahunAjaran,
    format: format === "docx" ? "docx" : "pdf",
    records,
    guru: {
      nama_lengkap: user.nama_lengkap,
      nip: user.nip,
      pangkat_golongan: user.pangkat_golongan,
      mapel: user.mapel,
      nama_sekolah: user.nama_sekolah
    }
  });
  if (!gasRes || !gasRes.sukses) {
    return c.json({
      sukses: false,
      pesan: gasRes?.pesan || "Gagal memproses dokumen di Google Drive."
    }, 500);
  }
  const newDoc = {
    user_id: targetUserId,
    bulan,
    tahun_ajaran: tahunAjaran,
    format: gasRes.format || format,
    nama_file: gasRes.namaFile || `Laporan_Agenda_${bulan}_${tahunAjaran}.${format}`,
    doc_url: gasRes.url || gasRes.downloadUrl,
    view_url: gasRes.viewUrl || gasRes.url,
    total_kegiatan: gasRes.totalKegiatan || records.length
  };
  const docId = await db.saveUserDocument(newDoc);
  newDoc.id = docId;
  return c.json({
    sukses: true,
    pesan: "Dokumen laporan berhasil dibuat dan tautannya disimpan di Arsip Dokumen!",
    document: newDoc
  });
});
documentRoutes.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const db = new DatabaseQueries(c.env.DB);
  await db.deleteUserDocument(id);
  return c.json({ sukses: true, pesan: "Catatan arsip dokumen berhasil dihapus!" });
});

// src/routes/dashboard.ts
var dashboardRoutes = new Hono3();
dashboardRoutes.use("*", authMiddleware);
dashboardRoutes.get("/metrics", async (c) => {
  const session = c.get("user");
  const db = new DatabaseQueries(c.env.DB);
  const settings = await db.getAllSettings();
  const activeYear = settings["active_academic_year"] || "2026/2027";
  const whatsappGroupUrl = settings["whatsapp_group_url"] || "";
  const namaBulanArr = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember"
  ];
  const bulanIni = namaBulanArr[(/* @__PURE__ */ new Date()).getMonth()];
  const metrics = await db.getTeacherDashboardMetrics(session.id, bulanIni, activeYear);
  return c.json({
    sukses: true,
    bulanIni,
    tahunAjaranAktif: activeYear,
    whatsappGroupUrl,
    metrics
  });
});

// src/index.ts
var app = new Hono3();
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"]
}));
app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    app: "CMS Manager LHK Multi-User API",
    version: "1.0.0",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/public/info", async (c) => {
  try {
    const db = new DatabaseQueries(c.env.DB);
    const settings = await db.getAllSettings();
    return c.json({
      sukses: true,
      whatsappGroupUrl: settings["whatsapp_group_url"] || "",
      tahunAjaranAktif: settings["active_academic_year"] || "2026/2027"
    });
  } catch (err) {
    return c.json({ sukses: false, whatsappGroupUrl: "" }, 500);
  }
});
app.route("/api/auth", authRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/classes", classRoutes);
app.route("/api/cptp", cptpRoutes);
app.route("/api/lhk", lhkRoutes);
app.route("/api/documents", documentRoutes);
app.route("/api/dashboard", dashboardRoutes);
app.get("*", async (c) => {
  if (c.env.ASSETS) {
    try {
      const response = await c.env.ASSETS.fetch(c.req.raw);
      if (response.status === 404 && !c.req.path.startsWith("/api/")) {
        const url = new URL(c.req.url);
        url.pathname = "/index.html";
        return await c.env.ASSETS.fetch(new Request(url.toString(), c.req.raw));
      }
      return response;
    } catch (e) {
    }
  }
  return c.json({
    pesan: "Selamat datang di API CMS Manager LHK. Gunakan endpoint /api/... atau jalankan frontend."
  });
});
var src_default = app;

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    return Response.json(error3, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-m5bCmO/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-m5bCmO/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
