var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../.wrangler/tmp/bundle-Ryusmq/checked-fetch.js
var require_checked_fetch = __commonJS({
  "../.wrangler/tmp/bundle-Ryusmq/checked-fetch.js"() {
    var urls = /* @__PURE__ */ new Set();
    function checkURL(request, init) {
      const url = request instanceof URL ? request : new URL(
        (typeof request === "string" ? new Request(request, init) : request).url
      );
      if (url.port && url.port !== "443" && url.protocol === "https:") {
        if (!urls.has(url.toString())) {
          urls.add(url.toString());
          console.warn(
            `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
          );
        }
      }
    }
    __name(checkURL, "checkURL");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        const [request, init] = argArray;
        checkURL(request, init);
        return Reflect.apply(target, thisArg, argArray);
      }
    });
  }
});

// ../node_modules/@google/generative-ai/dist/index.mjs
function getClientHeaders(requestOptions) {
  const clientHeaders = [];
  if (requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.apiClient) {
    clientHeaders.push(requestOptions.apiClient);
  }
  clientHeaders.push(`${PACKAGE_LOG_HEADER}/${PACKAGE_VERSION}`);
  return clientHeaders.join(" ");
}
async function getHeaders(url) {
  var _a;
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("x-goog-api-client", getClientHeaders(url.requestOptions));
  headers.append("x-goog-api-key", url.apiKey);
  let customHeaders = (_a = url.requestOptions) === null || _a === void 0 ? void 0 : _a.customHeaders;
  if (customHeaders) {
    if (!(customHeaders instanceof Headers)) {
      try {
        customHeaders = new Headers(customHeaders);
      } catch (e) {
        throw new GoogleGenerativeAIRequestInputError(`unable to convert customHeaders value ${JSON.stringify(customHeaders)} to Headers: ${e.message}`);
      }
    }
    for (const [headerName, headerValue] of customHeaders.entries()) {
      if (headerName === "x-goog-api-key") {
        throw new GoogleGenerativeAIRequestInputError(`Cannot set reserved header name ${headerName}`);
      } else if (headerName === "x-goog-api-client") {
        throw new GoogleGenerativeAIRequestInputError(`Header name ${headerName} can only be set using the apiClient field`);
      }
      headers.append(headerName, headerValue);
    }
  }
  return headers;
}
async function constructModelRequest(model, task, apiKey, stream, body, requestOptions) {
  const url = new RequestUrl(model, task, apiKey, stream, requestOptions);
  return {
    url: url.toString(),
    fetchOptions: Object.assign(Object.assign({}, buildFetchOptions(requestOptions)), { method: "POST", headers: await getHeaders(url), body })
  };
}
async function makeModelRequest(model, task, apiKey, stream, body, requestOptions = {}, fetchFn = fetch) {
  const { url, fetchOptions } = await constructModelRequest(model, task, apiKey, stream, body, requestOptions);
  return makeRequest(url, fetchOptions, fetchFn);
}
async function makeRequest(url, fetchOptions, fetchFn = fetch) {
  let response;
  try {
    response = await fetchFn(url, fetchOptions);
  } catch (e) {
    handleResponseError(e, url);
  }
  if (!response.ok) {
    await handleResponseNotOk(response, url);
  }
  return response;
}
function handleResponseError(e, url) {
  let err = e;
  if (!(e instanceof GoogleGenerativeAIFetchError || e instanceof GoogleGenerativeAIRequestInputError)) {
    err = new GoogleGenerativeAIError(`Error fetching from ${url.toString()}: ${e.message}`);
    err.stack = e.stack;
  }
  throw err;
}
async function handleResponseNotOk(response, url) {
  let message = "";
  let errorDetails;
  try {
    const json = await response.json();
    message = json.error.message;
    if (json.error.details) {
      message += ` ${JSON.stringify(json.error.details)}`;
      errorDetails = json.error.details;
    }
  } catch (e) {
  }
  throw new GoogleGenerativeAIFetchError(`Error fetching from ${url.toString()}: [${response.status} ${response.statusText}] ${message}`, response.status, response.statusText, errorDetails);
}
function buildFetchOptions(requestOptions) {
  const fetchOptions = {};
  if ((requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.signal) !== void 0 || (requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.timeout) >= 0) {
    const controller = new AbortController();
    if ((requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.timeout) >= 0) {
      setTimeout(() => controller.abort(), requestOptions.timeout);
    }
    if (requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.signal) {
      requestOptions.signal.addEventListener("abort", () => {
        controller.abort();
      });
    }
    fetchOptions.signal = controller.signal;
  }
  return fetchOptions;
}
function addHelpers(response) {
  response.text = () => {
    if (response.candidates && response.candidates.length > 0) {
      if (response.candidates.length > 1) {
        console.warn(`This response had ${response.candidates.length} candidates. Returning text from the first candidate only. Access response.candidates directly to use the other candidates.`);
      }
      if (hadBadFinishReason(response.candidates[0])) {
        throw new GoogleGenerativeAIResponseError(`${formatBlockErrorMessage(response)}`, response);
      }
      return getText(response);
    } else if (response.promptFeedback) {
      throw new GoogleGenerativeAIResponseError(`Text not available. ${formatBlockErrorMessage(response)}`, response);
    }
    return "";
  };
  response.functionCall = () => {
    if (response.candidates && response.candidates.length > 0) {
      if (response.candidates.length > 1) {
        console.warn(`This response had ${response.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`);
      }
      if (hadBadFinishReason(response.candidates[0])) {
        throw new GoogleGenerativeAIResponseError(`${formatBlockErrorMessage(response)}`, response);
      }
      console.warn(`response.functionCall() is deprecated. Use response.functionCalls() instead.`);
      return getFunctionCalls(response)[0];
    } else if (response.promptFeedback) {
      throw new GoogleGenerativeAIResponseError(`Function call not available. ${formatBlockErrorMessage(response)}`, response);
    }
    return void 0;
  };
  response.functionCalls = () => {
    if (response.candidates && response.candidates.length > 0) {
      if (response.candidates.length > 1) {
        console.warn(`This response had ${response.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`);
      }
      if (hadBadFinishReason(response.candidates[0])) {
        throw new GoogleGenerativeAIResponseError(`${formatBlockErrorMessage(response)}`, response);
      }
      return getFunctionCalls(response);
    } else if (response.promptFeedback) {
      throw new GoogleGenerativeAIResponseError(`Function call not available. ${formatBlockErrorMessage(response)}`, response);
    }
    return void 0;
  };
  return response;
}
function getText(response) {
  var _a, _b, _c, _d;
  const textStrings = [];
  if ((_b = (_a = response.candidates) === null || _a === void 0 ? void 0 : _a[0].content) === null || _b === void 0 ? void 0 : _b.parts) {
    for (const part of (_d = (_c = response.candidates) === null || _c === void 0 ? void 0 : _c[0].content) === null || _d === void 0 ? void 0 : _d.parts) {
      if (part.text) {
        textStrings.push(part.text);
      }
      if (part.executableCode) {
        textStrings.push("\n```" + part.executableCode.language + "\n" + part.executableCode.code + "\n```\n");
      }
      if (part.codeExecutionResult) {
        textStrings.push("\n```\n" + part.codeExecutionResult.output + "\n```\n");
      }
    }
  }
  if (textStrings.length > 0) {
    return textStrings.join("");
  } else {
    return "";
  }
}
function getFunctionCalls(response) {
  var _a, _b, _c, _d;
  const functionCalls = [];
  if ((_b = (_a = response.candidates) === null || _a === void 0 ? void 0 : _a[0].content) === null || _b === void 0 ? void 0 : _b.parts) {
    for (const part of (_d = (_c = response.candidates) === null || _c === void 0 ? void 0 : _c[0].content) === null || _d === void 0 ? void 0 : _d.parts) {
      if (part.functionCall) {
        functionCalls.push(part.functionCall);
      }
    }
  }
  if (functionCalls.length > 0) {
    return functionCalls;
  } else {
    return void 0;
  }
}
function hadBadFinishReason(candidate) {
  return !!candidate.finishReason && badFinishReasons.includes(candidate.finishReason);
}
function formatBlockErrorMessage(response) {
  var _a, _b, _c;
  let message = "";
  if ((!response.candidates || response.candidates.length === 0) && response.promptFeedback) {
    message += "Response was blocked";
    if ((_a = response.promptFeedback) === null || _a === void 0 ? void 0 : _a.blockReason) {
      message += ` due to ${response.promptFeedback.blockReason}`;
    }
    if ((_b = response.promptFeedback) === null || _b === void 0 ? void 0 : _b.blockReasonMessage) {
      message += `: ${response.promptFeedback.blockReasonMessage}`;
    }
  } else if ((_c = response.candidates) === null || _c === void 0 ? void 0 : _c[0]) {
    const firstCandidate = response.candidates[0];
    if (hadBadFinishReason(firstCandidate)) {
      message += `Candidate was blocked due to ${firstCandidate.finishReason}`;
      if (firstCandidate.finishMessage) {
        message += `: ${firstCandidate.finishMessage}`;
      }
    }
  }
  return message;
}
function __await(v) {
  return this instanceof __await ? (this.v = v, this) : new __await(v);
}
function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var g = generator.apply(thisArg, _arguments || []), i, q = [];
  return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
    return this;
  }, i;
  function verb(n) {
    if (g[n]) i[n] = function(v) {
      return new Promise(function(a, b) {
        q.push([n, v, a, b]) > 1 || resume(n, v);
      });
    };
  }
  __name(verb, "verb");
  function resume(n, v) {
    try {
      step(g[n](v));
    } catch (e) {
      settle(q[0][3], e);
    }
  }
  __name(resume, "resume");
  function step(r) {
    r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
  }
  __name(step, "step");
  function fulfill(value) {
    resume("next", value);
  }
  __name(fulfill, "fulfill");
  function reject(value) {
    resume("throw", value);
  }
  __name(reject, "reject");
  function settle(f, v) {
    if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
  }
  __name(settle, "settle");
}
function processStream(response) {
  const inputStream = response.body.pipeThrough(new TextDecoderStream("utf8", { fatal: true }));
  const responseStream = getResponseStream(inputStream);
  const [stream1, stream2] = responseStream.tee();
  return {
    stream: generateResponseSequence(stream1),
    response: getResponsePromise(stream2)
  };
}
async function getResponsePromise(stream) {
  const allResponses = [];
  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      return addHelpers(aggregateResponses(allResponses));
    }
    allResponses.push(value);
  }
}
function generateResponseSequence(stream) {
  return __asyncGenerator(this, arguments, /* @__PURE__ */ __name(function* generateResponseSequence_1() {
    const reader = stream.getReader();
    while (true) {
      const { value, done } = yield __await(reader.read());
      if (done) {
        break;
      }
      yield yield __await(addHelpers(value));
    }
  }, "generateResponseSequence_1"));
}
function getResponseStream(inputStream) {
  const reader = inputStream.getReader();
  const stream = new ReadableStream({
    start(controller) {
      let currentText = "";
      return pump();
      function pump() {
        return reader.read().then(({ value, done }) => {
          if (done) {
            if (currentText.trim()) {
              controller.error(new GoogleGenerativeAIError("Failed to parse stream"));
              return;
            }
            controller.close();
            return;
          }
          currentText += value;
          let match2 = currentText.match(responseLineRE);
          let parsedResponse;
          while (match2) {
            try {
              parsedResponse = JSON.parse(match2[1]);
            } catch (e) {
              controller.error(new GoogleGenerativeAIError(`Error parsing JSON response: "${match2[1]}"`));
              return;
            }
            controller.enqueue(parsedResponse);
            currentText = currentText.substring(match2[0].length);
            match2 = currentText.match(responseLineRE);
          }
          return pump();
        });
      }
      __name(pump, "pump");
    }
  });
  return stream;
}
function aggregateResponses(responses) {
  const lastResponse = responses[responses.length - 1];
  const aggregatedResponse = {
    promptFeedback: lastResponse === null || lastResponse === void 0 ? void 0 : lastResponse.promptFeedback
  };
  for (const response of responses) {
    if (response.candidates) {
      for (const candidate of response.candidates) {
        const i = candidate.index;
        if (!aggregatedResponse.candidates) {
          aggregatedResponse.candidates = [];
        }
        if (!aggregatedResponse.candidates[i]) {
          aggregatedResponse.candidates[i] = {
            index: candidate.index
          };
        }
        aggregatedResponse.candidates[i].citationMetadata = candidate.citationMetadata;
        aggregatedResponse.candidates[i].groundingMetadata = candidate.groundingMetadata;
        aggregatedResponse.candidates[i].finishReason = candidate.finishReason;
        aggregatedResponse.candidates[i].finishMessage = candidate.finishMessage;
        aggregatedResponse.candidates[i].safetyRatings = candidate.safetyRatings;
        if (candidate.content && candidate.content.parts) {
          if (!aggregatedResponse.candidates[i].content) {
            aggregatedResponse.candidates[i].content = {
              role: candidate.content.role || "user",
              parts: []
            };
          }
          const newPart = {};
          for (const part of candidate.content.parts) {
            if (part.text) {
              newPart.text = part.text;
            }
            if (part.functionCall) {
              newPart.functionCall = part.functionCall;
            }
            if (part.executableCode) {
              newPart.executableCode = part.executableCode;
            }
            if (part.codeExecutionResult) {
              newPart.codeExecutionResult = part.codeExecutionResult;
            }
            if (Object.keys(newPart).length === 0) {
              newPart.text = "";
            }
            aggregatedResponse.candidates[i].content.parts.push(newPart);
          }
        }
      }
    }
    if (response.usageMetadata) {
      aggregatedResponse.usageMetadata = response.usageMetadata;
    }
  }
  return aggregatedResponse;
}
async function generateContentStream(apiKey, model, params, requestOptions) {
  const response = await makeModelRequest(
    model,
    Task.STREAM_GENERATE_CONTENT,
    apiKey,
    /* stream */
    true,
    JSON.stringify(params),
    requestOptions
  );
  return processStream(response);
}
async function generateContent(apiKey, model, params, requestOptions) {
  const response = await makeModelRequest(
    model,
    Task.GENERATE_CONTENT,
    apiKey,
    /* stream */
    false,
    JSON.stringify(params),
    requestOptions
  );
  const responseJson = await response.json();
  const enhancedResponse = addHelpers(responseJson);
  return {
    response: enhancedResponse
  };
}
function formatSystemInstruction(input) {
  if (input == null) {
    return void 0;
  } else if (typeof input === "string") {
    return { role: "system", parts: [{ text: input }] };
  } else if (input.text) {
    return { role: "system", parts: [input] };
  } else if (input.parts) {
    if (!input.role) {
      return { role: "system", parts: input.parts };
    } else {
      return input;
    }
  }
}
function formatNewContent(request) {
  let newParts = [];
  if (typeof request === "string") {
    newParts = [{ text: request }];
  } else {
    for (const partOrString of request) {
      if (typeof partOrString === "string") {
        newParts.push({ text: partOrString });
      } else {
        newParts.push(partOrString);
      }
    }
  }
  return assignRoleToPartsAndValidateSendMessageRequest(newParts);
}
function assignRoleToPartsAndValidateSendMessageRequest(parts) {
  const userContent = { role: "user", parts: [] };
  const functionContent = { role: "function", parts: [] };
  let hasUserContent = false;
  let hasFunctionContent = false;
  for (const part of parts) {
    if ("functionResponse" in part) {
      functionContent.parts.push(part);
      hasFunctionContent = true;
    } else {
      userContent.parts.push(part);
      hasUserContent = true;
    }
  }
  if (hasUserContent && hasFunctionContent) {
    throw new GoogleGenerativeAIError("Within a single message, FunctionResponse cannot be mixed with other type of part in the request for sending chat message.");
  }
  if (!hasUserContent && !hasFunctionContent) {
    throw new GoogleGenerativeAIError("No content is provided for sending chat message.");
  }
  if (hasUserContent) {
    return userContent;
  }
  return functionContent;
}
function formatCountTokensInput(params, modelParams) {
  var _a;
  let formattedGenerateContentRequest = {
    model: modelParams === null || modelParams === void 0 ? void 0 : modelParams.model,
    generationConfig: modelParams === null || modelParams === void 0 ? void 0 : modelParams.generationConfig,
    safetySettings: modelParams === null || modelParams === void 0 ? void 0 : modelParams.safetySettings,
    tools: modelParams === null || modelParams === void 0 ? void 0 : modelParams.tools,
    toolConfig: modelParams === null || modelParams === void 0 ? void 0 : modelParams.toolConfig,
    systemInstruction: modelParams === null || modelParams === void 0 ? void 0 : modelParams.systemInstruction,
    cachedContent: (_a = modelParams === null || modelParams === void 0 ? void 0 : modelParams.cachedContent) === null || _a === void 0 ? void 0 : _a.name,
    contents: []
  };
  const containsGenerateContentRequest = params.generateContentRequest != null;
  if (params.contents) {
    if (containsGenerateContentRequest) {
      throw new GoogleGenerativeAIRequestInputError("CountTokensRequest must have one of contents or generateContentRequest, not both.");
    }
    formattedGenerateContentRequest.contents = params.contents;
  } else if (containsGenerateContentRequest) {
    formattedGenerateContentRequest = Object.assign(Object.assign({}, formattedGenerateContentRequest), params.generateContentRequest);
  } else {
    const content = formatNewContent(params);
    formattedGenerateContentRequest.contents = [content];
  }
  return { generateContentRequest: formattedGenerateContentRequest };
}
function formatGenerateContentInput(params) {
  let formattedRequest;
  if (params.contents) {
    formattedRequest = params;
  } else {
    const content = formatNewContent(params);
    formattedRequest = { contents: [content] };
  }
  if (params.systemInstruction) {
    formattedRequest.systemInstruction = formatSystemInstruction(params.systemInstruction);
  }
  return formattedRequest;
}
function formatEmbedContentInput(params) {
  if (typeof params === "string" || Array.isArray(params)) {
    const content = formatNewContent(params);
    return { content };
  }
  return params;
}
function validateChatHistory(history) {
  let prevContent = false;
  for (const currContent of history) {
    const { role, parts } = currContent;
    if (!prevContent && role !== "user") {
      throw new GoogleGenerativeAIError(`First content should be with role 'user', got ${role}`);
    }
    if (!POSSIBLE_ROLES.includes(role)) {
      throw new GoogleGenerativeAIError(`Each item should include role field. Got ${role} but valid roles are: ${JSON.stringify(POSSIBLE_ROLES)}`);
    }
    if (!Array.isArray(parts)) {
      throw new GoogleGenerativeAIError("Content should have 'parts' property with an array of Parts");
    }
    if (parts.length === 0) {
      throw new GoogleGenerativeAIError("Each Content should have at least one part");
    }
    const countFields = {
      text: 0,
      inlineData: 0,
      functionCall: 0,
      functionResponse: 0,
      fileData: 0,
      executableCode: 0,
      codeExecutionResult: 0
    };
    for (const part of parts) {
      for (const key of VALID_PART_FIELDS) {
        if (key in part) {
          countFields[key] += 1;
        }
      }
    }
    const validParts = VALID_PARTS_PER_ROLE[role];
    for (const key of VALID_PART_FIELDS) {
      if (!validParts.includes(key) && countFields[key] > 0) {
        throw new GoogleGenerativeAIError(`Content with role '${role}' can't contain '${key}' part`);
      }
    }
    prevContent = true;
  }
}
async function countTokens(apiKey, model, params, singleRequestOptions) {
  const response = await makeModelRequest(model, Task.COUNT_TOKENS, apiKey, false, JSON.stringify(params), singleRequestOptions);
  return response.json();
}
async function embedContent(apiKey, model, params, requestOptions) {
  const response = await makeModelRequest(model, Task.EMBED_CONTENT, apiKey, false, JSON.stringify(params), requestOptions);
  return response.json();
}
async function batchEmbedContents(apiKey, model, params, requestOptions) {
  const requestsWithModel = params.requests.map((request) => {
    return Object.assign(Object.assign({}, request), { model });
  });
  const response = await makeModelRequest(model, Task.BATCH_EMBED_CONTENTS, apiKey, false, JSON.stringify({ requests: requestsWithModel }), requestOptions);
  return response.json();
}
var import_checked_fetch, SchemaType, ExecutableCodeLanguage, Outcome, POSSIBLE_ROLES, HarmCategory, HarmBlockThreshold, HarmProbability, BlockReason, FinishReason, TaskType, FunctionCallingMode, DynamicRetrievalMode, GoogleGenerativeAIError, GoogleGenerativeAIResponseError, GoogleGenerativeAIFetchError, GoogleGenerativeAIRequestInputError, DEFAULT_BASE_URL, DEFAULT_API_VERSION, PACKAGE_VERSION, PACKAGE_LOG_HEADER, Task, RequestUrl, badFinishReasons, responseLineRE, VALID_PART_FIELDS, VALID_PARTS_PER_ROLE, SILENT_ERROR, ChatSession, GenerativeModel, GoogleGenerativeAI;
var init_dist = __esm({
  "../node_modules/@google/generative-ai/dist/index.mjs"() {
    init_functionsRoutes_0_37336205855784055();
    import_checked_fetch = __toESM(require_checked_fetch(), 1);
    (function(SchemaType2) {
      SchemaType2["STRING"] = "string";
      SchemaType2["NUMBER"] = "number";
      SchemaType2["INTEGER"] = "integer";
      SchemaType2["BOOLEAN"] = "boolean";
      SchemaType2["ARRAY"] = "array";
      SchemaType2["OBJECT"] = "object";
    })(SchemaType || (SchemaType = {}));
    (function(ExecutableCodeLanguage2) {
      ExecutableCodeLanguage2["LANGUAGE_UNSPECIFIED"] = "language_unspecified";
      ExecutableCodeLanguage2["PYTHON"] = "python";
    })(ExecutableCodeLanguage || (ExecutableCodeLanguage = {}));
    (function(Outcome2) {
      Outcome2["OUTCOME_UNSPECIFIED"] = "outcome_unspecified";
      Outcome2["OUTCOME_OK"] = "outcome_ok";
      Outcome2["OUTCOME_FAILED"] = "outcome_failed";
      Outcome2["OUTCOME_DEADLINE_EXCEEDED"] = "outcome_deadline_exceeded";
    })(Outcome || (Outcome = {}));
    POSSIBLE_ROLES = ["user", "model", "function", "system"];
    (function(HarmCategory2) {
      HarmCategory2["HARM_CATEGORY_UNSPECIFIED"] = "HARM_CATEGORY_UNSPECIFIED";
      HarmCategory2["HARM_CATEGORY_HATE_SPEECH"] = "HARM_CATEGORY_HATE_SPEECH";
      HarmCategory2["HARM_CATEGORY_SEXUALLY_EXPLICIT"] = "HARM_CATEGORY_SEXUALLY_EXPLICIT";
      HarmCategory2["HARM_CATEGORY_HARASSMENT"] = "HARM_CATEGORY_HARASSMENT";
      HarmCategory2["HARM_CATEGORY_DANGEROUS_CONTENT"] = "HARM_CATEGORY_DANGEROUS_CONTENT";
    })(HarmCategory || (HarmCategory = {}));
    (function(HarmBlockThreshold2) {
      HarmBlockThreshold2["HARM_BLOCK_THRESHOLD_UNSPECIFIED"] = "HARM_BLOCK_THRESHOLD_UNSPECIFIED";
      HarmBlockThreshold2["BLOCK_LOW_AND_ABOVE"] = "BLOCK_LOW_AND_ABOVE";
      HarmBlockThreshold2["BLOCK_MEDIUM_AND_ABOVE"] = "BLOCK_MEDIUM_AND_ABOVE";
      HarmBlockThreshold2["BLOCK_ONLY_HIGH"] = "BLOCK_ONLY_HIGH";
      HarmBlockThreshold2["BLOCK_NONE"] = "BLOCK_NONE";
    })(HarmBlockThreshold || (HarmBlockThreshold = {}));
    (function(HarmProbability2) {
      HarmProbability2["HARM_PROBABILITY_UNSPECIFIED"] = "HARM_PROBABILITY_UNSPECIFIED";
      HarmProbability2["NEGLIGIBLE"] = "NEGLIGIBLE";
      HarmProbability2["LOW"] = "LOW";
      HarmProbability2["MEDIUM"] = "MEDIUM";
      HarmProbability2["HIGH"] = "HIGH";
    })(HarmProbability || (HarmProbability = {}));
    (function(BlockReason2) {
      BlockReason2["BLOCKED_REASON_UNSPECIFIED"] = "BLOCKED_REASON_UNSPECIFIED";
      BlockReason2["SAFETY"] = "SAFETY";
      BlockReason2["OTHER"] = "OTHER";
    })(BlockReason || (BlockReason = {}));
    (function(FinishReason2) {
      FinishReason2["FINISH_REASON_UNSPECIFIED"] = "FINISH_REASON_UNSPECIFIED";
      FinishReason2["STOP"] = "STOP";
      FinishReason2["MAX_TOKENS"] = "MAX_TOKENS";
      FinishReason2["SAFETY"] = "SAFETY";
      FinishReason2["RECITATION"] = "RECITATION";
      FinishReason2["LANGUAGE"] = "LANGUAGE";
      FinishReason2["OTHER"] = "OTHER";
    })(FinishReason || (FinishReason = {}));
    (function(TaskType2) {
      TaskType2["TASK_TYPE_UNSPECIFIED"] = "TASK_TYPE_UNSPECIFIED";
      TaskType2["RETRIEVAL_QUERY"] = "RETRIEVAL_QUERY";
      TaskType2["RETRIEVAL_DOCUMENT"] = "RETRIEVAL_DOCUMENT";
      TaskType2["SEMANTIC_SIMILARITY"] = "SEMANTIC_SIMILARITY";
      TaskType2["CLASSIFICATION"] = "CLASSIFICATION";
      TaskType2["CLUSTERING"] = "CLUSTERING";
    })(TaskType || (TaskType = {}));
    (function(FunctionCallingMode2) {
      FunctionCallingMode2["MODE_UNSPECIFIED"] = "MODE_UNSPECIFIED";
      FunctionCallingMode2["AUTO"] = "AUTO";
      FunctionCallingMode2["ANY"] = "ANY";
      FunctionCallingMode2["NONE"] = "NONE";
    })(FunctionCallingMode || (FunctionCallingMode = {}));
    (function(DynamicRetrievalMode2) {
      DynamicRetrievalMode2["MODE_UNSPECIFIED"] = "MODE_UNSPECIFIED";
      DynamicRetrievalMode2["MODE_DYNAMIC"] = "MODE_DYNAMIC";
    })(DynamicRetrievalMode || (DynamicRetrievalMode = {}));
    GoogleGenerativeAIError = class extends Error {
      static {
        __name(this, "GoogleGenerativeAIError");
      }
      constructor(message) {
        super(`[GoogleGenerativeAI Error]: ${message}`);
      }
    };
    GoogleGenerativeAIResponseError = class extends GoogleGenerativeAIError {
      static {
        __name(this, "GoogleGenerativeAIResponseError");
      }
      constructor(message, response) {
        super(message);
        this.response = response;
      }
    };
    GoogleGenerativeAIFetchError = class extends GoogleGenerativeAIError {
      static {
        __name(this, "GoogleGenerativeAIFetchError");
      }
      constructor(message, status, statusText, errorDetails) {
        super(message);
        this.status = status;
        this.statusText = statusText;
        this.errorDetails = errorDetails;
      }
    };
    GoogleGenerativeAIRequestInputError = class extends GoogleGenerativeAIError {
      static {
        __name(this, "GoogleGenerativeAIRequestInputError");
      }
    };
    DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com";
    DEFAULT_API_VERSION = "v1beta";
    PACKAGE_VERSION = "0.21.0";
    PACKAGE_LOG_HEADER = "genai-js";
    (function(Task2) {
      Task2["GENERATE_CONTENT"] = "generateContent";
      Task2["STREAM_GENERATE_CONTENT"] = "streamGenerateContent";
      Task2["COUNT_TOKENS"] = "countTokens";
      Task2["EMBED_CONTENT"] = "embedContent";
      Task2["BATCH_EMBED_CONTENTS"] = "batchEmbedContents";
    })(Task || (Task = {}));
    RequestUrl = class {
      static {
        __name(this, "RequestUrl");
      }
      constructor(model, task, apiKey, stream, requestOptions) {
        this.model = model;
        this.task = task;
        this.apiKey = apiKey;
        this.stream = stream;
        this.requestOptions = requestOptions;
      }
      toString() {
        var _a, _b;
        const apiVersion = ((_a = this.requestOptions) === null || _a === void 0 ? void 0 : _a.apiVersion) || DEFAULT_API_VERSION;
        const baseUrl = ((_b = this.requestOptions) === null || _b === void 0 ? void 0 : _b.baseUrl) || DEFAULT_BASE_URL;
        let url = `${baseUrl}/${apiVersion}/${this.model}:${this.task}`;
        if (this.stream) {
          url += "?alt=sse";
        }
        return url;
      }
    };
    __name(getClientHeaders, "getClientHeaders");
    __name(getHeaders, "getHeaders");
    __name(constructModelRequest, "constructModelRequest");
    __name(makeModelRequest, "makeModelRequest");
    __name(makeRequest, "makeRequest");
    __name(handleResponseError, "handleResponseError");
    __name(handleResponseNotOk, "handleResponseNotOk");
    __name(buildFetchOptions, "buildFetchOptions");
    __name(addHelpers, "addHelpers");
    __name(getText, "getText");
    __name(getFunctionCalls, "getFunctionCalls");
    badFinishReasons = [
      FinishReason.RECITATION,
      FinishReason.SAFETY,
      FinishReason.LANGUAGE
    ];
    __name(hadBadFinishReason, "hadBadFinishReason");
    __name(formatBlockErrorMessage, "formatBlockErrorMessage");
    __name(__await, "__await");
    __name(__asyncGenerator, "__asyncGenerator");
    responseLineRE = /^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/;
    __name(processStream, "processStream");
    __name(getResponsePromise, "getResponsePromise");
    __name(generateResponseSequence, "generateResponseSequence");
    __name(getResponseStream, "getResponseStream");
    __name(aggregateResponses, "aggregateResponses");
    __name(generateContentStream, "generateContentStream");
    __name(generateContent, "generateContent");
    __name(formatSystemInstruction, "formatSystemInstruction");
    __name(formatNewContent, "formatNewContent");
    __name(assignRoleToPartsAndValidateSendMessageRequest, "assignRoleToPartsAndValidateSendMessageRequest");
    __name(formatCountTokensInput, "formatCountTokensInput");
    __name(formatGenerateContentInput, "formatGenerateContentInput");
    __name(formatEmbedContentInput, "formatEmbedContentInput");
    VALID_PART_FIELDS = [
      "text",
      "inlineData",
      "functionCall",
      "functionResponse",
      "executableCode",
      "codeExecutionResult"
    ];
    VALID_PARTS_PER_ROLE = {
      user: ["text", "inlineData"],
      function: ["functionResponse"],
      model: ["text", "functionCall", "executableCode", "codeExecutionResult"],
      // System instructions shouldn't be in history anyway.
      system: ["text"]
    };
    __name(validateChatHistory, "validateChatHistory");
    SILENT_ERROR = "SILENT_ERROR";
    ChatSession = class {
      static {
        __name(this, "ChatSession");
      }
      constructor(apiKey, model, params, _requestOptions = {}) {
        this.model = model;
        this.params = params;
        this._requestOptions = _requestOptions;
        this._history = [];
        this._sendPromise = Promise.resolve();
        this._apiKey = apiKey;
        if (params === null || params === void 0 ? void 0 : params.history) {
          validateChatHistory(params.history);
          this._history = params.history;
        }
      }
      /**
       * Gets the chat history so far. Blocked prompts are not added to history.
       * Blocked candidates are not added to history, nor are the prompts that
       * generated them.
       */
      async getHistory() {
        await this._sendPromise;
        return this._history;
      }
      /**
       * Sends a chat message and receives a non-streaming
       * {@link GenerateContentResult}.
       *
       * Fields set in the optional {@link SingleRequestOptions} parameter will
       * take precedence over the {@link RequestOptions} values provided to
       * {@link GoogleGenerativeAI.getGenerativeModel }.
       */
      async sendMessage(request, requestOptions = {}) {
        var _a, _b, _c, _d, _e, _f;
        await this._sendPromise;
        const newContent = formatNewContent(request);
        const generateContentRequest = {
          safetySettings: (_a = this.params) === null || _a === void 0 ? void 0 : _a.safetySettings,
          generationConfig: (_b = this.params) === null || _b === void 0 ? void 0 : _b.generationConfig,
          tools: (_c = this.params) === null || _c === void 0 ? void 0 : _c.tools,
          toolConfig: (_d = this.params) === null || _d === void 0 ? void 0 : _d.toolConfig,
          systemInstruction: (_e = this.params) === null || _e === void 0 ? void 0 : _e.systemInstruction,
          cachedContent: (_f = this.params) === null || _f === void 0 ? void 0 : _f.cachedContent,
          contents: [...this._history, newContent]
        };
        const chatSessionRequestOptions = Object.assign(Object.assign({}, this._requestOptions), requestOptions);
        let finalResult;
        this._sendPromise = this._sendPromise.then(() => generateContent(this._apiKey, this.model, generateContentRequest, chatSessionRequestOptions)).then((result) => {
          var _a2;
          if (result.response.candidates && result.response.candidates.length > 0) {
            this._history.push(newContent);
            const responseContent = Object.assign({
              parts: [],
              // Response seems to come back without a role set.
              role: "model"
            }, (_a2 = result.response.candidates) === null || _a2 === void 0 ? void 0 : _a2[0].content);
            this._history.push(responseContent);
          } else {
            const blockErrorMessage = formatBlockErrorMessage(result.response);
            if (blockErrorMessage) {
              console.warn(`sendMessage() was unsuccessful. ${blockErrorMessage}. Inspect response object for details.`);
            }
          }
          finalResult = result;
        });
        await this._sendPromise;
        return finalResult;
      }
      /**
       * Sends a chat message and receives the response as a
       * {@link GenerateContentStreamResult} containing an iterable stream
       * and a response promise.
       *
       * Fields set in the optional {@link SingleRequestOptions} parameter will
       * take precedence over the {@link RequestOptions} values provided to
       * {@link GoogleGenerativeAI.getGenerativeModel }.
       */
      async sendMessageStream(request, requestOptions = {}) {
        var _a, _b, _c, _d, _e, _f;
        await this._sendPromise;
        const newContent = formatNewContent(request);
        const generateContentRequest = {
          safetySettings: (_a = this.params) === null || _a === void 0 ? void 0 : _a.safetySettings,
          generationConfig: (_b = this.params) === null || _b === void 0 ? void 0 : _b.generationConfig,
          tools: (_c = this.params) === null || _c === void 0 ? void 0 : _c.tools,
          toolConfig: (_d = this.params) === null || _d === void 0 ? void 0 : _d.toolConfig,
          systemInstruction: (_e = this.params) === null || _e === void 0 ? void 0 : _e.systemInstruction,
          cachedContent: (_f = this.params) === null || _f === void 0 ? void 0 : _f.cachedContent,
          contents: [...this._history, newContent]
        };
        const chatSessionRequestOptions = Object.assign(Object.assign({}, this._requestOptions), requestOptions);
        const streamPromise = generateContentStream(this._apiKey, this.model, generateContentRequest, chatSessionRequestOptions);
        this._sendPromise = this._sendPromise.then(() => streamPromise).catch((_ignored) => {
          throw new Error(SILENT_ERROR);
        }).then((streamResult) => streamResult.response).then((response) => {
          if (response.candidates && response.candidates.length > 0) {
            this._history.push(newContent);
            const responseContent = Object.assign({}, response.candidates[0].content);
            if (!responseContent.role) {
              responseContent.role = "model";
            }
            this._history.push(responseContent);
          } else {
            const blockErrorMessage = formatBlockErrorMessage(response);
            if (blockErrorMessage) {
              console.warn(`sendMessageStream() was unsuccessful. ${blockErrorMessage}. Inspect response object for details.`);
            }
          }
        }).catch((e) => {
          if (e.message !== SILENT_ERROR) {
            console.error(e);
          }
        });
        return streamPromise;
      }
    };
    __name(countTokens, "countTokens");
    __name(embedContent, "embedContent");
    __name(batchEmbedContents, "batchEmbedContents");
    GenerativeModel = class {
      static {
        __name(this, "GenerativeModel");
      }
      constructor(apiKey, modelParams, _requestOptions = {}) {
        this.apiKey = apiKey;
        this._requestOptions = _requestOptions;
        if (modelParams.model.includes("/")) {
          this.model = modelParams.model;
        } else {
          this.model = `models/${modelParams.model}`;
        }
        this.generationConfig = modelParams.generationConfig || {};
        this.safetySettings = modelParams.safetySettings || [];
        this.tools = modelParams.tools;
        this.toolConfig = modelParams.toolConfig;
        this.systemInstruction = formatSystemInstruction(modelParams.systemInstruction);
        this.cachedContent = modelParams.cachedContent;
      }
      /**
       * Makes a single non-streaming call to the model
       * and returns an object containing a single {@link GenerateContentResponse}.
       *
       * Fields set in the optional {@link SingleRequestOptions} parameter will
       * take precedence over the {@link RequestOptions} values provided to
       * {@link GoogleGenerativeAI.getGenerativeModel }.
       */
      async generateContent(request, requestOptions = {}) {
        var _a;
        const formattedParams = formatGenerateContentInput(request);
        const generativeModelRequestOptions = Object.assign(Object.assign({}, this._requestOptions), requestOptions);
        return generateContent(this.apiKey, this.model, Object.assign({ generationConfig: this.generationConfig, safetySettings: this.safetySettings, tools: this.tools, toolConfig: this.toolConfig, systemInstruction: this.systemInstruction, cachedContent: (_a = this.cachedContent) === null || _a === void 0 ? void 0 : _a.name }, formattedParams), generativeModelRequestOptions);
      }
      /**
       * Makes a single streaming call to the model and returns an object
       * containing an iterable stream that iterates over all chunks in the
       * streaming response as well as a promise that returns the final
       * aggregated response.
       *
       * Fields set in the optional {@link SingleRequestOptions} parameter will
       * take precedence over the {@link RequestOptions} values provided to
       * {@link GoogleGenerativeAI.getGenerativeModel }.
       */
      async generateContentStream(request, requestOptions = {}) {
        var _a;
        const formattedParams = formatGenerateContentInput(request);
        const generativeModelRequestOptions = Object.assign(Object.assign({}, this._requestOptions), requestOptions);
        return generateContentStream(this.apiKey, this.model, Object.assign({ generationConfig: this.generationConfig, safetySettings: this.safetySettings, tools: this.tools, toolConfig: this.toolConfig, systemInstruction: this.systemInstruction, cachedContent: (_a = this.cachedContent) === null || _a === void 0 ? void 0 : _a.name }, formattedParams), generativeModelRequestOptions);
      }
      /**
       * Gets a new {@link ChatSession} instance which can be used for
       * multi-turn chats.
       */
      startChat(startChatParams) {
        var _a;
        return new ChatSession(this.apiKey, this.model, Object.assign({ generationConfig: this.generationConfig, safetySettings: this.safetySettings, tools: this.tools, toolConfig: this.toolConfig, systemInstruction: this.systemInstruction, cachedContent: (_a = this.cachedContent) === null || _a === void 0 ? void 0 : _a.name }, startChatParams), this._requestOptions);
      }
      /**
       * Counts the tokens in the provided request.
       *
       * Fields set in the optional {@link SingleRequestOptions} parameter will
       * take precedence over the {@link RequestOptions} values provided to
       * {@link GoogleGenerativeAI.getGenerativeModel }.
       */
      async countTokens(request, requestOptions = {}) {
        const formattedParams = formatCountTokensInput(request, {
          model: this.model,
          generationConfig: this.generationConfig,
          safetySettings: this.safetySettings,
          tools: this.tools,
          toolConfig: this.toolConfig,
          systemInstruction: this.systemInstruction,
          cachedContent: this.cachedContent
        });
        const generativeModelRequestOptions = Object.assign(Object.assign({}, this._requestOptions), requestOptions);
        return countTokens(this.apiKey, this.model, formattedParams, generativeModelRequestOptions);
      }
      /**
       * Embeds the provided content.
       *
       * Fields set in the optional {@link SingleRequestOptions} parameter will
       * take precedence over the {@link RequestOptions} values provided to
       * {@link GoogleGenerativeAI.getGenerativeModel }.
       */
      async embedContent(request, requestOptions = {}) {
        const formattedParams = formatEmbedContentInput(request);
        const generativeModelRequestOptions = Object.assign(Object.assign({}, this._requestOptions), requestOptions);
        return embedContent(this.apiKey, this.model, formattedParams, generativeModelRequestOptions);
      }
      /**
       * Embeds an array of {@link EmbedContentRequest}s.
       *
       * Fields set in the optional {@link SingleRequestOptions} parameter will
       * take precedence over the {@link RequestOptions} values provided to
       * {@link GoogleGenerativeAI.getGenerativeModel }.
       */
      async batchEmbedContents(batchEmbedContentRequest, requestOptions = {}) {
        const generativeModelRequestOptions = Object.assign(Object.assign({}, this._requestOptions), requestOptions);
        return batchEmbedContents(this.apiKey, this.model, batchEmbedContentRequest, generativeModelRequestOptions);
      }
    };
    GoogleGenerativeAI = class {
      static {
        __name(this, "GoogleGenerativeAI");
      }
      constructor(apiKey) {
        this.apiKey = apiKey;
      }
      /**
       * Gets a {@link GenerativeModel} instance for the provided model name.
       */
      getGenerativeModel(modelParams, requestOptions) {
        if (!modelParams.model) {
          throw new GoogleGenerativeAIError(`Must provide a model name. Example: genai.getGenerativeModel({ model: 'my-model-name' })`);
        }
        return new GenerativeModel(this.apiKey, modelParams, requestOptions);
      }
      /**
       * Creates a {@link GenerativeModel} instance from provided content cache.
       */
      getGenerativeModelFromCachedContent(cachedContent, modelParams, requestOptions) {
        if (!cachedContent.name) {
          throw new GoogleGenerativeAIRequestInputError("Cached content must contain a `name` field.");
        }
        if (!cachedContent.model) {
          throw new GoogleGenerativeAIRequestInputError("Cached content must contain a `model` field.");
        }
        const disallowedDuplicates = ["model", "systemInstruction"];
        for (const key of disallowedDuplicates) {
          if ((modelParams === null || modelParams === void 0 ? void 0 : modelParams[key]) && cachedContent[key] && (modelParams === null || modelParams === void 0 ? void 0 : modelParams[key]) !== cachedContent[key]) {
            if (key === "model") {
              const modelParamsComp = modelParams.model.startsWith("models/") ? modelParams.model.replace("models/", "") : modelParams.model;
              const cachedContentComp = cachedContent.model.startsWith("models/") ? cachedContent.model.replace("models/", "") : cachedContent.model;
              if (modelParamsComp === cachedContentComp) {
                continue;
              }
            }
            throw new GoogleGenerativeAIRequestInputError(`Different value for "${key}" specified in modelParams (${modelParams[key]}) and cachedContent (${cachedContent[key]})`);
          }
        }
        const modelParamsFromCache = Object.assign(Object.assign({}, modelParams), { model: cachedContent.model, tools: cachedContent.tools, toolConfig: cachedContent.toolConfig, systemInstruction: cachedContent.systemInstruction, cachedContent });
        return new GenerativeModel(this.apiKey, modelParamsFromCache, requestOptions);
      }
    };
  }
});

// api/lib/llm.ts
var import_checked_fetch2, LLMService;
var init_llm = __esm({
  "api/lib/llm.ts"() {
    init_functionsRoutes_0_37336205855784055();
    import_checked_fetch2 = __toESM(require_checked_fetch(), 1);
    init_dist();
    LLMService = class {
      static {
        __name(this, "LLMService");
      }
      genAI;
      model;
      apiKey;
      constructor(apiKey) {
        if (!apiKey) {
          throw new Error("GEMINI_API_KEY is required");
        }
        this.apiKey = apiKey;
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      }
      /**
       * 生成回覆
       */
      async generateReply(params) {
        const { message, intent, entities, context, mode, knowledgeBase: knowledgeBase3 } = params;
        const systemPrompt = this.buildSystemPrompt(mode, intent, entities, context, knowledgeBase3, message);
        const userMessage = this.buildUserMessage(message, context);
        try {
          const result = await this.model.generateContent({
            contents: [
              {
                role: "user",
                parts: [{ text: systemPrompt + "\n\n" + userMessage }]
              }
            ]
          });
          const response = result.response;
          const rawReply = response.text();
          const cleanedReply = this.cleanReply(rawReply);
          return cleanedReply;
        } catch (error) {
          console.error("[LLM Error]", error);
          throw new Error(`Failed to generate reply: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      /**
       * 構建 System Prompt
       */
      buildSystemPrompt(mode, intent, entities, context, knowledgeBase3, userMessage) {
        let prompt = `\u4F60\u662F\u300C\u597D\u6642\u6709\u5F71\u300D\u651D\u5F71\u5DE5\u4F5C\u5BA4\u7684 AI \u5F62\u8C61\u9867\u554F\uFF0C\u8CA0\u8CAC\u5354\u52A9\u5BA2\u6236\u9078\u64C7\u62CD\u651D\u65B9\u6848\u3001\u8AAA\u660E\u6D41\u7A0B\u8207\u50F9\u683C\u3002

## \u54C1\u724C\u5B9A\u4F4D
- \u6EAB\u6696\u3001\u5C08\u696D\u3001\u771F\u8AA0\u3001\u7C21\u55AE
- \u8A9E\u6C23\uFF1A\u670B\u53CB + \u9867\u554F\u7684\u6DF7\u642D\u98A8\u683C
- \u4E0D\u63A8\u92B7\u3001\u4E0D\u627F\u8AFE\u7121\u6CD5\u9054\u6210\u7684\u50F9\u683C\u3001\u4E0D\u7D66\u4E0D\u78BA\u5B9A\u8CC7\u8A0A

## \u95DC\u9375\u7D04\u675F\uFF08\u5FC5\u9808\u56B4\u683C\u9075\u5B88\uFF09
1. **\u7981\u6B62\u7DE8\u9020\u670D\u52D9**\uFF1A**\u56B4\u7981\u7DE8\u9020\u4EFB\u4F55\u4E0D\u5B58\u5728\u7684\u670D\u52D9\u6216\u670D\u52D9\u9805\u76EE**\u3002\u53EA\u80FD\u4F7F\u7528\u77E5\u8B58\u5EAB\u4E2D\u5BE6\u969B\u5B58\u5728\u7684\u670D\u52D9\u3002\u82E5\u77E5\u8B58\u5EAB\u6C92\u6709\u76F8\u95DC\u8CC7\u6599\uFF0C\u7981\u6B62\u81EA\u5DF1\u731C\u6E2C\u6216\u5F15\u7528\u5916\u90E8\u8CC7\u8A0A\u3002**\u53EA\u6709\u5728\u77E5\u8B58\u5EAB\u771F\u7684\u6C92\u6709\u76F8\u95DC\u8CC7\u6599\u6642\uFF0C\u624D\u5EFA\u8B70\u806F\u7D61\u771F\u4EBA**\u3002
2. **\u7981\u6B62\u7DE8\u9020\u806F\u7D61\u8CC7\u8A0A**\uFF1A**\u56B4\u7981\u7DE8\u9020\u4EFB\u4F55\u5730\u5740\u3001\u96FB\u8A71\u3001\u71DF\u696D\u6642\u9593\u3001\u505C\u8ECA\u5834\u540D\u7A31\u7B49\u806F\u7D61\u8CC7\u8A0A**\u3002\u53EA\u80FD\u4F7F\u7528\u77E5\u8B58\u5EAB\u4E2D\u63D0\u4F9B\u7684\u806F\u7D61\u8CC7\u8A0A\u3002\u82E5\u77E5\u8B58\u5EAB\u4E2D\u6C92\u6709\u5177\u9AD4\u8CC7\u8A0A\uFF08\u5982\u5177\u9AD4\u505C\u8ECA\u5834\u540D\u7A31\uFF09\uFF0C\u53EA\u80FD\u4F7F\u7528\u77E5\u8B58\u5EAB\u4E2D\u7684\u63CF\u8FF0\uFF0C\u7D55\u5C0D\u4E0D\u80FD\u81EA\u884C\u641C\u5C0B\u6216\u7DE8\u9020\u5916\u90E8\u8CC7\u8A0A\u3002
3. **\u50F9\u683C\u5FC5\u9808\u51FA\u81EA JSON**\uFF1A\u6240\u6709\u50F9\u683C\u6578\u5B57\u7686\u9808\u51FA\u81EA JSON/FAQ\uFF0C\u4E0D\u5F97\u6191\u7A7A\u4F30\u7B97\u3002\u82E5\u627E\u4E0D\u5230\u50F9\u683C\u8CC7\u8A0A\uFF0C\u8ACB\u8AAA\u660E\u300C\u5BE6\u969B\u91D1\u984D\u4EE5\u73FE\u5834\u8207\u7576\u5B63\u516C\u544A\u70BA\u6E96\u300D\uFF0C\u4E26\u63D0\u4F9B\u9810\u7D04\u9023\u7D50\u8B93\u5BA2\u6236\u81EA\u884C\u67E5\u8A62\u3002
4. **\u653F\u7B56\u985E\u554F\u984C\u5F37\u5236\u5F9E FAQ \u56DE\u7B54**\uFF1A\u653F\u7B56\u985E\u554F\u984C\uFF08\u50F9\u683C\u3001\u53D6\u6D88\u3001\u96B1\u79C1\u3001\u6388\u6B0A\uFF09\u5FC5\u9808\u5F9E FAQ/JSON \u56DE\u7B54\uFF0C\u7981\u6B62 LLM \u7368\u7ACB\u751F\u6210\u3002\u82E5 FAQ \u6C92\u627E\u5230\uFF0C\u624D\u5EFA\u8B70\u806F\u7D61\u771F\u4EBA\u3002
5. **\u6295\u8A34\u8655\u7406\u4F7F\u7528\u6A21\u677F**\uFF1A\u6295\u8A34\u8655\u7406\uFF08complaint intent\uFF09\u5FC5\u9808\u4F7F\u7528\u56B4\u683C\u6A21\u677F\uFF0C\u4E0D\u5141\u8A31\u81EA\u884C\u6C7A\u5B9A\u88DC\u511F\u65B9\u6848\u3002\u6240\u6709\u88DC\u511F\u6C7A\u7B56\u90FD\u843D\u5728\u771F\u4EBA\u5BA2\u670D\u3002
6. **\u6E1B\u5C11\u8F49\u771F\u4EBA\u9078\u9805**\uFF1A\u76E1\u91CF\u7528\u77E5\u8B58\u5EAB\u56DE\u7B54\u554F\u984C\uFF0C\u4E0D\u8981\u8F15\u6613\u5EFA\u8B70\u8F49\u771F\u4EBA\u3002\u53EA\u6709\u5728\u4EE5\u4E0B\u60C5\u6CC1\u624D\u5EFA\u8B70\u8F49\u771F\u4EBA\uFF1A
   - \u77E5\u8B58\u5EAB\u771F\u7684\u6C92\u6709\u76F8\u95DC\u8CC7\u6599
   - \u5BA2\u6236\u660E\u78BA\u8981\u6C42\u627E\u771F\u4EBA
   - \u4F01\u696D/\u5718\u9AD4\u5831\u50F9\u7B49\u9700\u8981\u5BA2\u88FD\u5316\u7684\u670D\u52D9
7. **\u670D\u52D9\u9805\u76EE\u9650\u5236**\uFF1A\u53EA\u80FD\u63A8\u85A6\u77E5\u8B58\u5EAB\u4E2D\u5BE6\u969B\u5B58\u5728\u7684\u670D\u52D9\u3002\u82E5\u5BA2\u6236\u8A62\u554F\u4E0D\u5B58\u5728\u7684\u670D\u52D9\uFF08\u4F8B\u5982\uFF1A\u5BF6\u5BF6\u5BEB\u771F\u3001\u6293\u5468\u3001\u5B55\u5A66\u5BEB\u771F\u7B49\uFF09\uFF0C\u5FC5\u9808\u660E\u78BA\u8AAA\u660E\u300C\u6211\u5011\u76EE\u524D\u6C92\u6709\u63D0\u4F9B\u9019\u500B\u670D\u52D9\u300D\uFF0C\u4E26\u5F15\u5C0E\u5BA2\u6236\u9078\u64C7\u73FE\u6709\u7684\u670D\u52D9\u9805\u76EE\u3002
8. **\u7981\u6B62\u7DE8\u9020\u4FC3\u92B7\u8207\u512A\u60E0**\uFF1A**\u56B4\u7981\u7DE8\u9020\u4EFB\u4F55\u4FC3\u92B7\u6D3B\u52D5\u3001\u512A\u60E0\u65B9\u6848\u3001\u8D08\u54C1\u6216\u984D\u5916\u670D\u52D9**\u3002
   - \u7981\u6B62\u81EA\u884C\u63A8\u6E2C\u6216\u7DE8\u9020\u4EFB\u4F55\u300C\u591A\u9001\u300D\u3001\u300C\u52A0\u8D08\u300D\u3001\u300C\u984D\u5916\u63D0\u4F9B\u300D\u7B49\u512A\u60E0
   - \u53EA\u80FD\u4F7F\u7528\u77E5\u8B58\u5EAB\u4E2D\u660E\u78BA\u8A18\u8F09\u7684\u4FC3\u92B7\u8CC7\u8A0A\uFF08\u5982\u5B78\u751F\u512A\u60E0\uFF09
   - \u82E5\u77E5\u8B58\u5EAB\u4E2D\u6C92\u6709\u76F8\u95DC\u4FC3\u92B7\u8CC7\u8A0A\uFF0C\u5FC5\u9808\u660E\u78BA\u8AAA\u660E\u300C\u76EE\u524D\u6C92\u6709\u9019\u500B\u512A\u60E0\u300D
   - **\u7D55\u5C0D\u4E0D\u80FD\u56E0\u70BA\u300C\u7CBE\u7DFB\u300D\u3001\u300C\u9AD8\u7D1A\u300D\u7B49\u5F62\u5BB9\u8A5E\u5C31\u81EA\u884C\u63A8\u6E2C\u6703\u6709\u984D\u5916\u512A\u60E0**

## \u8F38\u51FA\u683C\u5F0F\u8981\u6C42\uFF08\u56B4\u683C\u9075\u5B88\uFF09
1. **\u7981\u6B62\u8F38\u51FA JSON \u683C\u5F0F**\uFF1A\u7D55\u5C0D\u4E0D\u8981\u8F38\u51FA\u4EFB\u4F55 JSON \u5167\u5BB9\uFF0C\u5305\u62EC\uFF1A
   - \u4E0D\u8981\u8F38\u51FA {"key": "value"} \u9019\u985E\u7269\u4EF6\u6587\u5B57
   - \u4E0D\u8981\u8F38\u51FA\u5305\u542B\u591A\u5C64\u7684\u5927\u62EC\u865F\u6216\u4E2D\u62EC\u865F\u7D50\u69CB
   - \u4E0D\u8981\u8F38\u51FA\u4EFB\u4F55\u985E\u4F3C\u7A0B\u5F0F\u78BC\u6216\u8CC7\u6599\u7D50\u69CB\u7684\u5167\u5BB9\uFF08\u4F8B\u5982\u4EE5 { \u958B\u982D\u3001\u4EE5 } \u7D50\u5C3E\u7684\u5927\u6BB5\u6587\u5B57\uFF09
2. **\u7981\u6B62\u8F38\u51FA\u7A0B\u5F0F\u78BC\u5340\u584A**\uFF1A\u4E0D\u8981\u8F38\u51FA\u4EFB\u4F55\u7A0B\u5F0F\u78BC\u5340\u584A\u6216\u6A19\u793A\uFF08\u4F8B\u5982\u4EE5\u4E09\u500B\u53CD\u5F15\u865F\u6A19\u8A18\u7684\u5340\u584A\uFF09\uFF0C\u6240\u6709\u5167\u5BB9\u90FD\u5FC5\u9808\u662F\u81EA\u7136\u8A9E\u8A00\u3002
3. **\u53EA\u8F38\u51FA\u81EA\u7136\u8A9E\u8A00**\uFF1A\u6240\u6709\u56DE\u8986\u5FC5\u9808\u662F\u81EA\u7136\u7684\u4E2D\u6587\u53E5\u5B50\uFF0C\u76F4\u63A5\u56DE\u7B54\u5BA2\u6236\u554F\u984C\uFF0C\u4E0D\u8981\u51FA\u73FE JSON\u3001\u7269\u4EF6\u3001\u9663\u5217\u6216\u6B04\u4F4D\u540D\u7A31\u7B49\u6280\u8853\u7D30\u7BC0\u3002
4. **\u6A21\u677F\u8CC7\u6599\u50C5\u4F9B\u53C3\u8003**\uFF1A\u4E0B\u9762\u63D0\u4F9B\u7684\u56DE\u8986\u6A21\u677F\u3001\u670D\u52D9\u6458\u8981\u8207\u5176\u4ED6\u8CC7\u6599\uFF0C\u50C5\u4F9B\u4F60\u7406\u89E3\u8207\u53C3\u8003\uFF0C\u8ACB\u7528\u81EA\u5DF1\u7684\u8A71\u91CD\u5BEB\u6210\u81EA\u7136\u8A9E\u8A00\uFF0C\u4E0D\u8981\u539F\u5C01\u4E0D\u52D5\u8CBC\u4E0A\uFF0C\u4E5F\u4E0D\u8981\u8F49\u6210 JSON\u3002
5. **\u7981\u6B62\u8F38\u51FA\u539F\u59CB\u8CC7\u6599**\uFF1A\u4E0D\u8981\u628A\u539F\u59CB JSON\u3001ID\u3001\u6B04\u4F4D\u540D\u7A31\u3001\u9375\u503C\u5C0D\u7B49\u76F4\u63A5\u7D66\u5BA2\u6236\uFF0C\u53EA\u80FD\u8F38\u51FA\u5BA2\u6236\u770B\u5F97\u61C2\u7684\u81EA\u7136\u8A9E\u8A00\u8AAA\u660E\u3002

## \u56DE\u8986\u683C\u5F0F\u8981\u6C42\uFF08\u56B4\u683C\u9075\u5B88\u4E09\u6BB5\u5F0F\u7D50\u69CB\uFF09
\u6BCF\u6B21\u56DE\u8986\u5FC5\u9808\u63A1\u7528\u4E09\u6BB5\u5F0F\u7D50\u69CB\uFF0C\u8B93\u5BA2\u6236\u7372\u5F97\u300C\u8DB3\u5920\u8CC7\u8A0A\u300D\u800C\u7121\u9700\u53CD\u8986\u8A62\u554F\uFF1A

1. **\u4E3B\u56DE\u7B54\uFF08main_answer\uFF09**\uFF1A
   - \u76F4\u63A5\u56DE\u7B54\u5BA2\u6236\u554F\u984C\uFF0C\u6E05\u695A\u3001\u5B8C\u6574\u3001\u4E0D\u5197\u9577
   - \u512A\u5148\u4F7F\u7528\u77E5\u8B58\u5EAB\u4E2D\u7684 response_template \u6216 service_summary
   - \u5982\u679C\u77E5\u8B58\u5EAB\u6709\u5C0D\u61C9\u7684\u6A21\u677F\uFF0C\u5FC5\u9808\u4F7F\u7528\u6A21\u677F\u4E2D\u7684 main_answer
   - \u8A9E\u6C23\uFF1A\u6EAB\u6696\u3001\u900F\u660E\u3001\u4E0D\u4E2D\u63A8\u92B7\uFF0C\u4E00\u5F8B\u4F7F\u7528\u300C\u60A8\u300D

2. **\u88DC\u5145\u8CC7\u8A0A\uFF08supplementary_info\uFF09**\uFF1A
   - \u53EA\u88DC\u5145\u6700\u95DC\u9375\u3001\u6700\u5E38\u88AB\u8FFD\u554F\u7684 1-2 \u9EDE\u7D30\u7BC0
   - \u4F7F\u7528\u77E5\u8B58\u5EAB\u4E2D\u7684 supplementary_info
   - \u4E0D\u8981\u9577\u7BC7\u5927\u8AD6\uFF0C\u4FDD\u6301\u7C21\u6F54

3. **\u667A\u6167\u9810\u6E2C\u9078\u55AE\uFF08next_best_actions\uFF09**\uFF1A
   - \u63D0\u4F9B 2-4 \u500B\u5E38\u898B\u4E0B\u4E00\u6B65\u9078\u9805
   - \u4F7F\u7528\u77E5\u8B58\u5EAB\u4E2D\u7684 intent_nba_mapping \u6216 response_template \u4E2D\u7684 next_best_actions
   - \u9019\u4E9B\u9078\u9805\u6703\u81EA\u52D5\u986F\u793A\u70BA\u5FEB\u901F\u56DE\u8986\u6309\u9215

**\u91CD\u8981**\uFF1A\u5982\u679C\u77E5\u8B58\u5EAB\u4E2D\u6709\u5C0D\u61C9\u7684 response_template\uFF0C\u5FC5\u9808\u512A\u5148\u4F7F\u7528\u6A21\u677F\u5167\u5BB9\uFF0C\u4E0D\u8981\u81EA\u884C\u767C\u63EE\u3002

## \u7576\u524D\u6A21\u5F0F
${this.getModeDescription(mode)}

## \u7576\u524D\u610F\u5716
${this.getIntentDescription(intent)}

## \u5DF2\u63D0\u53D6\u7684\u5BE6\u9AD4
${this.formatEntities(entities)}

## \u5C0D\u8A71\u4E0A\u4E0B\u6587
${this.formatContext(context)}
`;
        if (knowledgeBase3) {
          try {
            const services = knowledgeBase3.getAllServices();
            if (services && services.length > 0) {
              prompt += `
## \u5BE6\u969B\u5B58\u5728\u7684\u670D\u52D9\u9805\u76EE\uFF08\u53EA\u80FD\u63A8\u85A6\u4EE5\u4E0B\u670D\u52D9\uFF0C\u56B4\u7981\u7DE8\u9020\u5176\u4ED6\u670D\u52D9\uFF09
`;
              services.forEach((service) => {
                prompt += `- ${service.name}\uFF08${service.id}\uFF09\uFF1A${service.one_line}
`;
              });
              prompt += `
**\u91CD\u8981**\uFF1A\u82E5\u5BA2\u6236\u8A62\u554F\u4E0A\u8FF0\u5217\u8868\u4EE5\u5916\u7684\u670D\u52D9\uFF08\u4F8B\u5982\uFF1A\u5BF6\u5BF6\u5BEB\u771F\u3001\u6293\u5468\u3001\u5B55\u5A66\u5BEB\u771F\u7B49\uFF09\uFF0C\u5FC5\u9808\u660E\u78BA\u8AAA\u660E\u300C\u6211\u5011\u76EE\u524D\u6C92\u6709\u63D0\u4F9B\u9019\u500B\u670D\u52D9\u300D\uFF0C\u4E26\u5F15\u5C0E\u5BA2\u6236\u9078\u64C7\u4E0A\u8FF0\u5BE6\u969B\u5B58\u5728\u7684\u670D\u52D9\u9805\u76EE\u3002
`;
            }
          } catch (error) {
            console.error("[LLM] Failed to get services from knowledge base:", error);
          }
        }
        if (knowledgeBase3) {
          try {
            const responseTemplate = knowledgeBase3.getResponseTemplate(intent);
            if (responseTemplate) {
              prompt += `
## \u56DE\u8986\u6A21\u677F\uFF08\u5FC5\u9808\u512A\u5148\u4F7F\u7528\uFF09
**\u4E3B\u56DE\u7B54\uFF08\u7BC4\u4F8B\uFF09**\uFF1A${responseTemplate.main_answer}
**\u88DC\u5145\u8CC7\u8A0A\uFF08\u7BC4\u4F8B\uFF09**\uFF1A${responseTemplate.supplementary_info || "\u7121"}
**\u667A\u6167\u9078\u55AE\uFF08\u7BC4\u4F8B\uFF09**\uFF1A${responseTemplate.next_best_actions.join("\u3001")}

**\u91CD\u8981**\uFF1A\u4E0A\u8FF0\u5167\u5BB9\u662F\u300C\u7BC4\u4F8B\u6A21\u677F\u300D\uFF0C\u53EA\u4F9B\u4F60\u7406\u89E3\u8A9E\u6C23\u8207\u91CD\u9EDE\u3002\u4F60\u5FC5\u9808\uFF1A
- \u7528\u81EA\u7136\u8A9E\u8A00\u91CD\u65B0\u8868\u9054\uFF0C\u4E0D\u8981\u539F\u6A23\u8CBC\u4E0A
- \u4E0D\u8981\u628A\u9019\u4E9B\u8CC7\u6599\u8F49\u6210 JSON \u6216\u7A0B\u5F0F\u78BC\u683C\u5F0F
- \u4E0D\u8981\u8F38\u51FA\u4EFB\u4F55\u6B04\u4F4D\u540D\u7A31\u6216\u7D50\u69CB\uFF0C\u53EA\u8F38\u51FA\u7D66\u5BA2\u6236\u770B\u7684\u81EA\u7136\u8A9E\u8A00\u56DE\u8986\u3002
`;
            }
          } catch (error) {
            console.error("[LLM] Failed to get response template from knowledge base:", error);
          }
        }
        if (knowledgeBase3 && userMessage) {
          try {
            const emotionTemplate = knowledgeBase3.findEmotionTemplateByKeywords(userMessage);
            if (emotionTemplate) {
              prompt += `
## \u60C5\u7DD2\u5834\u666F\u6A21\u677F\uFF08\u5075\u6E2C\u5230 ${emotionTemplate.emotion}\uFF09
**\u6EAB\u6696\u5B89\u64AB**\uFF1A${emotionTemplate.warm_comfort}
**\u5354\u52A9\u8AAA\u660E**\uFF1A${emotionTemplate.assistance_explanation}
**\u667A\u6167\u9078\u55AE**\uFF1A${emotionTemplate.next_best_actions.join("\u3001")}

**\u91CD\u8981**\uFF1A\u4F60\u5FC5\u9808\u4F7F\u7528\u4E0A\u8FF0\u60C5\u7DD2\u6A21\u677F\u7684\u5167\u5BB9\uFF0C\u512A\u5148\u5C55\u73FE\u540C\u7406\u5FC3\u548C\u5354\u52A9\u610F\u9858\u3002
`;
            }
          } catch (error) {
            console.error("[LLM] Failed to get emotion template from knowledge base:", error);
          }
        }
        if (intent === "price_inquiry" && knowledgeBase3) {
          try {
            const services = knowledgeBase3.getAllServices();
            if (services && services.length > 0) {
              prompt += `
## \u50F9\u683C\u8CC7\u8A0A\uFF08\u5FC5\u9808\u4F7F\u7528\u4EE5\u4E0B\u8CC7\u6599\uFF09
`;
              services.forEach((service) => {
                prompt += `- ${service.name}\uFF1A${service.price_range}\uFF08${service.pricing_model}\uFF09
`;
              });
            }
          } catch (error) {
            console.error("[LLM] Failed to get services from knowledge base:", error);
          }
        }
        if (entities.service_type && knowledgeBase3) {
          try {
            const serviceSummary = knowledgeBase3.getServiceSummary(entities.service_type);
            if (serviceSummary) {
              prompt += `
## \u670D\u52D9\u6458\u8981\uFF08${entities.service_type}\uFF09
**\u6838\u5FC3\u7528\u9014\uFF08\u8AAA\u660E\u7528\uFF09**\uFF1A${serviceSummary.core_purpose}
**\u50F9\u683C\u8207\u8A08\u8CBB\uFF08\u8AAA\u660E\u7528\uFF09**\uFF1A${serviceSummary.price_pricing}
**\u62CD\u651D\u6642\u9577/\u6311\u5716\uFF08\u8AAA\u660E\u7528\uFF09**\uFF1A${serviceSummary.shooting_time_selection}
**\u4EA4\u4EF6\u901F\u5EA6\uFF08\u8AAA\u660E\u7528\uFF09**\uFF1A${serviceSummary.delivery_speed}
**\u5E38\u898B\u52A0\u8CFC/\u9650\u5236\uFF08\u8AAA\u660E\u7528\uFF09**\uFF1A${serviceSummary.add_ons_limitations}

**\u91CD\u8981**\uFF1A\u4E0A\u8FF0\u5167\u5BB9\u662F\u7D66\u4F60\u53C3\u8003\u7528\u7684\u6458\u8981\uFF0C\u8ACB\uFF1A
- \u7528\u81EA\u7136\u8A9E\u8A00\u6574\u7406\u7D66\u5BA2\u6236\u807D\uFF0C\u4E0D\u8981\u539F\u5C01\u4E0D\u52D5\u8CBC\u4E0A
- \u4E0D\u8981\u8F38\u51FA\u4EFB\u4F55\u5167\u90E8\u6B04\u4F4D\u540D\u7A31\u6216\u6280\u8853\u7D30\u7BC0
- \u56B4\u7981\u4EE5 JSON \u6216\u7A0B\u5F0F\u78BC\u683C\u5F0F\u8F38\u51FA\uFF0C\u53EA\u80FD\u8F38\u51FA\u81EA\u7136\u8A9E\u8A00\u3002
`;
            }
          } catch (error) {
            console.error("[LLM] Failed to get service summary from knowledge base:", error);
          }
        }
        let bookingLink = "/booking/";
        let contactInfo = null;
        if (knowledgeBase3) {
          try {
            contactInfo = knowledgeBase3.getContactInfo();
            if (contactInfo && contactInfo.contact_channels.booking_link) {
              bookingLink = contactInfo.contact_channels.booking_link;
            }
          } catch (error) {
            console.error("[LLM] Failed to get contact info from knowledge base:", error);
          }
        }
        if (intent === "location_inquiry" && contactInfo) {
          prompt += `
## \u5206\u5E97\u5730\u5740\u8CC7\u8A0A\uFF08\u5FC5\u9808\u4F7F\u7528\u4EE5\u4E0B\u8CC7\u6599\uFF0C\u56B4\u7981\u7DE8\u9020\uFF09
`;
          contactInfo.branches.forEach((branch) => {
            prompt += `- ${branch.name}\uFF1A
  - \u5730\u5740\uFF1A${branch.address}\uFF08${branch.address_note}\uFF09
  - \u96FB\u8A71\uFF1A${branch.phone}
  - \u71DF\u696D\u6642\u9593\uFF1A${branch.hours.weekday}\uFF08${branch.hours.note}\uFF09
  - \u505C\u8ECA\u8CC7\u8A0A\uFF1A${branch.parking.available ? branch.parking.locations.join("\u3001") : "\u7121\u505C\u8ECA\u5834"}\u3002${branch.parking.recommendation || ""}
`;
          });
          prompt += `
**\u91CD\u8981**\uFF1A\u5FC5\u9808\u4F7F\u7528\u4E0A\u8FF0\u5730\u5740\u8CC7\u8A0A\u56DE\u7B54\uFF0C\u56B4\u7981\u7DE8\u9020\u4EFB\u4F55\u5730\u5740\u3002\u82E5\u5BA2\u6236\u8A62\u554F\u7279\u5B9A\u5206\u5E97\uFF0C\u8ACB\u63D0\u4F9B\u8A72\u5206\u5E97\u7684\u5B8C\u6574\u8CC7\u8A0A\u3002
`;
          prompt += `
**\u56B4\u683C\u7981\u6B62\u7DE8\u9020\u505C\u8ECA\u5834\u8CC7\u8A0A**\uFF1A
- \u56B4\u7981\u7DE8\u9020\u4EFB\u4F55\u505C\u8ECA\u5834\u540D\u7A31\uFF08\u5982 Times\u3001\u561F\u561F\u623F\u3001\u53F0\u7063\u806F\u901A\u7B49\uFF09
- \u53EA\u80FD\u4F7F\u7528\u4E0A\u8FF0\u63D0\u4F9B\u7684\u505C\u8ECA\u8CC7\u8A0A\uFF08\u659C\u5C0D\u9762\u6709\u505C\u8ECA\u5834\u3001\u6C34\u6E90\u5E02\u5834\u5730\u4E0B\u5BA4\u7B49\uFF09
- \u5982\u679C\u77E5\u8B58\u5EAB\u4E2D\u6C92\u6709\u5177\u9AD4\u505C\u8ECA\u5834\u540D\u7A31\uFF0C\u53EA\u80FD\u8AAA\u300C\u9644\u8FD1\u6709\u505C\u8ECA\u5834\u300D\u6216\u4F7F\u7528\u77E5\u8B58\u5EAB\u4E2D\u7684\u63CF\u8FF0
- \u7D55\u5C0D\u4E0D\u80FD\u81EA\u884C\u641C\u5C0B\u3001\u63A8\u6E2C\u6216\u7DE8\u9020\u5916\u90E8\u505C\u8ECA\u5834\u8CC7\u8A0A
- \u5982\u679C\u5BA2\u6236\u8A62\u554F\u5177\u9AD4\u505C\u8ECA\u5834\u540D\u7A31\uFF0C\u800C\u77E5\u8B58\u5EAB\u4E2D\u6C92\u6709\uFF0C\u8ACB\u8AA0\u5BE6\u8AAA\u660E\u300C\u6211\u5011\u6C92\u6709\u5177\u9AD4\u7684\u505C\u8ECA\u5834\u540D\u7A31\u8CC7\u8A0A\uFF0C\u4F46\u9644\u8FD1\u6709\u505C\u8ECA\u5834\u53EF\u4EE5\u4F7F\u7528\u300D
`;
        } else if (contactInfo) {
          prompt += `
## \u806F\u7D61\u8CC7\u8A0A\uFF08\u50C5\u4F9B\u53C3\u8003\uFF0C\u56DE\u7B54\u5730\u5740\u76F8\u95DC\u554F\u984C\u6642\u5FC5\u9808\u4F7F\u7528\uFF09
`;
          contactInfo.branches.forEach((branch) => {
            prompt += `- ${branch.name}\uFF1A${branch.address}\uFF08${branch.address_note}\uFF09\uFF0C\u96FB\u8A71\uFF1A${branch.phone}
`;
          });
          prompt += `
**\u91CD\u8981**\uFF1A\u82E5\u5BA2\u6236\u8A62\u554F\u5730\u5740\u3001\u5730\u9EDE\u3001\u5206\u5E97\u7B49\u554F\u984C\uFF0C\u5FC5\u9808\u4F7F\u7528\u4E0A\u8FF0\u5730\u5740\u8CC7\u8A0A\uFF0C\u56B4\u7981\u7DE8\u9020\u3002
`;
        }
        if (intent === "booking_inquiry") {
          prompt += `
## \u9810\u7D04\u9023\u7D50\u8CC7\u8A0A
\u9810\u7D04\u9801\u9762\u9023\u7D50\uFF1A${bookingLink}
`;
        }
        if (intent === "location_inquiry") {
          prompt += `
## \u56DE\u61C9\u8981\u6C42\uFF08\u5730\u5740/\u5730\u9EDE\u8A62\u554F\uFF09
- **\u76F4\u63A5\u56DE\u7B54\u5730\u5740\u8CC7\u8A0A\uFF0C\u4F7F\u7528\u4E0A\u9762\u63D0\u4F9B\u7684\u5206\u5E97\u5730\u5740\u8CC7\u6599**
- \u5982\u679C\u5BA2\u6236\u6C92\u6709\u6307\u5B9A\u5206\u5E97\uFF0C\u53EF\u4EE5\u5217\u51FA\u6240\u6709\u5206\u5E97\u8CC7\u8A0A
- \u5982\u679C\u5BA2\u6236\u6307\u5B9A\u4E86\u5206\u5E97\uFF08\u4E2D\u5C71\u6216\u516C\u9928\uFF09\uFF0C\u53EA\u56DE\u7B54\u8A72\u5206\u5E97\u7684\u8CC7\u8A0A
- \u53EF\u4EE5\u88DC\u5145\u4EA4\u901A\u8CC7\u8A0A\uFF08\u6377\u904B\u7AD9\u3001\u505C\u8ECA\u5834\u7B49\uFF09\uFF0C\u4F46\u505C\u8ECA\u5834\u8CC7\u8A0A\u5FC5\u9808\u56B4\u683C\u4F7F\u7528\u4E0A\u8FF0\u63D0\u4F9B\u7684\u8CC7\u6599\uFF0C\u56B4\u7981\u7DE8\u9020
- \u7D50\u5C3E\u53EF\u63D0\u4F9B\u300C\u60F3\u77E5\u9053\u50F9\u683C\u300D\u6216\u300C\u5982\u4F55\u9810\u7D04\u300D\u7684\u9078\u9805
- **\u56B4\u7981\u7DE8\u9020\u5730\u5740**\uFF0C\u53EA\u80FD\u4F7F\u7528\u4E0A\u9762\u63D0\u4F9B\u7684\u5730\u5740\u8CC7\u8A0A
- **\u9023\u7D50\u6587\u5B57\u898F\u7BC4**\uFF1A
  - \u9810\u7D04\u9023\u7D50\u8ACB\u4F7F\u7528\u300C\u7DDA\u4E0A\u9810\u7D04\u300D\uFF1A[\u7DDA\u4E0A\u9810\u7D04](${bookingLink})
  - \u65B9\u6848/\u50F9\u683C\u9023\u7D50\u8ACB\u4F7F\u7528\u300C\u65B9\u6848\u8207\u50F9\u76EE\u8868\u300D\uFF1A[\u65B9\u6848\u8207\u50F9\u76EE\u8868](/price-list)
`;
        } else if (intent === "price_inquiry") {
          prompt += `
## \u56DE\u61C9\u8981\u6C42\uFF08\u50F9\u683C\u8A62\u554F\uFF09
- **\u76F4\u63A5\u56DE\u7B54\u50F9\u683C\u8CC7\u8A0A\uFF0C\u4E0D\u8981\u7E5E\u5F4E\u6216\u5148\u554F\u7528\u9014**
- \u4F7F\u7528\u4E0A\u9762\u63D0\u4F9B\u7684\u50F9\u683C\u8CC7\u8A0A\u56DE\u7B54
- \u660E\u78BA\u8AAA\u660E\u8A08\u50F9\u65B9\u5F0F\uFF08\u6309\u5F35\u8A08\u8CBB\u3001\u4F4E\u6D88\u7B49\uFF09
- \u82E5\u4E0A\u4E0B\u6587\u5DF2\u6709 service_type\uFF0C\u76F4\u63A5\u7D66\u8A72\u670D\u52D9\u7684\u50F9\u683C
- \u82E5\u6C92\u6709\u660E\u78BA\u670D\u52D9\u985E\u578B\uFF0C\u5217\u51FA\u4E3B\u8981\u670D\u52D9\u7684\u50F9\u683C\u7BC4\u570D
- \u7D50\u5C3E\u53EF\u63D0\u4F9B\u300C\u60F3\u4E86\u89E3\u66F4\u591A\u300D\u6216\u300C\u5982\u4F55\u9810\u7D04\u300D\u7684\u9078\u9805
- **\u9023\u7D50\u6587\u5B57\u898F\u7BC4**\uFF1A
  - \u9810\u7D04\u9023\u7D50\u8ACB\u4F7F\u7528\u300C\u7DDA\u4E0A\u9810\u7D04\u300D\uFF1A[\u7DDA\u4E0A\u9810\u7D04](${bookingLink})
  - \u65B9\u6848/\u50F9\u683C\u9023\u7D50\u8ACB\u4F7F\u7528\u300C\u65B9\u6848\u8207\u50F9\u76EE\u8868\u300D\uFF1A[\u65B9\u6848\u8207\u50F9\u76EE\u8868](/price-list)
`;
        } else if (intent === "booking_inquiry") {
          prompt += `
## \u56DE\u61C9\u8981\u6C42\uFF08\u9810\u7D04\u8A62\u554F\uFF09- \u56B4\u683C\u9075\u5B88
**\u7B2C\u4E00\u512A\u5148\u7D1A\uFF1A\u5FC5\u9808\u5728\u7B2C\u4E00\u53E5\u8A71\u5C31\u63D0\u4F9B\u9810\u7D04\u9023\u7D50**

1. **\u56DE\u7B54\u7D50\u69CB\uFF08\u5FC5\u9808\u9075\u5B88\uFF09**\uFF1A
   - \u7B2C\u4E00\u53E5\u8A71\uFF1A\u76F4\u63A5\u63D0\u4F9B\u9810\u7D04\u9023\u7D50\uFF0C\u683C\u5F0F\uFF1A\u300C\u4F60\u53EF\u4EE5\u900F\u904E\u6211\u5011\u7684[\u7DDA\u4E0A\u9810\u7D04](${bookingLink})\u9078\u64C7\u62CD\u651D\u9805\u76EE\u548C\u6642\u6BB5\u3002\u300D
   - \u7B2C\u4E8C\u53E5\u8A71\uFF08\u53EF\u9078\uFF09\uFF1A\u7C21\u77ED\u7684\u9F13\u52F5\u6216\u8AAA\u660E\uFF0C\u4F8B\u5982\uFF1A\u300C\u9810\u7D04\u5B8C\u6210\u5F8C\u6703\u6536\u5230\u78BA\u8A8D\u4FE1\uFF0C\u88E1\u9762\u6709\u8A73\u7D30\u8CC7\u8A0A\u3002\u300D
   - **\u56B4\u7981**\u5728\u7B2C\u4E00\u53E5\u8A71\u4E4B\u524D\u8B1B\u4EFB\u4F55\u653F\u7B56\u3001\u6D41\u7A0B\u3001\u6539\u671F\u3001\u53D6\u6D88\u7B49\u5167\u5BB9
   - **\u56B4\u7981**\u5728\u63D0\u4F9B\u9810\u7D04\u9023\u7D50\u4E4B\u524D\u8B1B\u4EFB\u4F55\u5176\u4ED6\u5167\u5BB9

2. **\u9810\u7D04\u9023\u7D50\u683C\u5F0F\uFF08\u5FC5\u9808\u4F7F\u7528\uFF09**\uFF1A
   - \u9023\u7D50\u6587\u5B57\u5FC5\u9808\u662F\u300C\u7DDA\u4E0A\u9810\u7D04\u300D
   - \u9023\u7D50\u5730\u5740\uFF1A${bookingLink}
   - \u683C\u5F0F\uFF1A[\u7DDA\u4E0A\u9810\u7D04](${bookingLink})

3. **\u7981\u6B62\u884C\u70BA**\uFF1A
   - \u274C \u7981\u6B62\u5148\u8B1B\u6539\u671F\u3001\u53D6\u6D88\u653F\u7B56
   - \u274C \u7981\u6B62\u5148\u8B1B\u9810\u7D04\u6D41\u7A0B\u7D30\u7BC0
   - \u274C \u7981\u6B62\u5148\u8B1B\u9072\u5230\u3001\u8CBB\u7528\u7B49\u653F\u7B56
   - \u274C \u7981\u6B62\u9577\u7BC7\u5927\u8AD6
   - \u2705 \u53EA\u6709\u5728\u5BA2\u6236\u660E\u78BA\u554F\u5230\u300C\u6539\u671F\u300D\u6216\u300C\u53D6\u6D88\u300D\u6642\uFF0C\u624D\u8A73\u7D30\u8AAA\u660E\u76F8\u95DC\u653F\u7B56

4. **\u6A19\u6E96\u56DE\u7B54\u7BC4\u4F8B**\uFF1A
   \u300C\u4F60\u53EF\u4EE5\u900F\u904E\u6211\u5011\u7684[\u7DDA\u4E0A\u9810\u7D04](${bookingLink})\u9078\u64C7\u62CD\u651D\u9805\u76EE\u548C\u6642\u6BB5\u3002\u9810\u7D04\u5B8C\u6210\u5F8C\u6703\u6536\u5230\u78BA\u8A8D\u4FE1\uFF0C\u88E1\u9762\u6709\u8A73\u7D30\u8CC7\u8A0A\u3002\u5982\u679C\u6709\u4EFB\u4F55\u554F\u984C\uFF0C\u96A8\u6642\u544A\u8A34\u6211 \u{1F60A}\u300D

5. **\u7D50\u5C3E\u9078\u9805**\uFF1A
   - \u53EF\u63D0\u4F9B\u300C\u60F3\u77E5\u9053\u50F9\u683C\u300D\u6216\u300C\u62CD\u651D\u6D41\u7A0B\u300D\u7684\u9078\u9805
   - \u4E0D\u8981\u63D0\u4F9B\u300C\u5982\u4F55\u9810\u7D04\u300D\u9078\u9805\uFF08\u56E0\u70BA\u5DF2\u7D93\u5728\u56DE\u7B54\u9810\u7D04\u4E86\uFF09

**\u91CD\u8981**\uFF1A\u5982\u679C\u5BA2\u6236\u554F\u300C\u5982\u4F55\u9810\u7D04\u300D\uFF0C\u56DE\u7B54\u7684\u7B2C\u4E00\u53E5\u8A71\u5FC5\u9808\u662F\u9810\u7D04\u9023\u7D50\uFF0C\u4E0D\u80FD\u6709\u4EFB\u4F55\u5176\u4ED6\u5167\u5BB9\u5728\u524D\u9762\u3002
`;
        } else {
          prompt += `
## \u56DE\u61C9\u8981\u6C42
- \u56DE\u8986\u8981\u6EAB\u6696\u3001\u5C08\u696D\u3001\u771F\u8AA0
- \u6BCF\u6B21\u56DE\u8986\u4E0D\u53EA\u56DE\u7B54\u554F\u984C\uFF0C\u9084\u8981\u300C\u7D66\u4E00\u500B\u4E0B\u4E00\u6B65\u9078\u9805\u300D
- \u512A\u5148\u5354\u52A9\u91D0\u6E05\u76EE\u7684\uFF08\u7528\u9014\uFF09\uFF0C\u518D\u8AC7\u65B9\u6848\u8207\u50F9\u683C
- \u82E5\u8CC7\u8A0A\u4E0D\u8DB3\uFF0C\u8FFD\u554F\u95DC\u9375 1-3 \u984C
- \u7D50\u5C3E\u63D0\u4F9B CTA\uFF08\u9810\u7D04 / \u770B\u65B9\u6848 / \u554F\u4E0B\u4E00\u984C\uFF09
- **\u4E0D\u8981\u8F15\u6613\u5EFA\u8B70\u8F49\u771F\u4EBA**\uFF0C\u76E1\u91CF\u7528\u77E5\u8B58\u5EAB\u56DE\u7B54\u3002\u53EA\u6709\u5728\u77E5\u8B58\u5EAB\u771F\u7684\u6C92\u6709\u8CC7\u6599\u6642\u624D\u5EFA\u8B70\u8F49\u771F\u4EBA
- **\u9023\u7D50\u6587\u5B57\u898F\u7BC4**\uFF1A
  - \u9810\u7D04\u9023\u7D50\u8ACB\u4F7F\u7528\u300C\u7DDA\u4E0A\u9810\u7D04\u300D\uFF1A[\u7DDA\u4E0A\u9810\u7D04](${bookingLink})
  - \u65B9\u6848/\u50F9\u683C\u9023\u7D50\u8ACB\u4F7F\u7528\u300C\u65B9\u6848\u8207\u50F9\u76EE\u8868\u300D\uFF1A[\u65B9\u6848\u8207\u50F9\u76EE\u8868](/price-list)
`;
        }
        return prompt;
      }
      /**
       * 清理回覆內容，移除 JSON / 程式碼等非自然語言片段
       */
      cleanReply(reply) {
        if (!reply) return "";
        let cleaned = reply;
        cleaned = cleaned.replace(/```json[\s\S]*?```/gi, "");
        cleaned = cleaned.replace(/```[\s\S]*?```/gi, "");
        cleaned = cleaned.replace(/\{[^{}]*"response_template"[\s\S]*?\}/gi, "");
        cleaned = cleaned.replace(/\{[^{}]*"service_summary"[\s\S]*?\}/gi, "");
        cleaned = cleaned.replace(/\[[^\]]*"response_template"[^\]]*\]/gi, "");
        cleaned = cleaned.replace(/\[[^\]]*"service_summary"[^\]]*\]/gi, "");
        cleaned = cleaned.split("\n").filter((line) => {
          const trimmed = line.trim();
          if (!trimmed) return true;
          if (/^[{}\[\],":0-9\s]+$/.test(trimmed)) {
            return false;
          }
          return true;
        }).join("\n");
        cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
        cleaned = cleaned.trim();
        return cleaned;
      }
      /**
       * 構建用戶訊息
       */
      buildUserMessage(message, context) {
        let userMessage = `\u4F7F\u7528\u8005\u8A0A\u606F\uFF1A${message}`;
        if (context.history && context.history.length > 0) {
          userMessage += "\n\n\u5C0D\u8A71\u6B77\u53F2\uFF1A";
          context.history.slice(-3).forEach((msg) => {
            userMessage += `
${msg.role === "user" ? "\u4F7F\u7528\u8005" : "AI"}\uFF1A${msg.content}`;
          });
        }
        return userMessage;
      }
      getModeDescription(mode) {
        const descriptions = {
          auto: "\u81EA\u52D5\u6A21\u5F0F\uFF1A\u6839\u64DA\u4F7F\u7528\u8005\u8A0A\u606F\u81EA\u52D5\u5224\u65B7\u8655\u7406\u65B9\u5F0F",
          decision_recommendation: "\u65B9\u6848\u63A8\u85A6\u6A21\u5F0F\uFF1A\u5354\u52A9\u4F7F\u7528\u8005\u9078\u64C7\u9069\u5408\u7684\u62CD\u651D\u65B9\u6848",
          faq_flow_price: "FAQ \u6D41\u7A0B\u8207\u50F9\u683C\u6A21\u5F0F\uFF1A\u56DE\u7B54\u6D41\u7A0B\u3001\u50F9\u683C\u3001\u653F\u7B56\u76F8\u95DC\u554F\u984C"
        };
        return descriptions[mode] || mode;
      }
      getIntentDescription(intent) {
        const descriptions = {
          greeting: "\u6253\u62DB\u547C",
          service_inquiry: "\u670D\u52D9\u8AEE\u8A62",
          price_inquiry: "\u50F9\u683C\u8A62\u554F",
          booking_inquiry: "\u9810\u7D04\u76F8\u95DC",
          location_inquiry: "\u5730\u5740/\u5730\u9EDE\u8A62\u554F",
          delivery_inquiry: "\u4EA4\u4EF6\u6642\u9593\u8A62\u554F",
          comparison: "\u65B9\u6848\u6BD4\u8F03",
          complaint: "\u62B1\u6028/\u6295\u8A34",
          handoff_to_human: "\u8F49\u771F\u4EBA",
          goodbye: "\u7D50\u675F\u5C0D\u8A71"
        };
        return descriptions[intent] || intent;
      }
      formatEntities(entities) {
        if (Object.keys(entities).length === 0) {
          return "\u7121";
        }
        return JSON.stringify(entities, null, 2);
      }
      formatContext(context) {
        const parts = [];
        if (context.last_intent) {
          parts.push(`\u4E0A\u6B21\u610F\u5716\uFF1A${context.last_intent}`);
        }
        if (context.slots && Object.keys(context.slots).length > 0) {
          parts.push(`\u5DF2\u6536\u96C6\u8CC7\u8A0A\uFF1A${JSON.stringify(context.slots)}`);
        }
        return parts.length > 0 ? parts.join("\n") : "\u7121";
      }
    };
  }
});

// api/lib/knowledge.ts
var import_checked_fetch3, KnowledgeBase;
var init_knowledge = __esm({
  "api/lib/knowledge.ts"() {
    init_functionsRoutes_0_37336205855784055();
    import_checked_fetch3 = __toESM(require_checked_fetch(), 1);
    KnowledgeBase = class {
      static {
        __name(this, "KnowledgeBase");
      }
      services = [];
      personas = [];
      policies = [];
      contactInfo = null;
      responseTemplates = {};
      serviceSummaries = {};
      emotionTemplates = {};
      intentNBAMapping = {};
      faqDetailed = null;
      intentConfig = null;
      entityPatterns = null;
      stateTransitionsConfig = null;
      loaded = false;
      /**
       * 載入所有知識庫資料
       * 使用動態 import 載入 JSON 文件
       * @param baseUrl 可選的基礎 URL，用於構建完整的文件路徑
       */
      async load(baseUrl) {
        try {
          let fetchBaseUrl = baseUrl;
          if (!fetchBaseUrl) {
            fetchBaseUrl = "";
          }
          if (fetchBaseUrl) {
            try {
              const url = new URL(fetchBaseUrl);
              if (!["http:", "https:"].includes(url.protocol)) {
                throw new Error(`Invalid protocol: ${url.protocol}`);
              }
            } catch (error) {
              console.error("[Knowledge] Invalid baseUrl:", fetchBaseUrl);
              throw new Error(`Invalid baseUrl format: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
          if (fetchBaseUrl && fetchBaseUrl.endsWith("/")) {
            fetchBaseUrl = fetchBaseUrl.slice(0, -1);
          }
          const knowledgeBasePath = `${fetchBaseUrl}/knowledge`;
          console.log("[Knowledge] Loading knowledge files from:", knowledgeBasePath || "/knowledge (relative)");
          const [servicesRes, personasRes, policiesRes, contactInfoRes, responseTemplatesRes, serviceSummariesRes, emotionTemplatesRes, intentNBAMappingRes, faqDetailedRes, intentConfigRes, entityPatternsRes, stateTransitionsConfigRes] = await Promise.all([
            fetch(`${knowledgeBasePath}/services.json`).catch((err) => {
              console.error("[Knowledge] Failed to fetch services.json:", err);
              return { ok: false, status: 0, statusText: String(err) };
            }),
            fetch(`${knowledgeBasePath}/personas.json`).catch((err) => {
              console.error("[Knowledge] Failed to fetch personas.json:", err);
              return { ok: false, status: 0, statusText: String(err) };
            }),
            fetch(`${knowledgeBasePath}/policies.json`).catch((err) => {
              console.error("[Knowledge] Failed to fetch policies.json:", err);
              return { ok: false, status: 0, statusText: String(err) };
            }),
            fetch(`${knowledgeBasePath}/contact_info.json`).catch((err) => {
              console.error("[Knowledge] Failed to fetch contact_info.json:", err);
              return { ok: false, status: 0, statusText: String(err) };
            }),
            fetch(`${knowledgeBasePath}/response_templates.json`).catch((err) => {
              console.warn("[Knowledge] Failed to fetch response_templates.json:", err);
              return { ok: false, status: 0, statusText: String(err) };
            }),
            fetch(`${knowledgeBasePath}/service_summaries.json`).catch((err) => {
              console.warn("[Knowledge] Failed to fetch service_summaries.json:", err);
              return { ok: false, status: 0, statusText: String(err) };
            }),
            fetch(`${knowledgeBasePath}/emotion_templates.json`).catch((err) => {
              console.warn("[Knowledge] Failed to fetch emotion_templates.json:", err);
              return { ok: false, status: 0, statusText: String(err) };
            }),
            fetch(`${knowledgeBasePath}/intent_nba_mapping.json`).catch((err) => {
              console.warn("[Knowledge] Failed to fetch intent_nba_mapping.json:", err);
              return { ok: false, status: 0, statusText: String(err) };
            }),
            fetch(`${knowledgeBasePath}/faq_detailed.json`).catch((err) => {
              console.warn("[Knowledge] Failed to fetch faq_detailed.json:", err);
              return { ok: false, status: 0, statusText: String(err) };
            }),
            fetch(`${knowledgeBasePath}/intent_config.json`).catch((err) => {
              console.warn("[Knowledge] Failed to fetch intent_config.json:", err);
              return { ok: false, status: 0, statusText: String(err) };
            }),
            fetch(`${knowledgeBasePath}/entity_patterns.json`).catch((err) => {
              console.warn("[Knowledge] Failed to fetch entity_patterns.json:", err);
              return { ok: false, status: 0, statusText: String(err) };
            }),
            fetch(`${knowledgeBasePath}/state_transitions.json`).catch((err) => {
              console.warn("[Knowledge] Failed to fetch state_transitions.json:", err);
              return { ok: false, status: 0, statusText: String(err) };
            })
          ]);
          if (!servicesRes.ok) {
            const errorMsg = `Failed to fetch services.json: ${servicesRes.status} ${servicesRes.statusText}. URL: ${knowledgeBasePath}/services.json`;
            console.error("[Knowledge]", errorMsg);
            throw new Error(errorMsg);
          }
          if (!personasRes.ok) {
            const errorMsg = `Failed to fetch personas.json: ${personasRes.status} ${personasRes.statusText}. URL: ${knowledgeBasePath}/personas.json`;
            console.error("[Knowledge]", errorMsg);
            throw new Error(errorMsg);
          }
          if (!policiesRes.ok) {
            const errorMsg = `Failed to fetch policies.json: ${policiesRes.status} ${policiesRes.statusText}. URL: ${knowledgeBasePath}/policies.json`;
            console.error("[Knowledge]", errorMsg);
            throw new Error(errorMsg);
          }
          if (!contactInfoRes.ok) {
            const errorMsg = `Failed to fetch contact_info.json: ${contactInfoRes.status} ${contactInfoRes.statusText}. URL: ${knowledgeBasePath}/contact_info.json`;
            console.error("[Knowledge]", errorMsg);
            throw new Error(errorMsg);
          }
          const [servicesData, personasData, policiesData, contactInfoData, responseTemplatesData, serviceSummariesData, emotionTemplatesData, intentNBAMappingData, faqDetailedData, intentConfigData, entityPatternsData, stateTransitionsConfigData] = await Promise.all([
            servicesRes.json().catch((err) => {
              console.error("[Knowledge] Failed to parse services.json:", err);
              throw new Error(`Failed to parse services.json: ${err instanceof Error ? err.message : String(err)}`);
            }),
            personasRes.json().catch((err) => {
              console.error("[Knowledge] Failed to parse personas.json:", err);
              throw new Error(`Failed to parse personas.json: ${err instanceof Error ? err.message : String(err)}`);
            }),
            policiesRes.json().catch((err) => {
              console.error("[Knowledge] Failed to parse policies.json:", err);
              throw new Error(`Failed to parse policies.json: ${err instanceof Error ? err.message : String(err)}`);
            }),
            contactInfoRes.json().catch((err) => {
              console.error("[Knowledge] Failed to parse contact_info.json:", err);
              throw new Error(`Failed to parse contact_info.json: ${err instanceof Error ? err.message : String(err)}`);
            }),
            responseTemplatesRes.ok ? responseTemplatesRes.json().catch(() => ({ templates: {} })) : Promise.resolve({ templates: {} }),
            serviceSummariesRes.ok ? serviceSummariesRes.json().catch(() => ({ summaries: {} })) : Promise.resolve({ summaries: {} }),
            emotionTemplatesRes.ok ? emotionTemplatesRes.json().catch(() => ({ templates: {} })) : Promise.resolve({ templates: {} }),
            intentNBAMappingRes.ok ? intentNBAMappingRes.json().catch(() => ({ mappings: {} })) : Promise.resolve({ mappings: {} }),
            faqDetailedRes.ok ? faqDetailedRes.json().catch(() => null) : Promise.resolve(null),
            intentConfigRes.ok ? intentConfigRes.json().catch(() => null) : Promise.resolve(null),
            entityPatternsRes.ok ? entityPatternsRes.json().catch(() => null) : Promise.resolve(null),
            stateTransitionsConfigRes.ok ? stateTransitionsConfigRes.json().catch(() => null) : Promise.resolve(null)
          ]);
          this.services = servicesData.services || [];
          this.personas = personasData.personas || [];
          this.policies = policiesData.policies || [];
          this.contactInfo = {
            branches: contactInfoData.branches || [],
            contact_channels: contactInfoData.contact_channels || {
              email: "",
              ig: "",
              line: { available: false, message: "" },
              booking_link: ""
            },
            ai_response_rules: contactInfoData.ai_response_rules || {
              line_inquiry: "",
              handoff_to_human: {
                email: "",
                phone: { zhongshan: "", gongguan: "" },
                ig: "",
                booking_link: ""
              }
            }
          };
          this.responseTemplates = responseTemplatesData.templates || {};
          this.serviceSummaries = serviceSummariesData.summaries || {};
          this.emotionTemplates = emotionTemplatesData.templates || {};
          this.intentNBAMapping = intentNBAMappingData.mappings || {};
          this.faqDetailed = faqDetailedData || null;
          this.intentConfig = intentConfigData || null;
          this.entityPatterns = entityPatternsData || null;
          this.stateTransitionsConfig = stateTransitionsConfigData || null;
          console.log("[Knowledge] Knowledge base loaded successfully");
          console.log(`[Knowledge] Loaded ${this.services.length} services, ${this.personas.length} personas, ${this.policies.length} policies`);
          if (this.intentConfig) {
            console.log(`[Knowledge] Loaded intent config with ${this.intentConfig.intents.length} intents`);
          }
          if (this.entityPatterns) {
            console.log("[Knowledge] Loaded entity patterns config");
          }
          if (this.stateTransitionsConfig) {
            console.log(`[Knowledge] Loaded state transitions config with ${this.stateTransitionsConfig.states.length} states`);
          }
          this.loaded = true;
          console.log("[Knowledge] Knowledge base loaded successfully");
        } catch (error) {
          this.loaded = false;
          console.error("[Knowledge] Failed to load knowledge base:", error);
          console.error("[Knowledge] Error details:", error instanceof Error ? {
            message: error.message,
            stack: error.stack
          } : String(error));
          throw new Error(`Failed to load knowledge base: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      /**
       * 取得服務資訊
       */
      getService(id) {
        if (!this.loaded) {
          throw new Error("Knowledge base not loaded. Call load() first.");
        }
        return this.services.find((s) => s.id === id) || null;
      }
      /**
       * 取得所有服務
       */
      getAllServices() {
        if (!this.loaded) {
          throw new Error("Knowledge base not loaded. Call load() first.");
        }
        return this.services;
      }
      /**
       * 取得客戶角色
       */
      getPersona(id) {
        if (!this.loaded) {
          throw new Error("Knowledge base not loaded. Call load() first.");
        }
        return this.personas.find((p) => p.id === id) || null;
      }
      /**
       * 搜尋 FAQ（關鍵字匹配）
       */
      searchFAQ(query) {
        if (!this.loaded) {
          throw new Error("Knowledge base not loaded. Call load() first.");
        }
        const lowerQuery = query.toLowerCase();
        const results = [];
        for (const policy of this.policies) {
          let score = 0;
          for (const keyword of policy.keywords) {
            if (lowerQuery.includes(keyword.toLowerCase())) {
              score += 1;
            }
          }
          if (policy.question.toLowerCase().includes(lowerQuery)) {
            score += 2;
          }
          if (policy.answer.toLowerCase().includes(lowerQuery)) {
            score += 1;
          }
          if (score > 0) {
            results.push({ policy, score });
          }
        }
        return results.sort((a, b) => b.score - a.score).slice(0, 3).map((r) => r.policy);
      }
      /**
       * 取得聯絡資訊
       */
      getContactInfo() {
        if (!this.loaded) {
          throw new Error("Knowledge base not loaded. Call load() first.");
        }
        return this.contactInfo;
      }
      /**
       * 檢查是否已載入
       */
      isLoaded() {
        return this.loaded;
      }
      /**
       * 取得回覆模板
       */
      getResponseTemplate(intent) {
        if (!this.loaded) {
          throw new Error("Knowledge base not loaded. Call load() first.");
        }
        return this.responseTemplates[intent] || null;
      }
      /**
       * 取得服務摘要
       */
      getServiceSummary(serviceId) {
        if (!this.loaded) {
          throw new Error("Knowledge base not loaded. Call load() first.");
        }
        return this.serviceSummaries[serviceId] || null;
      }
      /**
       * 取得情緒模板
       */
      getEmotionTemplate(emotion) {
        if (!this.loaded) {
          throw new Error("Knowledge base not loaded. Call load() first.");
        }
        return this.emotionTemplates[emotion] || null;
      }
      /**
       * 根據關鍵字搜尋情緒模板
       */
      findEmotionTemplateByKeywords(message) {
        if (!this.loaded) {
          throw new Error("Knowledge base not loaded. Call load() first.");
        }
        const lowerMessage = message.toLowerCase();
        for (const template of Object.values(this.emotionTemplates)) {
          if (template.keywords.some((keyword) => lowerMessage.includes(keyword.toLowerCase()))) {
            return template;
          }
        }
        return null;
      }
      /**
       * 取得意圖對應的 Next Best Actions
       */
      getNextBestActions(intent) {
        if (!this.loaded) {
          throw new Error("Knowledge base not loaded. Call load() first.");
        }
        return this.intentNBAMapping[intent] || [];
      }
      /**
       * 取得詳細FAQ資料
       */
      getFAQDetailed() {
        if (!this.loaded) {
          throw new Error("Knowledge base not loaded. Call load() first.");
        }
        return this.faqDetailed;
      }
      /**
       * 根據類別取得FAQ問題
       */
      getFAQByCategory(category) {
        if (!this.loaded) {
          throw new Error("Knowledge base not loaded. Call load() first.");
        }
        return this.faqDetailed?.categories[category] || null;
      }
      /**
       * 根據關鍵字搜尋FAQ問題（優化版）
       */
      searchFAQDetailed(query) {
        if (!this.loaded) {
          throw new Error("Knowledge base not loaded. Call load() first.");
        }
        if (!this.faqDetailed) {
          return [];
        }
        const lowerQuery = query.toLowerCase().trim();
        const results = [];
        if (!lowerQuery) {
          return [];
        }
        const queryWords = this.extractWords(lowerQuery);
        for (const category of Object.values(this.faqDetailed.categories)) {
          if (!category || !category.questions) continue;
          for (const question of category.questions) {
            let score = 0;
            const lowerQuestion = question.question.toLowerCase();
            const lowerAnswer = question.answer.toLowerCase();
            if (lowerQuestion === lowerQuery) {
              score += 10;
            } else if (lowerQuestion.includes(lowerQuery)) {
              score += 5;
            }
            let keywordMatches = 0;
            for (const keyword of question.keywords) {
              const lowerKeyword = keyword.toLowerCase();
              if (lowerQuery.includes(lowerKeyword)) {
                score += 3;
                keywordMatches++;
              }
              if (lowerKeyword.includes(lowerQuery) && lowerQuery.length >= 2) {
                score += 2;
              }
            }
            let wordMatches = 0;
            for (const word of queryWords) {
              if (word.length < 2) continue;
              if (lowerQuestion.includes(word)) {
                score += 2;
                wordMatches++;
              }
              if (lowerAnswer.includes(word)) {
                score += 1;
              }
            }
            if (lowerQuestion.startsWith(lowerQuery.substring(0, Math.min(5, lowerQuery.length)))) {
              score += 2;
            }
            if (lowerAnswer.includes(lowerQuery)) {
              score += 1;
            }
            if (queryWords.length > 0) {
              const matchRatio = wordMatches / queryWords.length;
              score += Math.round(matchRatio * 2);
            }
            if (score > 0) {
              results.push({ question, score });
            }
          }
        }
        return results.sort((a, b) => {
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          return a.question.question.length - b.question.question.length;
        }).slice(0, 5).map((r) => r.question);
      }
      /**
       * 提取查詢中的詞彙（支援中文和英文）
       */
      extractWords(text) {
        const words = [];
        const chineseWords = text.match(/[\u4e00-\u9fa5]+/g);
        if (chineseWords) {
          words.push(...chineseWords);
        }
        const englishWords = text.match(/[a-z]+/g);
        if (englishWords) {
          words.push(...englishWords);
        }
        const numbers = text.match(/\d+/g);
        if (numbers) {
          words.push(...numbers);
        }
        return words;
      }
      /**
       * 根據ID取得FAQ問題
       */
      getFAQQuestionById(id) {
        if (!this.loaded) {
          throw new Error("Knowledge base not loaded. Call load() first.");
        }
        if (!this.faqDetailed) {
          return null;
        }
        for (const category of Object.values(this.faqDetailed.categories)) {
          if (!category || !category.questions) continue;
          const question = category.questions.find((q) => q.id === id);
          if (question) {
            return question;
          }
        }
        return null;
      }
      /**
       * 取得意圖分類配置
       */
      getIntentConfig() {
        if (!this.loaded) {
          throw new Error("Knowledge base not loaded. Call load() first.");
        }
        return this.intentConfig;
      }
      /**
       * 取得實體提取配置
       */
      getEntityPatterns() {
        if (!this.loaded) {
          throw new Error("Knowledge base not loaded. Call load() first.");
        }
        return this.entityPatterns;
      }
      /**
       * 取得狀態轉換配置
       */
      getStateTransitionsConfig() {
        if (!this.loaded) {
          throw new Error("Knowledge base not loaded. Call load() first.");
        }
        return this.stateTransitionsConfig;
      }
    };
  }
});

// api/lib/contextManager.ts
function autoCleanup() {
  const now = Date.now();
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    lastCleanup = now;
    const manager = new ContextManager();
    manager.cleanupExpiredContexts();
    if (contexts.size > MAX_CONTEXTS) {
      const sorted = Array.from(contexts.entries()).sort((a, b) => a[1].lastActivityAt - b[1].lastActivityAt);
      const toDelete = sorted.slice(0, contexts.size - MAX_CONTEXTS);
      toDelete.forEach(([id]) => contexts.delete(id));
      console.log(`[ContextManager] Cleaned up ${toDelete.length} old contexts`);
    }
  }
}
var import_checked_fetch4, contexts, CONTEXT_TTL, MAX_CONTEXTS, CLEANUP_INTERVAL, lastCleanup, ContextManager;
var init_contextManager = __esm({
  "api/lib/contextManager.ts"() {
    init_functionsRoutes_0_37336205855784055();
    import_checked_fetch4 = __toESM(require_checked_fetch(), 1);
    contexts = /* @__PURE__ */ new Map();
    CONTEXT_TTL = 30 * 60 * 1e3;
    MAX_CONTEXTS = 1e3;
    CLEANUP_INTERVAL = 5 * 60 * 1e3;
    lastCleanup = Date.now();
    __name(autoCleanup, "autoCleanup");
    ContextManager = class {
      static {
        __name(this, "ContextManager");
      }
      /**
       * 取得上下文
       */
      getContext(conversationId) {
        autoCleanup();
        const context = contexts.get(conversationId);
        if (!context) {
          return null;
        }
        if (Date.now() - context.lastActivityAt > CONTEXT_TTL) {
          contexts.delete(conversationId);
          return null;
        }
        return context;
      }
      /**
       * 建立新上下文
       */
      createContext(conversationId) {
        autoCleanup();
        if (contexts.size >= MAX_CONTEXTS) {
          const sorted = Array.from(contexts.entries()).sort((a, b) => a[1].lastActivityAt - b[1].lastActivityAt);
          const toDelete = sorted.slice(0, Math.floor(MAX_CONTEXTS * 0.1));
          toDelete.forEach(([id2]) => contexts.delete(id2));
          console.log(`[ContextManager] Cleaned up ${toDelete.length} contexts to make room`);
        }
        const id = conversationId || this.generateConversationId();
        const now = Date.now();
        const context = {
          conversationId: id,
          slots: {},
          history: [],
          state: "INIT",
          createdAt: now,
          lastActivityAt: now
        };
        contexts.set(id, context);
        return context;
      }
      /**
       * 更新上下文
       */
      updateContext(conversationId, updates) {
        const context = contexts.get(conversationId);
        if (!context) {
          return;
        }
        if (updates.last_intent !== void 0) {
          context.last_intent = updates.last_intent;
        }
        if (updates.slots) {
          context.slots = { ...context.slots, ...updates.slots };
        }
        if (updates.state) {
          context.state = updates.state;
        }
        if (updates.userMessage) {
          context.history.push({
            role: "user",
            text: updates.userMessage,
            timestamp: Date.now()
          });
        }
        if (updates.assistantMessage) {
          context.history.push({
            role: "assistant",
            text: updates.assistantMessage,
            timestamp: Date.now()
          });
        }
        if (context.history.length > 20) {
          context.history = context.history.slice(-20);
        }
        context.lastActivityAt = Date.now();
        contexts.set(conversationId, context);
      }
      /**
       * 生成對話 ID
       */
      generateConversationId() {
        return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      }
      /**
       * 清理過期上下文（可選，在 Cloudflare 中可能不需要）
       */
      cleanupExpiredContexts() {
        const now = Date.now();
        for (const [id, context] of contexts.entries()) {
          if (now - context.lastActivityAt > CONTEXT_TTL) {
            contexts.delete(id);
          }
        }
      }
      /**
       * 檢查是否有足夠的資訊進行推薦
       */
      hasRequiredSlotsForRecommendation(context) {
        return !!(context.slots.service_type || context.slots.use_case);
      }
      /**
       * 根據意圖和當前狀態決定下一個狀態（配置驅動版本）
       * @param currentState 當前狀態
       * @param intent 意圖
       * @param hasRequiredSlots 是否有必需的 slots
       * @param stateTransitionsConfig 可選的狀態轉換配置（如果提供則使用配置，否則使用 fallback）
       */
      determineNextState(currentState, intent, hasRequiredSlots, stateTransitionsConfig) {
        if (!stateTransitionsConfig || !stateTransitionsConfig.transitions) {
          return this.determineNextStateFallback(currentState, intent, hasRequiredSlots);
        }
        const transitions = stateTransitionsConfig.transitions[currentState];
        if (!transitions) {
          return currentState;
        }
        if (transitions.hasRequiredSlots && hasRequiredSlots) {
          return transitions.hasRequiredSlots;
        }
        if (transitions[intent]) {
          return transitions[intent];
        }
        for (const [pattern, nextState] of Object.entries(transitions)) {
          if (pattern === "default" || pattern === "hasRequiredSlots") continue;
          if (pattern.includes("|")) {
            const intentList = pattern.split("|");
            if (intentList.includes(intent)) {
              return nextState;
            }
          }
        }
        return transitions.default || currentState;
      }
      /**
       * Fallback 狀態轉換邏輯（原始硬編碼版本，用於配置缺失時）
       */
      determineNextStateFallback(currentState, intent, hasRequiredSlots) {
        if (currentState === "INIT") {
          if (intent === "greeting") {
            return "INIT";
          } else if (intent === "service_inquiry" || intent === "price_inquiry") {
            return "COLLECTING_INFO";
          } else if (intent === "handoff_to_human" || intent === "complaint") {
            return "COMPLETE";
          }
        } else if (currentState === "COLLECTING_INFO") {
          if (hasRequiredSlots) {
            return "RECOMMENDING";
          } else if (intent === "handoff_to_human" || intent === "complaint") {
            return "COMPLETE";
          }
        } else if (currentState === "RECOMMENDING") {
          if (intent === "goodbye" || intent === "handoff_to_human") {
            return "COMPLETE";
          } else if (intent === "service_inquiry" || intent === "comparison") {
            return "FOLLOW_UP";
          }
        } else if (currentState === "FOLLOW_UP") {
          if (intent === "goodbye" || intent === "handoff_to_human") {
            return "COMPLETE";
          }
        }
        return currentState;
      }
    };
  }
});

// api/lib/responseTemplates.ts
function setKnowledgeBase(kb) {
  knowledgeBaseInstance = kb;
}
function getComplaintTemplate() {
  try {
    const contactInfo = knowledgeBaseInstance?.getContactInfo();
    if (!contactInfo) {
      return "\u975E\u5E38\u62B1\u6B49\u8B93\u4F60\u9047\u5230\u9019\u6A23\u7684\u60C5\u6CC1\u3002\u8ACB\u806F\u7D61\u6211\u5011\u7684\u771F\u4EBA\u5925\u4F34\u5354\u52A9\u8655\u7406\u3002";
    }
    const { email, phone, ig } = contactInfo.ai_response_rules.handoff_to_human;
    return `\u975E\u5E38\u62B1\u6B49\u8B93\u4F60\u9047\u5230\u9019\u6A23\u7684\u60C5\u6CC1\uFF0C\u6211\u5B8C\u5168\u7406\u89E3\u4F60\u7684\u611F\u53D7\u3002\u70BA\u4E86\u80FD\u66F4\u6E96\u78BA\u5730\u5354\u52A9\u4F60\uFF0C\u6211\u5EFA\u8B70\u4F60\u76F4\u63A5\u806F\u7D61\u6211\u5011\u7684\u771F\u4EBA\u5925\u4F34\uFF0C\u4ED6\u5011\u6703\u7ACB\u5373\u8655\u7406\u4E26\u63D0\u4F9B\u6700\u9069\u5408\u7684\u89E3\u6C7A\u65B9\u6848\u3002

\u806F\u7D61\u65B9\u5F0F\uFF1A
- Email\uFF1A${email}
- \u96FB\u8A71\uFF1A\u4E2D\u5C71\u5E97 ${phone.zhongshan} / \u516C\u9928\u5E97 ${phone.gongguan}
- IG\uFF1A${ig}

\u6211\u5011\u6703\u76E1\u5FEB\u56DE\u8986\u4E26\u5354\u52A9\u4F60\u89E3\u6C7A\u554F\u984C\u3002

**\u91CD\u8981\u63D0\u9192\uFF1A\u6240\u6709\u88DC\u511F\u6C7A\u7B56\u90FD\u7531\u771F\u4EBA\u5BA2\u670D\u8655\u7406\uFF0C\u4EE5\u78BA\u4FDD\u516C\u5E73\u8207\u6E96\u78BA\u3002**`;
  } catch (error) {
    return "\u975E\u5E38\u62B1\u6B49\u8B93\u4F60\u9047\u5230\u9019\u6A23\u7684\u60C5\u6CC1\u3002\u8ACB\u806F\u7D61\u6211\u5011\u7684\u771F\u4EBA\u5925\u4F34\u5354\u52A9\u8655\u7406\u3002";
  }
}
function getHandoffTemplate(reason) {
  const contactInfo = knowledgeBaseInstance?.getContactInfo();
  if (!contactInfo) {
    return "\u5EFA\u8B70\u4F60\u900F\u904E Email \u6216\u96FB\u8A71\u806F\u7D61\u6211\u5011\u7684\u771F\u4EBA\u5925\u4F34\u3002";
  }
  const { email, phone, ig, booking_link } = contactInfo.ai_response_rules.handoff_to_human;
  let message = "\u9019\u985E\u554F\u984C\u6BD4\u8F03\u9069\u5408\u7531\u771F\u4EBA\u5925\u4F34\u4F86\u5354\u52A9\uFF0C\u6703\u6BD4\u8F03\u7CBE\u6E96\u3001\u4E5F\u66F4\u8CBC\u8FD1\u4F60\u7684\u72C0\u6CC1 \u{1F64F}\n\n\u5EFA\u8B70\u4F60\u53EF\u4EE5\u900F\u904E\u4EE5\u4E0B\u65B9\u5F0F\u806F\u7D61\u6211\u5011\uFF1A\n";
  message += `- Email\uFF1A${email}
`;
  message += `- \u96FB\u8A71\uFF1A\u4E2D\u5C71\u5E97 ${phone.zhongshan} / \u516C\u9928\u5E97 ${phone.gongguan}
`;
  message += `- IG\uFF1A${ig}
`;
  message += `- \u9810\u7D04\u9023\u7D50\uFF1A${booking_link}`;
  if (reason) {
    message += `

\u539F\u56E0\uFF1A${reason}`;
  }
  return message;
}
function getApiErrorTemplate() {
  try {
    const contactInfo = knowledgeBaseInstance?.getContactInfo();
    if (!contactInfo) {
      return "\u7CDF\u7CD5\uFF0C\u5F8C\u53F0\u7CFB\u7D71\u73FE\u5728\u6709\u9EDE\u5FD9\u788C\uFF0C\u6211\u66AB\u6642\u62FF\u4E0D\u5230\u6B63\u78BA\u7684\u8CC7\u8A0A \u{1F623} \u4F60\u53EF\u4EE5\u904E\u5E7E\u5206\u9418\u518D\u8A66\u4E00\u6B21\uFF0C\u6216\u76F4\u63A5\u900F\u904E Email \u6216\u96FB\u8A71\u806F\u7D61\u6211\u5011\u7684\u771F\u4EBA\u5925\u4F34\u3002";
    }
    const { email, phone } = contactInfo.ai_response_rules.handoff_to_human;
    return `\u7CDF\u7CD5\uFF0C\u5F8C\u53F0\u7CFB\u7D71\u73FE\u5728\u6709\u9EDE\u5FD9\u788C\uFF0C\u6211\u66AB\u6642\u62FF\u4E0D\u5230\u6B63\u78BA\u7684\u8CC7\u8A0A \u{1F623} \u4F60\u53EF\u4EE5\u904E\u5E7E\u5206\u9418\u518D\u8A66\u4E00\u6B21\uFF0C\u6216\u76F4\u63A5\u900F\u904E Email\uFF08${email}\uFF09\u6216\u96FB\u8A71\uFF08\u4E2D\u5C71\u5E97 ${phone.zhongshan} / \u516C\u9928\u5E97 ${phone.gongguan}\uFF09\u806F\u7D61\u6211\u5011\u7684\u771F\u4EBA\u5925\u4F34\u3002`;
  } catch (error) {
    return "\u7CDF\u7CD5\uFF0C\u5F8C\u53F0\u7CFB\u7D71\u73FE\u5728\u6709\u9EDE\u5FD9\u788C\uFF0C\u6211\u66AB\u6642\u62FF\u4E0D\u5230\u6B63\u78BA\u7684\u8CC7\u8A0A \u{1F623} \u4F60\u53EF\u4EE5\u904E\u5E7E\u5206\u9418\u518D\u8A66\u4E00\u6B21\uFF0C\u6216\u76F4\u63A5\u900F\u904E Email \u6216\u96FB\u8A71\u806F\u7D61\u6211\u5011\u7684\u771F\u4EBA\u5925\u4F34\u3002";
  }
}
function getTimeoutTemplate() {
  const contactInfo = knowledgeBaseInstance?.getContactInfo();
  if (!contactInfo) {
    return "\u9019\u6B21\u56DE\u8986\u82B1\u7684\u6642\u9593\u6709\u9EDE\u4E45\uFF0C\u6211\u6015\u7CFB\u7D71\u5361\u4F4F\u4E86\u3002\u4F60\u53EF\u4EE5\u91CD\u65B0\u63D0\u554F\u4E00\u6B21\uFF0C\u6216\u76F4\u63A5\u7528 Email \u6216\u96FB\u8A71\u627E\u771F\u4EBA\u5354\u52A9\u3002";
  }
  const { email, phone } = contactInfo.ai_response_rules.handoff_to_human;
  return `\u9019\u6B21\u56DE\u8986\u82B1\u7684\u6642\u9593\u6709\u9EDE\u4E45\uFF0C\u6211\u6015\u7CFB\u7D71\u5361\u4F4F\u4E86\u3002\u4F60\u53EF\u4EE5\u91CD\u65B0\u63D0\u554F\u4E00\u6B21\uFF0C\u6216\u76F4\u63A5\u7528 Email\uFF08${email}\uFF09\u6216\u96FB\u8A71\uFF08\u4E2D\u5C71\u5E97 ${phone.zhongshan} / \u516C\u9928\u5E97 ${phone.gongguan}\uFF09\u627E\u771F\u4EBA\u5354\u52A9\u3002`;
}
function getLineInquiryTemplate() {
  const contactInfo = knowledgeBaseInstance?.getContactInfo();
  if (!contactInfo) {
    return "\u6211\u5011\u76EE\u524D\u6C92\u6709\u63D0\u4F9B Line \u5B98\u65B9\u5E33\u865F\u670D\u52D9\uFF0C\u5982\u6709\u9700\u8981\u53EF\u4EE5\u900F\u904E Email \u6216\u96FB\u8A71\u806F\u7D61\u6211\u5011\u3002";
  }
  return contactInfo.ai_response_rules.line_inquiry;
}
var import_checked_fetch5, knowledgeBaseInstance;
var init_responseTemplates = __esm({
  "api/lib/responseTemplates.ts"() {
    init_functionsRoutes_0_37336205855784055();
    import_checked_fetch5 = __toESM(require_checked_fetch(), 1);
    knowledgeBaseInstance = null;
    __name(setKnowledgeBase, "setKnowledgeBase");
    __name(getComplaintTemplate, "getComplaintTemplate");
    __name(getHandoffTemplate, "getHandoffTemplate");
    __name(getApiErrorTemplate, "getApiErrorTemplate");
    __name(getTimeoutTemplate, "getTimeoutTemplate");
    __name(getLineInquiryTemplate, "getLineInquiryTemplate");
  }
});

// api/lib/pipeline.ts
var import_checked_fetch6, Pipeline;
var init_pipeline = __esm({
  "api/lib/pipeline.ts"() {
    init_functionsRoutes_0_37336205855784055();
    import_checked_fetch6 = __toESM(require_checked_fetch(), 1);
    Pipeline = class {
      static {
        __name(this, "Pipeline");
      }
      nodes = [];
      config;
      constructor(config = {}) {
        this.config = {
          enableDetailedLogging: true,
          logLevel: "INFO",
          ...config
        };
      }
      /**
       * 添加節點
       */
      addNode(name, node) {
        this.nodes.push({ name, node });
      }
      /**
       * 執行 Pipeline
       */
      async execute(context) {
        for (const { name, node } of this.nodes) {
          const startNodeTime = Date.now();
          try {
            this.log(context, name, "INFO", `\u958B\u59CB\u57F7\u884C\u7BC0\u9EDE: ${name}`);
            const result = await node(context);
            if (result instanceof Response) {
              const duration2 = Date.now() - startNodeTime;
              this.log(context, name, "SUCCESS", `\u7BC0\u9EDE ${name} \u8FD4\u56DE\u97FF\u61C9\uFF0C\u6D41\u7A0B\u7D50\u675F`, duration2);
              return result;
            }
            context = result;
            const duration = Date.now() - startNodeTime;
            this.log(context, name, "SUCCESS", `\u7BC0\u9EDE ${name} \u57F7\u884C\u5B8C\u6210`, duration);
          } catch (error) {
            const duration = Date.now() - startNodeTime;
            this.log(context, name, "ERROR", `\u7BC0\u9EDE ${name} \u57F7\u884C\u5931\u6557: ${error instanceof Error ? error.message : String(error)}`, duration);
            throw error;
          }
        }
        throw new Error("Pipeline execution completed without returning a response");
      }
      /**
       * 記錄日誌
       */
      log(ctx, node, level, message, duration) {
        const logEntry = {
          node,
          level,
          message,
          timestamp: Date.now(),
          duration
        };
        ctx.logs.push(logEntry);
        if (this.shouldLog(level)) {
          const prefix = `[Pipeline:${node}]`;
          const durationStr = duration !== void 0 ? ` (${duration}ms)` : "";
          const emoji = {
            INFO: "\u2139\uFE0F",
            SUCCESS: "\u2705",
            ERROR: "\u274C",
            WARN: "\u26A0\uFE0F"
          }[level];
          console.log(`${emoji} ${prefix} [${level}] ${message}${durationStr}`);
        }
      }
      /**
       * 判斷是否應該記錄日誌
       */
      shouldLog(level) {
        if (!this.config.enableDetailedLogging) {
          return level === "ERROR" || level === "WARN";
        }
        const levels = ["INFO", "SUCCESS", "WARN", "ERROR"];
        const currentLevelIndex = levels.indexOf(this.config.logLevel || "INFO");
        const messageLevelIndex = levels.indexOf(level);
        return messageLevelIndex >= currentLevelIndex;
      }
      /**
       * 獲取節點列表（用於調試）
       */
      getNodeNames() {
        return this.nodes.map((n) => n.name);
      }
      /**
       * 清空所有節點（用於測試）
       */
      clear() {
        this.nodes = [];
      }
    };
  }
});

// api/nodes/01-validate-request.ts
function buildCorsHeaders(request) {
  const allowedOrigins = [
    "https://goldenyearsphoto.pages.dev",
    "https://www.goldenyearsphoto.com",
    "https://goldenyearsphoto.com",
    // 開發環境
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:8081",
    "http://127.0.0.1:8081"
  ];
  const origin = request.headers.get("Origin");
  const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
    // 24 hours
  };
}
async function node_validateRequest(ctx) {
  if (ctx.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: ctx.corsHeaders
    });
  }
  if (!ctx.corsHeaders || Object.keys(ctx.corsHeaders).length === 0) {
    ctx.corsHeaders = buildCorsHeaders(ctx.request);
  }
  const contentType = ctx.request.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return new Response(
      JSON.stringify({
        error: "Invalid Content-Type",
        message: "\u8ACB\u6C42\u5FC5\u9808\u4F7F\u7528 application/json"
      }),
      {
        status: 400,
        headers: {
          ...ctx.corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
  let body;
  try {
    body = await ctx.request.json();
  } catch (error) {
    console.error("[Chat] Failed to parse request body:", error);
    return new Response(
      JSON.stringify({
        error: "Invalid JSON",
        message: "\u8ACB\u6C42\u9AD4\u5FC5\u9808\u662F\u6709\u6548\u7684 JSON \u683C\u5F0F"
      }),
      {
        status: 400,
        headers: {
          ...ctx.corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
  if (!body.message || typeof body.message !== "string" || body.message.trim().length === 0) {
    return new Response(
      JSON.stringify({
        error: "Invalid request",
        message: "message \u6B04\u4F4D\u70BA\u5FC5\u586B\u4E14\u4E0D\u80FD\u70BA\u7A7A"
      }),
      {
        status: 400,
        headers: {
          ...ctx.corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
  if (body.message.length > 1e3) {
    return new Response(
      JSON.stringify({
        error: "Invalid request",
        message: "message \u9577\u5EA6\u4E0D\u80FD\u8D85\u904E 1000 \u5B57\u5143"
      }),
      {
        status: 400,
        headers: {
          ...ctx.corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
  if (body.conversationId) {
    if (typeof body.conversationId !== "string" || body.conversationId.length > 100 || !/^conv_[a-zA-Z0-9_]+$/.test(body.conversationId)) {
      return new Response(
        JSON.stringify({
          error: "Invalid request",
          message: "conversationId \u683C\u5F0F\u4E0D\u6B63\u78BA"
        }),
        {
          status: 400,
          headers: {
            ...ctx.corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }
  }
  if (body.mode && !["auto", "decision_recommendation", "faq_flow_price"].includes(body.mode)) {
    return new Response(
      JSON.stringify({
        error: "Invalid request",
        message: "mode \u503C\u4E0D\u6B63\u78BA"
      }),
      {
        status: 400,
        headers: {
          ...ctx.corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
  if (body.source && !["menu", "input"].includes(body.source)) {
    return new Response(
      JSON.stringify({
        error: "Invalid request",
        message: "source \u503C\u4E0D\u6B63\u78BA"
      }),
      {
        status: 400,
        headers: {
          ...ctx.corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
  if (body.pageType && !["home", "qa"].includes(body.pageType)) {
    return new Response(
      JSON.stringify({
        error: "Invalid request",
        message: "pageType \u503C\u4E0D\u6B63\u78BA"
      }),
      {
        status: 400,
        headers: {
          ...ctx.corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
  ctx.body = body;
  return ctx;
}
var import_checked_fetch7;
var init_validate_request = __esm({
  "api/nodes/01-validate-request.ts"() {
    init_functionsRoutes_0_37336205855784055();
    import_checked_fetch7 = __toESM(require_checked_fetch(), 1);
    __name(buildCorsHeaders, "buildCorsHeaders");
    __name(node_validateRequest, "node_validateRequest");
  }
});

// api/nodes/02-initialize-services.ts
async function node_initializeServices(ctx) {
  let kb;
  try {
    console.log("[Chat] Loading knowledge base...");
    const url = new URL(ctx.request.url);
    console.log("[Chat] Request host:", url.host);
    kb = await loadKnowledgeBase(ctx.request);
    console.log("[Chat] Knowledge base loaded successfully");
  } catch (error) {
    console.error("[Chat] Failed to load knowledge base:", error);
    console.error("[Chat] Error details:", error instanceof Error ? {
      message: error.message,
      stack: error.stack?.substring(0, 500)
      // 限制 stack 長度
    } : String(error));
    throw error;
  }
  setKnowledgeBase(kb);
  console.log("[Chat] Initializing services...");
  const llm = initLLMService(ctx.env);
  const cm = initContextManager();
  console.log("[Chat] Services initialized. LLM available:", !!llm);
  ctx.knowledgeBase = kb;
  ctx.llmService = llm;
  ctx.contextManager = cm;
  return ctx;
}
var import_checked_fetch8;
var init_initialize_services = __esm({
  "api/nodes/02-initialize-services.ts"() {
    init_functionsRoutes_0_37336205855784055();
    import_checked_fetch8 = __toESM(require_checked_fetch(), 1);
    init_responseTemplates();
    init_chat();
    __name(node_initializeServices, "node_initializeServices");
  }
});

// api/nodes/03-context-management.ts
async function node_contextManagement(ctx) {
  if (!ctx.contextManager) {
    throw new Error("ContextManager not initialized");
  }
  if (!ctx.body) {
    throw new Error("Request body not validated");
  }
  let context_obj;
  if (ctx.body.conversationId) {
    const existingContext = ctx.contextManager.getContext(ctx.body.conversationId);
    if (existingContext) {
      context_obj = existingContext;
    } else {
      context_obj = ctx.contextManager.createContext(ctx.body.conversationId);
    }
  } else {
    context_obj = ctx.contextManager.createContext();
  }
  ctx.conversationContext = context_obj;
  return ctx;
}
var import_checked_fetch9;
var init_context_management = __esm({
  "api/nodes/03-context-management.ts"() {
    init_functionsRoutes_0_37336205855784055();
    import_checked_fetch9 = __toESM(require_checked_fetch(), 1);
    __name(node_contextManagement, "node_contextManagement");
  }
});

// api/nodes/04-intent-extraction.ts
async function node_intentExtraction(ctx) {
  if (!ctx.knowledgeBase) {
    throw new Error("KnowledgeBase not initialized");
  }
  if (!ctx.body) {
    throw new Error("Request body not validated");
  }
  if (!ctx.conversationContext) {
    throw new Error("ConversationContext not initialized");
  }
  const intent = classifyIntent(ctx.body.message, {
    last_intent: ctx.conversationContext.last_intent,
    slots: ctx.conversationContext.slots
  }, ctx.knowledgeBase);
  const entities = extractEntities(ctx.body.message, ctx.knowledgeBase);
  const mergedEntities = {
    ...ctx.conversationContext.slots,
    ...entities
  };
  ctx.intent = intent;
  ctx.entities = entities;
  ctx.mergedEntities = mergedEntities;
  return ctx;
}
var import_checked_fetch10;
var init_intent_extraction = __esm({
  "api/nodes/04-intent-extraction.ts"() {
    init_functionsRoutes_0_37336205855784055();
    import_checked_fetch10 = __toESM(require_checked_fetch(), 1);
    init_chat();
    __name(node_intentExtraction, "node_intentExtraction");
  }
});

// api/nodes/05-state-transition.ts
async function node_stateTransition(ctx) {
  if (!ctx.knowledgeBase) {
    throw new Error("KnowledgeBase not initialized");
  }
  if (!ctx.contextManager) {
    throw new Error("ContextManager not initialized");
  }
  if (!ctx.conversationContext) {
    throw new Error("ConversationContext not initialized");
  }
  if (!ctx.intent) {
    throw new Error("Intent not extracted");
  }
  if (!ctx.mergedEntities) {
    throw new Error("Merged entities not calculated");
  }
  let nextState = ctx.conversationContext.state;
  try {
    const stateTransitionsConfig = ctx.knowledgeBase.getStateTransitionsConfig();
    if (stateTransitionsConfig) {
      const requiredSlotsCheck = stateTransitionsConfig.requiredSlotsCheck;
      let hasRequiredSlots = false;
      if (requiredSlotsCheck) {
        if (requiredSlotsCheck.requireAny) {
          hasRequiredSlots = requiredSlotsCheck.fields.some((field) => ctx.mergedEntities[field]);
        } else {
          hasRequiredSlots = requiredSlotsCheck.fields.every((field) => ctx.mergedEntities[field]);
        }
      } else {
        hasRequiredSlots = !!(ctx.mergedEntities.service_type || ctx.mergedEntities.use_case);
      }
      nextState = ctx.contextManager.determineNextState(
        ctx.conversationContext.state,
        ctx.intent,
        hasRequiredSlots,
        {
          transitions: stateTransitionsConfig.transitions,
          requiredSlotsCheck: stateTransitionsConfig.requiredSlotsCheck
        }
      );
    } else {
      const hasRequiredSlots = !!(ctx.mergedEntities.service_type || ctx.mergedEntities.use_case);
      nextState = ctx.contextManager.determineNextState(
        ctx.conversationContext.state,
        ctx.intent,
        hasRequiredSlots
      );
    }
  } catch (error) {
    console.warn("[Chat] Failed to determine next state, using current state:", error);
    nextState = ctx.conversationContext.state;
  }
  ctx.nextState = nextState;
  return ctx;
}
var import_checked_fetch11;
var init_state_transition = __esm({
  "api/nodes/05-state-transition.ts"() {
    init_functionsRoutes_0_37336205855784055();
    import_checked_fetch11 = __toESM(require_checked_fetch(), 1);
    __name(node_stateTransition, "node_stateTransition");
  }
});

// api/nodes/06-special-intents.ts
async function node_specialIntents(ctx) {
  if (!ctx.body) {
    throw new Error("Request body not validated");
  }
  if (!ctx.intent) {
    throw new Error("Intent not extracted");
  }
  if (!ctx.conversationContext) {
    throw new Error("ConversationContext not initialized");
  }
  if (!ctx.mergedEntities) {
    throw new Error("Merged entities not calculated");
  }
  if (!ctx.contextManager) {
    throw new Error("ContextManager not initialized");
  }
  if (!ctx.knowledgeBase) {
    throw new Error("KnowledgeBase not initialized");
  }
  if (!ctx.nextState) {
    throw new Error("Next state not determined");
  }
  if (ctx.body.message.includes("line") || ctx.body.message.includes("Line") || ctx.body.message.includes("LINE")) {
    return buildResponse(
      getLineInquiryTemplate(),
      ctx.intent,
      ctx.conversationContext.conversationId,
      ctx.mergedEntities,
      ctx.contextManager,
      ctx.knowledgeBase,
      ctx.body.message,
      ctx.corsHeaders,
      ctx.nextState
    );
  }
  const intentHandlers = {
    complaint: getComplaintTemplate,
    handoff_to_human: getHandoffTemplate
  };
  if (intentHandlers[ctx.intent]) {
    return buildResponse(
      intentHandlers[ctx.intent](),
      ctx.intent,
      ctx.conversationContext.conversationId,
      ctx.mergedEntities,
      ctx.contextManager,
      ctx.knowledgeBase,
      ctx.body.message,
      ctx.corsHeaders,
      ctx.nextState
    );
  }
  return ctx;
}
var import_checked_fetch12;
var init_special_intents = __esm({
  "api/nodes/06-special-intents.ts"() {
    init_functionsRoutes_0_37336205855784055();
    import_checked_fetch12 = __toESM(require_checked_fetch(), 1);
    init_chat();
    init_responseTemplates();
    __name(node_specialIntents, "node_specialIntents");
  }
});

// api/nodes/07-faq-check.ts
async function node_faqCheck(ctx) {
  if (!ctx.intent) {
    throw new Error("Intent not extracted");
  }
  if (!ctx.body) {
    throw new Error("Request body not validated");
  }
  if (!ctx.knowledgeBase) {
    throw new Error("KnowledgeBase not initialized");
  }
  if (!ctx.conversationContext) {
    throw new Error("ConversationContext not initialized");
  }
  if (!ctx.mergedEntities) {
    throw new Error("Merged entities not calculated");
  }
  if (!ctx.contextManager) {
    throw new Error("ContextManager not initialized");
  }
  if (!ctx.nextState) {
    throw new Error("Next state not determined");
  }
  const faqResponse = handleFAQIfNeeded(
    ctx.intent,
    ctx.body.message,
    ctx.knowledgeBase,
    ctx.conversationContext,
    ctx.mergedEntities,
    ctx.contextManager,
    ctx.corsHeaders,
    ctx.nextState
  );
  if (faqResponse) {
    return faqResponse;
  }
  if (ctx.body.source === "menu") {
    console.log("[Chat] Menu source detected, prioritizing FAQ match");
    const faqResults = ctx.knowledgeBase.searchFAQDetailed(ctx.body.message);
    if (faqResults && faqResults.length > 0) {
      const matchedFAQ = faqResults[0];
      console.log("[Chat] FAQ matched:", matchedFAQ.id, "score:", matchedFAQ.score || "N/A");
      return buildResponse(
        matchedFAQ.answer,
        ctx.intent,
        ctx.conversationContext.conversationId,
        ctx.mergedEntities,
        ctx.contextManager,
        ctx.knowledgeBase,
        ctx.body.message,
        ctx.corsHeaders,
        ctx.nextState
      );
    } else {
      console.log("[Chat] FAQ match failed for menu selection, message:", ctx.body.message);
      console.log("[Chat] Attempting fuzzy match...");
      const keywords = ctx.body.message.toLowerCase().replace(/我想|我要|我想知道|請問|可以|嗎|呢/g, "").trim();
      if (keywords) {
        const fuzzyResults = ctx.knowledgeBase.searchFAQDetailed(keywords);
        if (fuzzyResults && fuzzyResults.length > 0) {
          const matchedFAQ = fuzzyResults[0];
          console.log("[Chat] Fuzzy FAQ matched:", matchedFAQ.id);
          return buildResponse(
            matchedFAQ.answer,
            ctx.intent,
            ctx.conversationContext.conversationId,
            ctx.mergedEntities,
            ctx.contextManager,
            ctx.knowledgeBase,
            ctx.body.message,
            ctx.corsHeaders,
            ctx.nextState
          );
        }
      }
      console.warn("[Chat] No FAQ match found for menu selection, returning friendly message");
      const friendlyMessage = `\u62B1\u6B49\uFF0C\u6211\u66AB\u6642\u627E\u4E0D\u5230\u9019\u500B\u554F\u984C\u7684\u7B54\u6848\u3002\u5EFA\u8B70\u60A8\uFF1A

1. \u67E5\u770B\u6211\u5011\u7684 [\u5E38\u898B\u554F\u984C\u9801\u9762](/guide/faq/)
2. \u76F4\u63A5\u900F\u904E Email\uFF08goldenyears166@gmail.com\uFF09\u6216\u96FB\u8A71\u806F\u7D61\u6211\u5011\u7684\u771F\u4EBA\u5925\u4F34
3. \u6216\u91CD\u65B0\u9078\u64C7\u5176\u4ED6\u554F\u984C`;
      return buildResponse(
        friendlyMessage,
        ctx.intent,
        ctx.conversationContext.conversationId,
        ctx.mergedEntities,
        ctx.contextManager,
        ctx.knowledgeBase,
        ctx.body.message,
        ctx.corsHeaders,
        ctx.nextState
      );
    }
  }
  return ctx;
}
var import_checked_fetch13;
var init_faq_check = __esm({
  "api/nodes/07-faq-check.ts"() {
    init_functionsRoutes_0_37336205855784055();
    import_checked_fetch13 = __toESM(require_checked_fetch(), 1);
    init_chat();
    __name(node_faqCheck, "node_faqCheck");
  }
});

// api/nodes/08-llm-generation.ts
async function node_llmGeneration(ctx) {
  if (!ctx.body) {
    throw new Error("Request body not validated");
  }
  if (!ctx.intent) {
    throw new Error("Intent not extracted");
  }
  if (!ctx.conversationContext) {
    throw new Error("ConversationContext not initialized");
  }
  if (!ctx.mergedEntities) {
    throw new Error("Merged entities not calculated");
  }
  if (!ctx.contextManager) {
    throw new Error("ContextManager not initialized");
  }
  if (!ctx.knowledgeBase) {
    throw new Error("KnowledgeBase not initialized");
  }
  if (!ctx.llmService) {
    if (ctx.body?.source === "menu") {
      console.error("[Chat] ERROR: Menu selection reached LLM node without FAQ match!");
      const reply3 = "\u62B1\u6B49\uFF0C\u7CFB\u7D71\u66AB\u6642\u7121\u6CD5\u8655\u7406\u9019\u500B\u554F\u984C\u3002\u5EFA\u8B70\u60A8\u67E5\u770B\u6211\u5011\u7684\u5E38\u898B\u554F\u984C\u9801\u9762\uFF0C\u6216\u76F4\u63A5\u806F\u7D61\u6211\u5011\u7684\u771F\u4EBA\u5925\u4F34\u3002";
      return new Response(
        JSON.stringify({
          reply: reply3,
          intent: ctx.intent || "handoff_to_human",
          conversationId: ctx.conversationContext.conversationId,
          updatedContext: {
            last_intent: ctx.intent || "handoff_to_human",
            slots: ctx.mergedEntities
          }
        }),
        {
          status: 200,
          // 返回 200 而不是 503，因為這是菜單選擇
          headers: {
            ...ctx.corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }
    const reply2 = getApiErrorTemplate();
    return new Response(
      JSON.stringify({
        reply: reply2,
        intent: "handoff_to_human",
        conversationId: ctx.conversationContext.conversationId,
        updatedContext: {
          last_intent: "handoff_to_human",
          slots: ctx.mergedEntities
        }
        // ⚠️ 注意：無 suggestedQuickReplies 欄位
      }),
      {
        status: 503,
        headers: {
          ...ctx.corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
  const history = ctx.conversationContext.history.slice(-5).map((msg) => ({
    role: msg.role,
    content: msg.text
  }));
  const mode = ctx.body.mode || "auto";
  const replyPromise = ctx.llmService.generateReply({
    message: ctx.body.message,
    intent: ctx.intent,
    entities: ctx.mergedEntities,
    context: {
      last_intent: ctx.conversationContext.last_intent,
      slots: ctx.mergedEntities,
      history
    },
    mode,
    knowledgeBase: ctx.knowledgeBase
    // 傳入知識庫實例，用於獲取價格資訊
  });
  let timeoutId = null;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Timeout")), TIMEOUT_MS);
  });
  let reply;
  try {
    reply = await Promise.race([replyPromise, timeoutPromise]);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (error instanceof Error && error.message === "Timeout") {
      reply = getTimeoutTemplate();
    } else {
      throw error;
    }
  }
  ctx.reply = reply;
  return ctx;
}
var import_checked_fetch14, TIMEOUT_MS;
var init_llm_generation = __esm({
  "api/nodes/08-llm-generation.ts"() {
    init_functionsRoutes_0_37336205855784055();
    import_checked_fetch14 = __toESM(require_checked_fetch(), 1);
    init_responseTemplates();
    TIMEOUT_MS = 1e4;
    __name(node_llmGeneration, "node_llmGeneration");
  }
});

// api/nodes/09-build-response.ts
async function node_buildResponse(ctx) {
  if (!ctx.reply) {
    throw new Error("Reply not generated");
  }
  if (!ctx.intent) {
    throw new Error("Intent not extracted");
  }
  if (!ctx.conversationContext) {
    throw new Error("ConversationContext not initialized");
  }
  if (!ctx.mergedEntities) {
    throw new Error("Merged entities not calculated");
  }
  if (!ctx.contextManager) {
    throw new Error("ContextManager not initialized");
  }
  if (!ctx.knowledgeBase) {
    throw new Error("KnowledgeBase not initialized");
  }
  if (!ctx.body) {
    throw new Error("Request body not validated");
  }
  if (!ctx.nextState) {
    throw new Error("Next state not determined");
  }
  const responseTime = Date.now() - ctx.startTime;
  console.log(`[Chat] ${ctx.intent} - ${responseTime}ms`);
  return buildResponse(
    ctx.reply,
    ctx.intent,
    ctx.conversationContext.conversationId,
    ctx.mergedEntities,
    ctx.contextManager,
    ctx.knowledgeBase,
    ctx.body.message,
    ctx.corsHeaders,
    ctx.nextState
  );
}
var import_checked_fetch15;
var init_build_response = __esm({
  "api/nodes/09-build-response.ts"() {
    init_functionsRoutes_0_37336205855784055();
    import_checked_fetch15 = __toESM(require_checked_fetch(), 1);
    init_chat();
    __name(node_buildResponse, "node_buildResponse");
  }
});

// api/nodes/99-error-handler.ts
function handlePipelineError(error, ctx) {
  console.error("[Chat Error] ========== ERROR START ==========");
  console.error("[Chat Error] Error type:", error instanceof Error ? error.constructor.name : typeof error);
  console.error("[Chat Error] Error message:", error instanceof Error ? error.message : String(error));
  if (error instanceof Error && error.stack) {
    const stackPreview = error.stack.substring(0, 200);
    console.error("[Chat Error] Error stack preview:", stackPreview);
  }
  if (error instanceof Error && error.message.includes("Failed to load knowledge base")) {
    console.error("[Chat Error] Knowledge base loading failed - this is likely the root cause");
    console.error("[Chat Error] Please check:");
    console.error("[Chat Error] 1. Knowledge files exist in _site/knowledge/ after build");
    console.error("[Chat Error] 2. Knowledge files are accessible via HTTP");
    console.error("[Chat Error] 3. Base URL is correctly constructed");
  }
  if (error instanceof Error && (error.message.includes("GEMINI_API_KEY") || error.message.includes("LLM"))) {
    console.error("[Chat Error] LLM service initialization failed");
    console.error("[Chat Error] Please check GEMINI_API_KEY environment variable in Cloudflare Pages");
  }
  console.error("[Chat Error] ========== ERROR END ==========");
  return new Response(
    JSON.stringify({
      reply: getApiErrorTemplate(),
      intent: "handoff_to_human",
      updatedContext: {
        last_intent: "handoff_to_human",
        slots: {}
      }
    }),
    {
      status: 500,
      headers: {
        ...ctx.corsHeaders,
        "Content-Type": "application/json"
      }
    }
  );
}
var import_checked_fetch16;
var init_error_handler = __esm({
  "api/nodes/99-error-handler.ts"() {
    init_functionsRoutes_0_37336205855784055();
    import_checked_fetch16 = __toESM(require_checked_fetch(), 1);
    init_responseTemplates();
    __name(handlePipelineError, "handlePipelineError");
  }
});

// api/nodes/index.ts
var import_checked_fetch17;
var init_nodes = __esm({
  "api/nodes/index.ts"() {
    init_functionsRoutes_0_37336205855784055();
    import_checked_fetch17 = __toESM(require_checked_fetch(), 1);
    init_validate_request();
    init_initialize_services();
    init_context_management();
    init_intent_extraction();
    init_state_transition();
    init_special_intents();
    init_faq_check();
    init_llm_generation();
    init_build_response();
    init_error_handler();
  }
});

// api/chat-pipeline.ts
var chat_pipeline_exports = {};
__export(chat_pipeline_exports, {
  onRequestPostPipeline: () => onRequestPostPipeline
});
async function onRequestPostPipeline(context) {
  const startTime = Date.now();
  const pipeline = new Pipeline({
    enableDetailedLogging: true,
    logLevel: "INFO"
  });
  pipeline.addNode("validateRequest", node_validateRequest);
  pipeline.addNode("initializeServices", node_initializeServices);
  pipeline.addNode("contextManagement", node_contextManagement);
  pipeline.addNode("intentExtraction", node_intentExtraction);
  pipeline.addNode("stateTransition", node_stateTransition);
  pipeline.addNode("specialIntents", node_specialIntents);
  pipeline.addNode("faqCheck", node_faqCheck);
  pipeline.addNode("llmGeneration", node_llmGeneration);
  pipeline.addNode("buildResponse", node_buildResponse);
  const pipelineContext = {
    request: context.request,
    env: context.env,
    corsHeaders: {},
    startTime,
    logs: []
  };
  try {
    return await pipeline.execute(pipelineContext);
  } catch (error) {
    return handlePipelineError(error, pipelineContext);
  }
}
var import_checked_fetch18;
var init_chat_pipeline = __esm({
  "api/chat-pipeline.ts"() {
    init_functionsRoutes_0_37336205855784055();
    import_checked_fetch18 = __toESM(require_checked_fetch(), 1);
    init_pipeline();
    init_nodes();
    __name(onRequestPostPipeline, "onRequestPostPipeline");
  }
});

// api/chat.ts
async function loadKnowledgeBase(request) {
  if (knowledgeBase && knowledgeBase.isLoaded()) {
    return knowledgeBase;
  }
  if (knowledgeBaseLoading) {
    console.log("[Chat] Knowledge base is loading, waiting...");
    return await knowledgeBaseLoading;
  }
  if (knowledgeBase && !knowledgeBase.isLoaded()) {
    console.log("[Chat] Knowledge base exists but not loaded, recreating...");
    knowledgeBase = null;
  }
  knowledgeBaseLoading = (async () => {
    try {
      if (!knowledgeBase) {
        knowledgeBase = new KnowledgeBase();
      }
      let baseUrl;
      if (request) {
        const url = new URL(request.url);
        baseUrl = `${url.protocol}//${url.host}`;
      }
      if (!knowledgeBase.isLoaded()) {
        await knowledgeBase.load(baseUrl);
      }
      return knowledgeBase;
    } catch (error) {
      console.error("[Chat] Knowledge base loading failed, clearing instance:", error);
      knowledgeBase = null;
      knowledgeBaseLoading = null;
      throw error;
    } finally {
      knowledgeBaseLoading = null;
    }
  })();
  return await knowledgeBaseLoading;
}
function initLLMService(env) {
  if (!llmService) {
    const apiKey = env?.GEMINI_API_KEY;
    console.log("[Init LLM] Checking API key...");
    console.log("[Init LLM] env object exists:", !!env);
    console.log("[Init LLM] API Key exists:", !!apiKey);
    if (apiKey) {
      console.log("[Init LLM] API Key format valid:", apiKey.startsWith("AIza"));
      try {
        llmService = new LLMService(apiKey);
        console.log("[Init LLM] LLM service initialized successfully");
      } catch (error) {
        console.error("[Init LLM] Failed to initialize LLM service:", error);
        throw error;
      }
    } else {
      console.error("[Init LLM] GEMINI_API_KEY not found in env");
      console.log("[Init LLM] Available env keys:", env ? Object.keys(env) : "env is null/undefined");
    }
  }
  return llmService;
}
function initContextManager() {
  if (!contextManager) {
    contextManager = new ContextManager();
  }
  return contextManager;
}
function buildResponse(reply, intent, conversationId, mergedEntities, cm, kb, userMessage, corsHeaders, nextState) {
  cm.updateContext(conversationId, {
    last_intent: intent,
    slots: mergedEntities,
    userMessage,
    assistantMessage: reply,
    state: nextState
  });
  const response = {
    reply,
    intent,
    conversationId,
    updatedContext: {
      last_intent: intent,
      slots: mergedEntities
    },
    suggestedQuickReplies: getSuggestedQuickReplies(intent, mergedEntities, nextState, kb)
  };
  return new Response(
    JSON.stringify(response),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
function handleFAQIfNeeded(intent, message, kb, context_obj, mergedEntities, cm, corsHeaders, nextState) {
  const rule = faqHandlingRules[intent];
  if (!rule || !rule.shouldCheckFAQ(message)) {
    return null;
  }
  const faqResults = kb.searchFAQ(message);
  let criticalFAQ;
  if (rule.faqFilter) {
    criticalFAQ = faqResults.find((faq) => rule.faqFilter(faq, message));
  } else {
    criticalFAQ = faqResults.find((faq) => faq.critical);
  }
  if (criticalFAQ) {
    return buildResponse(
      criticalFAQ.answer,
      intent,
      context_obj.conversationId,
      mergedEntities,
      cm,
      kb,
      message,
      corsHeaders,
      nextState
    );
  }
  return null;
}
function classifyIntent(message, context, knowledgeBase3) {
  const lowerMessage = message.toLowerCase();
  let intentConfig = null;
  if (knowledgeBase3) {
    try {
      intentConfig = knowledgeBase3.getIntentConfig();
    } catch (error) {
      console.warn("[Chat] Failed to get intent config from knowledge base:", error);
    }
  }
  if (!intentConfig || !intentConfig.intents) {
    if (context?.last_intent && lowerMessage.length < 10) {
      return context.last_intent;
    }
    return "service_inquiry";
  }
  const sortedIntents = [...intentConfig.intents].sort((a, b) => a.priority - b.priority);
  for (const intent of sortedIntents) {
    const hasKeyword = intent.keywords.some((keyword) => lowerMessage.includes(keyword));
    const hasContextKeyword = intent.contextKeywords.length > 0 && intent.contextKeywords.some((ctx) => lowerMessage.includes(ctx));
    const hasExcludeKeyword = intent.excludeKeywords.length > 0 && intent.excludeKeywords.some((exclude) => lowerMessage.includes(exclude));
    let matchesSpecialCondition = false;
    if (intent.specialConditions) {
      if (intent.specialConditions.shortMessage && lowerMessage.length < (intent.specialConditions.shortMessageThreshold || 5)) {
        matchesSpecialCondition = true;
      }
    }
    if ((hasKeyword || hasContextKeyword || matchesSpecialCondition) && !hasExcludeKeyword) {
      return intent.id;
    }
  }
  if (intentConfig.fallback.useContextIntent && context?.last_intent && lowerMessage.length < intentConfig.fallback.contextIntentThreshold) {
    return context.last_intent;
  }
  return intentConfig.fallback.defaultIntent;
}
function extractEntityByPatterns(message, patterns) {
  const lowerMessage = message.toLowerCase();
  for (const pattern of patterns) {
    if (pattern.keywords.some((keyword) => lowerMessage.includes(keyword))) {
      return pattern.id;
    }
  }
  return void 0;
}
function extractEntities(message, knowledgeBase3) {
  const lowerMessage = message.toLowerCase();
  const entities = {};
  let entityPatterns = null;
  if (knowledgeBase3) {
    try {
      entityPatterns = knowledgeBase3.getEntityPatterns();
    } catch (error) {
      console.warn("[Chat] Failed to get entity patterns from knowledge base:", error);
    }
  }
  if (!entityPatterns || !entityPatterns.patterns) {
    if (lowerMessage.includes("\u9810\u7D04") || lowerMessage.includes("book")) {
      entities.booking_action = "book";
    }
    return entities;
  }
  const patterns = entityPatterns.patterns;
  if (patterns.service_type) {
    entities.service_type = extractEntityByPatterns(message, patterns.service_type);
  }
  if (patterns.use_case) {
    entities.use_case = extractEntityByPatterns(message, patterns.use_case);
  }
  if (patterns.persona) {
    entities.persona = extractEntityByPatterns(message, patterns.persona);
  }
  if (patterns.branch) {
    for (const [branchId, branchConfig] of Object.entries(patterns.branch)) {
      if (branchConfig.keywords.some((keyword) => lowerMessage.includes(keyword))) {
        entities.branch = branchId;
        break;
      }
    }
  }
  if (patterns.booking_action) {
    for (const [actionId, actionConfig] of Object.entries(patterns.booking_action)) {
      if (actionConfig.keywords.some((keyword) => lowerMessage.includes(keyword))) {
        entities.booking_action = actionId;
        break;
      }
    }
  }
  return entities;
}
function getSuggestedQuickReplies(intent, entities, state, knowledgeBase3) {
  if (knowledgeBase3) {
    try {
      const nbaActions = knowledgeBase3.getNextBestActions(intent);
      if (nbaActions && nbaActions.length > 0) {
        return nbaActions;
      }
    } catch (error) {
      console.error("[Chat] Failed to get next best actions from knowledge base:", error);
    }
    try {
      const responseTemplate = knowledgeBase3.getResponseTemplate(intent);
      if (responseTemplate?.next_best_actions?.length > 0) {
        return responseTemplate.next_best_actions;
      }
    } catch (error) {
      console.error("[Chat] Failed to get response template from knowledge base:", error);
    }
  }
  return ["\u6211\u60F3\u4E86\u89E3\u66F4\u591A", "\u5982\u4F55\u9810\u7D04", "\u806F\u7D61\u771F\u4EBA"];
}
async function onRequestPost(context) {
  const { onRequestPostPipeline: onRequestPostPipeline2 } = await Promise.resolve().then(() => (init_chat_pipeline(), chat_pipeline_exports));
  return onRequestPostPipeline2(context);
}
var import_checked_fetch19, knowledgeBase, llmService, contextManager, knowledgeBaseLoading, faqHandlingRules;
var init_chat = __esm({
  "api/chat.ts"() {
    init_functionsRoutes_0_37336205855784055();
    import_checked_fetch19 = __toESM(require_checked_fetch(), 1);
    init_llm();
    init_knowledge();
    init_contextManager();
    init_responseTemplates();
    knowledgeBase = null;
    llmService = null;
    contextManager = null;
    knowledgeBaseLoading = null;
    __name(loadKnowledgeBase, "loadKnowledgeBase");
    __name(initLLMService, "initLLMService");
    __name(initContextManager, "initContextManager");
    __name(buildResponse, "buildResponse");
    faqHandlingRules = {
      location_inquiry: {
        shouldCheckFAQ: /* @__PURE__ */ __name(() => true, "shouldCheckFAQ")
      },
      price_inquiry: {
        shouldCheckFAQ: /* @__PURE__ */ __name((msg) => {
          const lower = msg.toLowerCase();
          return ["\u53EF\u4EE5\u8DDF\u6211\u8AAA\u5230", "\u8AAA\u5230\u591A\u7D30", "\u54EA\u4E9B\u4E00\u5B9A\u8981", "\u518D\u554F\u771F\u4EBA", "\u5831\u50F9\u7BC4\u570D"].some((k) => lower.includes(k));
        }, "shouldCheckFAQ"),
        faqFilter: /* @__PURE__ */ __name((faq) => faq.critical && faq.id === "policy_price_scope", "faqFilter")
      },
      booking_inquiry: {
        shouldCheckFAQ: /* @__PURE__ */ __name((msg) => {
          const lower = msg.toLowerCase();
          return ["\u6539\u671F", "\u53D6\u6D88", "reschedule", "cancel"].some((k) => lower.includes(k));
        }, "shouldCheckFAQ"),
        faqFilter: /* @__PURE__ */ __name((faq, message) => {
          if (!faq.critical) return false;
          if (faq.id === "policy_reschedule_cancel") return true;
          if (message && faq.keywords && faq.keywords.some(
            (k) => message.toLowerCase().includes(k.toLowerCase())
          )) return true;
          return false;
        }, "faqFilter")
      }
    };
    __name(handleFAQIfNeeded, "handleFAQIfNeeded");
    __name(classifyIntent, "classifyIntent");
    __name(extractEntityByPatterns, "extractEntityByPatterns");
    __name(extractEntities, "extractEntities");
    __name(getSuggestedQuickReplies, "getSuggestedQuickReplies");
    __name(onRequestPost, "onRequestPost");
  }
});

// api/faq-menu.ts
async function loadKnowledgeBase2(request) {
  if (knowledgeBase2 && knowledgeBase2.isLoaded()) {
    return knowledgeBase2;
  }
  if (knowledgeBaseLoading2) {
    console.log("[FAQ Menu] Knowledge base is loading, waiting...");
    return await knowledgeBaseLoading2;
  }
  if (knowledgeBase2 && !knowledgeBase2.isLoaded()) {
    console.log("[FAQ Menu] Knowledge base exists but not loaded, recreating...");
    knowledgeBase2 = null;
  }
  knowledgeBaseLoading2 = (async () => {
    try {
      if (!knowledgeBase2) {
        knowledgeBase2 = new KnowledgeBase();
      }
      let baseUrl;
      if (request) {
        const url = new URL(request.url);
        baseUrl = `${url.protocol}//${url.host}`;
      }
      if (!knowledgeBase2.isLoaded()) {
        await knowledgeBase2.load(baseUrl);
      }
      return knowledgeBase2;
    } catch (error) {
      console.error("[FAQ Menu] Knowledge base loading failed, clearing instance:", error);
      knowledgeBase2 = null;
      knowledgeBaseLoading2 = null;
      throw error;
    } finally {
      knowledgeBaseLoading2 = null;
    }
  })();
  return await knowledgeBaseLoading2;
}
async function onRequestGet(context) {
  const { request } = context;
  const corsHeaders = {
    "Access-Control-Allow-Origin": request.headers.get("Origin") || "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  try {
    console.log("[FAQ Menu] Loading knowledge base...");
    const kb = await loadKnowledgeBase2(request);
    console.log("[FAQ Menu] Knowledge base loaded successfully");
    const faqDetailed = kb.getFAQDetailed();
    if (!faqDetailed) {
      return new Response(
        JSON.stringify({ error: "FAQ data not available" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const categories = Object.entries(faqDetailed.categories).map(([categoryId, category]) => {
      if (!category || !category.questions) {
        return null;
      }
      const questions = category.questions.slice(0, 8).map((q) => ({
        id: q.id,
        question: q.question
      }));
      return {
        id: categoryId,
        title: category.title,
        questions
      };
    }).filter((cat) => cat !== null);
    const response = {
      categories
    };
    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[FAQ Menu Error]", error);
    console.error("[FAQ Menu Error] Error details:", error instanceof Error ? {
      message: error.message,
      stack: error.stack?.substring(0, 500)
    } : String(error));
    return new Response(
      JSON.stringify({
        error: "Failed to load FAQ menu",
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
var import_checked_fetch20, knowledgeBase2, knowledgeBaseLoading2;
var init_faq_menu = __esm({
  "api/faq-menu.ts"() {
    init_functionsRoutes_0_37336205855784055();
    import_checked_fetch20 = __toESM(require_checked_fetch(), 1);
    init_knowledge();
    knowledgeBase2 = null;
    knowledgeBaseLoading2 = null;
    __name(loadKnowledgeBase2, "loadKnowledgeBase");
    __name(onRequestGet, "onRequestGet");
  }
});

// ../.wrangler/tmp/pages-PSJ4Kd/functionsRoutes-0.37336205855784055.mjs
var routes;
var init_functionsRoutes_0_37336205855784055 = __esm({
  "../.wrangler/tmp/pages-PSJ4Kd/functionsRoutes-0.37336205855784055.mjs"() {
    init_chat();
    init_faq_menu();
    routes = [
      {
        routePath: "/api/chat",
        mountPath: "/api",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost]
      },
      {
        routePath: "/api/faq-menu",
        mountPath: "/api",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet]
      }
    ];
  }
});

// ../.wrangler/tmp/bundle-Ryusmq/middleware-loader.entry.ts
init_functionsRoutes_0_37336205855784055();
var import_checked_fetch27 = __toESM(require_checked_fetch());

// ../.wrangler/tmp/bundle-Ryusmq/middleware-insertion-facade.js
init_functionsRoutes_0_37336205855784055();
var import_checked_fetch25 = __toESM(require_checked_fetch());

// ../node_modules/wrangler/templates/pages-template-worker.ts
init_functionsRoutes_0_37336205855784055();
var import_checked_fetch22 = __toESM(require_checked_fetch());

// ../node_modules/wrangler/node_modules/path-to-regexp/dist.es2015/index.js
init_functionsRoutes_0_37336205855784055();
var import_checked_fetch21 = __toESM(require_checked_fetch());
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// ../node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_functionsRoutes_0_37336205855784055();
var import_checked_fetch23 = __toESM(require_checked_fetch());
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
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

// ../node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_functionsRoutes_0_37336205855784055();
var import_checked_fetch24 = __toESM(require_checked_fetch());
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-Ryusmq/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// ../node_modules/wrangler/templates/middleware/common.ts
init_functionsRoutes_0_37336205855784055();
var import_checked_fetch26 = __toESM(require_checked_fetch());
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-Ryusmq/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
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
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
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
/*! Bundled license information:

@google/generative-ai/dist/index.mjs:
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
*/
//# sourceMappingURL=functionsWorker-0.45657729076384224.mjs.map
