(() => {
  // deno:https://cdn.jsdelivr.net/npm/iconify-icon@1.0.0-beta.1/dist/iconify-icon.js
  (function() {
    "use strict";
    const defaultIconDimensions = Object.freeze({
      left: 0,
      top: 0,
      width: 16,
      height: 16
    });
    const defaultIconTransformations = Object.freeze({
      rotate: 0,
      vFlip: false,
      hFlip: false
    });
    const defaultIconProps = Object.freeze({
      ...defaultIconDimensions,
      ...defaultIconTransformations
    });
    const defaultExtendedIconProps = Object.freeze({
      ...defaultIconProps,
      body: "",
      hidden: false
    });
    const defaultIconSizeCustomisations = Object.freeze({
      width: null,
      height: null
    });
    const defaultIconCustomisations = Object.freeze({
      ...defaultIconSizeCustomisations,
      ...defaultIconTransformations
    });
    function rotateFromString(value, defaultValue = 0) {
      const units = value.replace(/^-?[0-9.]*/, "");
      function cleanup(value2) {
        while (value2 < 0) {
          value2 += 4;
        }
        return value2 % 4;
      }
      if (units === "") {
        const num = parseInt(value);
        return isNaN(num) ? 0 : cleanup(num);
      } else if (units !== value) {
        let split = 0;
        switch (units) {
          case "%":
            split = 25;
            break;
          case "deg":
            split = 90;
        }
        if (split) {
          let num = parseFloat(value.slice(0, value.length - units.length));
          if (isNaN(num)) {
            return 0;
          }
          num = num / split;
          return num % 1 === 0 ? cleanup(num) : 0;
        }
      }
      return defaultValue;
    }
    const separator = /[\s,]+/;
    function flipFromString(custom, flip) {
      flip.split(separator).forEach((str) => {
        const value = str.trim();
        switch (value) {
          case "horizontal":
            custom.hFlip = true;
            break;
          case "vertical":
            custom.vFlip = true;
            break;
        }
      });
    }
    const defaultCustomisations = {
      ...defaultIconCustomisations,
      preserveAspectRatio: ""
    };
    function getCustomisations(node) {
      const customisations = {
        ...defaultCustomisations
      };
      const attr = (key, def) => node.getAttribute(key) || def;
      customisations.width = attr("width", null);
      customisations.height = attr("height", null);
      customisations.rotate = rotateFromString(attr("rotate", ""));
      flipFromString(customisations, attr("flip", ""));
      customisations.preserveAspectRatio = attr("preserveAspectRatio", attr("preserveaspectratio", ""));
      return customisations;
    }
    function haveCustomisationsChanged(value1, value2) {
      for (const key in defaultCustomisations) {
        if (value1[key] !== value2[key]) {
          return true;
        }
      }
      return false;
    }
    const matchIconName = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    const stringToIcon = (value, validate, allowSimpleName, provider = "") => {
      const colonSeparated = value.split(":");
      if (value.slice(0, 1) === "@") {
        if (colonSeparated.length < 2 || colonSeparated.length > 3) {
          return null;
        }
        provider = colonSeparated.shift().slice(1);
      }
      if (colonSeparated.length > 3 || !colonSeparated.length) {
        return null;
      }
      if (colonSeparated.length > 1) {
        const name2 = colonSeparated.pop();
        const prefix = colonSeparated.pop();
        const result = {
          provider: colonSeparated.length > 0 ? colonSeparated[0] : provider,
          prefix,
          name: name2
        };
        return validate && !validateIcon(result) ? null : result;
      }
      const name = colonSeparated[0];
      const dashSeparated = name.split("-");
      if (dashSeparated.length > 1) {
        const result = {
          provider,
          prefix: dashSeparated.shift(),
          name: dashSeparated.join("-")
        };
        return validate && !validateIcon(result) ? null : result;
      }
      if (allowSimpleName && provider === "") {
        const result = {
          provider,
          prefix: "",
          name
        };
        return validate && !validateIcon(result, allowSimpleName) ? null : result;
      }
      return null;
    };
    const validateIcon = (icon, allowSimpleName) => {
      if (!icon) {
        return false;
      }
      return !!((icon.provider === "" || icon.provider.match(matchIconName)) && (allowSimpleName && icon.prefix === "" || icon.prefix.match(matchIconName)) && icon.name.match(matchIconName));
    };
    function mergeIconTransformations(obj1, obj2) {
      const result = {};
      if (!obj1.hFlip !== !obj2.hFlip) {
        result.hFlip = true;
      }
      if (!obj1.vFlip !== !obj2.vFlip) {
        result.vFlip = true;
      }
      const rotate = ((obj1.rotate || 0) + (obj2.rotate || 0)) % 4;
      if (rotate) {
        result.rotate = rotate;
      }
      return result;
    }
    function mergeIconData(parent, child) {
      const result = mergeIconTransformations(parent, child);
      for (const key in defaultExtendedIconProps) {
        if (defaultIconTransformations[key] !== void 0) {
          if (result[key] === void 0 && parent[key] !== void 0) {
            result[key] = defaultIconTransformations[key];
          }
        } else if (child[key] !== void 0) {
          result[key] = child[key];
        } else if (parent[key] !== void 0) {
          result[key] = parent[key];
        }
      }
      return result;
    }
    function getIconsTree(data, names) {
      const icons = data.icons;
      const aliases = data.aliases || {};
      const resolved = /* @__PURE__ */ Object.create(null);
      function resolve(name) {
        if (icons[name]) {
          return resolved[name] = [];
        }
        if (resolved[name] === void 0) {
          resolved[name] = null;
          const parent = aliases[name] && aliases[name].parent;
          const value = parent && resolve(parent);
          if (value) {
            resolved[name] = [parent].concat(value);
          }
        }
        return resolved[name];
      }
      (names || Object.keys(icons).concat(Object.keys(aliases))).forEach(resolve);
      return resolved;
    }
    function internalGetIconData(data, name, tree, full) {
      const icons = data.icons;
      const aliases = data.aliases || {};
      let currentProps = {};
      function parse(name2) {
        currentProps = mergeIconData(icons[name2] || aliases[name2], currentProps);
      }
      parse(name);
      tree.forEach(parse);
      currentProps = mergeIconData(data, currentProps);
      return full ? Object.assign({}, defaultIconProps, currentProps) : currentProps;
    }
    function parseIconSet(data, callback) {
      const names = [];
      if (typeof data !== "object" || typeof data.icons !== "object") {
        return names;
      }
      if (data.not_found instanceof Array) {
        data.not_found.forEach((name) => {
          callback(name, null);
          names.push(name);
        });
      }
      const tree = getIconsTree(data);
      for (const name in tree) {
        const item = tree[name];
        if (item) {
          callback(name, internalGetIconData(data, name, item, true));
          names.push(name);
        }
      }
      return names;
    }
    const optionalPropertyDefaults = {
      provider: "",
      aliases: {},
      not_found: {},
      ...defaultIconDimensions
    };
    function checkOptionalProps(item, defaults) {
      for (const prop in defaults) {
        if (item[prop] !== void 0 && typeof item[prop] !== typeof defaults[prop]) {
          return false;
        }
      }
      return true;
    }
    function quicklyValidateIconSet(obj) {
      if (typeof obj !== "object" || obj === null) {
        return null;
      }
      const data = obj;
      if (typeof data.prefix !== "string" || !obj.icons || typeof obj.icons !== "object") {
        return null;
      }
      if (!checkOptionalProps(obj, optionalPropertyDefaults)) {
        return null;
      }
      const icons = data.icons;
      for (const name in icons) {
        const icon = icons[name];
        if (!name.match(matchIconName) || typeof icon.body !== "string" || !checkOptionalProps(icon, defaultExtendedIconProps)) {
          return null;
        }
      }
      const aliases = data.aliases || {};
      for (const name in aliases) {
        const icon = aliases[name];
        const parent = icon.parent;
        if (!name.match(matchIconName) || typeof parent !== "string" || !icons[parent] && !aliases[parent] || !checkOptionalProps(icon, defaultExtendedIconProps)) {
          return null;
        }
      }
      return data;
    }
    const dataStorage = /* @__PURE__ */ Object.create(null);
    function newStorage(provider, prefix) {
      return {
        provider,
        prefix,
        icons: /* @__PURE__ */ Object.create(null),
        missing: /* @__PURE__ */ new Set()
      };
    }
    function getStorage(provider, prefix) {
      const providerStorage = dataStorage[provider] || (dataStorage[provider] = /* @__PURE__ */ Object.create(null));
      return providerStorage[prefix] || (providerStorage[prefix] = newStorage(provider, prefix));
    }
    function addIconSet(storage2, data) {
      if (!quicklyValidateIconSet(data)) {
        return [];
      }
      return parseIconSet(data, (name, icon) => {
        if (icon) {
          storage2.icons[name] = icon;
        } else {
          storage2.missing.add(name);
        }
      });
    }
    function addIconToStorage(storage2, name, icon) {
      try {
        if (typeof icon.body === "string") {
          storage2.icons[name] = Object.freeze({
            ...defaultIconProps,
            ...icon
          });
          return true;
        }
      } catch (err) {
      }
      return false;
    }
    function listIcons(provider, prefix) {
      let allIcons = [];
      const providers = typeof provider === "string" ? [provider] : Object.keys(dataStorage);
      providers.forEach((provider2) => {
        const prefixes = typeof provider2 === "string" && typeof prefix === "string" ? [prefix] : Object.keys(dataStorage[provider2] || {});
        prefixes.forEach((prefix2) => {
          const storage2 = getStorage(provider2, prefix2);
          allIcons = allIcons.concat(Object.keys(storage2.icons).map((name) => (provider2 !== "" ? "@" + provider2 + ":" : "") + prefix2 + ":" + name));
        });
      });
      return allIcons;
    }
    let simpleNames = false;
    function allowSimpleNames(allow) {
      if (typeof allow === "boolean") {
        simpleNames = allow;
      }
      return simpleNames;
    }
    function getIconData(name) {
      const icon = typeof name === "string" ? stringToIcon(name, true, simpleNames) : name;
      if (!icon) {
        return;
      }
      const storage2 = getStorage(icon.provider, icon.prefix);
      const iconName = icon.name;
      return storage2.icons[iconName] || (storage2.missing.has(iconName) ? null : void 0);
    }
    function addIcon(name, data) {
      const icon = stringToIcon(name, true, simpleNames);
      if (!icon) {
        return false;
      }
      const storage2 = getStorage(icon.provider, icon.prefix);
      return addIconToStorage(storage2, icon.name, data);
    }
    function addCollection(data, provider) {
      if (typeof data !== "object") {
        return false;
      }
      if (typeof provider !== "string") {
        provider = typeof data.provider === "string" ? data.provider : "";
      }
      if (simpleNames && provider === "" && (typeof data.prefix !== "string" || data.prefix === "")) {
        let added = false;
        if (quicklyValidateIconSet(data)) {
          data.prefix = "";
          parseIconSet(data, (name, icon) => {
            if (icon && addIcon(name, icon)) {
              added = true;
            }
          });
        }
        return added;
      }
      if (typeof data.prefix !== "string" || !validateIcon({
        provider,
        prefix: data.prefix,
        name: "a"
      })) {
        return false;
      }
      const storage2 = getStorage(provider, data.prefix);
      return !!addIconSet(storage2, data);
    }
    function iconExists(name) {
      return !!getIconData(name);
    }
    function getIcon(name) {
      const result = getIconData(name);
      return result ? { ...result } : null;
    }
    function sortIcons(icons) {
      const result = {
        loaded: [],
        missing: [],
        pending: []
      };
      const storage2 = /* @__PURE__ */ Object.create(null);
      icons.sort((a, b) => {
        if (a.provider !== b.provider) {
          return a.provider.localeCompare(b.provider);
        }
        if (a.prefix !== b.prefix) {
          return a.prefix.localeCompare(b.prefix);
        }
        return a.name.localeCompare(b.name);
      });
      let lastIcon = {
        provider: "",
        prefix: "",
        name: ""
      };
      icons.forEach((icon) => {
        if (lastIcon.name === icon.name && lastIcon.prefix === icon.prefix && lastIcon.provider === icon.provider) {
          return;
        }
        lastIcon = icon;
        const provider = icon.provider;
        const prefix = icon.prefix;
        const name = icon.name;
        if (storage2[provider] === void 0) {
          storage2[provider] = /* @__PURE__ */ Object.create(null);
        }
        const providerStorage = storage2[provider];
        if (providerStorage[prefix] === void 0) {
          providerStorage[prefix] = getStorage(provider, prefix);
        }
        const localStorage = providerStorage[prefix];
        let list;
        if (localStorage.icons[name] !== void 0) {
          list = result.loaded;
        } else if (prefix === "" || localStorage.missing.has(name)) {
          list = result.missing;
        } else {
          list = result.pending;
        }
        const item = {
          provider,
          prefix,
          name
        };
        list.push(item);
      });
      return result;
    }
    function removeCallback(storages, id) {
      storages.forEach((storage2) => {
        const items = storage2.loaderCallbacks;
        if (items) {
          storage2.loaderCallbacks = items.filter((row) => row.id !== id);
        }
      });
    }
    function updateCallbacks(storage2) {
      if (!storage2.pendingCallbacksFlag) {
        storage2.pendingCallbacksFlag = true;
        setTimeout(() => {
          storage2.pendingCallbacksFlag = false;
          const items = storage2.loaderCallbacks ? storage2.loaderCallbacks.slice(0) : [];
          if (!items.length) {
            return;
          }
          let hasPending = false;
          const provider = storage2.provider;
          const prefix = storage2.prefix;
          items.forEach((item) => {
            const icons = item.icons;
            const oldLength = icons.pending.length;
            icons.pending = icons.pending.filter((icon) => {
              if (icon.prefix !== prefix) {
                return true;
              }
              const name = icon.name;
              if (storage2.icons[name] !== void 0) {
                icons.loaded.push({
                  provider,
                  prefix,
                  name
                });
              } else if (storage2.missing.has(name)) {
                icons.missing.push({
                  provider,
                  prefix,
                  name
                });
              } else {
                hasPending = true;
                return true;
              }
              return false;
            });
            if (icons.pending.length !== oldLength) {
              if (!hasPending) {
                removeCallback([storage2], item.id);
              }
              item.callback(icons.loaded.slice(0), icons.missing.slice(0), icons.pending.slice(0), item.abort);
            }
          });
        });
      }
    }
    let idCounter = 0;
    function storeCallback(callback, icons, pendingSources) {
      const id = idCounter++;
      const abort = removeCallback.bind(null, pendingSources, id);
      if (!icons.pending.length) {
        return abort;
      }
      const item = {
        id,
        icons,
        callback,
        abort
      };
      pendingSources.forEach((storage2) => {
        (storage2.loaderCallbacks || (storage2.loaderCallbacks = [])).push(item);
      });
      return abort;
    }
    const storage = /* @__PURE__ */ Object.create(null);
    function setAPIModule(provider, item) {
      storage[provider] = item;
    }
    function getAPIModule(provider) {
      return storage[provider] || storage[""];
    }
    function listToIcons(list, validate = true, simpleNames2 = false) {
      const result = [];
      list.forEach((item) => {
        const icon = typeof item === "string" ? stringToIcon(item, false, simpleNames2) : { ...item };
        if (!validate || validateIcon(icon, simpleNames2)) {
          result.push(icon);
        }
      });
      return result;
    }
    var defaultConfig = {
      resources: [],
      index: 0,
      timeout: 2e3,
      rotate: 750,
      random: false,
      dataAfterTimeout: false
    };
    function sendQuery(config, payload, query, done) {
      const resourcesCount = config.resources.length;
      const startIndex = config.random ? Math.floor(Math.random() * resourcesCount) : config.index;
      let resources;
      if (config.random) {
        let list = config.resources.slice(0);
        resources = [];
        while (list.length > 1) {
          const nextIndex = Math.floor(Math.random() * list.length);
          resources.push(list[nextIndex]);
          list = list.slice(0, nextIndex).concat(list.slice(nextIndex + 1));
        }
        resources = resources.concat(list);
      } else {
        resources = config.resources.slice(startIndex).concat(config.resources.slice(0, startIndex));
      }
      const startTime = Date.now();
      let status = "pending";
      let queriesSent = 0;
      let lastError;
      let timer = null;
      let queue = [];
      let doneCallbacks = [];
      if (typeof done === "function") {
        doneCallbacks.push(done);
      }
      function resetTimer() {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      }
      function abort() {
        if (status === "pending") {
          status = "aborted";
        }
        resetTimer();
        queue.forEach((item) => {
          if (item.status === "pending") {
            item.status = "aborted";
          }
        });
        queue = [];
      }
      function subscribe(callback, overwrite) {
        if (overwrite) {
          doneCallbacks = [];
        }
        if (typeof callback === "function") {
          doneCallbacks.push(callback);
        }
      }
      function getQueryStatus() {
        return {
          startTime,
          payload,
          status,
          queriesSent,
          queriesPending: queue.length,
          subscribe,
          abort
        };
      }
      function failQuery() {
        status = "failed";
        doneCallbacks.forEach((callback) => {
          callback(void 0, lastError);
        });
      }
      function clearQueue() {
        queue.forEach((item) => {
          if (item.status === "pending") {
            item.status = "aborted";
          }
        });
        queue = [];
      }
      function moduleResponse(item, response, data) {
        const isError = response !== "success";
        queue = queue.filter((queued) => queued !== item);
        switch (status) {
          case "pending":
            break;
          case "failed":
            if (isError || !config.dataAfterTimeout) {
              return;
            }
            break;
          default:
            return;
        }
        if (response === "abort") {
          lastError = data;
          failQuery();
          return;
        }
        if (isError) {
          lastError = data;
          if (!queue.length) {
            if (!resources.length) {
              failQuery();
            } else {
              execNext();
            }
          }
          return;
        }
        resetTimer();
        clearQueue();
        if (!config.random) {
          const index = config.resources.indexOf(item.resource);
          if (index !== -1 && index !== config.index) {
            config.index = index;
          }
        }
        status = "completed";
        doneCallbacks.forEach((callback) => {
          callback(data);
        });
      }
      function execNext() {
        if (status !== "pending") {
          return;
        }
        resetTimer();
        const resource = resources.shift();
        if (resource === void 0) {
          if (queue.length) {
            timer = setTimeout(() => {
              resetTimer();
              if (status === "pending") {
                clearQueue();
                failQuery();
              }
            }, config.timeout);
            return;
          }
          failQuery();
          return;
        }
        const item = {
          status: "pending",
          resource,
          callback: (status2, data) => {
            moduleResponse(item, status2, data);
          }
        };
        queue.push(item);
        queriesSent++;
        timer = setTimeout(execNext, config.rotate);
        query(resource, payload, item.callback);
      }
      setTimeout(execNext);
      return getQueryStatus;
    }
    function initRedundancy(cfg) {
      const config = {
        ...defaultConfig,
        ...cfg
      };
      let queries = [];
      function cleanup() {
        queries = queries.filter((item) => item().status === "pending");
      }
      function query(payload, queryCallback, doneCallback) {
        const query2 = sendQuery(config, payload, queryCallback, (data, error) => {
          cleanup();
          if (doneCallback) {
            doneCallback(data, error);
          }
        });
        queries.push(query2);
        return query2;
      }
      function find(callback) {
        return queries.find((value) => {
          return callback(value);
        }) || null;
      }
      const instance = {
        query,
        find,
        setIndex: (index) => {
          config.index = index;
        },
        getIndex: () => config.index,
        cleanup
      };
      return instance;
    }
    function createAPIConfig(source) {
      let resources;
      if (typeof source.resources === "string") {
        resources = [source.resources];
      } else {
        resources = source.resources;
        if (!(resources instanceof Array) || !resources.length) {
          return null;
        }
      }
      const result = {
        resources,
        path: source.path || "/",
        maxURL: source.maxURL || 500,
        rotate: source.rotate || 750,
        timeout: source.timeout || 5e3,
        random: source.random === true,
        index: source.index || 0,
        dataAfterTimeout: source.dataAfterTimeout !== false
      };
      return result;
    }
    const configStorage = /* @__PURE__ */ Object.create(null);
    const fallBackAPISources = [
      "https://api.simplesvg.com",
      "https://api.unisvg.com"
    ];
    const fallBackAPI = [];
    while (fallBackAPISources.length > 0) {
      if (fallBackAPISources.length === 1) {
        fallBackAPI.push(fallBackAPISources.shift());
      } else {
        if (Math.random() > 0.5) {
          fallBackAPI.push(fallBackAPISources.shift());
        } else {
          fallBackAPI.push(fallBackAPISources.pop());
        }
      }
    }
    configStorage[""] = createAPIConfig({
      resources: ["https://api.iconify.design"].concat(fallBackAPI)
    });
    function addAPIProvider(provider, customConfig) {
      const config = createAPIConfig(customConfig);
      if (config === null) {
        return false;
      }
      configStorage[provider] = config;
      return true;
    }
    function getAPIConfig(provider) {
      return configStorage[provider];
    }
    function listAPIProviders() {
      return Object.keys(configStorage);
    }
    function emptyCallback$1() {
    }
    const redundancyCache = /* @__PURE__ */ Object.create(null);
    function getRedundancyCache(provider) {
      if (redundancyCache[provider] === void 0) {
        const config = getAPIConfig(provider);
        if (!config) {
          return;
        }
        const redundancy = initRedundancy(config);
        const cachedReundancy = {
          config,
          redundancy
        };
        redundancyCache[provider] = cachedReundancy;
      }
      return redundancyCache[provider];
    }
    function sendAPIQuery(target, query, callback) {
      let redundancy;
      let send2;
      if (typeof target === "string") {
        const api = getAPIModule(target);
        if (!api) {
          callback(void 0, 424);
          return emptyCallback$1;
        }
        send2 = api.send;
        const cached = getRedundancyCache(target);
        if (cached) {
          redundancy = cached.redundancy;
        }
      } else {
        const config = createAPIConfig(target);
        if (config) {
          redundancy = initRedundancy(config);
          const moduleKey = target.resources ? target.resources[0] : "";
          const api = getAPIModule(moduleKey);
          if (api) {
            send2 = api.send;
          }
        }
      }
      if (!redundancy || !send2) {
        callback(void 0, 424);
        return emptyCallback$1;
      }
      return redundancy.query(query, send2, callback)().abort;
    }
    const browserCacheVersion = "iconify2";
    const browserCachePrefix = "iconify";
    const browserCacheCountKey = browserCachePrefix + "-count";
    const browserCacheVersionKey = browserCachePrefix + "-version";
    const browserStorageHour = 36e5;
    const browserStorageCacheExpiration = 168;
    function getStoredItem(func, key) {
      try {
        return func.getItem(key);
      } catch (err) {
      }
    }
    function setStoredItem(func, key, value) {
      try {
        func.setItem(key, value);
        return true;
      } catch (err) {
      }
    }
    function removeStoredItem(func, key) {
      try {
        func.removeItem(key);
      } catch (err) {
      }
    }
    function setBrowserStorageItemsCount(storage2, value) {
      return setStoredItem(storage2, browserCacheCountKey, value.toString());
    }
    function getBrowserStorageItemsCount(storage2) {
      return parseInt(getStoredItem(storage2, browserCacheCountKey)) || 0;
    }
    const browserStorageConfig = {
      local: true,
      session: true
    };
    const browserStorageEmptyItems = {
      local: /* @__PURE__ */ new Set(),
      session: /* @__PURE__ */ new Set()
    };
    let browserStorageStatus = false;
    function setBrowserStorageStatus(status) {
      browserStorageStatus = status;
    }
    let _window = typeof window === "undefined" ? {} : window;
    function getBrowserStorage(key) {
      const attr = key + "Storage";
      try {
        if (_window && _window[attr] && typeof _window[attr].length === "number") {
          return _window[attr];
        }
      } catch (err) {
      }
      browserStorageConfig[key] = false;
    }
    function iterateBrowserStorage(key, callback) {
      const func = getBrowserStorage(key);
      if (!func) {
        return;
      }
      const version = getStoredItem(func, browserCacheVersionKey);
      if (version !== browserCacheVersion) {
        if (version) {
          const total2 = getBrowserStorageItemsCount(func);
          for (let i = 0; i < total2; i++) {
            removeStoredItem(func, browserCachePrefix + i.toString());
          }
        }
        setStoredItem(func, browserCacheVersionKey, browserCacheVersion);
        setBrowserStorageItemsCount(func, 0);
        return;
      }
      const minTime = Math.floor(Date.now() / browserStorageHour) - browserStorageCacheExpiration;
      const parseItem = (index) => {
        const name = browserCachePrefix + index.toString();
        const item = getStoredItem(func, name);
        if (typeof item !== "string") {
          return;
        }
        try {
          const data = JSON.parse(item);
          if (typeof data === "object" && typeof data.cached === "number" && data.cached > minTime && typeof data.provider === "string" && typeof data.data === "object" && typeof data.data.prefix === "string" && callback(data, index)) {
            return true;
          }
        } catch (err) {
        }
        removeStoredItem(func, name);
      };
      let total = getBrowserStorageItemsCount(func);
      for (let i = total - 1; i >= 0; i--) {
        if (!parseItem(i)) {
          if (i === total - 1) {
            total--;
            setBrowserStorageItemsCount(func, total);
          } else {
            browserStorageEmptyItems[key].add(i);
          }
        }
      }
    }
    function initBrowserStorage() {
      if (browserStorageStatus) {
        return;
      }
      setBrowserStorageStatus(true);
      for (const key in browserStorageConfig) {
        iterateBrowserStorage(key, (item) => {
          const iconSet = item.data;
          const provider = item.provider;
          const prefix = iconSet.prefix;
          const storage2 = getStorage(provider, prefix);
          if (!addIconSet(storage2, iconSet).length) {
            return false;
          }
          const lastModified = iconSet.lastModified || -1;
          storage2.lastModifiedCached = storage2.lastModifiedCached ? Math.min(storage2.lastModifiedCached, lastModified) : lastModified;
          return true;
        });
      }
    }
    function updateLastModified(storage2, lastModified) {
      const lastValue = storage2.lastModifiedCached;
      if (lastValue && lastValue >= lastModified) {
        return lastValue === lastModified;
      }
      storage2.lastModifiedCached = lastModified;
      if (lastValue) {
        for (const key in browserStorageConfig) {
          iterateBrowserStorage(key, (item) => {
            const iconSet = item.data;
            return item.provider !== storage2.provider || iconSet.prefix !== storage2.prefix || iconSet.lastModified === lastModified;
          });
        }
      }
      return true;
    }
    function storeInBrowserStorage(storage2, data) {
      if (!browserStorageStatus) {
        initBrowserStorage();
      }
      function store(key) {
        let func;
        if (!browserStorageConfig[key] || !(func = getBrowserStorage(key))) {
          return;
        }
        const set = browserStorageEmptyItems[key];
        let index;
        if (set.size) {
          set.delete(index = Array.from(set).shift());
        } else {
          index = getBrowserStorageItemsCount(func);
          if (!setBrowserStorageItemsCount(func, index + 1)) {
            return;
          }
        }
        const item = {
          cached: Math.floor(Date.now() / browserStorageHour),
          provider: storage2.provider,
          data
        };
        return setStoredItem(func, browserCachePrefix + index.toString(), JSON.stringify(item));
      }
      if (data.lastModified && !updateLastModified(storage2, data.lastModified)) {
        return;
      }
      if (!Object.keys(data.icons).length) {
        return;
      }
      if (data.not_found) {
        data = Object.assign({}, data);
        delete data.not_found;
      }
      if (!store("local")) {
        store("session");
      }
    }
    function emptyCallback() {
    }
    function loadedNewIcons(storage2) {
      if (!storage2.iconsLoaderFlag) {
        storage2.iconsLoaderFlag = true;
        setTimeout(() => {
          storage2.iconsLoaderFlag = false;
          updateCallbacks(storage2);
        });
      }
    }
    function loadNewIcons(storage2, icons) {
      if (!storage2.iconsToLoad) {
        storage2.iconsToLoad = icons;
      } else {
        storage2.iconsToLoad = storage2.iconsToLoad.concat(icons).sort();
      }
      if (!storage2.iconsQueueFlag) {
        storage2.iconsQueueFlag = true;
        setTimeout(() => {
          storage2.iconsQueueFlag = false;
          const { provider, prefix } = storage2;
          const icons2 = storage2.iconsToLoad;
          delete storage2.iconsToLoad;
          let api;
          if (!icons2 || !(api = getAPIModule(provider))) {
            return;
          }
          const params = api.prepare(provider, prefix, icons2);
          params.forEach((item) => {
            sendAPIQuery(provider, item, (data, error) => {
              if (typeof data !== "object") {
                if (error !== 404) {
                  return;
                }
                item.icons.forEach((name) => {
                  storage2.missing.add(name);
                });
              } else {
                try {
                  const parsed = addIconSet(storage2, data);
                  if (!parsed.length) {
                    return;
                  }
                  const pending = storage2.pendingIcons;
                  if (pending) {
                    parsed.forEach((name) => {
                      pending.delete(name);
                    });
                  }
                  storeInBrowserStorage(storage2, data);
                } catch (err) {
                  console.error(err);
                }
              }
              loadedNewIcons(storage2);
            });
          });
        });
      }
    }
    const loadIcons = (icons, callback) => {
      const cleanedIcons = listToIcons(icons, true, allowSimpleNames());
      const sortedIcons = sortIcons(cleanedIcons);
      if (!sortedIcons.pending.length) {
        let callCallback = true;
        if (callback) {
          setTimeout(() => {
            if (callCallback) {
              callback(sortedIcons.loaded, sortedIcons.missing, sortedIcons.pending, emptyCallback);
            }
          });
        }
        return () => {
          callCallback = false;
        };
      }
      const newIcons = /* @__PURE__ */ Object.create(null);
      const sources = [];
      let lastProvider, lastPrefix;
      sortedIcons.pending.forEach((icon) => {
        const { provider, prefix } = icon;
        if (prefix === lastPrefix && provider === lastProvider) {
          return;
        }
        lastProvider = provider;
        lastPrefix = prefix;
        sources.push(getStorage(provider, prefix));
        const providerNewIcons = newIcons[provider] || (newIcons[provider] = /* @__PURE__ */ Object.create(null));
        if (!providerNewIcons[prefix]) {
          providerNewIcons[prefix] = [];
        }
      });
      sortedIcons.pending.forEach((icon) => {
        const { provider, prefix, name } = icon;
        const storage2 = getStorage(provider, prefix);
        const pendingQueue = storage2.pendingIcons || (storage2.pendingIcons = /* @__PURE__ */ new Set());
        if (!pendingQueue.has(name)) {
          pendingQueue.add(name);
          newIcons[provider][prefix].push(name);
        }
      });
      sources.forEach((storage2) => {
        const { provider, prefix } = storage2;
        if (newIcons[provider][prefix].length) {
          loadNewIcons(storage2, newIcons[provider][prefix]);
        }
      });
      return callback ? storeCallback(callback, sortedIcons, sources) : emptyCallback;
    };
    const loadIcon = (icon) => {
      return new Promise((fulfill, reject) => {
        const iconObj = typeof icon === "string" ? stringToIcon(icon) : icon;
        loadIcons([iconObj || icon], (loaded) => {
          if (loaded.length && iconObj) {
            const data = getIconData(iconObj);
            if (data) {
              fulfill({
                ...data
              });
              return;
            }
          }
          reject(icon);
        });
      });
    };
    function testIconObject(value) {
      try {
        const obj = typeof value === "string" ? JSON.parse(value) : value;
        if (typeof obj.body === "string") {
          return {
            ...defaultIconProps,
            ...obj
          };
        }
      } catch (err) {
      }
    }
    function parseIconValue(value, onload) {
      const name = typeof value === "string" ? stringToIcon(value, true, true) : null;
      if (!name) {
        const data2 = testIconObject(value);
        return {
          value,
          data: data2
        };
      }
      const data = getIconData(name);
      if (data !== void 0 || !name.prefix) {
        return {
          value,
          name,
          data
        };
      }
      const loading = loadIcons([name], () => onload(value, name, getIconData(name)));
      return {
        value,
        name,
        loading
      };
    }
    function getInline(node) {
      return node.hasAttribute("inline");
    }
    let isBuggedSafari = false;
    try {
      isBuggedSafari = navigator.vendor.indexOf("Apple") === 0;
    } catch (err) {
    }
    function getRenderMode(body, mode) {
      switch (mode) {
        case "svg":
        case "bg":
        case "mask":
          return mode;
      }
      if (mode !== "style" && (isBuggedSafari || body.indexOf("<a") === -1)) {
        return "svg";
      }
      return body.indexOf("currentColor") === -1 ? "bg" : "mask";
    }
    function mergeCustomisations(defaults, item) {
      const result = {
        ...defaults
      };
      for (const key in item) {
        const value = item[key];
        const valueType = typeof value;
        if (key in defaultIconSizeCustomisations) {
          if (value === null || value && (valueType === "string" || valueType === "number")) {
            result[key] = value;
          }
        } else if (valueType === typeof result[key]) {
          result[key] = key === "rotate" ? value % 4 : value;
        }
      }
      return result;
    }
    const unitsSplit = /(-?[0-9.]*[0-9]+[0-9.]*)/g;
    const unitsTest = /^-?[0-9.]*[0-9]+[0-9.]*$/g;
    function calculateSize(size, ratio, precision) {
      if (ratio === 1) {
        return size;
      }
      precision = precision === void 0 ? 100 : precision;
      if (typeof size === "number") {
        return Math.ceil(size * ratio * precision) / precision;
      }
      if (typeof size !== "string") {
        return size;
      }
      const oldParts = size.split(unitsSplit);
      if (oldParts === null || !oldParts.length) {
        return size;
      }
      const newParts = [];
      let code = oldParts.shift();
      let isNumber = unitsTest.test(code);
      while (true) {
        if (isNumber) {
          const num = parseFloat(code);
          if (isNaN(num)) {
            newParts.push(code);
          } else {
            newParts.push(Math.ceil(num * ratio * precision) / precision);
          }
        } else {
          newParts.push(code);
        }
        code = oldParts.shift();
        if (code === void 0) {
          return newParts.join("");
        }
        isNumber = !isNumber;
      }
    }
    function iconToSVG(icon, customisations) {
      const box = {
        left: icon.left,
        top: icon.top,
        width: icon.width,
        height: icon.height
      };
      let body = icon.body;
      [icon, customisations].forEach((props) => {
        const transformations = [];
        const hFlip = props.hFlip;
        const vFlip = props.vFlip;
        let rotation = props.rotate;
        if (hFlip) {
          if (vFlip) {
            rotation += 2;
          } else {
            transformations.push("translate(" + (box.width + box.left).toString() + " " + (0 - box.top).toString() + ")");
            transformations.push("scale(-1 1)");
            box.top = box.left = 0;
          }
        } else if (vFlip) {
          transformations.push("translate(" + (0 - box.left).toString() + " " + (box.height + box.top).toString() + ")");
          transformations.push("scale(1 -1)");
          box.top = box.left = 0;
        }
        let tempValue;
        if (rotation < 0) {
          rotation -= Math.floor(rotation / 4) * 4;
        }
        rotation = rotation % 4;
        switch (rotation) {
          case 1:
            tempValue = box.height / 2 + box.top;
            transformations.unshift("rotate(90 " + tempValue.toString() + " " + tempValue.toString() + ")");
            break;
          case 2:
            transformations.unshift("rotate(180 " + (box.width / 2 + box.left).toString() + " " + (box.height / 2 + box.top).toString() + ")");
            break;
          case 3:
            tempValue = box.width / 2 + box.left;
            transformations.unshift("rotate(-90 " + tempValue.toString() + " " + tempValue.toString() + ")");
            break;
        }
        if (rotation % 2 === 1) {
          if (box.left !== box.top) {
            tempValue = box.left;
            box.left = box.top;
            box.top = tempValue;
          }
          if (box.width !== box.height) {
            tempValue = box.width;
            box.width = box.height;
            box.height = tempValue;
          }
        }
        if (transformations.length) {
          body = '<g transform="' + transformations.join(" ") + '">' + body + "</g>";
        }
      });
      const customisationsWidth = customisations.width;
      const customisationsHeight = customisations.height;
      const boxWidth = box.width;
      const boxHeight = box.height;
      let width;
      let height;
      if (customisationsWidth === null) {
        height = customisationsHeight === null ? "1em" : customisationsHeight === "auto" ? boxHeight : customisationsHeight;
        width = calculateSize(height, boxWidth / boxHeight);
      } else {
        width = customisationsWidth === "auto" ? boxWidth : customisationsWidth;
        height = customisationsHeight === null ? calculateSize(width, boxHeight / boxWidth) : customisationsHeight === "auto" ? boxHeight : customisationsHeight;
      }
      const result = {
        attributes: {
          width: width.toString(),
          height: height.toString(),
          viewBox: box.left.toString() + " " + box.top.toString() + " " + boxWidth.toString() + " " + boxHeight.toString()
        },
        body
      };
      return result;
    }
    function buildIcon(icon, customisations) {
      return iconToSVG({ ...defaultIconProps, ...icon }, mergeCustomisations(defaultIconCustomisations, customisations || {}));
    }
    const detectFetch = () => {
      let callback;
      try {
        callback = fetch;
        if (typeof callback === "function") {
          return callback;
        }
      } catch (err) {
      }
    };
    let fetchModule = detectFetch();
    function setFetch(fetch2) {
      fetchModule = fetch2;
    }
    function getFetch() {
      return fetchModule;
    }
    function calculateMaxLength(provider, prefix) {
      const config = getAPIConfig(provider);
      if (!config) {
        return 0;
      }
      let result;
      if (!config.maxURL) {
        result = 0;
      } else {
        let maxHostLength = 0;
        config.resources.forEach((item) => {
          const host = item;
          maxHostLength = Math.max(maxHostLength, host.length);
        });
        const url = prefix + ".json?icons=";
        result = config.maxURL - maxHostLength - config.path.length - url.length;
      }
      return result;
    }
    function shouldAbort(status) {
      return status === 404;
    }
    const prepare = (provider, prefix, icons) => {
      const results = [];
      const maxLength = calculateMaxLength(provider, prefix);
      const type = "icons";
      let item = {
        type,
        provider,
        prefix,
        icons: []
      };
      let length = 0;
      icons.forEach((name, index) => {
        length += name.length + 1;
        if (length >= maxLength && index > 0) {
          results.push(item);
          item = {
            type,
            provider,
            prefix,
            icons: []
          };
          length = name.length;
        }
        item.icons.push(name);
      });
      results.push(item);
      return results;
    };
    function getPath(provider) {
      if (typeof provider === "string") {
        const config = getAPIConfig(provider);
        if (config) {
          return config.path;
        }
      }
      return "/";
    }
    const send = (host, params, callback) => {
      if (!fetchModule) {
        callback("abort", 424);
        return;
      }
      let path = getPath(params.provider);
      switch (params.type) {
        case "icons": {
          const prefix = params.prefix;
          const icons = params.icons;
          const iconsList = icons.join(",");
          const urlParams = new URLSearchParams({
            icons: iconsList
          });
          path += prefix + ".json?" + urlParams.toString();
          break;
        }
        case "custom": {
          const uri = params.uri;
          path += uri.slice(0, 1) === "/" ? uri.slice(1) : uri;
          break;
        }
        default:
          callback("abort", 400);
          return;
      }
      let defaultError = 503;
      fetchModule(host + path).then((response) => {
        const status = response.status;
        if (status !== 200) {
          setTimeout(() => {
            callback(shouldAbort(status) ? "abort" : "next", status);
          });
          return;
        }
        defaultError = 501;
        return response.json();
      }).then((data) => {
        if (typeof data !== "object" || data === null) {
          setTimeout(() => {
            callback("next", defaultError);
          });
          return;
        }
        setTimeout(() => {
          callback("success", data);
        });
      }).catch(() => {
        callback("next", defaultError);
      });
    };
    const fetchAPIModule = {
      prepare,
      send
    };
    function toggleBrowserCache(storage2, value) {
      switch (storage2) {
        case "local":
        case "session":
          browserStorageConfig[storage2] = value;
          break;
        case "all":
          for (const key in browserStorageConfig) {
            browserStorageConfig[key] = value;
          }
          break;
      }
    }
    function exportFunctions() {
      setAPIModule("", fetchAPIModule);
      allowSimpleNames(true);
      let _window2;
      try {
        _window2 = window;
      } catch (err) {
      }
      if (_window2) {
        initBrowserStorage();
        if (_window2.IconifyPreload !== void 0) {
          const preload = _window2.IconifyPreload;
          const err = "Invalid IconifyPreload syntax.";
          if (typeof preload === "object" && preload !== null) {
            (preload instanceof Array ? preload : [preload]).forEach((item) => {
              try {
                if (typeof item !== "object" || item === null || item instanceof Array || typeof item.icons !== "object" || typeof item.prefix !== "string" || !addCollection(item)) {
                  console.error(err);
                }
              } catch (e) {
                console.error(err);
              }
            });
          }
        }
        if (_window2.IconifyProviders !== void 0) {
          const providers = _window2.IconifyProviders;
          if (typeof providers === "object" && providers !== null) {
            for (const key in providers) {
              const err = "IconifyProviders[" + key + "] is invalid.";
              try {
                const value = providers[key];
                if (typeof value !== "object" || !value || value.resources === void 0) {
                  continue;
                }
                if (!addAPIProvider(key, value)) {
                  console.error(err);
                }
              } catch (e) {
                console.error(err);
              }
            }
          }
        }
      }
      const _api = {
        getAPIConfig,
        setAPIModule,
        sendAPIQuery,
        setFetch,
        getFetch,
        listAPIProviders
      };
      return {
        enableCache: (storage2) => toggleBrowserCache(storage2, true),
        disableCache: (storage2) => toggleBrowserCache(storage2, false),
        iconExists,
        getIcon,
        listIcons,
        addIcon,
        addCollection,
        calculateSize,
        buildIcon,
        loadIcons,
        loadIcon,
        addAPIProvider,
        _api
      };
    }
    function iconToHTML(body, attributes) {
      let renderAttribsHTML = body.indexOf("xlink:") === -1 ? "" : ' xmlns:xlink="http://www.w3.org/1999/xlink"';
      for (const attr in attributes) {
        renderAttribsHTML += " " + attr + '="' + attributes[attr] + '"';
      }
      return '<svg xmlns="http://www.w3.org/2000/svg"' + renderAttribsHTML + ">" + body + "</svg>";
    }
    function encodeSVGforURL(svg) {
      return svg.replace(/"/g, "'").replace(/%/g, "%25").replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E").replace(/\s+/g, " ");
    }
    function svgToURL(svg) {
      return 'url("data:image/svg+xml,' + encodeSVGforURL(svg) + '")';
    }
    const monotoneProps = {
      "background-color": "currentColor"
    };
    const coloredProps = {
      "background-color": "transparent"
    };
    const propsToAdd = {
      image: "var(--svg)",
      repeat: "no-repeat",
      size: "100% 100%"
    };
    const propsToAddTo = {
      "-webkit-mask": monotoneProps,
      "mask": monotoneProps,
      "background": coloredProps
    };
    for (const prefix in propsToAddTo) {
      const list = propsToAddTo[prefix];
      for (const prop in propsToAdd) {
        list[prefix + "-" + prop] = propsToAdd[prop];
      }
    }
    function fixSize(value) {
      return value + (value.match(/^[-0-9.]+$/) ? "px" : "");
    }
    function renderSPAN(data, icon, useMask) {
      const node = document.createElement("span");
      let body = data.body;
      if (body.indexOf("<a") !== -1) {
        body += "<!-- " + Date.now() + " -->";
      }
      const renderAttribs = data.attributes;
      const html = iconToHTML(body, {
        ...renderAttribs,
        width: icon.width + "",
        height: icon.height + ""
      });
      const url = svgToURL(html);
      const svgStyle = node.style;
      const styles = {
        "--svg": url,
        "width": fixSize(renderAttribs.width),
        "height": fixSize(renderAttribs.height),
        ...useMask ? monotoneProps : coloredProps
      };
      for (const prop in styles) {
        svgStyle.setProperty(prop, styles[prop]);
      }
      return node;
    }
    function renderSVG(data) {
      const node = document.createElement("span");
      node.innerHTML = iconToHTML(data.body, data.attributes);
      return node.firstChild;
    }
    function renderIcon(parent, state) {
      const iconData = state.icon.data;
      const customisations = state.customisations;
      const renderData = iconToSVG(iconData, customisations);
      if (customisations.preserveAspectRatio) {
        renderData.attributes["preserveAspectRatio"] = customisations.preserveAspectRatio;
      }
      const mode = state.renderedMode;
      let node;
      switch (mode) {
        case "svg":
          node = renderSVG(renderData);
          break;
        default:
          node = renderSPAN(renderData, iconData, mode === "mask");
      }
      if (parent.childNodes.length > 1) {
        const lastChild = parent.lastChild;
        if (node.tagName === "SPAN" && lastChild.tagName === node.tagName) {
          lastChild.setAttribute("style", node.getAttribute("style"));
        } else {
          parent.replaceChild(node, lastChild);
        }
      } else {
        parent.appendChild(node);
      }
    }
    function updateStyle(parent, inline) {
      let style = parent.firstChild;
      if (!style) {
        style = document.createElement("style");
        parent.appendChild(style);
      }
      style.textContent = ":host{display:inline-block;vertical-align:" + (inline ? "-0.125em" : "0") + "}span,svg{display:block}";
    }
    function setPendingState(icon, inline, lastState) {
      const lastRender = lastState && (lastState.rendered ? lastState : lastState.lastRender);
      return {
        rendered: false,
        inline,
        icon,
        lastRender
      };
    }
    function defineIconifyIcon(name = "iconify-icon") {
      let customElements;
      let ParentClass;
      try {
        customElements = window.customElements;
        ParentClass = window.HTMLElement;
      } catch (err) {
        return;
      }
      if (!customElements || !ParentClass) {
        return;
      }
      const ConflictingClass = customElements.get(name);
      if (ConflictingClass) {
        return ConflictingClass;
      }
      const attributes = [
        "icon",
        "mode",
        "inline",
        "width",
        "height",
        "rotate",
        "flip"
      ];
      const IconifyIcon = class extends ParentClass {
        _shadowRoot;
        _state;
        _checkQueued = false;
        constructor() {
          super();
          const root = this._shadowRoot = this.attachShadow({
            mode: "closed"
          });
          const inline = getInline(this);
          updateStyle(root, inline);
          this._state = setPendingState({
            value: ""
          }, inline);
          this._queueCheck();
        }
        static get observedAttributes() {
          return attributes.slice(0);
        }
        attributeChangedCallback(name2) {
          if (name2 === "inline") {
            const newInline = getInline(this);
            const state = this._state;
            if (newInline !== state.inline) {
              state.inline = newInline;
              updateStyle(this._shadowRoot, newInline);
            }
          } else {
            this._queueCheck();
          }
        }
        get icon() {
          const value = this.getAttribute("icon");
          if (value && value.slice(0, 1) === "{") {
            try {
              return JSON.parse(value);
            } catch (err) {
            }
          }
          return value;
        }
        set icon(value) {
          if (typeof value === "object") {
            value = JSON.stringify(value);
          }
          this.setAttribute("icon", value);
        }
        get inline() {
          return getInline(this);
        }
        set inline(value) {
          this.setAttribute("inline", value ? "true" : null);
        }
        restartAnimation() {
          const state = this._state;
          if (state.rendered) {
            const root = this._shadowRoot;
            if (state.renderedMode === "svg") {
              try {
                root.lastChild.setCurrentTime(0);
                return;
              } catch (err) {
              }
            }
            renderIcon(root, state);
          }
        }
        get status() {
          const state = this._state;
          return state.rendered ? "rendered" : state.icon.data === null ? "failed" : "loading";
        }
        _queueCheck() {
          if (!this._checkQueued) {
            this._checkQueued = true;
            setTimeout(() => {
              this._check();
            });
          }
        }
        _check() {
          if (!this._checkQueued) {
            return;
          }
          this._checkQueued = false;
          const state = this._state;
          const newIcon = this.getAttribute("icon");
          if (newIcon !== state.icon.value) {
            this._iconChanged(newIcon);
            return;
          }
          if (!state.rendered) {
            return;
          }
          const mode = this.getAttribute("mode");
          const customisations = getCustomisations(this);
          if (state.attrMode !== mode || haveCustomisationsChanged(state.customisations, customisations)) {
            this._renderIcon(state.icon, customisations, mode);
          }
        }
        _iconChanged(newValue) {
          const icon = parseIconValue(newValue, (value, name2, data) => {
            const state = this._state;
            if (state.rendered || this.getAttribute("icon") !== value) {
              return;
            }
            const icon2 = {
              value,
              name: name2,
              data
            };
            if (icon2.data) {
              this._gotIconData(icon2);
            } else {
              state.icon = icon2;
            }
          });
          if (icon.data) {
            this._gotIconData(icon);
          } else {
            this._state = setPendingState(icon, this._state.inline, this._state);
          }
        }
        _gotIconData(icon) {
          this._checkQueued = false;
          this._renderIcon(icon, getCustomisations(this), this.getAttribute("mode"));
        }
        _renderIcon(icon, customisations, attrMode) {
          const renderedMode = getRenderMode(icon.data.body, attrMode);
          const inline = this._state.inline;
          renderIcon(this._shadowRoot, this._state = {
            rendered: true,
            icon,
            inline,
            customisations,
            attrMode,
            renderedMode
          });
        }
      };
      attributes.forEach((attr) => {
        if (!Object.hasOwn(IconifyIcon.prototype, attr)) {
          Object.defineProperty(IconifyIcon.prototype, attr, {
            get: function() {
              return this.getAttribute(attr);
            },
            set: function(value) {
              this.setAttribute(attr, value);
            }
          });
        }
      });
      const functions = exportFunctions();
      for (const key in functions) {
        IconifyIcon[key] = IconifyIcon.prototype[key] = functions[key];
      }
      customElements.define(name, IconifyIcon);
      return IconifyIcon;
    }
    defineIconifyIcon();
  })();
})();
/**
* (c) Iconify
*
* For the full copyright and license information, please view the license.txt
* files at https://github.com/iconify/iconify
*
* Licensed under MIT.
*
* @license MIT
* @version 1.0.0-beta.1
*/
