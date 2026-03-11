// src/lib/environment.ts
import path from "path";
import fs from "fs-extra";
import minimist from "minimist";
import _ from "lodash";
var cmdArgs = minimist(process.argv.slice(2));
var envVars = process.env;
var Environment = class {
  /** 命令行参数 */
  cmdArgs;
  /** 环境变量 */
  envVars;
  /** 环境名称 */
  env;
  /** 服务名称 */
  name;
  /** 服务地址 */
  host;
  /** 服务端口 */
  port;
  /** 包参数 */
  package;
  constructor(options = {}) {
    const { cmdArgs: cmdArgs2, envVars: envVars2, package: _package } = options;
    this.cmdArgs = cmdArgs2;
    this.envVars = envVars2;
    this.env = _.defaultTo(cmdArgs2.env || envVars2.SERVER_ENV, "dev");
    this.name = cmdArgs2.name || envVars2.SERVER_NAME || void 0;
    this.host = cmdArgs2.host || envVars2.SERVER_HOST || void 0;
    this.port = Number(cmdArgs2.port || envVars2.SERVER_PORT) ? Number(cmdArgs2.port || envVars2.SERVER_PORT) : void 0;
    this.package = _package;
  }
};
var environment_default = new Environment({
  cmdArgs,
  envVars,
  package: JSON.parse(fs.readFileSync(path.join(path.resolve(), "package.json")).toString())
});

// src/lib/configs/service-config.ts
import path3 from "path";
import fs3 from "fs-extra";
import yaml from "yaml";
import _3 from "lodash";

// src/lib/util.ts
import os from "os";
import path2 from "path";
import crypto from "crypto";
import { Readable, Writable } from "stream";
import "colors";
import mime from "mime";
import axios from "axios";
import fs2 from "fs-extra";
import { v1 as uuid } from "uuid";
import { format as dateFormat } from "date-fns";
import CRC32 from "crc-32";
import randomstring from "randomstring";
import _2 from "lodash";
import { CronJob } from "cron";

// src/lib/http-status-codes.ts
var http_status_codes_default = {
  CONTINUE: 100,
  //客户端应当继续发送请求。这个临时响应是用来通知客户端它的部分请求已经被服务器接收，且仍未被拒绝。客户端应当继续发送请求的剩余部分，或者如果请求已经完成，忽略这个响应。服务器必须在请求完成后向客户端发送一个最终响应
  SWITCHING_PROTOCOLS: 101,
  //服务器已经理解了客户端的请求，并将通过Upgrade 消息头通知客户端采用不同的协议来完成这个请求。在发送完这个响应最后的空行后，服务器将会切换到在Upgrade 消息头中定义的那些协议。只有在切换新的协议更有好处的时候才应该采取类似措施。例如，切换到新的HTTP 版本比旧版本更有优势，或者切换到一个实时且同步的协议以传送利用此类特性的资源
  PROCESSING: 102,
  //处理将被继续执行
  OK: 200,
  //请求已成功，请求所希望的响应头或数据体将随此响应返回
  CREATED: 201,
  //请求已经被实现，而且有一个新的资源已经依据请求的需要而建立，且其 URI 已经随Location 头信息返回。假如需要的资源无法及时建立的话，应当返回 '202 Accepted'
  ACCEPTED: 202,
  //服务器已接受请求，但尚未处理。正如它可能被拒绝一样，最终该请求可能会也可能不会被执行。在异步操作的场合下，没有比发送这个状态码更方便的做法了。返回202状态码的响应的目的是允许服务器接受其他过程的请求（例如某个每天只执行一次的基于批处理的操作），而不必让客户端一直保持与服务器的连接直到批处理操作全部完成。在接受请求处理并返回202状态码的响应应当在返回的实体中包含一些指示处理当前状态的信息，以及指向处理状态监视器或状态预测的指针，以便用户能够估计操作是否已经完成
  NON_AUTHORITATIVE_INFO: 203,
  //服务器已成功处理了请求，但返回的实体头部元信息不是在原始服务器上有效的确定集合，而是来自本地或者第三方的拷贝。当前的信息可能是原始版本的子集或者超集。例如，包含资源的元数据可能导致原始服务器知道元信息的超级。使用此状态码不是必须的，而且只有在响应不使用此状态码便会返回200 OK的情况下才是合适的
  NO_CONTENT: 204,
  //服务器成功处理了请求，但不需要返回任何实体内容，并且希望返回更新了的元信息。响应可能通过实体头部的形式，返回新的或更新后的元信息。如果存在这些头部信息，则应当与所请求的变量相呼应。如果客户端是浏览器的话，那么用户浏览器应保留发送了该请求的页面，而不产生任何文档视图上的变化，即使按照规范新的或更新后的元信息应当被应用到用户浏览器活动视图中的文档。由于204响应被禁止包含任何消息体，因此它始终以消息头后的第一个空行结尾
  RESET_CONTENT: 205,
  //服务器成功处理了请求，且没有返回任何内容。但是与204响应不同，返回此状态码的响应要求请求者重置文档视图。该响应主要是被用于接受用户输入后，立即重置表单，以便用户能够轻松地开始另一次输入。与204响应一样，该响应也被禁止包含任何消息体，且以消息头后的第一个空行结束
  PARTIAL_CONTENT: 206,
  //服务器已经成功处理了部分 GET 请求。类似于FlashGet或者迅雷这类的HTTP下载工具都是使用此类响应实现断点续传或者将一个大文档分解为多个下载段同时下载。该请求必须包含 Range 头信息来指示客户端希望得到的内容范围，并且可能包含 If-Range 来作为请求条件。响应必须包含如下的头部域：Content-Range 用以指示本次响应中返回的内容的范围；如果是Content-Type为multipart/byteranges的多段下载，则每一段multipart中都应包含Content-Range域用以指示本段的内容范围。假如响应中包含Content-Length，那么它的数值必须匹配它返回的内容范围的真实字节数。Date和ETag或Content-Location，假如同样的请求本应该返回200响应。Expires, Cache-Control，和/或 Vary，假如其值可能与之前相同变量的其他响应对应的值不同的话。假如本响应请求使用了 If-Range 强缓存验证，那么本次响应不应该包含其他实体头；假如本响应的请求使用了 If-Range 弱缓存验证，那么本次响应禁止包含其他实体头；这避免了缓存的实体内容和更新了的实体头信息之间的不一致。否则，本响应就应当包含所有本应该返回200响应中应当返回的所有实体头部域。假如 ETag 或 Latest-Modified 头部不能精确匹配的话，则客户端缓存应禁止将206响应返回的内容与之前任何缓存过的内容组合在一起。任何不支持 Range 以及 Content-Range 头的缓存都禁止缓存206响应返回的内容
  MULTIPLE_STATUS: 207,
  //代表之后的消息体将是一个XML消息，并且可能依照之前子请求数量的不同，包含一系列独立的响应代码
  MULTIPLE_CHOICES: 300,
  //被请求的资源有一系列可供选择的回馈信息，每个都有自己特定的地址和浏览器驱动的商议信息。用户或浏览器能够自行选择一个首选的地址进行重定向。除非这是一个HEAD请求，否则该响应应当包括一个资源特性及地址的列表的实体，以便用户或浏览器从中选择最合适的重定向地址。这个实体的格式由Content-Type定义的格式所决定。浏览器可能根据响应的格式以及浏览器自身能力，自动作出最合适的选择。当然，RFC 2616规范并没有规定这样的自动选择该如何进行。如果服务器本身已经有了首选的回馈选择，那么在Location中应当指明这个回馈的 URI；浏览器可能会将这个 Location 值作为自动重定向的地址。此外，除非额外指定，否则这个响应也是可缓存的
  MOVED_PERMANENTLY: 301,
  //被请求的资源已永久移动到新位置，并且将来任何对此资源的引用都应该使用本响应返回的若干个URI之一。如果可能，拥有链接编辑功能的客户端应当自动把请求的地址修改为从服务器反馈回来的地址。除非额外指定，否则这个响应也是可缓存的。新的永久性的URI应当在响应的Location域中返回。除非这是一个HEAD请求，否则响应的实体中应当包含指向新的URI的超链接及简短说明。如果这不是一个GET或者HEAD请求，因此浏览器禁止自动进行重定向，除非得到用户的确认，因为请求的条件可能因此发生变化。注意：对于某些使用 HTTP/1.0 协议的浏览器，当它们发送的POST请求得到了一个301响应的话，接下来的重定向请求将会变成GET方式
  FOUND: 302,
  //请求的资源现在临时从不同的URI响应请求。由于这样的重定向是临时的，客户端应当继续向原有地址发送以后的请求。只有在Cache-Control或Expires中进行了指定的情况下，这个响应才是可缓存的。新的临时性的URI应当在响应的 Location 域中返回。除非这是一个HEAD请求，否则响应的实体中应当包含指向新的URI的超链接及简短说明。如果这不是一个GET或者HEAD请求，那么浏览器禁止自动进行重定向，除非得到用户的确认，因为请求的条件可能因此发生变化。注意：虽然RFC 1945和RFC 2068规范不允许客户端在重定向时改变请求的方法，但是很多现存的浏览器将302响应视作为303响应，并且使用GET方式访问在Location中规定的URI，而无视原先请求的方法。状态码303和307被添加了进来，用以明确服务器期待客户端进行何种反应
  SEE_OTHER: 303,
  //对应当前请求的响应可以在另一个URI上被找到，而且客户端应当采用 GET 的方式访问那个资源。这个方法的存在主要是为了允许由脚本激活的POST请求输出重定向到一个新的资源。这个新的 URI 不是原始资源的替代引用。同时，303响应禁止被缓存。当然，第二个请求（重定向）可能被缓存。新的 URI 应当在响应的Location域中返回。除非这是一个HEAD请求，否则响应的实体中应当包含指向新的URI的超链接及简短说明。注意：许多 HTTP/1.1 版以前的浏览器不能正确理解303状态。如果需要考虑与这些浏览器之间的互动，302状态码应该可以胜任，因为大多数的浏览器处理302响应时的方式恰恰就是上述规范要求客户端处理303响应时应当做的
  NOT_MODIFIED: 304,
  //如果客户端发送了一个带条件的GET请求且该请求已被允许，而文档的内容（自上次访问以来或者根据请求的条件）并没有改变，则服务器应当返回这个状态码。304响应禁止包含消息体，因此始终以消息头后的第一个空行结尾。该响应必须包含以下的头信息：Date，除非这个服务器没有时钟。假如没有时钟的服务器也遵守这些规则，那么代理服务器以及客户端可以自行将Date字段添加到接收到的响应头中去（正如RFC 2068中规定的一样），缓存机制将会正常工作。ETag或 Content-Location，假如同样的请求本应返回200响应。Expires, Cache-Control，和/或Vary，假如其值可能与之前相同变量的其他响应对应的值不同的话。假如本响应请求使用了强缓存验证，那么本次响应不应该包含其他实体头；否则（例如，某个带条件的 GET 请求使用了弱缓存验证），本次响应禁止包含其他实体头；这避免了缓存了的实体内容和更新了的实体头信息之间的不一致。假如某个304响应指明了当前某个实体没有缓存，那么缓存系统必须忽视这个响应，并且重复发送不包含限制条件的请求。假如接收到一个要求更新某个缓存条目的304响应，那么缓存系统必须更新整个条目以反映所有在响应中被更新的字段的值
  USE_PROXY: 305,
  //被请求的资源必须通过指定的代理才能被访问。Location域中将给出指定的代理所在的URI信息，接收者需要重复发送一个单独的请求，通过这个代理才能访问相应资源。只有原始服务器才能建立305响应。注意：RFC 2068中没有明确305响应是为了重定向一个单独的请求，而且只能被原始服务器建立。忽视这些限制可能导致严重的安全后果
  UNUSED: 306,
  //在最新版的规范中，306状态码已经不再被使用
  TEMPORARY_REDIRECT: 307,
  //请求的资源现在临时从不同的URI 响应请求。由于这样的重定向是临时的，客户端应当继续向原有地址发送以后的请求。只有在Cache-Control或Expires中进行了指定的情况下，这个响应才是可缓存的。新的临时性的URI 应当在响应的Location域中返回。除非这是一个HEAD请求，否则响应的实体中应当包含指向新的URI 的超链接及简短说明。因为部分浏览器不能识别307响应，因此需要添加上述必要信息以便用户能够理解并向新的 URI 发出访问请求。如果这不是一个GET或者HEAD请求，那么浏览器禁止自动进行重定向，除非得到用户的确认，因为请求的条件可能因此发生变化
  BAD_REQUEST: 400,
  //1.语义有误，当前请求无法被服务器理解。除非进行修改，否则客户端不应该重复提交这个请求 2.请求参数有误
  UNAUTHORIZED: 401,
  //当前请求需要用户验证。该响应必须包含一个适用于被请求资源的 WWW-Authenticate 信息头用以询问用户信息。客户端可以重复提交一个包含恰当的 Authorization 头信息的请求。如果当前请求已经包含了 Authorization 证书，那么401响应代表着服务器验证已经拒绝了那些证书。如果401响应包含了与前一个响应相同的身份验证询问，且浏览器已经至少尝试了一次验证，那么浏览器应当向用户展示响应中包含的实体信息，因为这个实体信息中可能包含了相关诊断信息。参见RFC 2617
  PAYMENT_REQUIRED: 402,
  //该状态码是为了将来可能的需求而预留的
  FORBIDDEN: 403,
  //服务器已经理解请求，但是拒绝执行它。与401响应不同的是，身份验证并不能提供任何帮助，而且这个请求也不应该被重复提交。如果这不是一个HEAD请求，而且服务器希望能够讲清楚为何请求不能被执行，那么就应该在实体内描述拒绝的原因。当然服务器也可以返回一个404响应，假如它不希望让客户端获得任何信息
  NOT_FOUND: 404,
  //请求失败，请求所希望得到的资源未被在服务器上发现。没有信息能够告诉用户这个状况到底是暂时的还是永久的。假如服务器知道情况的话，应当使用410状态码来告知旧资源因为某些内部的配置机制问题，已经永久的不可用，而且没有任何可以跳转的地址。404这个状态码被广泛应用于当服务器不想揭示到底为何请求被拒绝或者没有其他适合的响应可用的情况下
  METHOD_NOT_ALLOWED: 405,
  //请求行中指定的请求方法不能被用于请求相应的资源。该响应必须返回一个Allow 头信息用以表示出当前资源能够接受的请求方法的列表。鉴于PUT，DELETE方法会对服务器上的资源进行写操作，因而绝大部分的网页服务器都不支持或者在默认配置下不允许上述请求方法，对于此类请求均会返回405错误
  NO_ACCEPTABLE: 406,
  //请求的资源的内容特性无法满足请求头中的条件，因而无法生成响应实体。除非这是一个 HEAD 请求，否则该响应就应当返回一个包含可以让用户或者浏览器从中选择最合适的实体特性以及地址列表的实体。实体的格式由Content-Type头中定义的媒体类型决定。浏览器可以根据格式及自身能力自行作出最佳选择。但是，规范中并没有定义任何作出此类自动选择的标准
  PROXY_AUTHENTICATION_REQUIRED: 407,
  //与401响应类似，只不过客户端必须在代理服务器上进行身份验证。代理服务器必须返回一个Proxy-Authenticate用以进行身份询问。客户端可以返回一个Proxy-Authorization信息头用以验证。参见RFC 2617
  REQUEST_TIMEOUT: 408,
  //请求超时。客户端没有在服务器预备等待的时间内完成一个请求的发送。客户端可以随时再次提交这一请求而无需进行任何更改
  CONFLICT: 409,
  //由于和被请求的资源的当前状态之间存在冲突，请求无法完成。这个代码只允许用在这样的情况下才能被使用：用户被认为能够解决冲突，并且会重新提交新的请求。该响应应当包含足够的信息以便用户发现冲突的源头。冲突通常发生于对PUT请求的处理中。例如，在采用版本检查的环境下，某次PUT提交的对特定资源的修改请求所附带的版本信息与之前的某个（第三方）请求向冲突，那么此时服务器就应该返回一个409错误，告知用户请求无法完成。此时，响应实体中很可能会包含两个冲突版本之间的差异比较，以便用户重新提交归并以后的新版本
  GONE: 410,
  //被请求的资源在服务器上已经不再可用，而且没有任何已知的转发地址。这样的状况应当被认为是永久性的。如果可能，拥有链接编辑功能的客户端应当在获得用户许可后删除所有指向这个地址的引用。如果服务器不知道或者无法确定这个状况是否是永久的，那么就应该使用404状态码。除非额外说明，否则这个响应是可缓存的。410响应的目的主要是帮助网站管理员维护网站，通知用户该资源已经不再可用，并且服务器拥有者希望所有指向这个资源的远端连接也被删除。这类事件在限时、增值服务中很普遍。同样，410响应也被用于通知客户端在当前服务器站点上，原本属于某个个人的资源已经不再可用。当然，是否需要把所有永久不可用的资源标记为'410 Gone'，以及是否需要保持此标记多长时间，完全取决于服务器拥有者
  LENGTH_REQUIRED: 411,
  //服务器拒绝在没有定义Content-Length头的情况下接受请求。在添加了表明请求消息体长度的有效Content-Length头之后，客户端可以再次提交该请求 
  PRECONDITION_FAILED: 412,
  //服务器在验证在请求的头字段中给出先决条件时，没能满足其中的一个或多个。这个状态码允许客户端在获取资源时在请求的元信息（请求头字段数据）中设置先决条件，以此避免该请求方法被应用到其希望的内容以外的资源上
  REQUEST_ENTITY_TOO_LARGE: 413,
  //服务器拒绝处理当前请求，因为该请求提交的实体数据大小超过了服务器愿意或者能够处理的范围。此种情况下，服务器可以关闭连接以免客户端继续发送此请求。如果这个状况是临时的，服务器应当返回一个 Retry-After 的响应头，以告知客户端可以在多少时间以后重新尝试
  REQUEST_URI_TOO_LONG: 414,
  //请求的URI长度超过了服务器能够解释的长度，因此服务器拒绝对该请求提供服务。这比较少见，通常的情况包括：本应使用POST方法的表单提交变成了GET方法，导致查询字符串（Query String）过长。重定向URI “黑洞”，例如每次重定向把旧的URI作为新的URI的一部分，导致在若干次重定向后URI超长。客户端正在尝试利用某些服务器中存在的安全漏洞攻击服务器。这类服务器使用固定长度的缓冲读取或操作请求的URI，当GET后的参数超过某个数值后，可能会产生缓冲区溢出，导致任意代码被执行[1]。没有此类漏洞的服务器，应当返回414状态码
  UNSUPPORTED_MEDIA_TYPE: 415,
  //对于当前请求的方法和所请求的资源，请求中提交的实体并不是服务器中所支持的格式，因此请求被拒绝
  REQUESTED_RANGE_NOT_SATISFIABLE: 416,
  //如果请求中包含了Range请求头，并且Range中指定的任何数据范围都与当前资源的可用范围不重合，同时请求中又没有定义If-Range请求头，那么服务器就应当返回416状态码。假如Range使用的是字节范围，那么这种情况就是指请求指定的所有数据范围的首字节位置都超过了当前资源的长度。服务器也应当在返回416状态码的同时，包含一个Content-Range实体头，用以指明当前资源的长度。这个响应也被禁止使用multipart/byteranges作为其 Content-Type
  EXPECTION_FAILED: 417,
  //在请求头Expect中指定的预期内容无法被服务器满足，或者这个服务器是一个代理服务器，它有明显的证据证明在当前路由的下一个节点上，Expect的内容无法被满足
  TOO_MANY_CONNECTIONS: 421,
  //从当前客户端所在的IP地址到服务器的连接数超过了服务器许可的最大范围。通常，这里的IP地址指的是从服务器上看到的客户端地址（比如用户的网关或者代理服务器地址）。在这种情况下，连接数的计算可能涉及到不止一个终端用户
  UNPROCESSABLE_ENTITY: 422,
  //请求格式正确，但是由于含有语义错误，无法响应
  FAILED_DEPENDENCY: 424,
  //由于之前的某个请求发生的错误，导致当前请求失败，例如PROPPATCH
  UNORDERED_COLLECTION: 425,
  //在WebDav Advanced Collections 草案中定义，但是未出现在《WebDAV 顺序集协议》（RFC 3658）中
  UPGRADE_REQUIRED: 426,
  //客户端应当切换到TLS/1.0
  RETRY_WITH: 449,
  //由微软扩展，代表请求应当在执行完适当的操作后进行重试
  INTERNAL_SERVER_ERROR: 500,
  //服务器遇到了一个未曾预料的状况，导致了它无法完成对请求的处理。一般来说，这个问题都会在服务器的程序码出错时出现
  NOT_IMPLEMENTED: 501,
  //服务器不支持当前请求所需要的某个功能。当服务器无法识别请求的方法，并且无法支持其对任何资源的请求
  BAD_GATEWAY: 502,
  //作为网关或者代理工作的服务器尝试执行请求时，从上游服务器接收到无效的响应
  SERVICE_UNAVAILABLE: 503,
  //由于临时的服务器维护或者过载，服务器当前无法处理请求。这个状况是临时的，并且将在一段时间以后恢复。如果能够预计延迟时间，那么响应中可以包含一个 Retry-After 头用以标明这个延迟时间。如果没有给出这个 Retry-After 信息，那么客户端应当以处理500响应的方式处理它。注意：503状态码的存在并不意味着服务器在过载的时候必须使用它。某些服务器只不过是希望拒绝客户端的连接
  GATEWAY_TIMEOUT: 504,
  //作为网关或者代理工作的服务器尝试执行请求时，未能及时从上游服务器（URI标识出的服务器，例如HTTP、FTP、LDAP）或者辅助服务器（例如DNS）收到响应。注意：某些代理服务器在DNS查询超时时会返回400或者500错误
  HTTP_VERSION_NOT_SUPPORTED: 505,
  //服务器不支持，或者拒绝支持在请求中使用的HTTP版本。这暗示着服务器不能或不愿使用与客户端相同的版本。响应中应当包含一个描述了为何版本不被支持以及服务器支持哪些协议的实体
  VARIANT_ALSO_NEGOTIATES: 506,
  //服务器存在内部配置错误：被请求的协商变元资源被配置为在透明内容协商中使用自己，因此在一个协商处理中不是一个合适的重点
  INSUFFICIENT_STORAGE: 507,
  //服务器无法存储完成请求所必须的内容。这个状况被认为是临时的
  BANDWIDTH_LIMIT_EXCEEDED: 509,
  //服务器达到带宽限制。这不是一个官方的状态码，但是仍被广泛使用
  NOT_EXTENDED: 510
  //获取资源所需要的策略并没有没满足
};

// src/lib/util.ts
var autoIdMap = /* @__PURE__ */ new Map();
var util = {
  is2DArrays(value) {
    return _2.isArray(value) && (!value[0] || _2.isArray(value[0]) && _2.isArray(value[value.length - 1]));
  },
  uuid: (separator = true) => separator ? uuid() : uuid().replace(/\-/g, ""),
  autoId: (prefix = "") => {
    let index = autoIdMap.get(prefix);
    if (index > 999999) index = 0;
    autoIdMap.set(prefix, (index || 0) + 1);
    return `${prefix}${index || 1}`;
  },
  ignoreJSONParse(value) {
    const result = _2.attempt(() => JSON.parse(value));
    if (_2.isError(result)) return null;
    return result;
  },
  generateRandomString(options) {
    return randomstring.generate(options);
  },
  getResponseContentType(value) {
    return value.headers ? value.headers["content-type"] || value.headers["Content-Type"] : null;
  },
  mimeToExtension(value) {
    let extension = mime.getExtension(value);
    if (extension == "mpga") return "mp3";
    return extension;
  },
  extractURLExtension(value) {
    const extname = path2.extname(new URL(value).pathname);
    return extname.substring(1).toLowerCase();
  },
  createCronJob(cronPatterns, callback) {
    if (!_2.isFunction(callback))
      throw new Error("callback must be an Function");
    return new CronJob(
      cronPatterns,
      () => callback(),
      null,
      false,
      "Asia/Shanghai"
    );
  },
  getDateString(format = "yyyy-MM-dd", date = /* @__PURE__ */ new Date()) {
    return dateFormat(date, format);
  },
  getIPAddressesByIPv4() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (let name in interfaces) {
      const networks = interfaces[name];
      const results = networks.filter(
        (network) => network.family === "IPv4" && network.address !== "127.0.0.1" && !network.internal
      );
      if (results[0] && results[0].address) addresses.push(results[0].address);
    }
    return addresses;
  },
  getMACAddressesByIPv4() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (let name in interfaces) {
      const networks = interfaces[name];
      const results = networks.filter(
        (network) => network.family === "IPv4" && network.address !== "127.0.0.1" && !network.internal
      );
      if (results[0] && results[0].mac) addresses.push(results[0].mac);
    }
    return addresses;
  },
  generateSSEData(event, data, retry) {
    return `event: ${event || "message"}
data: ${(data || "").replace(/\n/g, "\\n").replace(/\s/g, "\\s")}
retry: ${retry || 3e3}

`;
  },
  buildDataBASE64(type, ext, buffer) {
    return `data:${type}/${ext.replace("jpg", "jpeg")};base64,${buffer.toString(
      "base64"
    )}`;
  },
  isLinux() {
    return os.platform() !== "win32";
  },
  isIPAddress(value) {
    return _2.isString(value) && (/^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/.test(
      value
    ) || /\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*/.test(
      value
    ));
  },
  isPort(value) {
    return _2.isNumber(value) && value > 0 && value < 65536;
  },
  isReadStream(value) {
    return value && (value instanceof Readable || "readable" in value || value.readable);
  },
  isWriteStream(value) {
    return value && (value instanceof Writable || "writable" in value || value.writable);
  },
  isHttpStatusCode(value) {
    return _2.isNumber(value) && Object.values(http_status_codes_default).includes(value);
  },
  isURL(value) {
    return !_2.isUndefined(value) && /^(http|https)/.test(value);
  },
  isSrc(value) {
    return !_2.isUndefined(value) && /^\/.+\.[0-9a-zA-Z]+(\?.+)?$/.test(value);
  },
  isBASE64(value) {
    return !_2.isUndefined(value) && /^[a-zA-Z0-9\/\+]+(=?)+$/.test(value);
  },
  isBASE64Data(value) {
    return /^data:/.test(value);
  },
  extractBASE64DataFormat(value) {
    const match = value.trim().match(/^data:(.+);base64,/);
    if (!match) return null;
    return match[1];
  },
  removeBASE64DataHeader(value) {
    return value.replace(/^data:(.+);base64,/, "");
  },
  isDataString(value) {
    return /^(base64|json):/.test(value);
  },
  isStringNumber(value) {
    return _2.isFinite(Number(value));
  },
  isUnixTimestamp(value) {
    return /^[0-9]{10}$/.test(`${value}`);
  },
  isTimestamp(value) {
    return /^[0-9]{13}$/.test(`${value}`);
  },
  isEmail(value) {
    return /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/.test(
      value
    );
  },
  isAsyncFunction(value) {
    return Object.prototype.toString.call(value) === "[object AsyncFunction]";
  },
  async isAPNG(filePath) {
    let head;
    const readStream = fs2.createReadStream(filePath, { start: 37, end: 40 });
    const readPromise = new Promise((resolve, reject) => {
      readStream.once("end", resolve);
      readStream.once("error", reject);
    });
    readStream.once("data", (data) => head = data);
    await readPromise;
    return head.compare(Buffer.from([97, 99, 84, 76])) === 0;
  },
  unixTimestamp() {
    return parseInt(`${Date.now() / 1e3}`);
  },
  timestamp() {
    return Date.now();
  },
  urlJoin(...values) {
    let url = "";
    for (let i = 0; i < values.length; i++)
      url += `${i > 0 ? "/" : ""}${values[i].replace(/^\/*/, "").replace(/\/*$/, "")}`;
    return url;
  },
  millisecondsToHmss(milliseconds) {
    if (_2.isString(milliseconds)) return milliseconds;
    milliseconds = parseInt(milliseconds);
    const sec = Math.floor(milliseconds / 1e3);
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec - hours * 3600) / 60);
    const seconds = sec - hours * 3600 - minutes * 60;
    const ms = milliseconds % 6e4 - seconds * 1e3;
    return `${hours > 9 ? hours : "0" + hours}:${minutes > 9 ? minutes : "0" + minutes}:${seconds > 9 ? seconds : "0" + seconds}.${ms}`;
  },
  millisecondsToTimeString(milliseconds) {
    if (milliseconds < 1e3) return `${milliseconds}ms`;
    if (milliseconds < 6e4)
      return `${parseFloat((milliseconds / 1e3).toFixed(2))}s`;
    return `${Math.floor(milliseconds / 1e3 / 60)}m${Math.floor(
      milliseconds / 1e3 % 60
    )}s`;
  },
  rgbToHex(r, g, b) {
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },
  hexToRgb(hex) {
    const value = parseInt(hex.replace(/^#/, ""), 16);
    return [value >> 16 & 255, value >> 8 & 255, value & 255];
  },
  md5(value) {
    return crypto.createHash("md5").update(value).digest("hex");
  },
  crc32(value) {
    return _2.isBuffer(value) ? CRC32.buf(value) : CRC32.str(value);
  },
  arrayParse(value) {
    return _2.isArray(value) ? value : [value];
  },
  booleanParse(value) {
    return value === "true" || value === true ? true : false;
  },
  encodeBASE64(value) {
    return Buffer.from(value).toString("base64");
  },
  decodeBASE64(value) {
    return Buffer.from(value, "base64").toString();
  },
  async fetchFileBASE64(url) {
    const result = await axios.get(url, {
      responseType: "arraybuffer"
    });
    return result.data.toString("base64");
  }
};
var util_default = util;

// src/lib/configs/service-config.ts
var CONFIG_PATH = path3.join(path3.resolve(), "configs/", environment_default.env, "/service.yml");
var ServiceConfig = class _ServiceConfig {
  /** 服务名称 */
  name;
  /** @type {string} 服务绑定主机地址 */
  host;
  /** @type {number} 服务绑定端口 */
  port;
  /** @type {string} 服务路由前缀 */
  urlPrefix;
  /** @type {string} 服务绑定地址（外部访问地址） */
  bindAddress;
  constructor(options) {
    const { name, host, port, urlPrefix, bindAddress } = options || {};
    this.name = _3.defaultTo(name, "jimeng-free-api");
    this.host = _3.defaultTo(host, "0.0.0.0");
    this.port = _3.defaultTo(port, 5566);
    this.urlPrefix = _3.defaultTo(urlPrefix, "");
    this.bindAddress = bindAddress;
  }
  get addressHost() {
    if (this.bindAddress) return this.bindAddress;
    const ipAddresses = util_default.getIPAddressesByIPv4();
    for (let ipAddress of ipAddresses) {
      if (ipAddress === this.host)
        return ipAddress;
    }
    return ipAddresses[0] || "127.0.0.1";
  }
  get address() {
    return `${this.addressHost}:${this.port}`;
  }
  get pageDirUrl() {
    return `http://127.0.0.1:${this.port}/page`;
  }
  get publicDirUrl() {
    return `http://127.0.0.1:${this.port}/public`;
  }
  static load() {
    const external = _3.pickBy(environment_default, (v, k) => ["name", "host", "port"].includes(k) && !_3.isUndefined(v));
    if (!fs3.pathExistsSync(CONFIG_PATH)) return new _ServiceConfig(external);
    const data = yaml.parse(fs3.readFileSync(CONFIG_PATH).toString());
    return new _ServiceConfig({ ...data, ...external });
  }
};
var service_config_default = ServiceConfig.load();

// src/lib/configs/system-config.ts
import path4 from "path";
import fs4 from "fs-extra";
import yaml2 from "yaml";
import _4 from "lodash";
var CONFIG_PATH2 = path4.join(path4.resolve(), "configs/", environment_default.env, "/system.yml");
var SystemConfig = class _SystemConfig {
  /** 是否开启请求日志 */
  requestLog;
  /** 临时目录路径 */
  tmpDir;
  /** 日志目录路径 */
  logDir;
  /** 日志写入间隔（毫秒） */
  logWriteInterval;
  /** 日志文件有效期（毫秒） */
  logFileExpires;
  /** 公共目录路径 */
  publicDir;
  /** 临时文件有效期（毫秒） */
  tmpFileExpires;
  /** 请求体配置 */
  requestBody;
  /** 是否调试模式 */
  debug;
  constructor(options) {
    const { requestLog, tmpDir, logDir, logWriteInterval, logFileExpires, publicDir, tmpFileExpires, requestBody, debug } = options || {};
    this.requestLog = _4.defaultTo(requestLog, false);
    this.tmpDir = _4.defaultTo(tmpDir, "./tmp");
    this.logDir = _4.defaultTo(logDir, "./logs");
    this.logWriteInterval = _4.defaultTo(logWriteInterval, 200);
    this.logFileExpires = _4.defaultTo(logFileExpires, 262656e4);
    this.publicDir = _4.defaultTo(publicDir, "./public");
    this.tmpFileExpires = _4.defaultTo(tmpFileExpires, 864e5);
    this.requestBody = Object.assign(requestBody || {}, {
      enableTypes: ["form", "text", "xml"],
      // 移除 json，由自定义中间件处理
      encoding: "utf-8",
      formLimit: "100mb",
      jsonLimit: "100mb",
      textLimit: "100mb",
      xmlLimit: "100mb",
      formidable: {
        maxFileSize: "100mb"
      },
      multipart: true,
      parsedMethods: ["POST", "PUT", "PATCH"]
    });
    this.debug = _4.defaultTo(debug, true);
  }
  get rootDirPath() {
    return path4.resolve();
  }
  get tmpDirPath() {
    return path4.resolve(this.tmpDir);
  }
  get logDirPath() {
    return path4.resolve(this.logDir);
  }
  get publicDirPath() {
    return path4.resolve(this.publicDir);
  }
  static load() {
    if (!fs4.pathExistsSync(CONFIG_PATH2)) return new _SystemConfig();
    const data = yaml2.parse(fs4.readFileSync(CONFIG_PATH2).toString());
    return new _SystemConfig(data);
  }
};
var system_config_default = SystemConfig.load();

// src/lib/config.ts
var Config = class {
  /** 服务配置 */
  service = service_config_default;
  /** 系统配置 */
  system = system_config_default;
};
var config_default = new Config();

// src/lib/logger.ts
import path5 from "path";
import _util from "util";
import "colors";
import _5 from "lodash";
import fs5 from "fs-extra";
import { format as dateFormat2 } from "date-fns";
var isVercelEnv = process.env.VERCEL;
var LogWriter = class {
  #buffers = [];
  constructor() {
    !isVercelEnv && fs5.ensureDirSync(config_default.system.logDirPath);
    !isVercelEnv && this.work();
  }
  push(content) {
    const buffer = Buffer.from(content);
    this.#buffers.push(buffer);
  }
  writeSync(buffer) {
    !isVercelEnv && fs5.appendFileSync(path5.join(config_default.system.logDirPath, `/${util_default.getDateString()}.log`), buffer);
  }
  async write(buffer) {
    !isVercelEnv && await fs5.appendFile(path5.join(config_default.system.logDirPath, `/${util_default.getDateString()}.log`), buffer);
  }
  flush() {
    if (!this.#buffers.length) return;
    !isVercelEnv && fs5.appendFileSync(path5.join(config_default.system.logDirPath, `/${util_default.getDateString()}.log`), Buffer.concat(this.#buffers));
  }
  work() {
    if (!this.#buffers.length) return setTimeout(this.work.bind(this), config_default.system.logWriteInterval);
    const buffer = Buffer.concat(this.#buffers);
    this.#buffers = [];
    this.write(buffer).finally(() => setTimeout(this.work.bind(this), config_default.system.logWriteInterval)).catch((err) => console.error("Log write error:", err));
  }
};
var LogText = class {
  /** @type {string} 日志级别 */
  level;
  /** @type {string} 日志文本 */
  text;
  /** @type {string} 日志来源 */
  source;
  /** @type {Date} 日志发生时间 */
  time = /* @__PURE__ */ new Date();
  constructor(level, ...params) {
    this.level = level;
    this.text = _util.format.apply(null, params);
    this.source = this.#getStackTopCodeInfo();
  }
  #getStackTopCodeInfo() {
    const unknownInfo = { name: "unknown", codeLine: 0, codeColumn: 0 };
    const stackArray = new Error().stack.split("\n");
    const text = stackArray[4];
    if (!text)
      return unknownInfo;
    const match = text.match(/at (.+) \((.+)\)/) || text.match(/at (.+)/);
    if (!match || !_5.isString(match[2] || match[1]))
      return unknownInfo;
    const temp = match[2] || match[1];
    const _match = temp.match(/([a-zA-Z0-9_\-\.]+)\:(\d+)\:(\d+)$/);
    if (!_match)
      return unknownInfo;
    const [, scriptPath, codeLine, codeColumn] = _match;
    return {
      name: scriptPath ? scriptPath.replace(/.js$/, "") : "unknown",
      path: scriptPath || null,
      codeLine: parseInt(codeLine || 0),
      codeColumn: parseInt(codeColumn || 0)
    };
  }
  toString() {
    return `[${dateFormat2(this.time, "yyyy-MM-dd HH:mm:ss.SSS")}][${this.level}][${this.source.name}<${this.source.codeLine},${this.source.codeColumn}>] ${this.text}`;
  }
};
var Logger = class _Logger {
  /** @type {Object} 系统配置 */
  config = {};
  /** @type {Object} 日志级别映射 */
  static Level = {
    Success: "success",
    Info: "info",
    Log: "log",
    Debug: "debug",
    Warning: "warning",
    Error: "error",
    Fatal: "fatal"
  };
  /** @type {Object} 日志级别文本颜色樱色 */
  static LevelColor = {
    [_Logger.Level.Success]: "green",
    [_Logger.Level.Info]: "brightCyan",
    [_Logger.Level.Debug]: "white",
    [_Logger.Level.Warning]: "brightYellow",
    [_Logger.Level.Error]: "brightRed",
    [_Logger.Level.Fatal]: "red"
  };
  #writer;
  constructor() {
    this.#writer = new LogWriter();
  }
  header() {
    this.#writer.writeSync(Buffer.from(`

===================== LOG START ${dateFormat2(/* @__PURE__ */ new Date(), "yyyy-MM-dd HH:mm:ss.SSS")} =====================

`));
  }
  footer() {
    this.#writer.flush();
    this.#writer.writeSync(Buffer.from(`

===================== LOG END ${dateFormat2(/* @__PURE__ */ new Date(), "yyyy-MM-dd HH:mm:ss.SSS")} =====================

`));
  }
  success(...params) {
    const content = new LogText(_Logger.Level.Success, ...params).toString();
    console.info(content[_Logger.LevelColor[_Logger.Level.Success]]);
    this.#writer.push(content + "\n");
  }
  info(...params) {
    const content = new LogText(_Logger.Level.Info, ...params).toString();
    console.info(content[_Logger.LevelColor[_Logger.Level.Info]]);
    this.#writer.push(content + "\n");
  }
  log(...params) {
    const content = new LogText(_Logger.Level.Log, ...params).toString();
    console.log(content[_Logger.LevelColor[_Logger.Level.Log]]);
    this.#writer.push(content + "\n");
  }
  debug(...params) {
    if (!config_default.system.debug) return;
    const content = new LogText(_Logger.Level.Debug, ...params).toString();
    console.debug(content[_Logger.LevelColor[_Logger.Level.Debug]]);
    this.#writer.push(content + "\n");
  }
  warn(...params) {
    const content = new LogText(_Logger.Level.Warning, ...params).toString();
    console.warn(content[_Logger.LevelColor[_Logger.Level.Warning]]);
    this.#writer.push(content + "\n");
  }
  error(...params) {
    const content = new LogText(_Logger.Level.Error, ...params).toString();
    console.error(content[_Logger.LevelColor[_Logger.Level.Error]]);
    this.#writer.push(content);
  }
  fatal(...params) {
    const content = new LogText(_Logger.Level.Fatal, ...params).toString();
    console.error(content[_Logger.LevelColor[_Logger.Level.Fatal]]);
    this.#writer.push(content);
  }
  destory() {
    this.#writer.destory();
  }
};
var logger_default = new Logger();

// src/lib/browser-service.ts
import { chromium } from "playwright-core";
import { execSync } from "child_process";
import fs6 from "fs";
import os2 from "os";

// src/api/controllers/core.ts
import _7 from "lodash";
import mime2 from "mime";
import axios2 from "axios";

// src/lib/exceptions/Exception.ts
import assert from "assert";
import _6 from "lodash";
var Exception = class extends Error {
  /** 错误码 */
  errcode;
  /** 错误消息 */
  errmsg;
  /** 数据 */
  data;
  /** HTTP状态码 */
  httpStatusCode;
  /**
   * 构造异常
   * 
   * @param exception 异常
   * @param _errmsg 异常消息
   */
  constructor(exception, _errmsg) {
    assert(_6.isArray(exception), "Exception must be Array");
    const [errcode, errmsg] = exception;
    assert(_6.isFinite(errcode), "Exception errcode invalid");
    assert(_6.isString(errmsg), "Exception errmsg invalid");
    super(_errmsg || errmsg);
    this.errcode = errcode;
    this.errmsg = _errmsg || errmsg;
  }
  compare(exception) {
    const [errcode] = exception;
    return this.errcode == errcode;
  }
  setHTTPStatusCode(value) {
    this.httpStatusCode = value;
    return this;
  }
  setData(value) {
    this.data = _6.defaultTo(value, null);
    return this;
  }
};

// src/lib/exceptions/APIException.ts
var APIException = class extends Exception {
  /**
   * 构造异常
   * 
   * @param {[number, string]} exception 异常
   */
  constructor(exception, errmsg) {
    super(exception, errmsg);
  }
};

// src/api/consts/exceptions.ts
var exceptions_default = {
  API_TEST: [-9999, "API\u5F02\u5E38\u9519\u8BEF"],
  API_REQUEST_PARAMS_INVALID: [-2e3, "\u8BF7\u6C42\u53C2\u6570\u975E\u6CD5"],
  API_REQUEST_FAILED: [-2001, "\u8BF7\u6C42\u5931\u8D25"],
  API_TOKEN_EXPIRES: [-2002, "Token\u5DF2\u5931\u6548"],
  API_FILE_URL_INVALID: [-2003, "\u8FDC\u7A0B\u6587\u4EF6URL\u975E\u6CD5"],
  API_FILE_EXECEEDS_SIZE: [-2004, "\u8FDC\u7A0B\u6587\u4EF6\u8D85\u51FA\u5927\u5C0F"],
  API_CHAT_STREAM_PUSHING: [-2005, "\u5DF2\u6709\u5BF9\u8BDD\u6D41\u6B63\u5728\u8F93\u51FA"],
  API_CONTENT_FILTERED: [-2006, "\u5185\u5BB9\u7531\u4E8E\u5408\u89C4\u95EE\u9898\u5DF2\u88AB\u963B\u6B62\u751F\u6210"],
  API_IMAGE_GENERATION_FAILED: [-2007, "\u56FE\u50CF\u751F\u6210\u5931\u8D25"],
  API_VIDEO_GENERATION_FAILED: [-2008, "\u89C6\u9891\u751F\u6210\u5931\u8D25"],
  API_IMAGE_GENERATION_INSUFFICIENT_POINTS: [-2009, "\u5373\u68A6\u79EF\u5206\u4E0D\u8DB3"]
};

// src/api/controllers/core.ts
var DEFAULT_ASSISTANT_ID = 513695;
var VERSION_CODE = "8.4.0";
var PLATFORM_CODE = "7";
var DEVICE_ID = Math.random() * 1e18 + 7e18;
var WEB_ID = Math.random() * 1e18 + 7e18;
var USER_ID = util_default.uuid(false);
var FAKE_HEADERS = {
  Accept: "application/json, text/plain, */*",
  "Accept-Encoding": "gzip, deflate, br, zstd",
  "Accept-language": "zh-CN,zh;q=0.9",
  "App-Sdk-Version": "48.0.0",
  "Cache-control": "no-cache",
  Appid: DEFAULT_ASSISTANT_ID,
  Appvr: VERSION_CODE,
  Lan: "zh-Hans",
  Loc: "cn",
  Origin: "https://jimeng.jianying.com",
  Pragma: "no-cache",
  Priority: "u=1, i",
  Referer: "https://jimeng.jianying.com",
  Pf: PLATFORM_CODE,
  "Sec-Ch-Ua": '"Google Chrome";v="132", "Chromium";v="132", "Not_A Brand";v="8"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
};
var FILE_MAX_SIZE = 100 * 1024 * 1024;
async function acquireToken(refreshToken) {
  return refreshToken;
}
function generateCookie(refreshToken) {
  return [
    `_tea_web_id=${WEB_ID}`,
    `is_staff_user=false`,
    `store-region=cn-gd`,
    `store-region-src=uid`,
    `sid_guard=${refreshToken}%7C${util_default.unixTimestamp()}%7C5184000%7CMon%2C+03-Feb-2025+08%3A17%3A09+GMT`,
    `uid_tt=${USER_ID}`,
    `uid_tt_ss=${USER_ID}`,
    `sid_tt=${refreshToken}`,
    `sessionid=${refreshToken}`,
    `sessionid_ss=${refreshToken}`,
    `sid_tt=${refreshToken}`
  ].join("; ");
}
function getCookiesForBrowser(refreshToken) {
  const domain = ".jianying.com";
  return [
    { name: "_tea_web_id", value: String(WEB_ID), domain, path: "/" },
    { name: "is_staff_user", value: "false", domain, path: "/" },
    { name: "store-region", value: "cn-gd", domain, path: "/" },
    { name: "store-region-src", value: "uid", domain, path: "/" },
    { name: "uid_tt", value: USER_ID, domain, path: "/" },
    { name: "uid_tt_ss", value: USER_ID, domain, path: "/" },
    { name: "sid_tt", value: refreshToken, domain, path: "/" },
    { name: "sessionid", value: refreshToken, domain, path: "/" },
    { name: "sessionid_ss", value: refreshToken, domain, path: "/" }
  ];
}
async function getCredit(refreshToken) {
  const {
    credit: { gift_credit, purchase_credit, vip_credit }
  } = await request("POST", "/commerce/v1/benefits/user_credit", refreshToken, {
    data: {},
    headers: {
      // Cookie: 'x-web-secsdk-uid=ef44bd0d-0cf6-448c-b517-fd1b5a7267ba; s_v_web_id=verify_m4b1lhlu_DI8qKRlD_7mJJ_4eqx_9shQ_s8eS2QLAbc4n; passport_csrf_token=86f3619c0c4a9c13f24117f71dc18524; passport_csrf_token_default=86f3619c0c4a9c13f24117f71dc18524; n_mh=9-mIeuD4wZnlYrrOvfzG3MuT6aQmCUtmr8FxV8Kl8xY; sid_guard=a7eb745aec44bb3186dbc2083ea9e1a6%7C1733386629%7C5184000%7CMon%2C+03-Feb-2025+08%3A17%3A09+GMT; uid_tt=59a46c7d3f34bda9588b93590cca2e12; uid_tt_ss=59a46c7d3f34bda9588b93590cca2e12; sid_tt=a7eb745aec44bb3186dbc2083ea9e1a6; sessionid=a7eb745aec44bb3186dbc2083ea9e1a6; sessionid_ss=a7eb745aec44bb3186dbc2083ea9e1a6; is_staff_user=false; sid_ucp_v1=1.0.0-KGRiOGY2ODQyNWU1OTk3NzRhYTE2ZmZhYmFjNjdmYjY3NzRmZGRiZTgKHgjToPCw0cwbEIXDxboGGJ-tHyAMMITDxboGOAhAJhoCaGwiIGE3ZWI3NDVhZWM0NGJiMzE4NmRiYzIwODNlYTllMWE2; ssid_ucp_v1=1.0.0-KGRiOGY2ODQyNWU1OTk3NzRhYTE2ZmZhYmFjNjdmYjY3NzRmZGRiZTgKHgjToPCw0cwbEIXDxboGGJ-tHyAMMITDxboGOAhAJhoCaGwiIGE3ZWI3NDVhZWM0NGJiMzE4NmRiYzIwODNlYTllMWE2; store-region=cn-gd; store-region-src=uid; user_spaces_idc={"7444764277623653426":"lf"}; ttwid=1|cxHJViEev1mfkjntdMziir8SwbU8uPNVSaeh9QpEUs8|1733966961|d8d52f5f56607427691be4ac44253f7870a34d25dd05a01b4d89b8a7c5ea82ad; _tea_web_id=7444838473275573797; fpk1=fa6c6a4d9ba074b90003896f36b6960066521c1faec6a60bdcb69ec8ddf85e8360b4c0704412848ec582b2abca73d57a; odin_tt=efe9dc150207879b88509e651a1c4af4e7ffb4cfcb522425a75bd72fbf894eda570bbf7ffb551c8b1de0aa2bfa0bd1be6c4157411ecdcf4464fcaf8dd6657d66',
      Referer: "https://jimeng.jianying.com/ai-tool/image/generate"
      // "Device-Time": 1733966964,
      // Sign: "f3dbb824b378abea7c03cbb152b3a365"
    }
  });
  logger_default.info(`Credits: gift=${gift_credit}, purchased=${purchase_credit}, VIP=${vip_credit}`);
  return {
    giftCredit: gift_credit,
    purchaseCredit: purchase_credit,
    vipCredit: vip_credit,
    totalCredit: gift_credit + purchase_credit + vip_credit
  };
}
async function receiveCredit(refreshToken) {
  logger_default.info("Claiming daily credits...");
  const { cur_total_credits, receive_quota } = await request("POST", "/commerce/v1/benefits/credit_receive", refreshToken, {
    data: {
      time_zone: "Asia/Shanghai"
    },
    headers: {
      Referer: "https://jimeng.jianying.com/ai-tool/image/generate"
    }
  });
  logger_default.info(`Daily credits claimed: ${receive_quota}. Remaining balance: ${cur_total_credits}`);
  return cur_total_credits;
}
async function request(method, uri, refreshToken, options = {}) {
  const token = await acquireToken(refreshToken);
  const deviceTime = util_default.unixTimestamp();
  const sign = util_default.md5(
    `9e2c|${uri.slice(-7)}|${PLATFORM_CODE}|${VERSION_CODE}|${deviceTime}||11ac`
  );
  const fullUrl = `https://jimeng.jianying.com${uri}`;
  const requestParams = {
    aid: DEFAULT_ASSISTANT_ID,
    device_platform: "web",
    region: "cn",
    webId: WEB_ID,
    da_version: "3.3.2",
    web_component_open_flag: 1,
    web_version: "7.5.0",
    aigc_features: "app_lip_sync",
    ...options.params || {}
  };
  const headers = {
    ...FAKE_HEADERS,
    Cookie: generateCookie(token),
    "Device-Time": deviceTime,
    Sign: sign,
    "Sign-Ver": "1",
    ...options.headers || {}
  };
  logger_default.info(`Sending request: ${method.toUpperCase()} ${fullUrl}`);
  logger_default.info(`Request params: ${JSON.stringify(requestParams)}`);
  logger_default.info(`Request data: ${JSON.stringify(options.data || {})}`);
  let retries = 0;
  const maxRetries = 3;
  let lastError = null;
  while (retries <= maxRetries) {
    try {
      if (retries > 0) {
        logger_default.info(`Retry #${retries} ${method.toUpperCase()} ${fullUrl}`);
        await new Promise((resolve) => setTimeout(resolve, 1e3 * retries));
      }
      const response = await axios2.request({
        method,
        url: fullUrl,
        params: requestParams,
        headers,
        timeout: 45e3,
        // 增加超时时间到45秒
        validateStatus: () => true,
        // 允许任何状态码
        ..._7.omit(options, "params", "headers")
      });
      logger_default.info(`Response status: ${response.status} ${response.statusText}`);
      if (options.responseType == "stream") return response;
      const responseDataSummary = JSON.stringify(response.data).substring(0, 500) + (JSON.stringify(response.data).length > 500 ? "..." : "");
      logger_default.info(`Response data summary: ${responseDataSummary}`);
      if (response.status >= 400) {
        logger_default.warn(`HTTP error: ${response.status} ${response.statusText}`);
        if (retries < maxRetries) {
          retries++;
          continue;
        }
      }
      return checkResult(response);
    } catch (error) {
      lastError = error;
      logger_default.error(`Request failed (attempt ${retries + 1}/${maxRetries + 1}): ${error.message}`);
      if ((error.code === "ECONNABORTED" || error.code === "ETIMEDOUT" || error.message.includes("timeout") || error.message.includes("network")) && retries < maxRetries) {
        retries++;
        continue;
      }
      break;
    }
  }
  logger_default.error(`All retries exhausted after ${retries} retries: ${lastError.message}`);
  if (lastError.response) {
    logger_default.error(`Response status: ${lastError.response.status}`);
    logger_default.error(`Response data: ${JSON.stringify(lastError.response.data)}`);
  }
  throw lastError;
}
function checkResult(result) {
  const { ret, errmsg, data } = result.data;
  if (!_7.isFinite(Number(ret))) return result.data;
  if (ret === "0") return data;
  if (ret === "5000")
    throw new APIException(exceptions_default.API_IMAGE_GENERATION_INSUFFICIENT_POINTS, `[Generation failed]: Jimeng credits may be insufficient, ${errmsg}`);
  throw new APIException(exceptions_default.API_REQUEST_FAILED, `[Jimeng request failed]: ${errmsg}`);
}
function tokenSplit(authorization) {
  return authorization.replace("Bearer ", "").split(",");
}
async function getTokenLiveStatus(refreshToken) {
  const result = await request(
    "POST",
    "/passport/account/info/v2",
    refreshToken,
    {
      params: {
        account_sdk_source: "web"
      }
    }
  );
  try {
    const { user_id } = checkResult(result);
    return !!user_id;
  } catch (err) {
    return false;
  }
}

// src/lib/browser-service.ts
var cachedChromiumPath = null;
function findChromiumPath() {
  if (cachedChromiumPath) {
    return cachedChromiumPath;
  }
  if (process.env.CHROMIUM_PATH && fs6.existsSync(process.env.CHROMIUM_PATH)) {
    cachedChromiumPath = process.env.CHROMIUM_PATH;
    return cachedChromiumPath;
  }
  try {
    const playwrightPath = chromium.executablePath();
    if (playwrightPath && fs6.existsSync(playwrightPath)) {
      logger_default.info(`BrowserService: using Playwright built-in Chromium: ${playwrightPath}`);
      cachedChromiumPath = playwrightPath;
      return cachedChromiumPath;
    }
  } catch {
  }
  try {
    const whichPath = execSync("which chromium 2>/dev/null || which chromium-browser 2>/dev/null || which google-chrome 2>/dev/null", { encoding: "utf-8" }).trim();
    if (whichPath && fs6.existsSync(whichPath)) {
      cachedChromiumPath = whichPath;
      return cachedChromiumPath;
    }
  } catch {
  }
  try {
    const nixChrome = execSync("find /nix/store -maxdepth 3 -name 'chromium' -type f -executable 2>/dev/null | grep '/bin/chromium' | head -1", { encoding: "utf-8", timeout: 5e3 }).trim();
    if (nixChrome && fs6.existsSync(nixChrome)) {
      cachedChromiumPath = nixChrome;
      return cachedChromiumPath;
    }
  } catch {
  }
  const fallbacks = ["/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome"];
  for (const p of fallbacks) {
    if (fs6.existsSync(p)) {
      cachedChromiumPath = p;
      return cachedChromiumPath;
    }
  }
  return "";
}
var trackedBrowserPid = null;
function killTrackedBrowserProcess() {
  if (!trackedBrowserPid) return;
  try {
    execSync(`kill -9 ${trackedBrowserPid} 2>/dev/null || true`, { encoding: "utf-8", timeout: 5e3 });
    execSync(`pkill -9 -P ${trackedBrowserPid} 2>/dev/null || true`, { encoding: "utf-8", timeout: 5e3 });
    logger_default.info(`BrowserService: killed stale browser process (pid: ${trackedBrowserPid})`);
  } catch {
  }
  trackedBrowserPid = null;
}
function getSystemMemoryInfo() {
  const totalMB = Math.round(os2.totalmem() / 1024 / 1024);
  const freeMB = Math.round(os2.freemem() / 1024 / 1024);
  const usedPercent = Math.round((totalMB - freeMB) / totalMB * 100);
  return { totalMB, freeMB, usedPercent };
}
var SCRIPT_WHITELIST_DOMAINS = [
  "vlabstatic.com",
  "bytescm.com",
  "jianying.com",
  "byteimg.com"
];
var BLOCKED_RESOURCE_TYPES = ["image", "font", "stylesheet", "media"];
var SESSION_IDLE_TIMEOUT = 5 * 60 * 1e3;
var BDMS_READY_TIMEOUT = 3e4;
var BROWSER_LAUNCH_TIMEOUT = 12e4;
var MAX_SESSIONS = 2;
var HEALTH_CHECK_INTERVAL = 30 * 1e3;
var FETCH_TIMEOUT = 3e4;
var PROACTIVE_RECONNECT_DELAY = 2e3;
var API_CIRCUIT_BREAKER_THRESHOLD = 3;
var API_CIRCUIT_BREAKER_COOLDOWN = 20 * 1e3;
var BROWSER_CIRCUIT_BREAKER_THRESHOLD = 3;
var BROWSER_CIRCUIT_BREAKER_COOLDOWN = 30 * 1e3;
var BrowserService = class {
  browser = null;
  sessions = /* @__PURE__ */ new Map();
  launching = null;
  healthCheckTimer = null;
  apiConsecutiveFailures = 0;
  apiLastFailureTime = 0;
  browserConsecutiveFailures = 0;
  browserLastFailureTime = 0;
  browserStartCount = 0;
  browserStartTime = 0;
  isReady() {
    return this.browser !== null && this.browser.isConnected();
  }
  isApiCircuitOpen() {
    if (this.apiConsecutiveFailures < API_CIRCUIT_BREAKER_THRESHOLD) {
      return false;
    }
    const elapsed = Date.now() - this.apiLastFailureTime;
    if (elapsed > API_CIRCUIT_BREAKER_COOLDOWN) {
      logger_default.info(`BrowserService: API circuit breaker cooled (${Math.round(elapsed / 1e3)}s), allowing retry`);
      this.apiConsecutiveFailures = 0;
      return false;
    }
    return true;
  }
  isBrowserCircuitOpen() {
    if (this.browserConsecutiveFailures < BROWSER_CIRCUIT_BREAKER_THRESHOLD) {
      return false;
    }
    const elapsed = Date.now() - this.browserLastFailureTime;
    if (elapsed > BROWSER_CIRCUIT_BREAKER_COOLDOWN) {
      logger_default.info(`BrowserService: browser circuit breaker cooled (${Math.round(elapsed / 1e3)}s), allowing retry`);
      this.browserConsecutiveFailures = 0;
      return false;
    }
    return true;
  }
  recordApiFailure() {
    this.apiConsecutiveFailures++;
    this.apiLastFailureTime = Date.now();
    logger_default.warn(`BrowserService: API consecutive failures: ${this.apiConsecutiveFailures}/${API_CIRCUIT_BREAKER_THRESHOLD}`);
    if (this.apiConsecutiveFailures >= API_CIRCUIT_BREAKER_THRESHOLD) {
      logger_default.warn(`BrowserService: API circuit breaker OPEN, cooling for ${API_CIRCUIT_BREAKER_COOLDOWN / 1e3}s`);
      this.scheduleApiRecovery();
    }
  }
  recordApiSuccess() {
    if (this.apiConsecutiveFailures > 0) {
      logger_default.info(`BrowserService: API recovered, circuit breaker reset (was ${this.apiConsecutiveFailures} consecutive failures)`);
    }
    this.apiConsecutiveFailures = 0;
  }
  recordBrowserFailure() {
    this.browserConsecutiveFailures++;
    this.browserLastFailureTime = Date.now();
    logger_default.warn(`BrowserService: browser consecutive failures: ${this.browserConsecutiveFailures}/${BROWSER_CIRCUIT_BREAKER_THRESHOLD}`);
    if (this.browserConsecutiveFailures >= BROWSER_CIRCUIT_BREAKER_THRESHOLD) {
      logger_default.warn(`BrowserService: browser circuit breaker OPEN, cooling for ${BROWSER_CIRCUIT_BREAKER_COOLDOWN / 1e3}s`);
      this.scheduleBrowserRecovery();
    }
  }
  recordBrowserSuccess() {
    if (this.browserConsecutiveFailures > 0) {
      logger_default.info(`BrowserService: browser recovered, circuit breaker reset (was ${this.browserConsecutiveFailures} consecutive failures)`);
    }
    this.browserConsecutiveFailures = 0;
  }
  scheduleApiRecovery() {
    setTimeout(() => {
      logger_default.info(`BrowserService: API circuit breaker cooldown ended, counter reset`);
      this.apiConsecutiveFailures = 0;
    }, API_CIRCUIT_BREAKER_COOLDOWN + 1e3);
  }
  scheduleBrowserRecovery() {
    setTimeout(() => {
      if (this.isReady() || this.launching) {
        logger_default.info(`BrowserService: browser circuit breaker recovery check: browser ready, no reconnect needed`);
        return;
      }
      logger_default.info(`BrowserService: browser circuit breaker cooldown ended, attempting recovery...`);
      this.browserConsecutiveFailures = 0;
      this.ensureBrowser().then(() => {
        logger_default.info(`BrowserService: browser circuit breaker recovered successfully`);
      }).catch((err) => {
        logger_default.error(`BrowserService: browser circuit breaker recovery failed: ${err.message}`);
      });
    }, BROWSER_CIRCUIT_BREAKER_COOLDOWN + 1e3);
  }
  proactiveReconnect() {
    if (this.launching || this.isBrowserCircuitOpen()) {
      return;
    }
    logger_default.info(`BrowserService: scheduling proactive reconnect (in ${PROACTIVE_RECONNECT_DELAY}ms)...`);
    setTimeout(() => {
      if (this.isReady() || this.launching || this.isBrowserCircuitOpen()) {
        return;
      }
      logger_default.info(`BrowserService: executing proactive background reconnect...`);
      this.ensureBrowser().then(() => {
        logger_default.info(`BrowserService: proactive reconnect succeeded`);
      }).catch((err) => {
        logger_default.error(`BrowserService: proactive reconnect failed: ${err.message}`);
      });
    }, PROACTIVE_RECONNECT_DELAY);
  }
  async ensureBrowser() {
    var _a;
    if ((_a = this.browser) == null ? void 0 : _a.isConnected()) {
      return this.browser;
    }
    if (this.isBrowserCircuitOpen()) {
      const remaining = Math.round((BROWSER_CIRCUIT_BREAKER_COOLDOWN - (Date.now() - this.browserLastFailureTime)) / 1e3);
      throw new Error(`BrowserService: browser temporarily unavailable, retry in ${remaining}s`);
    }
    if (this.launching) {
      return this.launching;
    }
    this.launching = (async () => {
      const chromiumPath = findChromiumPath();
      const memInfo = getSystemMemoryInfo();
      logger_default.info(`BrowserService: launching Chromium... (path: ${chromiumPath || "default"}, memory: ${memInfo.freeMB}MB free / ${memInfo.totalMB}MB total, ${memInfo.usedPercent}% used)`);
      if (memInfo.freeMB < 200) {
        logger_default.warn(`BrowserService: low memory (${memInfo.freeMB}MB) free, cleaning up before launch...`);
        killTrackedBrowserProcess();
        await new Promise((r) => setTimeout(r, 2e3));
      }
      const maxAttempts = 3;
      let lastError = null;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          if (attempt > 1) {
            logger_default.info(`BrowserService: cleaning up stale processes before retry... (attempt ${attempt})`);
            killTrackedBrowserProcess();
            await new Promise((r) => setTimeout(r, 3e3));
          }
          const launchOptions = {
            headless: true,
            timeout: BROWSER_LAUNCH_TIMEOUT,
            args: [
              "--no-sandbox",
              "--disable-setuid-sandbox",
              "--disable-dev-shm-usage",
              "--disable-gpu",
              "--no-first-run",
              "--disable-extensions",
              "--disable-background-networking",
              "--disable-sync",
              "--disable-translate",
              "--metrics-recording-only",
              "--mute-audio",
              "--no-default-browser-check",
              "--js-flags=--max-old-space-size=128",
              "--disable-features=TranslateUI,BlinkGenPropertyTrees",
              "--disable-hang-monitor",
              "--disable-popup-blocking",
              "--disable-prompt-on-repost",
              "--disable-renderer-backgrounding",
              "--disable-component-update",
              "--disable-domain-reliability",
              "--disable-client-side-phishing-detection",
              "--disable-breakpad",
              "--disable-software-rasterizer",
              "--enable-low-end-device-mode",
              "--disable-canvas-aa",
              "--disable-2d-canvas-clip-aa"
            ]
          };
          if (chromiumPath) {
            launchOptions.executablePath = chromiumPath;
          }
          this.browser = await chromium.launch(launchOptions);
          try {
            const serverProcess = this.browser._browserProcess || this.browser._process;
            if (serverProcess == null ? void 0 : serverProcess.pid) {
              trackedBrowserPid = serverProcess.pid;
              logger_default.info(`BrowserService: browser process PID: ${trackedBrowserPid}`);
            }
          } catch {
          }
          this.browser.on("disconnected", () => {
            const uptime = this.browserStartTime ? Math.round((Date.now() - this.browserStartTime) / 1e3) : 0;
            logger_default.warn(`BrowserService: browser disconnected (uptime: ${uptime}s, active sessions: ${this.sessions.size})`);
            this.browser = null;
            this.sessions.clear();
            trackedBrowserPid = null;
            this.proactiveReconnect();
          });
          this.browserStartCount++;
          this.browserStartTime = Date.now();
          const memAfter = getSystemMemoryInfo();
          logger_default.info(`BrowserService: Chromium launched successfully (attempt ${attempt}, start #${this.browserStartCount}, memory after: ${memAfter.freeMB}MB free, ${memAfter.usedPercent}% used)`);
          this.recordBrowserSuccess();
          this.startHealthCheck();
          return this.browser;
        } catch (err) {
          lastError = err;
          const memErr = getSystemMemoryInfo();
          logger_default.error(`BrowserService: launch failed (attempt ${attempt}/${maxAttempts}): ${lastError.message} (memory: ${memErr.freeMB}MB free, ${memErr.usedPercent}% used)`);
          if (attempt < maxAttempts) {
            const backoffMs = 5e3 * attempt;
            logger_default.info(`BrowserService: retrying in ${backoffMs / 1e3}s...`);
            await new Promise((r) => setTimeout(r, backoffMs));
          }
        }
      }
      this.recordBrowserFailure();
      throw lastError || new Error("browser launch failed");
    })().finally(() => {
      this.launching = null;
    });
    return this.launching;
  }
  startHealthCheck() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    this.healthCheckTimer = setInterval(async () => {
      var _a;
      try {
        if (!((_a = this.browser) == null ? void 0 : _a.isConnected())) {
          logger_default.warn("BrowserService: health check: browser disconnected, triggering reconnect...");
          this.browser = null;
          this.sessions.clear();
          this.stopHealthCheck();
          this.proactiveReconnect();
          return;
        }
        const memInfo = getSystemMemoryInfo();
        if (memInfo.freeMB < 200 && this.sessions.size > 0) {
          const evictCount = memInfo.freeMB < 100 ? this.sessions.size : 1;
          logger_default.warn(`BrowserService: low memory (${memInfo.freeMB}MB free), evicting ${evictCount} session(s)...`);
          await this.evictOldestSessions(evictCount);
        }
        const now = Date.now();
        for (const [token, session] of this.sessions) {
          if (now - session.lastUsed > SESSION_IDLE_TIMEOUT) {
            logger_default.info(`BrowserService: health check: closing idle session ${token.substring(0, 8)}...`);
            await this.closeSession(token);
          }
        }
      } catch (err) {
        logger_default.error(`BrowserService: health check error: ${err.message}`);
      }
    }, HEALTH_CHECK_INTERVAL);
    if (this.healthCheckTimer.unref) {
      this.healthCheckTimer.unref();
    }
  }
  stopHealthCheck() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }
  async evictOldestSessions(count) {
    const sorted = [...this.sessions.entries()].sort(
      (a, b) => a[1].lastUsed - b[1].lastUsed
    );
    for (let i = 0; i < Math.min(count, sorted.length); i++) {
      const [token] = sorted[i];
      logger_default.info(`BrowserService: evicting oldest session ${token.substring(0, 8)}...`);
      await this.closeSession(token);
    }
  }
  async getSession(token) {
    const existing = this.sessions.get(token);
    if (existing) {
      try {
        if (!existing.page.isClosed()) {
          existing.lastUsed = Date.now();
          if (existing.idleTimer) {
            clearTimeout(existing.idleTimer);
          }
          existing.idleTimer = setTimeout(() => this.closeSession(token), SESSION_IDLE_TIMEOUT);
          return existing;
        }
      } catch {
      }
      logger_default.info(`BrowserService: session ${token.substring(0, 8)}... is stale, recreating`);
      this.sessions.delete(token);
      if (existing.idleTimer) clearTimeout(existing.idleTimer);
    }
    if (this.sessions.size >= MAX_SESSIONS) {
      logger_default.warn(`BrowserService: session limit reached (${MAX_SESSIONS}), evicting oldest...`);
      await this.evictOldestSessions(1);
    }
    return this.createSession(token);
  }
  async createSession(token) {
    const maxAttempts = 2;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const browser = await this.ensureBrowser();
        const memInfo = getSystemMemoryInfo();
        logger_default.info(`BrowserService: creating session for token ${token.substring(0, 8)}... (attempt ${attempt}, memory: ${memInfo.freeMB}MB free)`);
        if (memInfo.freeMB < 150 && this.sessions.size > 0) {
          logger_default.warn(`BrowserService: low memory (${memInfo.freeMB}MB) free, progressively evicting sessions...`);
          while (this.sessions.size > 0) {
            await this.evictOldestSessions(1);
            const updated = getSystemMemoryInfo();
            if (updated.freeMB >= 150) break;
          }
          await new Promise((r) => setTimeout(r, 1e3));
        }
        const context = await browser.newContext({
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
          viewport: { width: 1280, height: 720 },
          locale: "zh-CN"
        });
        const cookies = getCookiesForBrowser(token);
        await context.addCookies(cookies);
        await context.route("**/*", (route) => {
          const request2 = route.request();
          const resourceType = request2.resourceType();
          const url = request2.url();
          if (BLOCKED_RESOURCE_TYPES.includes(resourceType)) {
            return route.abort();
          }
          if (resourceType === "script") {
            const isWhitelisted = SCRIPT_WHITELIST_DOMAINS.some(
              (domain) => url.includes(domain)
            );
            if (!isWhitelisted) {
              return route.abort();
            }
          }
          return route.continue();
        });
        const page = await context.newPage();
        logger_default.info("BrowserService: navigating to jimeng.jianying.com...");
        await page.goto("https://jimeng.jianying.com", {
          waitUntil: "domcontentloaded",
          timeout: 45e3
        });
        logger_default.info("BrowserService: waiting for bdms SDK...");
        try {
          await page.waitForFunction(
            () => {
              var _a;
              return ((_a = window.bdms) == null ? void 0 : _a.init) || window.byted_acrawler || window.fetch.toString().indexOf("native code") === -1;
            },
            { timeout: BDMS_READY_TIMEOUT }
          );
          logger_default.info("BrowserService: bdms SDK is ready");
        } catch (err) {
          logger_default.warn(
            "BrowserService: bdms SDK wait timed out, may not be fully loaded, continuing..."
          );
        }
        const session = {
          context,
          page,
          lastUsed: Date.now(),
          idleTimer: setTimeout(() => this.closeSession(token), SESSION_IDLE_TIMEOUT)
        };
        this.sessions.set(token, session);
        return session;
      } catch (err) {
        logger_default.error(`BrowserService: session creation failed (attempt ${attempt}/${maxAttempts}): ${err.message}`);
        this.browser = null;
        this.sessions.clear();
        if (attempt >= maxAttempts) {
          this.recordBrowserFailure();
          throw err;
        }
        await new Promise((r) => setTimeout(r, 3e3));
      }
    }
    this.recordBrowserFailure();
    throw new Error("session creation failed");
  }
  async closeSession(token) {
    const session = this.sessions.get(token);
    if (!session) return;
    logger_default.info(`BrowserService: closing idle session ${token.substring(0, 8)}...`);
    if (session.idleTimer) {
      clearTimeout(session.idleTimer);
    }
    try {
      await session.context.close();
    } catch (err) {
    }
    this.sessions.delete(token);
  }
  async fetch(token, url, options) {
    if (this.isApiCircuitOpen()) {
      const remaining = Math.round((API_CIRCUIT_BREAKER_COOLDOWN - (Date.now() - this.apiLastFailureTime)) / 1e3);
      const error = new Error(`BrowserService: requests temporarily unavailable, retry in ${remaining}s`);
      error.statusCode = 503;
      error.retryAfter = remaining;
      throw error;
    }
    const totalStart = Date.now();
    let session;
    try {
      logger_default.info(`BrowserService: acquiring session...`);
      session = await this.getSession(token);
      const sessionElapsed = Date.now() - totalStart;
      logger_default.info(`BrowserService: session ready (${sessionElapsed}ms)`);
    } catch (err) {
      const elapsed = Date.now() - totalStart;
      logger_default.error(`BrowserService: session acquisition failed (${elapsed}ms): ${err.message}`);
      const error = new Error(`BrowserService: session acquisition failed: ${err.message}`);
      error.statusCode = 503;
      error.retryAfter = 10;
      throw error;
    }
    const fetchStart = Date.now();
    let timedOut = false;
    let timeoutTimer = null;
    const cancelToken = { cancelled: false };
    const timeoutPromise = new Promise((_17, reject) => {
      timeoutTimer = setTimeout(() => {
        timedOut = true;
        cancelToken.cancelled = true;
        reject(new Error(`BrowserService: request timed out (${FETCH_TIMEOUT / 1e3}s)`));
      }, FETCH_TIMEOUT);
    });
    try {
      const resultPromise = this._doFetch(token, session, url, options, cancelToken);
      const result = await Promise.race([resultPromise, timeoutPromise]);
      if (timeoutTimer) clearTimeout(timeoutTimer);
      const elapsed = Date.now() - fetchStart;
      const totalElapsed = Date.now() - totalStart;
      logger_default.info(`BrowserService: request completed (fetch: ${elapsed}ms, total: ${totalElapsed}ms)`);
      this.recordApiSuccess();
      return result;
    } catch (err) {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      const elapsed = Date.now() - fetchStart;
      const totalElapsed = Date.now() - totalStart;
      logger_default.error(`BrowserService: request failed (fetch: ${elapsed}ms, total: ${totalElapsed}ms): ${err.message}`);
      if (timedOut) {
        logger_default.warn(`BrowserService: timed out, closing session ${token.substring(0, 8)}...`);
        this.closeSession(token).catch(() => {
        });
      }
      this.recordApiFailure();
      if (timedOut) {
        const error = new Error(err.message);
        error.statusCode = 503;
        error.retryAfter = 10;
        throw error;
      }
      throw err;
    }
  }
  async _doFetch(token, session, url, options, cancelToken) {
    if (cancelToken.cancelled) {
      logger_default.warn(`BrowserService: request cancelled, skipping (already timed out)`);
      throw new Error("BrowserService: request was cancelled");
    }
    logger_default.info(`BrowserService: proxying ${options.method || "GET"} ${url.substring(0, 100)}...`);
    try {
      const result = await session.page.evaluate(
        async ({ url: url2, options: options2, timeoutMs }) => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            const res = await fetch(url2, {
              method: options2.method || "GET",
              headers: {
                "Content-Type": "application/json",
                ...options2.headers || {}
              },
              body: options2.body,
              credentials: "include",
              signal: controller.signal
            });
            clearTimeout(timeoutId);
            const text = await res.text();
            return { ok: res.ok, status: res.status, text };
          } catch (err) {
            return { ok: false, status: 0, text: "", error: err.message };
          }
        },
        { url, options, timeoutMs: FETCH_TIMEOUT - 2e3 }
      );
      if (result.error) {
        throw new Error(`browser fetch error: ${result.error}`);
      }
      logger_default.info(`BrowserService: response status ${result.status}`);
      try {
        return JSON.parse(result.text);
      } catch {
        logger_default.warn(`BrowserService: response is not valid JSON: ${result.text.substring(0, 200)}`);
        return result.text;
      }
    } catch (err) {
      logger_default.error(`BrowserService: request execution failed: ${err.message}`);
      await this.closeSession(token);
      throw err;
    }
  }
  warmUp() {
    if (this.isReady() || this.launching) {
      return;
    }
    logger_default.info(`BrowserService: warming up browser...`);
    this.ensureBrowser().then(() => {
      logger_default.info(`BrowserService: warm-up complete, browser ready`);
    }).catch((err) => {
      logger_default.warn(`BrowserService: warm-up failed: ${err.message}, will retry on first request`);
    });
  }
  async close() {
    logger_default.info("BrowserService: shutting down all sessions and browser...");
    this.stopHealthCheck();
    for (const [token] of this.sessions) {
      await this.closeSession(token);
    }
    if (this.browser) {
      try {
        await this.browser.close();
      } catch (err) {
      }
      this.browser = null;
    }
    killTrackedBrowserProcess();
    logger_default.info("BrowserService: closed");
  }
};
var browserService = new BrowserService();
browserService.warmUp();
var browser_service_default = browserService;

// src/lib/initialize.ts
process.setMaxListeners(Infinity);
process.on("uncaughtException", (err, origin) => {
  logger_default.error(`An unhandled error occurred: ${origin}`, err);
});
process.on("unhandledRejection", (_17, promise) => {
  promise.catch((err) => logger_default.error("An unhandled rejection occurred:", err));
});
process.on("warning", (warning) => logger_default.warn("System warning: ", warning));
process.on("exit", () => {
  logger_default.info("Service exit");
  logger_default.footer();
});
process.on("SIGTERM", () => {
  logger_default.warn("received kill signal");
  browser_service_default.close().finally(() => process.exit(2));
});
process.on("SIGINT", () => {
  browser_service_default.close().finally(() => process.exit(0));
});

// src/lib/server.ts
import Koa from "koa";
import KoaRouter from "koa-router";
import koaRange from "koa-range";
import koaCors from "koa2-cors";
import koaBody from "koa-body";
import _12 from "lodash";

// src/lib/request/Request.ts
import _8 from "lodash";
var Request = class {
  /** 请求方法 */
  method;
  /** 请求URL */
  url;
  /** 请求路径 */
  path;
  /** 请求载荷类型 */
  type;
  /** 请求headers */
  headers;
  /** 请求原始查询字符串 */
  search;
  /** 请求查询参数 */
  query;
  /** 请求URL参数 */
  params;
  /** 请求载荷 */
  body;
  /** 上传的文件 */
  files;
  /** 客户端IP地址 */
  remoteIP;
  /** 请求接受时间戳（毫秒） */
  time;
  constructor(ctx, options = {}) {
    const { time } = options;
    this.method = ctx.request.method;
    this.url = ctx.request.url;
    this.path = ctx.request.path;
    this.type = ctx.request.type;
    this.headers = ctx.request.headers || {};
    this.search = ctx.request.search;
    this.query = ctx.query || {};
    this.params = ctx.params || {};
    this.body = ctx.request.body || {};
    const rawFiles = ctx.request.files;
    if (rawFiles) {
      if (Array.isArray(rawFiles)) {
        this.files = rawFiles;
      } else if (typeof rawFiles === "object") {
        const filesArray = [];
        for (const key in rawFiles) {
          const fileOrFiles = rawFiles[key];
          if (Array.isArray(fileOrFiles)) {
            filesArray.push(...fileOrFiles);
          } else if (fileOrFiles) {
            filesArray.push(fileOrFiles);
          }
        }
        this.files = filesArray;
      } else {
        this.files = [];
      }
    } else {
      this.files = [];
    }
    this.remoteIP = this.headers["X-Real-IP"] || this.headers["x-real-ip"] || this.headers["X-Forwarded-For"] || this.headers["x-forwarded-for"] || ctx.ip || null;
    this.time = Number(_8.defaultTo(time, util_default.timestamp()));
  }
  validate(key, fn, message) {
    try {
      const value = _8.get(this, key);
      if (fn) {
        if (fn(value) === false)
          throw `[Mismatch] -> ${fn}`;
      } else if (_8.isUndefined(value))
        throw "[Undefined]";
    } catch (err) {
      logger_default.warn(`Params ${key} invalid:`, err);
      throw new APIException(exceptions_default.API_REQUEST_PARAMS_INVALID, message || `Params ${key} invalid`);
    }
    return this;
  }
};

// src/lib/response/Response.ts
import mime3 from "mime";
import _10 from "lodash";

// src/lib/response/Body.ts
import _9 from "lodash";
var Body = class _Body {
  /** 状态码 */
  code;
  /** 状态消息 */
  message;
  /** 载荷 */
  data;
  /** HTTP状态码 */
  statusCode;
  constructor(options = {}) {
    const { code, message, data, statusCode } = options;
    this.code = Number(_9.defaultTo(code, 0));
    this.message = _9.defaultTo(message, "OK");
    this.data = _9.defaultTo(data, null);
    this.statusCode = Number(_9.defaultTo(statusCode, 200));
  }
  toObject() {
    return {
      code: this.code,
      message: this.message,
      data: this.data
    };
  }
  static isInstance(value) {
    return value instanceof _Body;
  }
};

// src/lib/response/Response.ts
var Response = class _Response {
  /** 响应HTTP状态码 */
  statusCode;
  /** 响应内容类型 */
  type;
  /** 响应headers */
  headers;
  /** 重定向目标 */
  redirect;
  /** 响应载荷 */
  body;
  /** 响应载荷大小 */
  size;
  /** 响应时间戳 */
  time;
  constructor(body, options = {}) {
    const { statusCode, type, headers, redirect, size, time } = options;
    this.statusCode = Number(_10.defaultTo(statusCode, Body.isInstance(body) ? body.statusCode : void 0));
    this.type = type;
    this.headers = headers;
    this.redirect = redirect;
    this.size = size;
    this.time = Number(_10.defaultTo(time, util_default.timestamp()));
    this.body = body;
  }
  injectTo(ctx) {
    this.redirect && ctx.redirect(this.redirect);
    this.statusCode && (ctx.status = this.statusCode);
    this.type && (ctx.type = mime3.getType(this.type) || this.type);
    const headers = this.headers || {};
    if (this.size && !headers["Content-Length"] && !headers["content-length"])
      headers["Content-Length"] = this.size;
    ctx.set(headers);
    if (Body.isInstance(this.body))
      ctx.body = this.body.toObject();
    else
      ctx.body = this.body;
  }
  static isInstance(value) {
    return value instanceof _Response;
  }
};

// src/lib/response/FailureBody.ts
import _11 from "lodash";

// src/lib/consts/exceptions.ts
var exceptions_default2 = {
  SYSTEM_ERROR: [-1e3, "\u7CFB\u7EDF\u5F02\u5E38"],
  SYSTEM_REQUEST_VALIDATION_ERROR: [-1001, "\u8BF7\u6C42\u53C2\u6570\u6821\u9A8C\u9519\u8BEF"],
  SYSTEM_NOT_ROUTE_MATCHING: [-1002, "\u65E0\u5339\u914D\u7684\u8DEF\u7531"]
};

// src/lib/response/FailureBody.ts
var FailureBody = class _FailureBody extends Body {
  constructor(error, _data) {
    let errcode, errmsg, data = _data, httpStatusCode = http_status_codes_default.OK;
    ;
    if (_11.isString(error))
      error = new Exception(exceptions_default2.SYSTEM_ERROR, error);
    else if (error instanceof APIException || error instanceof Exception)
      ({ errcode, errmsg, data, httpStatusCode } = error);
    else if (_11.isError(error))
      ({ errcode, errmsg, data, httpStatusCode } = new Exception(exceptions_default2.SYSTEM_ERROR, error.message));
    super({
      code: errcode || -1,
      message: errmsg || "Internal error",
      data,
      statusCode: httpStatusCode
    });
  }
  static isInstance(value) {
    return value instanceof _FailureBody;
  }
};

// src/lib/server.ts
var Server = class {
  app;
  router;
  koaBodyMiddleware;
  constructor() {
    this.app = new Koa();
    this.app.use(koaCors());
    this.app.use(koaRange);
    this.router = new KoaRouter({ prefix: config_default.service.urlPrefix });
    this.koaBodyMiddleware = koaBody({
      multipart: true,
      formidable: {
        maxFileSize: 100 * 1024 * 1024,
        // 100MB
        keepExtensions: true
      },
      formLimit: "100mb",
      jsonLimit: "100mb",
      textLimit: "100mb",
      parsedMethods: ["POST", "PUT", "PATCH"]
    });
    this.app.use(async (ctx, next) => {
      if (ctx.request.type === "application/xml" || ctx.request.type === "application/ssml+xml")
        ctx.req.headers["content-type"] = "text/xml";
      try {
        await next();
      } catch (err) {
        logger_default.error(err);
        const failureBody = new FailureBody(err);
        new Response(failureBody).injectTo(ctx);
      }
    });
    this.app.use(async (ctx, next) => {
      if (ctx.is("multipart")) {
        await next();
        return;
      }
      if (ctx.is("application/json") && ["POST", "PUT", "PATCH"].includes(ctx.method)) {
        logger_default.debug("Starting custom JSON parse");
        const chunks = [];
        await new Promise((resolve, reject) => {
          ctx.req.on("data", (chunk) => {
            chunks.push(chunk);
          });
          ctx.req.on("end", () => {
            resolve(null);
          });
          ctx.req.on("error", reject);
        });
        const body = Buffer.concat(chunks).toString("utf8");
        let cleanedBody = body.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\u00A0/g, " ").replace(/[\u2000-\u200B]/g, " ").replace(/\uFEFF/g, "").trim();
        const parsedBody = JSON.parse(cleanedBody);
        logger_default.debug("Custom JSON parse successful, skipping koa-body");
        ctx.request.body = parsedBody;
        ctx.request.rawBody = cleanedBody;
        ctx._jsonProcessed = true;
      }
      await next();
    });
    this.app.use(async (ctx, next) => {
      if (!ctx._jsonProcessed) {
        await this.koaBodyMiddleware(ctx, next);
      } else {
        await next();
      }
    });
    this.app.on("error", (err) => {
      if (["ECONNRESET", "ECONNABORTED", "EPIPE", "ECANCELED"].includes(err.code)) return;
      logger_default.error(err);
    });
    logger_default.success("Server initialized");
  }
  /**
   * 附加路由
   * 
   * @param routes 路由列表
   */
  attachRoutes(routes) {
    routes.forEach((route) => {
      const prefix = route.prefix || "";
      for (let method in route) {
        if (method === "prefix") continue;
        if (!_12.isObject(route[method])) {
          logger_default.warn(`Router ${prefix} ${method} invalid`);
          continue;
        }
        for (let uri in route[method]) {
          this.router[method](`${prefix}${uri}`, async (ctx) => {
            const { request: request2, response } = await this.#requestProcessing(ctx, route[method][uri]);
            if (response != null && config_default.system.requestLog)
              logger_default.info(`<- ${request2.method} ${request2.url} ${response.time - request2.time}ms`);
          });
        }
      }
      logger_default.info(`Route ${config_default.service.urlPrefix || ""}${prefix} attached`);
    });
    this.app.use(this.router.routes());
    this.app.use((ctx) => {
      const request2 = new Request(ctx);
      logger_default.debug(`-> ${ctx.request.method} ${ctx.request.url} request is not supported - ${request2.remoteIP || "unknown"}`);
      const message = `[Bad Request]: Expected POST -> /v1/chat/completions, got ${ctx.request.method} -> ${ctx.request.url}`;
      logger_default.warn(message);
      const failureBody = new FailureBody(new Error(message));
      const response = new Response(failureBody);
      response.injectTo(ctx);
      if (config_default.system.requestLog)
        logger_default.info(`<- ${request2.method} ${request2.url} ${response.time - request2.time}ms`);
    });
  }
  /**
   * 请求处理
   * 
   * @param ctx 上下文
   * @param routeFn 路由方法
   */
  #requestProcessing(ctx, routeFn) {
    return new Promise((resolve) => {
      const request2 = new Request(ctx);
      try {
        if (config_default.system.requestLog)
          logger_default.info(`-> ${request2.method} ${request2.url}`);
        routeFn(request2).then((response) => {
          try {
            if (!Response.isInstance(response)) {
              const _response = new Response(response);
              _response.injectTo(ctx);
              return resolve({ request: request2, response: _response });
            }
            response.injectTo(ctx);
            resolve({ request: request2, response });
          } catch (err) {
            logger_default.error(err);
            const failureBody = new FailureBody(err);
            const response2 = new Response(failureBody);
            response2.injectTo(ctx);
            resolve({ request: request2, response: response2 });
          }
        }).catch((err) => {
          try {
            logger_default.error(err);
            const failureBody = new FailureBody(err);
            const response = new Response(failureBody);
            response.injectTo(ctx);
            resolve({ request: request2, response });
          } catch (err2) {
            logger_default.error(err2);
            const failureBody = new FailureBody(err2);
            const response = new Response(failureBody);
            response.injectTo(ctx);
            resolve({ request: request2, response });
          }
        });
      } catch (err) {
        logger_default.error(err);
        const failureBody = new FailureBody(err);
        const response = new Response(failureBody);
        response.injectTo(ctx);
        resolve({ request: request2, response });
      }
    });
  }
  /**
   * 监听端口
   */
  async listen() {
    const host = config_default.service.host;
    const port = config_default.service.port;
    await Promise.all([
      new Promise((resolve, reject) => {
        if (host === "0.0.0.0" || host === "localhost" || host === "127.0.0.1")
          return resolve(null);
        this.app.listen(port, "localhost", (err) => {
          if (err) return reject(err);
          resolve(null);
        });
      }),
      new Promise((resolve, reject) => {
        this.app.listen(port, host, (err) => {
          if (err) return reject(err);
          resolve(null);
        });
      })
    ]);
    logger_default.success(`Server listening on port ${port} (${host})`);
  }
};
var server_default = new Server();

// src/api/routes/index.ts
import fs9 from "fs-extra";

// src/api/routes/images.ts
import fs7 from "fs";
import _13 from "lodash";

// src/api/controllers/images.ts
import crypto2 from "crypto";

// src/lib/configs/model-config.ts
var MODEL_CONFIGS = {
  "jimeng-5.0": {
    internalModel: "high_aes_general_v50",
    draftVersion: "3.3.9",
    features: {
      multiImage: true,
      imageToImage: true,
      videoGeneration: false
    },
    defaultParams: {
      width: 2048,
      height: 2048,
      resolutions: [
        { width: 1024, height: 1024 },
        { width: 768, height: 1024 },
        { width: 1024, height: 768 },
        { width: 1024, height: 576 },
        { width: 576, height: 1024 },
        { width: 1024, height: 682 },
        { width: 682, height: 1024 },
        { width: 1195, height: 512 },
        { width: 2048, height: 2048 },
        { width: 2304, height: 1728 },
        { width: 1728, height: 2304 },
        { width: 2560, height: 1440 },
        { width: 1440, height: 2560 },
        { width: 2496, height: 1664 },
        { width: 1664, height: 2496 },
        { width: 3024, height: 1296 }
      ],
      sampleStrengthRange: [0.1, 1]
    }
  },
  "jimeng-4.6": {
    internalModel: "high_aes_general_v42",
    draftVersion: "3.3.9",
    features: {
      multiImage: true,
      imageToImage: true,
      videoGeneration: false
    },
    defaultParams: {
      width: 2048,
      height: 2048,
      resolutions: [
        { width: 1024, height: 1024 },
        { width: 768, height: 1024 },
        { width: 1024, height: 768 },
        { width: 1024, height: 576 },
        { width: 576, height: 1024 },
        { width: 1024, height: 682 },
        { width: 682, height: 1024 },
        { width: 1195, height: 512 },
        { width: 2048, height: 2048 },
        { width: 2304, height: 1728 },
        { width: 1728, height: 2304 },
        { width: 2560, height: 1440 },
        { width: 1440, height: 2560 },
        { width: 2496, height: 1664 },
        { width: 1664, height: 2496 },
        { width: 3024, height: 1296 }
      ],
      sampleStrengthRange: [0.1, 1]
    }
  },
  "jimeng-video-3.5-pro": {
    internalModel: "dreamina_ic_generate_video_model_vgfm_3.5_pro",
    draftVersion: "3.3.4",
    features: {
      multiImage: false,
      imageToImage: true,
      videoGeneration: true
    },
    defaultParams: {
      width: 1280,
      height: 720,
      resolutions: [
        { width: 1280, height: 720 },
        { width: 720, height: 1280 },
        { width: 1080, height: 1080 },
        { width: 1920, height: 1080 },
        { width: 1080, height: 1920 }
      ],
      sampleStrengthRange: [0.1, 1]
    }
  },
  "jimeng-4.5": {
    internalModel: "high_aes_general_v40l",
    draftVersion: "3.3.4",
    features: {
      multiImage: true,
      imageToImage: true,
      videoGeneration: false
    },
    defaultParams: {
      width: 2048,
      height: 2048,
      resolutions: [
        { width: 1024, height: 1024 },
        { width: 768, height: 1024 },
        { width: 1024, height: 768 },
        { width: 1024, height: 576 },
        { width: 576, height: 1024 },
        { width: 1024, height: 682 },
        { width: 682, height: 1024 },
        { width: 1195, height: 512 },
        { width: 2048, height: 2048 },
        { width: 2304, height: 1728 },
        { width: 1728, height: 2304 },
        { width: 2560, height: 1440 },
        { width: 1440, height: 2560 },
        { width: 2496, height: 1664 },
        { width: 1664, height: 2496 },
        { width: 3024, height: 1296 }
      ],
      sampleStrengthRange: [0.1, 1]
    }
  },
  "jimeng-4.1": {
    internalModel: "high_aes_general_v41",
    draftVersion: "3.3.4",
    features: {
      multiImage: true,
      imageToImage: true,
      videoGeneration: false
    },
    defaultParams: {
      width: 2048,
      height: 2048,
      resolutions: [
        { width: 1024, height: 1024 },
        { width: 768, height: 1024 },
        { width: 1024, height: 768 },
        { width: 1024, height: 576 },
        { width: 576, height: 1024 },
        { width: 1024, height: 682 },
        { width: 682, height: 1024 },
        { width: 1195, height: 512 },
        { width: 2048, height: 2048 },
        { width: 2304, height: 1728 },
        { width: 1728, height: 2304 },
        { width: 2560, height: 1440 },
        { width: 1440, height: 2560 },
        { width: 2496, height: 1664 },
        { width: 1664, height: 2496 },
        { width: 3024, height: 1296 }
      ],
      sampleStrengthRange: [0.1, 1]
    }
  },
  "jimeng-4.0": {
    internalModel: "high_aes_general_v40",
    draftVersion: "3.3.4",
    features: {
      multiImage: true,
      imageToImage: true,
      videoGeneration: false
    },
    defaultParams: {
      width: 2048,
      height: 2048,
      resolutions: [
        { width: 1024, height: 1024 },
        { width: 768, height: 1024 },
        { width: 1024, height: 768 },
        { width: 1024, height: 576 },
        { width: 576, height: 1024 },
        { width: 1024, height: 682 },
        { width: 682, height: 1024 },
        { width: 1195, height: 512 },
        { width: 2048, height: 2048 },
        { width: 2304, height: 1728 },
        { width: 1728, height: 2304 },
        { width: 2560, height: 1440 },
        { width: 1440, height: 2560 },
        { width: 2496, height: 1664 },
        { width: 1664, height: 2496 },
        { width: 3024, height: 1296 }
      ],
      sampleStrengthRange: [0.1, 1]
    }
  },
  "jimeng-3.1": {
    internalModel: "high_aes_general_v30l_art_fangzhou:general_v3.0_18b",
    draftVersion: "3.0.2",
    features: {
      multiImage: false,
      imageToImage: true,
      videoGeneration: false
    },
    defaultParams: {
      width: 1024,
      height: 1024,
      resolutions: [
        { width: 512, height: 512 },
        { width: 768, height: 768 },
        { width: 1024, height: 1024 }
      ],
      sampleStrengthRange: [0.1, 0.8]
    }
  },
  "jimeng-3.0": {
    internalModel: "high_aes_general_v30l:general_v3.0_18b",
    draftVersion: "3.0.2",
    features: {
      multiImage: false,
      imageToImage: true,
      videoGeneration: false
    },
    defaultParams: {
      width: 1024,
      height: 1024,
      resolutions: [
        { width: 512, height: 512 },
        { width: 768, height: 768 },
        { width: 1024, height: 1024 }
      ],
      sampleStrengthRange: [0.1, 0.8]
    }
  },
  "jimeng-2.1": {
    internalModel: "high_aes_general_v21_L:general_v2.1_L",
    draftVersion: "3.0.2",
    features: {
      multiImage: false,
      imageToImage: true,
      videoGeneration: false
    },
    defaultParams: {
      width: 512,
      height: 512,
      resolutions: [
        { width: 512, height: 512 },
        { width: 768, height: 768 }
      ],
      sampleStrengthRange: [0.1, 0.7]
    }
  },
  "jimeng-2.0-pro": {
    internalModel: "high_aes_general_v20_L:general_v2.0_L",
    draftVersion: "3.0.2",
    features: {
      multiImage: false,
      imageToImage: true,
      videoGeneration: false
    },
    defaultParams: {
      width: 512,
      height: 512,
      resolutions: [
        { width: 512, height: 512 },
        { width: 768, height: 768 }
      ],
      sampleStrengthRange: [0.1, 0.7]
    }
  },
  "jimeng-2.0": {
    internalModel: "high_aes_general_v20",
    draftVersion: "3.0.2",
    features: {
      multiImage: false,
      imageToImage: true,
      videoGeneration: false
    },
    defaultParams: {
      width: 512,
      height: 512,
      resolutions: [
        { width: 512, height: 512 },
        { width: 768, height: 768 }
      ],
      sampleStrengthRange: [0.1, 0.7]
    }
  },
  "jimeng-1.4": {
    internalModel: "high_aes_general_v14:general_v1.4",
    draftVersion: "3.0.2",
    features: {
      multiImage: false,
      imageToImage: true,
      videoGeneration: false
    },
    defaultParams: {
      width: 512,
      height: 512,
      resolutions: [
        { width: 512, height: 512 },
        { width: 768, height: 768 }
      ],
      sampleStrengthRange: [0.1, 0.6]
    }
  },
  "jimeng-xl-pro": {
    internalModel: "text2img_xl_sft",
    draftVersion: "3.0.2",
    features: {
      multiImage: false,
      imageToImage: true,
      videoGeneration: false
    },
    defaultParams: {
      width: 1024,
      height: 1024,
      resolutions: [
        { width: 1024, height: 1024 },
        { width: 1280, height: 720 },
        { width: 720, height: 1280 }
      ],
      sampleStrengthRange: [0.1, 0.8]
    }
  }
};
function getModelConfig(modelName) {
  const config = MODEL_CONFIGS[modelName];
  if (!config) {
    throw new Error(`Unsupported model: ${modelName}`);
  }
  return config;
}

// src/api/controllers/images.ts
var DEFAULT_ASSISTANT_ID2 = 513695;
var DEFAULT_MODEL = "jimeng-4.5";
var DRAFT_VERSION = "3.3.4";
var DRAFT_MIN_VERSION = "3.0.2";
var RESOLUTION_OPTIONS = {
  "1k": {
    "1:1": { width: 1024, height: 1024, ratio: 1 },
    "4:3": { width: 768, height: 1024, ratio: 4 },
    "3:4": { width: 1024, height: 768, ratio: 2 },
    "16:9": { width: 1024, height: 576, ratio: 3 },
    "9:16": { width: 576, height: 1024, ratio: 5 },
    "3:2": { width: 1024, height: 682, ratio: 7 },
    "2:3": { width: 682, height: 1024, ratio: 6 },
    "21:9": { width: 1195, height: 512, ratio: 8 }
  },
  "2k": {
    "1:1": { width: 2048, height: 2048, ratio: 1 },
    "4:3": { width: 2304, height: 1728, ratio: 4 },
    "3:4": { width: 1728, height: 2304, ratio: 2 },
    "16:9": { width: 2560, height: 1440, ratio: 3 },
    "9:16": { width: 1440, height: 2560, ratio: 5 },
    "3:2": { width: 2496, height: 1664, ratio: 7 },
    "2:3": { width: 1664, height: 2496, ratio: 6 },
    "21:9": { width: 3024, height: 1296, ratio: 8 }
  },
  "4k": {
    "1:1": { width: 4096, height: 4096, ratio: 101 },
    "4:3": { width: 4608, height: 3456, ratio: 104 },
    "3:4": { width: 3456, height: 4608, ratio: 102 },
    "16:9": { width: 5120, height: 2880, ratio: 103 },
    "9:16": { width: 2880, height: 5120, ratio: 105 },
    "3:2": { width: 4992, height: 3328, ratio: 107 },
    "2:3": { width: 3328, height: 4992, ratio: 106 },
    "21:9": { width: 6048, height: 2592, ratio: 108 }
  }
};
function resolveResolution(resolution = "2k", ratio = "1:1") {
  const resolutionGroup = RESOLUTION_OPTIONS[resolution];
  if (!resolutionGroup) {
    const supportedResolutions = Object.keys(RESOLUTION_OPTIONS).join(", ");
    throw new Error(`\u4E0D\u652F\u6301\u7684\u5206\u8FA8\u7387 "${resolution}"\u3002\u652F\u6301\u7684\u5206\u8FA8\u7387: ${supportedResolutions}`);
  }
  const ratioConfig = resolutionGroup[ratio];
  if (!ratioConfig) {
    const supportedRatios = Object.keys(resolutionGroup).join(", ");
    throw new Error(`\u5728 "${resolution}" \u5206\u8FA8\u7387\u4E0B\uFF0C\u4E0D\u652F\u6301\u7684\u6BD4\u4F8B "${ratio}"\u3002\u652F\u6301\u7684\u6BD4\u4F8B: ${supportedRatios}`);
  }
  return {
    width: ratioConfig.width,
    height: ratioConfig.height,
    imageRatio: ratioConfig.ratio,
    resolutionType: resolution
  };
}
var MODEL_DRAFT_VERSIONS = {
  "jimeng-5.0": "3.3.9",
  "jimeng-4.6": "3.3.9",
  "jimeng-4.5": "3.3.4",
  "jimeng-4.1": "3.3.4",
  "jimeng-4.0": "3.3.4",
  "jimeng-3.1": "3.0.2",
  "jimeng-3.0": "3.0.2",
  "jimeng-2.1": "3.0.2",
  "jimeng-2.0-pro": "3.0.2",
  "jimeng-2.0": "3.0.2",
  "jimeng-1.4": "3.0.2",
  "jimeng-xl-pro": "3.0.2"
};
function getDraftVersion(model) {
  try {
    const config = getModelConfig(model);
    return config.draftVersion;
  } catch (e) {
    return MODEL_DRAFT_VERSIONS[model] || DRAFT_VERSION;
  }
}
var MODEL_MAP = {
  "jimeng-5.0": "high_aes_general_v50",
  "jimeng-4.6": "high_aes_general_v42",
  "jimeng-4.5": "high_aes_general_v40l",
  "jimeng-4.1": "high_aes_general_v41",
  "jimeng-4.0": "high_aes_general_v40",
  "jimeng-3.1": "high_aes_general_v30l_art_fangzhou:general_v3.0_18b",
  "jimeng-3.0": "high_aes_general_v30l:general_v3.0_18b",
  "jimeng-2.1": "high_aes_general_v21_L:general_v2.1_L",
  "jimeng-2.0-pro": "high_aes_general_v20_L:general_v2.0_L",
  "jimeng-2.0": "high_aes_general_v20:general_v2.0",
  "jimeng-1.4": "high_aes_general_v14:general_v1.4",
  "jimeng-xl-pro": "text2img_xl_sft"
};
function getModel(model) {
  try {
    const config = getModelConfig(model);
    return config.internalModel;
  } catch (e) {
    return MODEL_MAP[model] || MODEL_MAP[DEFAULT_MODEL];
  }
}
function createSignature(method, url, headers, accessKeyId, secretAccessKey, sessionToken, payload = "") {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname || "/";
  const search = urlObj.search;
  const timestamp = headers["x-amz-date"];
  const date = timestamp.substr(0, 8);
  const region = "cn-north-1";
  const service = "imagex";
  const queryParams = [];
  const searchParams = new URLSearchParams(search);
  searchParams.forEach((value, key) => {
    queryParams.push([key, value]);
  });
  queryParams.sort(([a], [b]) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  });
  const canonicalQueryString = queryParams.map(([key, value]) => `${key}=${value}`).join("&");
  const headersToSign = {
    "x-amz-date": timestamp
  };
  if (sessionToken) {
    headersToSign["x-amz-security-token"] = sessionToken;
  }
  let payloadHash = crypto2.createHash("sha256").update("").digest("hex");
  if (method.toUpperCase() === "POST" && payload) {
    payloadHash = crypto2.createHash("sha256").update(payload, "utf8").digest("hex");
    headersToSign["x-amz-content-sha256"] = payloadHash;
  }
  const signedHeaders = Object.keys(headersToSign).map((key) => key.toLowerCase()).sort().join(";");
  const canonicalHeaders = Object.keys(headersToSign).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).map((key) => `${key.toLowerCase()}:${headersToSign[key].trim()}
`).join("");
  const canonicalRequest = [
    method.toUpperCase(),
    pathname,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join("\n");
  logger_default.debug(`\u89C4\u8303\u8BF7\u6C42:
Method: ${method.toUpperCase()}
Path: ${pathname}
Query: ${canonicalQueryString}
Headers: ${canonicalHeaders}
SignedHeaders: ${signedHeaders}
PayloadHash: ${payloadHash}
---\u5B8C\u6574\u89C4\u8303\u8BF7\u6C42---
${canonicalRequest}
---\u7ED3\u675F---`);
  const credentialScope = `${date}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    timestamp,
    credentialScope,
    crypto2.createHash("sha256").update(canonicalRequest, "utf8").digest("hex")
  ].join("\n");
  logger_default.debug(`\u5F85\u7B7E\u540D\u5B57\u7B26\u4E32:
${stringToSign}`);
  const kDate = crypto2.createHmac("sha256", `AWS4${secretAccessKey}`).update(date).digest();
  const kRegion = crypto2.createHmac("sha256", kDate).update(region).digest();
  const kService = crypto2.createHmac("sha256", kRegion).update(service).digest();
  const kSigning = crypto2.createHmac("sha256", kService).update("aws4_request").digest();
  const signature = crypto2.createHmac("sha256", kSigning).update(stringToSign, "utf8").digest("hex");
  return `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}
function calculateCRC32(buffer) {
  const crcTable = [];
  for (let i = 0; i < 256; i++) {
    let crc2 = i;
    for (let j = 0; j < 8; j++) {
      crc2 = crc2 & 1 ? 3988292384 ^ crc2 >>> 1 : crc2 >>> 1;
    }
    crcTable[i] = crc2;
  }
  let crc = 0 ^ -1;
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) {
    crc = crc >>> 8 ^ crcTable[(crc ^ bytes[i]) & 255];
  }
  return ((crc ^ -1) >>> 0).toString(16).padStart(8, "0");
}
async function uploadImageFromUrl(imageUrl, refreshToken) {
  var _a, _b, _c, _d, _e, _f;
  try {
    logger_default.info(`\u5F00\u59CB\u4E0A\u4F20\u56FE\u7247: ${imageUrl}`);
    const tokenResult = await request("post", "/mweb/v1/get_upload_token", refreshToken, {
      data: {
        scene: 2
        // AIGC 图片上传场景
      }
    });
    const { access_key_id, secret_access_key, session_token, service_id } = tokenResult;
    if (!access_key_id || !secret_access_key || !session_token) {
      throw new Error("\u83B7\u53D6\u4E0A\u4F20\u4EE4\u724C\u5931\u8D25");
    }
    const actualServiceId = service_id || "tb4s082cfz";
    logger_default.info(`\u83B7\u53D6\u4E0A\u4F20\u4EE4\u724C\u6210\u529F: service_id=${actualServiceId}`);
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`\u4E0B\u8F7D\u56FE\u7247\u5931\u8D25: ${imageResponse.status}`);
    }
    const imageBuffer = await imageResponse.arrayBuffer();
    const fileSize = imageBuffer.byteLength;
    const crc32 = calculateCRC32(imageBuffer);
    logger_default.info(`\u56FE\u7247\u4E0B\u8F7D\u5B8C\u6210: \u5927\u5C0F=${fileSize}\u5B57\u8282, CRC32=${crc32}`);
    const now = /* @__PURE__ */ new Date();
    const timestamp = now.toISOString().replace(/[:\-]/g, "").replace(/\.\d{3}Z$/, "Z");
    const randomStr = Math.random().toString(36).substring(2, 12);
    const applyUrl = `https://imagex.bytedanceapi.com/?Action=ApplyImageUpload&Version=2018-08-01&ServiceId=${actualServiceId}&FileSize=${fileSize}&s=${randomStr}`;
    logger_default.debug(`\u539F\u59CBURL: ${applyUrl}`);
    const requestHeaders = {
      "x-amz-date": timestamp,
      "x-amz-security-token": session_token
    };
    const authorization = createSignature("GET", applyUrl, requestHeaders, access_key_id, secret_access_key, session_token);
    logger_default.info(`AWS\u7B7E\u540D\u8C03\u8BD5\u4FE1\u606F:
      URL: ${applyUrl}
      AccessKeyId: ${access_key_id}
      SessionToken: ${session_token ? "\u5B58\u5728" : "\u4E0D\u5B58\u5728"}
      Timestamp: ${timestamp}
      Authorization: ${authorization}
    `);
    const applyResponse = await fetch(applyUrl, {
      method: "GET",
      headers: {
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9",
        "authorization": authorization,
        "origin": "https://jimeng.jianying.com",
        "referer": "https://jimeng.jianying.com/ai-tool/generate",
        "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
        "x-amz-date": timestamp,
        "x-amz-security-token": session_token
      }
    });
    if (!applyResponse.ok) {
      const errorText = await applyResponse.text();
      throw new Error(`\u7533\u8BF7\u4E0A\u4F20\u6743\u9650\u5931\u8D25: ${applyResponse.status} - ${errorText}`);
    }
    const applyResult = await applyResponse.json();
    if ((_a = applyResult == null ? void 0 : applyResult.ResponseMetadata) == null ? void 0 : _a.Error) {
      throw new Error(`\u7533\u8BF7\u4E0A\u4F20\u6743\u9650\u5931\u8D25: ${JSON.stringify(applyResult.ResponseMetadata.Error)}`);
    }
    logger_default.info(`\u7533\u8BF7\u4E0A\u4F20\u6743\u9650\u6210\u529F`);
    const uploadAddress = (_b = applyResult == null ? void 0 : applyResult.Result) == null ? void 0 : _b.UploadAddress;
    if (!uploadAddress || !uploadAddress.StoreInfos || !uploadAddress.UploadHosts) {
      throw new Error(`\u83B7\u53D6\u4E0A\u4F20\u5730\u5740\u5931\u8D25: ${JSON.stringify(applyResult)}`);
    }
    const storeInfo = uploadAddress.StoreInfos[0];
    const uploadHost = uploadAddress.UploadHosts[0];
    const auth = storeInfo.Auth;
    const uploadUrl = `https://${uploadHost}/upload/v1/${storeInfo.StoreUri}`;
    const imageId = storeInfo.StoreUri.split("/").pop();
    logger_default.info(`\u51C6\u5907\u4E0A\u4F20\u56FE\u7247: imageId=${imageId}, uploadUrl=${uploadUrl}`);
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Accept": "*/*",
        "Accept-Language": "zh-CN,zh;q=0.9",
        "Authorization": auth,
        "Connection": "keep-alive",
        "Content-CRC32": crc32,
        "Content-Disposition": 'attachment; filename="undefined"',
        "Content-Type": "application/octet-stream",
        "Origin": "https://jimeng.jianying.com",
        "Referer": "https://jimeng.jianying.com/ai-tool/generate",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
        "X-Storage-U": "704135154117550"
        // 用户ID，可以从token或其他地方获取
      },
      body: imageBuffer
    });
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`\u56FE\u7247\u4E0A\u4F20\u5931\u8D25: ${uploadResponse.status} - ${errorText}`);
    }
    logger_default.info(`\u56FE\u7247\u6587\u4EF6\u4E0A\u4F20\u6210\u529F`);
    const commitUrl = `https://imagex.bytedanceapi.com/?Action=CommitImageUpload&Version=2018-08-01&ServiceId=${actualServiceId}`;
    const commitTimestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:\-]/g, "").replace(/\.\d{3}Z$/, "Z");
    const commitPayload = JSON.stringify({
      SessionKey: uploadAddress.SessionKey,
      SuccessActionStatus: "200"
    });
    const payloadHash = crypto2.createHash("sha256").update(commitPayload, "utf8").digest("hex");
    const commitRequestHeaders = {
      "x-amz-date": commitTimestamp,
      "x-amz-security-token": session_token,
      "x-amz-content-sha256": payloadHash
    };
    const commitAuthorization = createSignature("POST", commitUrl, commitRequestHeaders, access_key_id, secret_access_key, session_token, commitPayload);
    const commitResponse = await fetch(commitUrl, {
      method: "POST",
      headers: {
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9",
        "authorization": commitAuthorization,
        "content-type": "application/json",
        "origin": "https://jimeng.jianying.com",
        "referer": "https://jimeng.jianying.com/ai-tool/generate",
        "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
        "x-amz-date": commitTimestamp,
        "x-amz-security-token": session_token,
        "x-amz-content-sha256": payloadHash
      },
      body: commitPayload
    });
    if (!commitResponse.ok) {
      const errorText = await commitResponse.text();
      throw new Error(`\u63D0\u4EA4\u4E0A\u4F20\u5931\u8D25: ${commitResponse.status} - ${errorText}`);
    }
    const commitResult = await commitResponse.json();
    if ((_c = commitResult == null ? void 0 : commitResult.ResponseMetadata) == null ? void 0 : _c.Error) {
      throw new Error(`\u63D0\u4EA4\u4E0A\u4F20\u5931\u8D25: ${JSON.stringify(commitResult.ResponseMetadata.Error)}`);
    }
    if (!((_d = commitResult == null ? void 0 : commitResult.Result) == null ? void 0 : _d.Results) || commitResult.Result.Results.length === 0) {
      throw new Error(`\u63D0\u4EA4\u4E0A\u4F20\u54CD\u5E94\u7F3A\u5C11\u7ED3\u679C: ${JSON.stringify(commitResult)}`);
    }
    const uploadResult = commitResult.Result.Results[0];
    if (uploadResult.UriStatus !== 2e3) {
      throw new Error(`\u56FE\u7247\u4E0A\u4F20\u72B6\u6001\u5F02\u5E38: UriStatus=${uploadResult.UriStatus}`);
    }
    const fullImageUri = uploadResult.Uri;
    const pluginResult = (_f = (_e = commitResult.Result) == null ? void 0 : _e.PluginResult) == null ? void 0 : _f[0];
    if (pluginResult) {
      logger_default.info(`\u56FE\u7247\u4E0A\u4F20\u6210\u529F\u8BE6\u60C5:`, {
        imageUri: pluginResult.ImageUri,
        sourceUri: pluginResult.SourceUri,
        size: `${pluginResult.ImageWidth}x${pluginResult.ImageHeight}`,
        format: pluginResult.ImageFormat,
        fileSize: pluginResult.ImageSize,
        md5: pluginResult.ImageMd5
      });
      if (pluginResult.ImageUri) {
        logger_default.info(`\u56FE\u7247\u4E0A\u4F20\u5B8C\u6210: ${pluginResult.ImageUri}`);
        return pluginResult.ImageUri;
      }
    }
    logger_default.info(`\u56FE\u7247\u4E0A\u4F20\u5B8C\u6210: ${fullImageUri}`);
    return fullImageUri;
  } catch (error) {
    logger_default.error(`\u56FE\u7247\u4E0A\u4F20\u5931\u8D25: ${error.message}`);
    throw error;
  }
}
async function uploadImageBuffer(buffer, refreshToken) {
  try {
    logger_default.info(`\u5F00\u59CB\u4ECEBuffer\u4E0A\u4F20\u56FE\u7247\uFF0C\u5927\u5C0F: ${buffer.length}\u5B57\u8282`);
    const proofResult = await request(
      "POST",
      "/mweb/v1/get_upload_image_proof",
      refreshToken,
      {
        data: {
          scene: "aigc_image",
          file_name: `${util_default.uuid()}.jpg`,
          file_size: buffer.length
        }
      }
    );
    if (!proofResult || !proofResult.proof_info) {
      logger_default.error(`\u83B7\u53D6\u4E0A\u4F20\u51ED\u8BC1\u5931\u8D25: ${JSON.stringify(proofResult)}`);
      throw new APIException(exceptions_default.API_REQUEST_FAILED, "\u83B7\u53D6\u4E0A\u4F20\u51ED\u8BC1\u5931\u8D25");
    }
    logger_default.info(`\u83B7\u53D6\u4E0A\u4F20\u51ED\u8BC1\u6210\u529F`);
    const { proof_info } = proofResult;
    const uploadProofUrl = "https://imagex.bytedanceapi.com/";
    const formData = new FormData();
    const blob = new Blob([buffer], { type: "image/jpeg" });
    formData.append("file", blob, `${util_default.uuid()}.jpg`);
    const uploadResult = await fetch(uploadProofUrl + "?" + new URLSearchParams(proof_info.query_params).toString(), {
      method: "POST",
      headers: proof_info.headers,
      body: formData
    });
    if (!uploadResult.ok) {
      logger_default.error(`\u4E0A\u4F20\u6587\u4EF6\u5931\u8D25: \u72B6\u6001\u7801 ${uploadResult.status}`);
      throw new APIException(exceptions_default.API_REQUEST_FAILED, `\u4E0A\u4F20\u6587\u4EF6\u5931\u8D25: \u72B6\u6001\u7801 ${uploadResult.status}`);
    }
    if (!proof_info.image_uri) {
      logger_default.error(`\u4E0A\u4F20\u51ED\u8BC1\u4E2D\u7F3A\u5C11 image_uri: ${JSON.stringify(proof_info)}`);
      throw new APIException(exceptions_default.API_REQUEST_FAILED, "\u4E0A\u4F20\u51ED\u8BC1\u4E2D\u7F3A\u5C11 image_uri");
    }
    logger_default.info(`Buffer\u56FE\u7247\u4E0A\u4F20\u6210\u529F: ${proof_info.image_uri}`);
    return proof_info.image_uri;
  } catch (error) {
    logger_default.error(`Buffer\u56FE\u7247\u4E0A\u4F20\u5931\u8D25: ${error.message}`);
    throw error;
  }
}
async function generateImageComposition(_model, prompt, imageUrls, {
  ratio = "1:1",
  resolution = "2k",
  sampleStrength = 0.5,
  negativePrompt = "",
  intelligentRatio = false
}, refreshToken) {
  const model = getModel(_model);
  const draftVersion = getDraftVersion(_model);
  const imageCount = imageUrls.length;
  const resolutionResult = resolveResolution(resolution, ratio);
  const { width, height, imageRatio, resolutionType } = resolutionResult;
  logger_default.info(`\u4F7F\u7528\u6A21\u578B: ${_model} \u6620\u5C04\u6A21\u578B: ${model} \u56FE\u751F\u56FE\u529F\u80FD ${imageCount}\u5F20\u56FE\u7247 ${width}x${height} (${ratio}@${resolution}) \u7CBE\u7EC6\u5EA6: ${sampleStrength}`);
  const { totalCredit } = await getCredit(refreshToken);
  if (totalCredit <= 0)
    await receiveCredit(refreshToken);
  const uploadedImageIds = [];
  for (let i = 0; i < imageUrls.length; i++) {
    try {
      const image = imageUrls[i];
      let imageId;
      if (typeof image === "string") {
        logger_default.info(`\u6B63\u5728\u5904\u7406\u7B2C ${i + 1}/${imageCount} \u5F20\u56FE\u7247 (URL)...`);
        imageId = await uploadImageFromUrl(image, refreshToken);
      } else {
        logger_default.info(`\u6B63\u5728\u5904\u7406\u7B2C ${i + 1}/${imageCount} \u5F20\u56FE\u7247 (Buffer)...`);
        imageId = await uploadImageBuffer(image, refreshToken);
      }
      uploadedImageIds.push(imageId);
      logger_default.info(`\u56FE\u7247 ${i + 1}/${imageCount} \u4E0A\u4F20\u6210\u529F: ${imageId}`);
    } catch (error) {
      logger_default.error(`\u56FE\u7247 ${i + 1}/${imageCount} \u4E0A\u4F20\u5931\u8D25: ${error.message}`);
      throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, `\u56FE\u7247\u4E0A\u4F20\u5931\u8D25: ${error.message}`);
    }
  }
  logger_default.info(`\u6240\u6709\u56FE\u7247\u4E0A\u4F20\u5B8C\u6210\uFF0C\u5F00\u59CB\u56FE\u751F\u56FE: ${uploadedImageIds.join(", ")}`);
  const componentId = util_default.uuid();
  const submitId = util_default.uuid();
  const sceneOption = {
    type: "image",
    scene: "ImageBasicGenerate",
    modelReqKey: _model,
    resolutionType,
    abilityList: uploadedImageIds.map(() => ({
      abilityName: "byte_edit",
      strength: sampleStrength,
      source: {
        imageUrl: `blob:https://jimeng.jianying.com/${util_default.uuid()}`
      }
    })),
    reportParams: {
      enterSource: "generate",
      vipSource: "generate",
      extraVipFunctionKey: `${_model}-${resolutionType}`,
      useVipFunctionDetailsReporterHoc: true
    }
  };
  const { aigc_data } = await request(
    "post",
    "/mweb/v1/aigc_draft/generate",
    refreshToken,
    {
      data: {
        extend: {
          root_model: model
        },
        submit_id: submitId,
        metrics_extra: JSON.stringify({
          promptSource: "custom",
          generateCount: 1,
          enterFrom: "click",
          sceneOptions: JSON.stringify([sceneOption]),
          generateId: submitId,
          isRegenerate: false
        }),
        draft_content: JSON.stringify({
          type: "draft",
          id: util_default.uuid(),
          min_version: "3.2.9",
          min_features: [],
          is_from_tsn: true,
          version: "3.2.9",
          main_component_id: componentId,
          component_list: [
            {
              type: "image_base_component",
              id: componentId,
              min_version: "3.0.2",
              aigc_mode: "workbench",
              metadata: {
                type: "",
                id: util_default.uuid(),
                created_platform: 3,
                created_platform_version: "",
                created_time_in_ms: Date.now().toString(),
                created_did: ""
              },
              generate_type: "blend",
              abilities: {
                type: "",
                id: util_default.uuid(),
                blend: {
                  type: "",
                  id: util_default.uuid(),
                  min_version: "3.2.9",
                  min_features: [],
                  core_param: {
                    type: "",
                    id: util_default.uuid(),
                    model,
                    prompt: `${"#".repeat(imageCount * 2)}${prompt}`,
                    sample_strength: sampleStrength,
                    image_ratio: imageRatio,
                    large_image_info: {
                      type: "",
                      id: util_default.uuid(),
                      height,
                      width,
                      resolution_type: resolutionType
                    },
                    intelligent_ratio: intelligentRatio
                  },
                  ability_list: uploadedImageIds.map((imageId) => ({
                    type: "",
                    id: util_default.uuid(),
                    name: "byte_edit",
                    image_uri_list: [imageId],
                    image_list: [{
                      type: "image",
                      id: util_default.uuid(),
                      source_from: "upload",
                      platform_type: 1,
                      name: "",
                      image_uri: imageId,
                      width: 0,
                      height: 0,
                      format: "",
                      uri: imageId
                    }],
                    strength: 0.5
                  })),
                  prompt_placeholder_info_list: uploadedImageIds.map((_17, index) => ({
                    type: "",
                    id: util_default.uuid(),
                    ability_index: index
                  })),
                  postedit_param: {
                    type: "",
                    id: util_default.uuid(),
                    generate_type: 0
                  }
                }
              }
            }
          ]
        }),
        http_common_info: {
          aid: DEFAULT_ASSISTANT_ID2
        }
      }
    }
  );
  const historyId = aigc_data == null ? void 0 : aigc_data.history_record_id;
  if (!historyId)
    throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u8BB0\u5F55ID\u4E0D\u5B58\u5728");
  logger_default.info(`\u56FE\u751F\u56FE\u4EFB\u52A1\u5DF2\u63D0\u4EA4\uFF0Chistory_id: ${historyId}\uFF0C\u7B49\u5F85\u751F\u6210\u5B8C\u6210...`);
  let status = 20, failCode, item_list = [];
  let pollCount = 0;
  const maxPollCount = 600;
  while (pollCount < maxPollCount) {
    await new Promise((resolve) => setTimeout(resolve, 1e3));
    pollCount++;
    if (pollCount % 30 === 0) {
      logger_default.info(`\u56FE\u751F\u56FE\u8FDB\u5EA6: \u7B2C ${pollCount} \u6B21\u8F6E\u8BE2 (history_id: ${historyId})\uFF0C\u5F53\u524D\u72B6\u6001: ${status}\uFF0C\u5DF2\u751F\u6210: ${item_list.length} \u5F20\u56FE\u7247...`);
    }
    const result = await request("post", "/mweb/v1/get_history_by_ids", refreshToken, {
      data: {
        history_ids: [historyId],
        image_info: {
          width: 2048,
          height: 2048,
          format: "webp",
          image_scene_list: [
            {
              scene: "smart_crop",
              width: 360,
              height: 360,
              uniq_key: "smart_crop-w:360-h:360",
              format: "webp"
            },
            {
              scene: "smart_crop",
              width: 480,
              height: 480,
              uniq_key: "smart_crop-w:480-h:480",
              format: "webp"
            },
            {
              scene: "smart_crop",
              width: 720,
              height: 720,
              uniq_key: "smart_crop-w:720-h:720",
              format: "webp"
            },
            {
              scene: "smart_crop",
              width: 720,
              height: 480,
              uniq_key: "smart_crop-w:720-h:480",
              format: "webp"
            },
            {
              scene: "normal",
              width: 2400,
              height: 2400,
              uniq_key: "2400",
              format: "webp"
            },
            {
              scene: "normal",
              width: 1080,
              height: 1080,
              uniq_key: "1080",
              format: "webp"
            },
            {
              scene: "normal",
              width: 720,
              height: 720,
              uniq_key: "720",
              format: "webp"
            },
            {
              scene: "normal",
              width: 480,
              height: 480,
              uniq_key: "480",
              format: "webp"
            },
            {
              scene: "normal",
              width: 360,
              height: 360,
              uniq_key: "360",
              format: "webp"
            }
          ]
        },
        http_common_info: {
          aid: DEFAULT_ASSISTANT_ID2
        }
      }
    });
    if (!result[historyId])
      throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u8BB0\u5F55\u4E0D\u5B58\u5728");
    status = result[historyId].status;
    failCode = result[historyId].fail_code;
    item_list = result[historyId].item_list || [];
    if (item_list.length > 0) {
      logger_default.info(`\u56FE\u751F\u56FE\u5B8C\u6210: \u72B6\u6001=${status}, \u5DF2\u751F\u6210 ${item_list.length} \u5F20\u56FE\u7247`);
      break;
    }
    if (pollCount % 60 === 0) {
      logger_default.info(`\u56FE\u751F\u56FE\u8BE6\u7EC6\u72B6\u6001: status=${status}, item_list.length=${item_list.length}, failCode=${failCode || "none"}`);
    }
    if (status === 10 && item_list.length === 0 && pollCount % 30 === 0) {
      logger_default.info(`\u56FE\u751F\u56FE\u72B6\u6001\u5DF2\u5B8C\u6210\u4F46\u65E0\u56FE\u7247\u751F\u6210: \u72B6\u6001=${status}, \u7EE7\u7EED\u7B49\u5F85...`);
    }
  }
  if (pollCount >= maxPollCount) {
    logger_default.warn(`\u56FE\u751F\u56FE\u8D85\u65F6: \u8F6E\u8BE2\u4E86 ${pollCount} \u6B21\uFF0C\u5F53\u524D\u72B6\u6001: ${status}\uFF0C\u5DF2\u751F\u6210\u56FE\u7247\u6570: ${item_list.length}`);
  }
  if (status === 30) {
    if (failCode === "2038")
      throw new APIException(exceptions_default.API_CONTENT_FILTERED);
    else
      throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, `\u56FE\u751F\u56FE\u5931\u8D25\uFF0C\u9519\u8BEF\u4EE3\u7801: ${failCode}`);
  }
  const resultImageUrls = item_list.map((item) => {
    var _a, _b, _c, _d;
    if (!((_c = (_b = (_a = item == null ? void 0 : item.image) == null ? void 0 : _a.large_images) == null ? void 0 : _b[0]) == null ? void 0 : _c.image_url))
      return ((_d = item == null ? void 0 : item.common_attr) == null ? void 0 : _d.cover_url) || null;
    return item.image.large_images[0].image_url;
  }).filter((url) => url !== null);
  logger_default.info(`\u56FE\u751F\u56FE\u7ED3\u679C: \u6210\u529F\u751F\u6210 ${resultImageUrls.length} \u5F20\u56FE\u7247`);
  return resultImageUrls;
}
async function generateMultiImages(_model, prompt, {
  ratio = "1:1",
  resolution = "2k",
  sampleStrength = 0.5,
  negativePrompt = "",
  intelligentRatio = false
}, refreshToken) {
  const model = getModel(_model);
  const resolutionResult = resolveResolution(resolution, ratio);
  const { width, height, imageRatio, resolutionType } = resolutionResult;
  const targetImageCount = prompt.match(/(\d+)张/) ? parseInt(prompt.match(/(\d+)张/)[1]) : 4;
  logger_default.info(`\u4F7F\u7528 ${_model} \u591A\u56FE\u751F\u6210: ${targetImageCount}\u5F20\u56FE\u7247 ${width}x${height} (${ratio}@${resolution}) \u7CBE\u7EC6\u5EA6: ${sampleStrength}`);
  const componentId = util_default.uuid();
  const submitId = util_default.uuid();
  const sceneOption = {
    type: "image",
    scene: "ImageMultiGenerate",
    modelReqKey: _model,
    resolutionType,
    abilityList: [],
    reportParams: {
      enterSource: "generate",
      vipSource: "generate",
      extraVipFunctionKey: `${_model}-${resolutionType}`,
      useVipFunctionDetailsReporterHoc: true
    }
  };
  const { aigc_data } = await request(
    "post",
    "/mweb/v1/aigc_draft/generate",
    refreshToken,
    {
      data: {
        extend: {
          root_model: model
        },
        submit_id: submitId,
        metrics_extra: JSON.stringify({
          promptSource: "custom",
          generateCount: 1,
          enterFrom: "click",
          sceneOptions: JSON.stringify([sceneOption]),
          generateId: submitId,
          isRegenerate: false,
          templateId: "",
          templateSource: "",
          lastRequestId: "",
          originRequestId: ""
        }),
        draft_content: JSON.stringify({
          type: "draft",
          id: util_default.uuid(),
          min_version: DRAFT_MIN_VERSION,
          min_features: [],
          is_from_tsn: true,
          version: DRAFT_VERSION,
          main_component_id: componentId,
          component_list: [
            {
              type: "image_base_component",
              id: componentId,
              min_version: DRAFT_MIN_VERSION,
              aigc_mode: "workbench",
              metadata: {
                type: "",
                id: util_default.uuid(),
                created_platform: 3,
                created_platform_version: "",
                created_time_in_ms: Date.now().toString(),
                created_did: ""
              },
              generate_type: "generate",
              abilities: {
                type: "",
                id: util_default.uuid(),
                generate: {
                  type: "",
                  id: util_default.uuid(),
                  core_param: {
                    type: "",
                    id: util_default.uuid(),
                    model,
                    prompt,
                    negative_prompt: negativePrompt,
                    seed: Math.floor(Math.random() * 1e8) + 25e8,
                    sample_strength: sampleStrength,
                    image_ratio: imageRatio,
                    large_image_info: {
                      type: "",
                      id: util_default.uuid(),
                      min_version: DRAFT_MIN_VERSION,
                      height,
                      width,
                      resolution_type: resolutionType
                    },
                    intelligent_ratio: intelligentRatio
                  },
                  gen_option: {
                    type: "",
                    id: util_default.uuid(),
                    generate_all: false
                  }
                }
              }
            }
          ]
        }),
        http_common_info: {
          aid: DEFAULT_ASSISTANT_ID2
        }
      }
    }
  );
  const historyId = aigc_data == null ? void 0 : aigc_data.history_record_id;
  if (!historyId)
    throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u8BB0\u5F55ID\u4E0D\u5B58\u5728");
  logger_default.info(`\u591A\u56FE\u751F\u6210\u4EFB\u52A1\u5DF2\u63D0\u4EA4\uFF0Csubmit_id: ${submitId}, history_id: ${historyId}\uFF0C\u7B49\u5F85\u751F\u6210 ${targetImageCount} \u5F20\u56FE\u7247...`);
  let status = 20, failCode, item_list = [];
  let pollCount = 0;
  const maxPollCount = 600;
  while (pollCount < maxPollCount) {
    await new Promise((resolve) => setTimeout(resolve, 1e3));
    pollCount++;
    if (pollCount % 30 === 0) {
      logger_default.info(`\u591A\u56FE\u751F\u6210\u8FDB\u5EA6: \u7B2C ${pollCount} \u6B21\u8F6E\u8BE2 (history_id: ${historyId})\uFF0C\u5F53\u524D\u72B6\u6001: ${status}\uFF0C\u5DF2\u751F\u6210: ${item_list.length}/${targetImageCount} \u5F20\u56FE\u7247...`);
    }
    const result = await request("post", "/mweb/v1/get_history_by_ids", refreshToken, {
      data: {
        history_ids: [historyId],
        image_info: {
          width: 2048,
          height: 2048,
          format: "webp",
          image_scene_list: [
            {
              scene: "smart_crop",
              width: 360,
              height: 360,
              uniq_key: "smart_crop-w:360-h:360",
              format: "webp"
            },
            {
              scene: "smart_crop",
              width: 480,
              height: 480,
              uniq_key: "smart_crop-w:480-h:480",
              format: "webp"
            },
            {
              scene: "smart_crop",
              width: 720,
              height: 720,
              uniq_key: "smart_crop-w:720-h:720",
              format: "webp"
            },
            {
              scene: "smart_crop",
              width: 720,
              height: 480,
              uniq_key: "smart_crop-w:720-h:480",
              format: "webp"
            },
            {
              scene: "normal",
              width: 2400,
              height: 2400,
              uniq_key: "2400",
              format: "webp"
            },
            {
              scene: "normal",
              width: 1080,
              height: 1080,
              uniq_key: "1080",
              format: "webp"
            },
            {
              scene: "normal",
              width: 720,
              height: 720,
              uniq_key: "720",
              format: "webp"
            },
            {
              scene: "normal",
              width: 480,
              height: 480,
              uniq_key: "480",
              format: "webp"
            },
            {
              scene: "normal",
              width: 360,
              height: 360,
              uniq_key: "360",
              format: "webp"
            }
          ]
        },
        http_common_info: {
          aid: DEFAULT_ASSISTANT_ID2
        }
      }
    });
    if (!result[historyId])
      throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u8BB0\u5F55\u4E0D\u5B58\u5728");
    status = result[historyId].status;
    failCode = result[historyId].fail_code;
    item_list = result[historyId].item_list || [];
    if (item_list.length >= targetImageCount) {
      logger_default.info(`\u591A\u56FE\u751F\u6210\u5B8C\u6210: \u72B6\u6001=${status}, \u5DF2\u751F\u6210 ${item_list.length} \u5F20\u56FE\u7247`);
      break;
    }
    if (pollCount % 60 === 0) {
      logger_default.info(`jimeng-4.0 \u8BE6\u7EC6\u72B6\u6001: status=${status}, item_list.length=${item_list.length}, failCode=${failCode || "none"}`);
    }
    if (status === 10 && item_list.length < targetImageCount && pollCount % 30 === 0) {
      logger_default.info(`jimeng-4.0 \u72B6\u6001\u5DF2\u5B8C\u6210\u4F46\u56FE\u7247\u6570\u91CF\u4E0D\u8DB3: \u72B6\u6001=${status}, \u5DF2\u751F\u6210 ${item_list.length}/${targetImageCount} \u5F20\u56FE\u7247\uFF0C\u7EE7\u7EED\u7B49\u5F85...`);
    }
  }
  if (pollCount >= maxPollCount) {
    logger_default.warn(`\u591A\u56FE\u751F\u6210\u8D85\u65F6: \u8F6E\u8BE2\u4E86 ${pollCount} \u6B21\uFF0C\u5F53\u524D\u72B6\u6001: ${status}\uFF0C\u5DF2\u751F\u6210\u56FE\u7247\u6570: ${item_list.length}`);
  }
  if (status === 30) {
    if (failCode === "2038")
      throw new APIException(exceptions_default.API_CONTENT_FILTERED);
    else
      throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, `\u751F\u6210\u5931\u8D25\uFF0C\u9519\u8BEF\u4EE3\u7801: ${failCode}`);
  }
  const imageUrls = item_list.map((item) => {
    var _a, _b, _c, _d;
    if (!((_c = (_b = (_a = item == null ? void 0 : item.image) == null ? void 0 : _a.large_images) == null ? void 0 : _b[0]) == null ? void 0 : _c.image_url))
      return ((_d = item == null ? void 0 : item.common_attr) == null ? void 0 : _d.cover_url) || null;
    return item.image.large_images[0].image_url;
  }).filter((url) => url !== null);
  logger_default.info(`\u591A\u56FE\u751F\u6210\u7ED3\u679C: \u6210\u529F\u751F\u6210 ${imageUrls.length} \u5F20\u56FE\u7247`);
  return imageUrls;
}
async function generateImages(_model, prompt, {
  ratio = "1:1",
  resolution = "2k",
  sampleStrength = 0.5,
  negativePrompt = "",
  intelligentRatio = false
}, refreshToken) {
  const model = getModel(_model);
  const resolutionResult = resolveResolution(resolution, ratio);
  const { width, height, imageRatio, resolutionType } = resolutionResult;
  logger_default.info(`\u4F7F\u7528\u6A21\u578B: ${_model} \u6620\u5C04\u6A21\u578B: ${model} ${width}x${height} (${ratio}@${resolution}) \u7CBE\u7EC6\u5EA6: ${sampleStrength}`);
  const { totalCredit } = await getCredit(refreshToken);
  if (totalCredit <= 0)
    await receiveCredit(refreshToken);
  const isMultiImageRequest = /jimeng-[45]\.[0-9]/.test(_model) && (prompt.includes("\u8FDE\u7EED") || prompt.includes("\u7ED8\u672C") || prompt.includes("\u6545\u4E8B") || /\d+张/.test(prompt));
  if (isMultiImageRequest) {
    return await generateMultiImages(_model, prompt, { ratio, resolution, sampleStrength, negativePrompt, intelligentRatio }, refreshToken);
  }
  const componentId = util_default.uuid();
  const submitId = util_default.uuid();
  const sceneOption = {
    type: "image",
    scene: "ImageBasicGenerate",
    modelReqKey: _model,
    resolutionType,
    abilityList: [],
    reportParams: {
      enterSource: "generate",
      vipSource: "generate",
      extraVipFunctionKey: `${_model}-${resolutionType}`,
      useVipFunctionDetailsReporterHoc: true
    }
  };
  const { aigc_data } = await request(
    "post",
    "/mweb/v1/aigc_draft/generate",
    refreshToken,
    {
      data: {
        extend: {
          root_model: model
        },
        submit_id: submitId,
        metrics_extra: JSON.stringify({
          promptSource: "custom",
          generateCount: 1,
          enterFrom: "click",
          sceneOptions: JSON.stringify([sceneOption]),
          generateId: submitId,
          isRegenerate: false
        }),
        draft_content: JSON.stringify({
          type: "draft",
          id: util_default.uuid(),
          min_version: DRAFT_MIN_VERSION,
          min_features: [],
          is_from_tsn: true,
          version: DRAFT_VERSION,
          main_component_id: componentId,
          component_list: [
            {
              type: "image_base_component",
              id: componentId,
              min_version: DRAFT_MIN_VERSION,
              aigc_mode: "workbench",
              metadata: {
                type: "",
                id: util_default.uuid(),
                created_platform: 3,
                created_platform_version: "",
                created_time_in_ms: Date.now().toString(),
                created_did: ""
              },
              generate_type: "generate",
              abilities: {
                type: "",
                id: util_default.uuid(),
                generate: {
                  type: "",
                  id: util_default.uuid(),
                  core_param: {
                    type: "",
                    id: util_default.uuid(),
                    model,
                    prompt,
                    negative_prompt: negativePrompt,
                    seed: Math.floor(Math.random() * 1e8) + 25e8,
                    sample_strength: sampleStrength,
                    image_ratio: imageRatio,
                    large_image_info: {
                      type: "",
                      id: util_default.uuid(),
                      min_version: DRAFT_MIN_VERSION,
                      height,
                      width,
                      resolution_type: resolutionType
                    },
                    intelligent_ratio: intelligentRatio
                  },
                  gen_option: {
                    type: "",
                    id: util_default.uuid(),
                    generate_all: false
                  }
                }
              }
            }
          ]
        }),
        http_common_info: {
          aid: DEFAULT_ASSISTANT_ID2
        }
      }
    }
  );
  const historyId = aigc_data.history_record_id;
  if (!historyId)
    throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u8BB0\u5F55ID\u4E0D\u5B58\u5728");
  logger_default.info(`\u6587\u751F\u56FE\u4EFB\u52A1\u5DF2\u63D0\u4EA4\uFF0Csubmit_id: ${submitId}, history_id: ${historyId}\uFF0C\u7B49\u5F85\u751F\u6210\u5B8C\u6210...`);
  let status = 20, failCode, item_list = [];
  let pollCount = 0;
  const maxPollCount = 600;
  while (pollCount < maxPollCount) {
    await new Promise((resolve) => setTimeout(resolve, 1e3));
    pollCount++;
    if (pollCount % 30 === 0) {
      logger_default.info(`\u6587\u751F\u56FE\u8FDB\u5EA6: \u7B2C ${pollCount} \u6B21\u8F6E\u8BE2 (history_id: ${historyId})\uFF0C\u5F53\u524D\u72B6\u6001: ${status}\uFF0C\u5DF2\u751F\u6210: ${item_list.length} \u5F20\u56FE\u7247...`);
    }
    const result = await request("post", "/mweb/v1/get_history_by_ids", refreshToken, {
      data: {
        history_ids: [historyId],
        image_info: {
          width: 2048,
          height: 2048,
          format: "webp",
          image_scene_list: [
            {
              scene: "smart_crop",
              width: 360,
              height: 360,
              uniq_key: "smart_crop-w:360-h:360",
              format: "webp"
            },
            {
              scene: "smart_crop",
              width: 480,
              height: 480,
              uniq_key: "smart_crop-w:480-h:480",
              format: "webp"
            },
            {
              scene: "smart_crop",
              width: 720,
              height: 720,
              uniq_key: "smart_crop-w:720-h:720",
              format: "webp"
            },
            {
              scene: "smart_crop",
              width: 720,
              height: 480,
              uniq_key: "smart_crop-w:720-h:480",
              format: "webp"
            },
            {
              scene: "smart_crop",
              width: 360,
              height: 240,
              uniq_key: "smart_crop-w:360-h:240",
              format: "webp"
            },
            {
              scene: "smart_crop",
              width: 240,
              height: 320,
              uniq_key: "smart_crop-w:240-h:320",
              format: "webp"
            },
            {
              scene: "smart_crop",
              width: 480,
              height: 640,
              uniq_key: "smart_crop-w:480-h:640",
              format: "webp"
            },
            {
              scene: "normal",
              width: 2400,
              height: 2400,
              uniq_key: "2400",
              format: "webp"
            },
            {
              scene: "normal",
              width: 1080,
              height: 1080,
              uniq_key: "1080",
              format: "webp"
            },
            {
              scene: "normal",
              width: 720,
              height: 720,
              uniq_key: "720",
              format: "webp"
            },
            {
              scene: "normal",
              width: 480,
              height: 480,
              uniq_key: "480",
              format: "webp"
            },
            {
              scene: "normal",
              width: 360,
              height: 360,
              uniq_key: "360",
              format: "webp"
            }
          ]
        },
        http_common_info: {
          aid: DEFAULT_ASSISTANT_ID2
        }
      }
    });
    if (!result[historyId])
      throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u8BB0\u5F55\u4E0D\u5B58\u5728");
    status = result[historyId].status;
    failCode = result[historyId].fail_code;
    item_list = result[historyId].item_list || [];
    if (item_list.length > 0) {
      logger_default.info(`\u6587\u751F\u56FE\u5B8C\u6210: \u72B6\u6001=${status}, \u5DF2\u751F\u6210 ${item_list.length} \u5F20\u56FE\u7247`);
      break;
    }
    if (pollCount % 60 === 0) {
      logger_default.info(`\u6587\u751F\u56FE\u8BE6\u7EC6\u72B6\u6001: status=${status}, item_list.length=${item_list.length}, failCode=${failCode || "none"}`);
    }
    if (status === 10 && item_list.length === 0 && pollCount % 30 === 0) {
      logger_default.info(`\u6587\u751F\u56FE\u72B6\u6001\u5DF2\u5B8C\u6210\u4F46\u65E0\u56FE\u7247\u751F\u6210: \u72B6\u6001=${status}, \u7EE7\u7EED\u7B49\u5F85...`);
    }
  }
  if (pollCount >= maxPollCount) {
    logger_default.warn(`\u6587\u751F\u56FE\u8D85\u65F6: \u8F6E\u8BE2\u4E86 ${pollCount} \u6B21\uFF0C\u5F53\u524D\u72B6\u6001: ${status}\uFF0C\u5DF2\u751F\u6210\u56FE\u7247\u6570: ${item_list.length}`);
  }
  if (status === 30) {
    if (failCode === "2038")
      throw new APIException(exceptions_default.API_CONTENT_FILTERED);
    else
      throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED);
  }
  const imageUrls = item_list.map((item) => {
    var _a, _b, _c, _d;
    if (!((_c = (_b = (_a = item == null ? void 0 : item.image) == null ? void 0 : _a.large_images) == null ? void 0 : _b[0]) == null ? void 0 : _c.image_url))
      return ((_d = item == null ? void 0 : item.common_attr) == null ? void 0 : _d.cover_url) || null;
    return item.image.large_images[0].image_url;
  }).filter((url) => url !== null);
  logger_default.info(`\u6587\u751F\u56FE\u7ED3\u679C: \u6210\u529F\u751F\u6210 ${imageUrls.length} \u5F20\u56FE\u7247`);
  return imageUrls;
}

// src/api/routes/images.ts
var images_default = {
  prefix: "/v1/images",
  post: {
    "/generations": async (request2) => {
      var _a;
      const unsupportedParams = ["size", "width", "height"];
      const bodyKeys = Object.keys(request2.body);
      const foundUnsupported = unsupportedParams.filter((param) => bodyKeys.includes(param));
      if (foundUnsupported.length > 0) {
        throw new Error(`\u4E0D\u652F\u6301\u7684\u53C2\u6570: ${foundUnsupported.join(", ")}\u3002\u8BF7\u4F7F\u7528 ratio \u548C resolution \u53C2\u6570\u63A7\u5236\u56FE\u50CF\u5C3A\u5BF8\u3002`);
      }
      const contentType = request2.headers["content-type"] || "";
      const isMultiPart = contentType.startsWith("multipart/form-data");
      if (isMultiPart) {
        request2.validate("body.model", (v) => _13.isUndefined(v) || _13.isString(v)).validate("body.prompt", _13.isString).validate("body.negative_prompt", (v) => _13.isUndefined(v) || _13.isString(v)).validate("body.ratio", (v) => _13.isUndefined(v) || _13.isString(v)).validate("body.resolution", (v) => _13.isUndefined(v) || _13.isString(v)).validate("body.intelligent_ratio", (v) => _13.isUndefined(v) || typeof v === "string" && (v === "true" || v === "false") || _13.isBoolean(v)).validate("body.sample_strength", (v) => _13.isUndefined(v) || typeof v === "string" && !isNaN(parseFloat(v)) || _13.isFinite(v)).validate("body.response_format", (v) => _13.isUndefined(v) || _13.isString(v)).validate("headers.authorization", _13.isString);
      } else {
        request2.validate("body.model", (v) => _13.isUndefined(v) || _13.isString(v)).validate("body.prompt", _13.isString).validate("body.images", (v) => _13.isUndefined(v) || _13.isArray(v)).validate("body.negative_prompt", (v) => _13.isUndefined(v) || _13.isString(v)).validate("body.ratio", (v) => _13.isUndefined(v) || _13.isString(v)).validate("body.resolution", (v) => _13.isUndefined(v) || _13.isString(v)).validate("body.intelligent_ratio", (v) => _13.isUndefined(v) || _13.isBoolean(v)).validate("body.sample_strength", (v) => _13.isUndefined(v) || _13.isFinite(v)).validate("body.response_format", (v) => _13.isUndefined(v) || _13.isString(v)).validate("headers.authorization", _13.isString);
      }
      let images = null;
      if (isMultiPart) {
        const files = (_a = request2.files) == null ? void 0 : _a.images;
        if (files) {
          const imageFiles = Array.isArray(files) ? files : [files];
          if (imageFiles.length > 0) {
            if (imageFiles.length > 10) {
              throw new Error("\u6700\u591A\u652F\u630110\u5F20\u8F93\u5165\u56FE\u7247");
            }
            images = imageFiles.map((file) => fs7.readFileSync(file.filepath));
          }
        }
      } else {
        const bodyImages = request2.body.images;
        if (bodyImages && Array.isArray(bodyImages) && bodyImages.length > 0) {
          if (bodyImages.length > 10) {
            throw new Error("\u6700\u591A\u652F\u630110\u5F20\u8F93\u5165\u56FE\u7247");
          }
          bodyImages.forEach((image, index) => {
            if (!_13.isString(image) && !_13.isObject(image)) {
              throw new Error(`\u56FE\u7247 ${index + 1} \u683C\u5F0F\u4E0D\u6B63\u786E\uFF1A\u5E94\u4E3AURL\u5B57\u7B26\u4E32\u6216\u5305\u542Burl\u5B57\u6BB5\u7684\u5BF9\u8C61`);
            }
            if (_13.isObject(image) && !image.url) {
              throw new Error(`\u56FE\u7247 ${index + 1} \u7F3A\u5C11url\u5B57\u6BB5`);
            }
          });
          images = bodyImages.map((image) => _13.isString(image) ? image : image.url);
        }
      }
      const tokens = tokenSplit(request2.headers.authorization);
      const token = _13.sample(tokens);
      const {
        model,
        prompt,
        negative_prompt: negativePrompt,
        ratio,
        resolution,
        intelligent_ratio: intelligentRatio,
        sample_strength: sampleStrength,
        response_format
      } = request2.body;
      const finalSampleStrength = isMultiPart && typeof sampleStrength === "string" ? parseFloat(sampleStrength) : sampleStrength;
      const finalIntelligentRatio = isMultiPart && typeof intelligentRatio === "string" ? intelligentRatio === "true" : intelligentRatio;
      const responseFormat = _13.defaultTo(response_format, "url");
      let imageUrls;
      let resultData = {
        created: util_default.unixTimestamp()
      };
      if (images && images.length > 0) {
        imageUrls = await generateImageComposition(model, prompt, images, {
          ratio,
          resolution,
          sampleStrength: finalSampleStrength,
          negativePrompt,
          intelligentRatio: finalIntelligentRatio
        }, token);
        resultData.input_images = images.length;
        resultData.composition_type = "multi_image_synthesis";
      } else {
        imageUrls = await generateImages(model, prompt, {
          ratio,
          resolution,
          sampleStrength: finalSampleStrength,
          negativePrompt,
          intelligentRatio: finalIntelligentRatio
        }, token);
      }
      let data = [];
      if (responseFormat == "b64_json") {
        data = (await Promise.all(imageUrls.map((url) => util_default.fetchFileBASE64(url)))).map((b64) => ({ b64_json: b64 }));
      } else {
        data = imageUrls.map((url) => ({
          url
        }));
      }
      resultData.data = data;
      return resultData;
    },
    // 图片合成路由（图生图）
    "/compositions": async (request2) => {
      var _a;
      const unsupportedParams = ["size", "width", "height"];
      const bodyKeys = Object.keys(request2.body);
      const foundUnsupported = unsupportedParams.filter((param) => bodyKeys.includes(param));
      if (foundUnsupported.length > 0) {
        throw new Error(`\u4E0D\u652F\u6301\u7684\u53C2\u6570: ${foundUnsupported.join(", ")}\u3002\u8BF7\u4F7F\u7528 ratio \u548C resolution \u53C2\u6570\u63A7\u5236\u56FE\u50CF\u5C3A\u5BF8\u3002`);
      }
      const contentType = request2.headers["content-type"] || "";
      const isMultiPart = contentType.startsWith("multipart/form-data");
      if (isMultiPart) {
        request2.validate("body.model", (v) => _13.isUndefined(v) || _13.isString(v)).validate("body.prompt", _13.isString).validate("body.negative_prompt", (v) => _13.isUndefined(v) || _13.isString(v)).validate("body.ratio", (v) => _13.isUndefined(v) || _13.isString(v)).validate("body.resolution", (v) => _13.isUndefined(v) || _13.isString(v)).validate("body.intelligent_ratio", (v) => _13.isUndefined(v) || typeof v === "string" && (v === "true" || v === "false") || _13.isBoolean(v)).validate("body.sample_strength", (v) => _13.isUndefined(v) || typeof v === "string" && !isNaN(parseFloat(v)) || _13.isFinite(v)).validate("body.response_format", (v) => _13.isUndefined(v) || _13.isString(v)).validate("headers.authorization", _13.isString);
      } else {
        request2.validate("body.model", (v) => _13.isUndefined(v) || _13.isString(v)).validate("body.prompt", _13.isString).validate("body.images", _13.isArray).validate("body.negative_prompt", (v) => _13.isUndefined(v) || _13.isString(v)).validate("body.ratio", (v) => _13.isUndefined(v) || _13.isString(v)).validate("body.resolution", (v) => _13.isUndefined(v) || _13.isString(v)).validate("body.intelligent_ratio", (v) => _13.isUndefined(v) || _13.isBoolean(v)).validate("body.sample_strength", (v) => _13.isUndefined(v) || _13.isFinite(v)).validate("body.response_format", (v) => _13.isUndefined(v) || _13.isString(v)).validate("headers.authorization", _13.isString);
      }
      let images = [];
      if (isMultiPart) {
        const files = (_a = request2.files) == null ? void 0 : _a.images;
        if (!files) {
          throw new Error("\u5728form-data\u4E2D\u7F3A\u5C11 'images' \u5B57\u6BB5");
        }
        const imageFiles = Array.isArray(files) ? files : [files];
        if (imageFiles.length === 0) {
          throw new Error("\u81F3\u5C11\u9700\u8981\u63D0\u4F9B1\u5F20\u8F93\u5165\u56FE\u7247");
        }
        if (imageFiles.length > 10) {
          throw new Error("\u6700\u591A\u652F\u630110\u5F20\u8F93\u5165\u56FE\u7247");
        }
        images = imageFiles.map((file) => fs7.readFileSync(file.filepath));
      } else {
        const bodyImages = request2.body.images;
        if (!bodyImages || bodyImages.length === 0) {
          throw new Error("\u81F3\u5C11\u9700\u8981\u63D0\u4F9B1\u5F20\u8F93\u5165\u56FE\u7247");
        }
        if (bodyImages.length > 10) {
          throw new Error("\u6700\u591A\u652F\u630110\u5F20\u8F93\u5165\u56FE\u7247");
        }
        bodyImages.forEach((image, index) => {
          if (!_13.isString(image) && !_13.isObject(image)) {
            throw new Error(`\u56FE\u7247 ${index + 1} \u683C\u5F0F\u4E0D\u6B63\u786E\uFF1A\u5E94\u4E3AURL\u5B57\u7B26\u4E32\u6216\u5305\u542Burl\u5B57\u6BB5\u7684\u5BF9\u8C61`);
          }
          if (_13.isObject(image) && !image.url) {
            throw new Error(`\u56FE\u7247 ${index + 1} \u7F3A\u5C11url\u5B57\u6BB5`);
          }
        });
        images = bodyImages.map((image) => _13.isString(image) ? image : image.url);
      }
      const tokens = tokenSplit(request2.headers.authorization);
      const token = _13.sample(tokens);
      const {
        model,
        prompt,
        negative_prompt: negativePrompt,
        ratio,
        resolution,
        intelligent_ratio: intelligentRatio,
        sample_strength: sampleStrength,
        response_format
      } = request2.body;
      const finalSampleStrength = isMultiPart && typeof sampleStrength === "string" ? parseFloat(sampleStrength) : sampleStrength;
      const finalIntelligentRatio = isMultiPart && typeof intelligentRatio === "string" ? intelligentRatio === "true" : intelligentRatio;
      const responseFormat = _13.defaultTo(response_format, "url");
      const resultUrls = await generateImageComposition(model, prompt, images, {
        ratio,
        resolution,
        sampleStrength: finalSampleStrength,
        negativePrompt,
        intelligentRatio: finalIntelligentRatio
      }, token);
      let data = [];
      if (responseFormat == "b64_json") {
        data = (await Promise.all(resultUrls.map((url) => util_default.fetchFileBASE64(url)))).map((b64) => ({ b64_json: b64 }));
      } else {
        data = resultUrls.map((url) => ({
          url
        }));
      }
      return {
        created: util_default.unixTimestamp(),
        data,
        input_images: images.length,
        composition_type: "multi_image_synthesis"
      };
    }
  }
};

// src/api/routes/chat.ts
import _14 from "lodash";

// src/api/controllers/chat.ts
import { PassThrough } from "stream";

// src/api/controllers/videos.ts
import crypto3 from "crypto";
import fs8 from "fs";

// src/lib/db.ts
import { Pool } from "pg";
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 1e4,
  connectionTimeoutMillis: 5e3,
  keepAlive: true,
  keepAliveInitialDelayMillis: 1e4
});
pool.on("error", (err) => {
  logger_default.error(`DB: pool error: ${err.message}`);
});
async function saveJobToDb(id, status, created) {
  try {
    await pool.query(
      `INSERT INTO video_jobs (id, status, created_at, updated_at)
             VALUES ($1, $2, $3, $3)
             ON CONFLICT (id) DO NOTHING`,
      [id, status, created]
    );
  } catch (err) {
    logger_default.error(`DB: saveJobToDb failed for ${id}: ${err.message}`);
  }
}
async function updateJobInDb(id, update) {
  const now = Math.floor(Date.now() / 1e3);
  const keys = Object.keys(update);
  if (keys.length === 0) return;
  const setClauses = keys.map((key, i) => `${key} = $${i + 2}`).join(", ");
  const values = Object.values(update);
  try {
    await pool.query(
      `UPDATE video_jobs SET ${setClauses}, updated_at = $1 WHERE id = $${values.length + 2}`,
      [now, ...values, id]
    );
  } catch (err) {
    logger_default.error(`DB: updateJobInDb failed for ${id}: ${err.message}`);
  }
}
var UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function getJobFromDb(id) {
  if (!UUID_REGEX.test(id)) return null;
  try {
    const result = await pool.query(
      `SELECT * FROM video_jobs WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  } catch (err) {
    logger_default.error(`DB: getJobFromDb failed for ${id}: ${err.message}`);
    return null;
  }
}
async function getStuckJobsWithoutHistoryId(olderThanSeconds = 600) {
  const cutoff = Math.floor(Date.now() / 1e3) - olderThanSeconds;
  try {
    const result = await pool.query(
      `SELECT * FROM video_jobs
             WHERE (status = 'processing' OR status = 'pending')
               AND jimeng_history_id IS NULL
               AND created_at < $1
             ORDER BY created_at ASC`,
      [cutoff]
    );
    return result.rows;
  } catch (err) {
    logger_default.error(`DB: getStuckJobsWithoutHistoryId failed: ${err.message}`);
    return [];
  }
}
async function getProcessingJobsWithHistoryId() {
  try {
    const result = await pool.query(
      `SELECT * FROM video_jobs
             WHERE (status = 'processing' OR status = 'pending')
               AND jimeng_history_id IS NOT NULL
             ORDER BY created_at ASC`
    );
    return result.rows;
  } catch (err) {
    logger_default.error(`DB: getProcessingJobsWithHistoryId failed: ${err.message}`);
    return [];
  }
}

// src/lib/job-store.ts
import { v1 as uuid2 } from "uuid";
var jobs = /* @__PURE__ */ new Map();
var JOB_TTL_SECONDS = 24 * 60 * 60;
var CLEANUP_INTERVAL_MS = 60 * 60 * 1e3;
setInterval(() => {
  const now = Math.floor(Date.now() / 1e3);
  let removed = 0;
  for (const [id, job] of jobs.entries()) {
    if (now - job.updated > JOB_TTL_SECONDS) {
      jobs.delete(id);
      removed++;
    }
  }
  if (removed > 0)
    logger_default.info(`JobStore: cleaned up ${removed} expired jobs`);
}, CLEANUP_INTERVAL_MS);
function dbJobToJob(dbJob) {
  const job = {
    id: dbJob.id,
    status: dbJob.status,
    created: dbJob.created_at,
    updated: dbJob.updated_at
  };
  if (dbJob.error_message) {
    job.error = dbJob.error_message;
  }
  if (dbJob.result_url || dbJob.result_b64_json) {
    job.result = {
      url: dbJob.result_url || void 0,
      b64_json: dbJob.result_b64_json || void 0,
      revised_prompt: dbJob.result_revised_prompt || void 0
    };
  }
  return job;
}
function createJob() {
  const id = uuid2();
  const now = Math.floor(Date.now() / 1e3);
  const job = { id, status: "pending", created: now, updated: now };
  jobs.set(id, job);
  saveJobToDb(id, "pending", now).catch(
    (err) => logger_default.error(`JobStore: failed to persist job ${id} to DB: ${err.message}`)
  );
  return job;
}
function updateJob(id, update) {
  var _a, _b, _c;
  const job = jobs.get(id);
  if (job) {
    Object.assign(job, update, { updated: Math.floor(Date.now() / 1e3) });
  }
  const dbUpdate = {};
  if (update.status) dbUpdate.status = update.status;
  if (update.error) dbUpdate.error_message = update.error;
  if ((_a = update.result) == null ? void 0 : _a.url) dbUpdate.result_url = update.result.url;
  if ((_b = update.result) == null ? void 0 : _b.b64_json) dbUpdate.result_b64_json = update.result.b64_json;
  if ((_c = update.result) == null ? void 0 : _c.revised_prompt) dbUpdate.result_revised_prompt = update.result.revised_prompt;
  if (Object.keys(dbUpdate).length > 0) {
    updateJobInDb(id, dbUpdate).catch(
      (err) => logger_default.error(`JobStore: failed to sync update for job ${id} to DB: ${err.message}`)
    );
  }
}
async function getJob(id) {
  const inMemory = jobs.get(id);
  if (inMemory) return inMemory;
  const dbJob = await getJobFromDb(id);
  if (!dbJob) return void 0;
  const job = dbJobToJob(dbJob);
  jobs.set(id, job);
  return job;
}
var BROWSER_CONCURRENCY = 1;
var activeBrowserSlots = 0;
var waitQueue = [];
function updateQueuePositions() {
  waitQueue.forEach((item, index) => {
    const job = jobs.get(item.id);
    if (job) {
      job.queuePosition = index + 1;
      job.updated = Math.floor(Date.now() / 1e3);
    }
  });
}
function acquireBrowserSlot(jobId) {
  return new Promise((resolve) => {
    if (activeBrowserSlots < BROWSER_CONCURRENCY && waitQueue.length === 0) {
      activeBrowserSlots++;
      logger_default.info(`BrowserSemaphore: slot acquired (${activeBrowserSlots}/${BROWSER_CONCURRENCY} active)`);
      resolve();
    } else {
      logger_default.info(`BrowserSemaphore: job ${jobId} waiting for slot (queue length: ${waitQueue.length + 1})`);
      waitQueue.push({ id: jobId, resolve });
      updateQueuePositions();
    }
  });
}
function releaseBrowserSlot() {
  activeBrowserSlots = Math.max(0, activeBrowserSlots - 1);
  if (waitQueue.length > 0) {
    const { id, resolve } = waitQueue.shift();
    const job = jobs.get(id);
    if (job) delete job.queuePosition;
    updateQueuePositions();
    resolve();
  } else {
    logger_default.info(`BrowserSemaphore: slot released (${activeBrowserSlots}/${BROWSER_CONCURRENCY} active)`);
  }
}

// src/api/controllers/videos.ts
var DEFAULT_ASSISTANT_ID3 = 513695;
var DEFAULT_MODEL2 = "jimeng-video-3.0";
var DEFAULT_DRAFT_VERSION = "3.2.8";
var MODEL_DRAFT_VERSIONS2 = {
  "jimeng-video-3.5-pro": "3.3.4",
  "jimeng-video-3.0-pro": "3.2.8",
  "jimeng-video-3.0": "3.2.8",
  "jimeng-video-2.0": "3.2.8",
  "jimeng-video-2.0-pro": "3.2.8",
  // Seedance 模型（与上游 iptag/jimeng-api 保持一致）
  "jimeng-video-seedance-2.0": "3.3.9",
  "seedance-2.0": "3.3.9",
  "seedance-2.0-pro": "3.3.9",
  // Seedance 2.0-fast 模型（v1.9.3 新增）
  "jimeng-video-seedance-2.0-fast": "3.3.9",
  "seedance-2.0-fast": "3.3.9"
};
var MODEL_MAP2 = {
  "jimeng-video-3.5-pro": "dreamina_ic_generate_video_model_vgfm_3.5_pro",
  "jimeng-video-3.0-pro": "dreamina_ic_generate_video_model_vgfm_3.0_pro",
  "jimeng-video-3.0": "dreamina_ic_generate_video_model_vgfm_3.0",
  "jimeng-video-2.0": "dreamina_ic_generate_video_model_vgfm_lite",
  "jimeng-video-2.0-pro": "dreamina_ic_generate_video_model_vgfm1.0",
  // Seedance 多图智能video生成模型（jimeng-video-seedance-2.0 为上游标准名称）
  "jimeng-video-seedance-2.0": "dreamina_seedance_40_pro",
  "seedance-2.0": "dreamina_seedance_40_pro",
  "seedance-2.0-pro": "dreamina_seedance_40_pro",
  // Seedance 2.0-fast 快速生成模型（v1.9.3 新增，内部模型为 dreamina_seedance_40）
  "jimeng-video-seedance-2.0-fast": "dreamina_seedance_40",
  "seedance-2.0-fast": "dreamina_seedance_40"
};
var SEEDANCE_BENEFIT_TYPE_MAP = {
  "jimeng-video-seedance-2.0": "dreamina_video_seedance_20_pro",
  "seedance-2.0": "dreamina_video_seedance_20_pro",
  "seedance-2.0-pro": "dreamina_video_seedance_20_pro",
  // Seedance 2.0-fast（v1.9.3 新增，注意：无 "video_" 前缀）
  "jimeng-video-seedance-2.0-fast": "dreamina_seedance_20_fast",
  "seedance-2.0-fast": "dreamina_seedance_20_fast"
};
function isSeedanceModel(model) {
  return model.startsWith("seedance-") || model.startsWith("jimeng-video-seedance-");
}
var MIME_TO_MATERIAL_TYPE = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "image",
  "image/bmp": "image",
  "video/mp4": "video",
  "video/quicktime": "video",
  "video/x-m4v": "video",
  "audio/mpeg": "audio",
  "audio/wav": "audio",
  "audio/x-wav": "audio",
  "audio/mp3": "audio"
};
var EXT_TO_MATERIAL_TYPE = {
  ".jpg": "image",
  ".jpeg": "image",
  ".png": "image",
  ".webp": "image",
  ".gif": "image",
  ".bmp": "image",
  ".mp4": "video",
  ".mov": "video",
  ".m4v": "video",
  ".mp3": "audio",
  ".wav": "audio"
};
var MATERIAL_TYPE_CODE = {
  image: 1,
  video: 2,
  audio: 3
};
function detectMaterialType(file) {
  const mime4 = (file.mimetype || file.mimeType || "").toLowerCase();
  if (mime4 && MIME_TO_MATERIAL_TYPE[mime4]) return MIME_TO_MATERIAL_TYPE[mime4];
  const filename = (file.originalFilename || file.newFilename || "").toLowerCase();
  const dotIdx = filename.lastIndexOf(".");
  if (dotIdx >= 0) {
    const ext = filename.substring(dotIdx);
    if (EXT_TO_MATERIAL_TYPE[ext]) return EXT_TO_MATERIAL_TYPE[ext];
  }
  return "image";
}
function detectMaterialTypeFromUrl(url) {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    const dotIdx = pathname.lastIndexOf(".");
    if (dotIdx >= 0) {
      const ext = pathname.substring(dotIdx);
      if (EXT_TO_MATERIAL_TYPE[ext]) return EXT_TO_MATERIAL_TYPE[ext];
    }
  } catch {
  }
  return "image";
}
var VIDEO_RESOLUTION_OPTIONS = {
  "480p": {
    "1:1": { width: 480, height: 480 },
    "4:3": { width: 640, height: 480 },
    "3:4": { width: 480, height: 640 },
    "16:9": { width: 854, height: 480 },
    "9:16": { width: 480, height: 854 }
  },
  "720p": {
    "1:1": { width: 720, height: 720 },
    "4:3": { width: 960, height: 720 },
    "3:4": { width: 720, height: 960 },
    "16:9": { width: 1280, height: 720 },
    "9:16": { width: 720, height: 1280 }
  },
  "1080p": {
    "1:1": { width: 1080, height: 1080 },
    "4:3": { width: 1440, height: 1080 },
    "3:4": { width: 1080, height: 1440 },
    "16:9": { width: 1920, height: 1080 },
    "9:16": { width: 1080, height: 1920 }
  }
};
function resolveVideoResolution(resolution = "720p", ratio = "1:1") {
  const resolutionGroup = VIDEO_RESOLUTION_OPTIONS[resolution];
  if (!resolutionGroup) {
    const supportedResolutions = Object.keys(VIDEO_RESOLUTION_OPTIONS).join(", ");
    throw new Error(`Unsupported video resolution "${resolution}". Supported resolutions: ${supportedResolutions}`);
  }
  const ratioConfig = resolutionGroup[ratio];
  if (!ratioConfig) {
    const supportedRatios = Object.keys(resolutionGroup).join(", ");
    throw new Error(`Unsupported ratio "${ratio}" for resolution "${resolution}". Supported ratios: ${supportedRatios}`);
  }
  return {
    width: ratioConfig.width,
    height: ratioConfig.height
  };
}
function getModel2(model) {
  return MODEL_MAP2[model] || MODEL_MAP2[DEFAULT_MODEL2];
}
function createSignature2(method, url, headers, accessKeyId, secretAccessKey, sessionToken, payload = "", awsRegion = "cn-north-1", serviceName = "imagex") {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname || "/";
  const search = urlObj.search;
  const timestamp = headers["x-amz-date"];
  const date = timestamp.substr(0, 8);
  const region = awsRegion;
  const service = serviceName;
  const queryParams = [];
  const searchParams = new URLSearchParams(search);
  searchParams.forEach((value, key) => {
    queryParams.push([key, value]);
  });
  queryParams.sort(([a], [b]) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  });
  const canonicalQueryString = queryParams.map(([key, value]) => `${key}=${value}`).join("&");
  const headersToSign = {
    "x-amz-date": timestamp
  };
  if (sessionToken) {
    headersToSign["x-amz-security-token"] = sessionToken;
  }
  let payloadHash = crypto3.createHash("sha256").update("").digest("hex");
  if (method.toUpperCase() === "POST" && payload) {
    payloadHash = crypto3.createHash("sha256").update(payload, "utf8").digest("hex");
    headersToSign["x-amz-content-sha256"] = payloadHash;
  }
  const signedHeaders = Object.keys(headersToSign).map((key) => key.toLowerCase()).sort().join(";");
  const canonicalHeaders = Object.keys(headersToSign).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).map((key) => `${key.toLowerCase()}:${headersToSign[key].trim()}
`).join("");
  const canonicalRequest = [
    method.toUpperCase(),
    pathname,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join("\n");
  const credentialScope = `${date}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    timestamp,
    credentialScope,
    crypto3.createHash("sha256").update(canonicalRequest, "utf8").digest("hex")
  ].join("\n");
  const kDate = crypto3.createHmac("sha256", `AWS4${secretAccessKey}`).update(date).digest();
  const kRegion = crypto3.createHmac("sha256", kDate).update(region).digest();
  const kService = crypto3.createHmac("sha256", kRegion).update(service).digest();
  const kSigning = crypto3.createHmac("sha256", kService).update("aws4_request").digest();
  const signature = crypto3.createHmac("sha256", kSigning).update(stringToSign, "utf8").digest("hex");
  return `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}
function calculateCRC322(buffer) {
  const crcTable = [];
  for (let i = 0; i < 256; i++) {
    let crc2 = i;
    for (let j = 0; j < 8; j++) {
      crc2 = crc2 & 1 ? 3988292384 ^ crc2 >>> 1 : crc2 >>> 1;
    }
    crcTable[i] = crc2;
  }
  let crc = 0 ^ -1;
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) {
    crc = crc >>> 8 ^ crcTable[(crc ^ bytes[i]) & 255];
  }
  return ((crc ^ -1) >>> 0).toString(16).padStart(8, "0");
}
async function uploadImageForVideo(imageUrl, refreshToken) {
  var _a, _b, _c, _d, _e, _f;
  try {
    logger_default.info(`Uploading image: ${imageUrl}`);
    const tokenResult = await request("post", "/mweb/v1/get_upload_token", refreshToken, {
      data: {
        scene: 2
        // AIGC 图片上传场景
      }
    });
    const { access_key_id, secret_access_key, session_token, service_id } = tokenResult;
    if (!access_key_id || !secret_access_key || !session_token) {
      throw new Error("Failed to get upload token");
    }
    const actualServiceId = service_id || "tb4s082cfz";
    logger_default.info(`Upload token obtained: service_id=${actualServiceId}`);
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Image download failed: ${imageResponse.status}`);
    }
    const imageBuffer = await imageResponse.arrayBuffer();
    const fileSize = imageBuffer.byteLength;
    const crc32 = calculateCRC322(imageBuffer);
    logger_default.info(`Image downloaded: size=${fileSize} bytes, CRC32=${crc32}`);
    const now = /* @__PURE__ */ new Date();
    const timestamp = now.toISOString().replace(/[:\-]/g, "").replace(/\.\d{3}Z$/, "Z");
    const randomStr = Math.random().toString(36).substring(2, 12);
    const applyUrl = `https://imagex.bytedanceapi.com/?Action=ApplyImageUpload&Version=2018-08-01&ServiceId=${actualServiceId}&FileSize=${fileSize}&s=${randomStr}`;
    const requestHeaders = {
      "x-amz-date": timestamp,
      "x-amz-security-token": session_token
    };
    const authorization = createSignature2("GET", applyUrl, requestHeaders, access_key_id, secret_access_key, session_token);
    logger_default.info(`Requesting upload auth: ${applyUrl}`);
    const applyResponse = await fetch(applyUrl, {
      method: "GET",
      headers: {
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9",
        "authorization": authorization,
        "origin": "https://jimeng.jianying.com",
        "referer": "https://jimeng.jianying.com/ai-tool/video/generate",
        "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
        "x-amz-date": timestamp,
        "x-amz-security-token": session_token
      }
    });
    if (!applyResponse.ok) {
      const errorText = await applyResponse.text();
      throw new Error(`Upload auth request failed: ${applyResponse.status} - ${errorText}`);
    }
    const applyResult = await applyResponse.json();
    if ((_a = applyResult == null ? void 0 : applyResult.ResponseMetadata) == null ? void 0 : _a.Error) {
      throw new Error(`Upload auth request failed: ${JSON.stringify(applyResult.ResponseMetadata.Error)}`);
    }
    logger_default.info(`Upload auth granted`);
    const uploadAddress = (_b = applyResult == null ? void 0 : applyResult.Result) == null ? void 0 : _b.UploadAddress;
    if (!uploadAddress || !uploadAddress.StoreInfos || !uploadAddress.UploadHosts) {
      throw new Error(`Failed to get upload endpoint: ${JSON.stringify(applyResult)}`);
    }
    const storeInfo = uploadAddress.StoreInfos[0];
    const uploadHost = uploadAddress.UploadHosts[0];
    const auth = storeInfo.Auth;
    const uploadUrl = `https://${uploadHost}/upload/v1/${storeInfo.StoreUri}`;
    const imageId = storeInfo.StoreUri.split("/").pop();
    logger_default.info(`Uploading image: imageId=${imageId}, url=${uploadUrl}`);
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Accept": "*/*",
        "Accept-Language": "zh-CN,zh;q=0.9",
        "Authorization": auth,
        "Connection": "keep-alive",
        "Content-CRC32": crc32,
        "Content-Disposition": 'attachment; filename="undefined"',
        "Content-Type": "application/octet-stream",
        "Origin": "https://jimeng.jianying.com",
        "Referer": "https://jimeng.jianying.com/ai-tool/video/generate",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
        "X-Storage-U": "704135154117550"
      },
      body: imageBuffer
    });
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Image upload failed: ${uploadResponse.status} - ${errorText}`);
    }
    logger_default.info(`Image file uploaded successfully`);
    const commitUrl = `https://imagex.bytedanceapi.com/?Action=CommitImageUpload&Version=2018-08-01&ServiceId=${actualServiceId}`;
    const commitTimestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:\-]/g, "").replace(/\.\d{3}Z$/, "Z");
    const commitPayload = JSON.stringify({
      SessionKey: uploadAddress.SessionKey,
      SuccessActionStatus: "200"
    });
    const payloadHash = crypto3.createHash("sha256").update(commitPayload, "utf8").digest("hex");
    const commitRequestHeaders = {
      "x-amz-date": commitTimestamp,
      "x-amz-security-token": session_token,
      "x-amz-content-sha256": payloadHash
    };
    const commitAuthorization = createSignature2("POST", commitUrl, commitRequestHeaders, access_key_id, secret_access_key, session_token, commitPayload);
    const commitResponse = await fetch(commitUrl, {
      method: "POST",
      headers: {
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9",
        "authorization": commitAuthorization,
        "content-type": "application/json",
        "origin": "https://jimeng.jianying.com",
        "referer": "https://jimeng.jianying.com/ai-tool/video/generate",
        "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
        "x-amz-date": commitTimestamp,
        "x-amz-security-token": session_token,
        "x-amz-content-sha256": payloadHash
      },
      body: commitPayload
    });
    if (!commitResponse.ok) {
      const errorText = await commitResponse.text();
      throw new Error(`Upload commit failed: ${commitResponse.status} - ${errorText}`);
    }
    const commitResult = await commitResponse.json();
    if ((_c = commitResult == null ? void 0 : commitResult.ResponseMetadata) == null ? void 0 : _c.Error) {
      throw new Error(`Upload commit failed: ${JSON.stringify(commitResult.ResponseMetadata.Error)}`);
    }
    if (!((_d = commitResult == null ? void 0 : commitResult.Result) == null ? void 0 : _d.Results) || commitResult.Result.Results.length === 0) {
      throw new Error(`Upload commit response missing result: ${JSON.stringify(commitResult)}`);
    }
    const uploadResult = commitResult.Result.Results[0];
    if (uploadResult.UriStatus !== 2e3) {
      throw new Error(`Image upload status error: UriStatus=${uploadResult.UriStatus}`);
    }
    const fullImageUri = uploadResult.Uri;
    const pluginResult = (_f = (_e = commitResult.Result) == null ? void 0 : _e.PluginResult) == null ? void 0 : _f[0];
    if (pluginResult && pluginResult.ImageUri) {
      logger_default.info(`Image upload complete: ${pluginResult.ImageUri}`);
      return pluginResult.ImageUri;
    }
    logger_default.info(`Image upload complete: ${fullImageUri}`);
    return fullImageUri;
  } catch (error) {
    logger_default.error(`Image upload failed: ${error.message}`);
    throw error;
  }
}
async function uploadImageBufferForVideo(buffer, refreshToken) {
  var _a, _b, _c, _d, _e, _f;
  try {
    logger_default.info(`Uploading image from buffer, size: ${buffer.length} bytes`);
    const tokenResult = await request("post", "/mweb/v1/get_upload_token", refreshToken, {
      data: {
        scene: 2
      }
    });
    const { access_key_id, secret_access_key, session_token, service_id } = tokenResult;
    if (!access_key_id || !secret_access_key || !session_token) {
      throw new Error("Failed to get upload token");
    }
    const actualServiceId = service_id || "tb4s082cfz";
    logger_default.info(`Upload token obtained: service_id=${actualServiceId}`);
    const fileSize = buffer.length;
    const crc32 = calculateCRC322(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
    logger_default.info(`Buffer size: ${fileSize} bytes, CRC32=${crc32}`);
    const now = /* @__PURE__ */ new Date();
    const timestamp = now.toISOString().replace(/[:\-]/g, "").replace(/\.\d{3}Z$/, "Z");
    const randomStr = Math.random().toString(36).substring(2, 12);
    const applyUrl = `https://imagex.bytedanceapi.com/?Action=ApplyImageUpload&Version=2018-08-01&ServiceId=${actualServiceId}&FileSize=${fileSize}&s=${randomStr}`;
    const requestHeaders = {
      "x-amz-date": timestamp,
      "x-amz-security-token": session_token
    };
    const authorization = createSignature2("GET", applyUrl, requestHeaders, access_key_id, secret_access_key, session_token);
    const applyResponse = await fetch(applyUrl, {
      method: "GET",
      headers: {
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9",
        "authorization": authorization,
        "origin": "https://jimeng.jianying.com",
        "referer": "https://jimeng.jianying.com/ai-tool/video/generate",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
        "x-amz-date": timestamp,
        "x-amz-security-token": session_token
      }
    });
    if (!applyResponse.ok) {
      const errorText = await applyResponse.text();
      throw new Error(`Upload auth request failed: ${applyResponse.status} - ${errorText}`);
    }
    const applyResult = await applyResponse.json();
    if ((_a = applyResult == null ? void 0 : applyResult.ResponseMetadata) == null ? void 0 : _a.Error) {
      throw new Error(`Upload auth request failed: ${JSON.stringify(applyResult.ResponseMetadata.Error)}`);
    }
    const uploadAddress = (_b = applyResult == null ? void 0 : applyResult.Result) == null ? void 0 : _b.UploadAddress;
    if (!uploadAddress || !uploadAddress.StoreInfos || !uploadAddress.UploadHosts) {
      throw new Error(`Failed to get upload endpoint: ${JSON.stringify(applyResult)}`);
    }
    const storeInfo = uploadAddress.StoreInfos[0];
    const uploadHost = uploadAddress.UploadHosts[0];
    const auth = storeInfo.Auth;
    const uploadUrl = `https://${uploadHost}/upload/v1/${storeInfo.StoreUri}`;
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Accept": "*/*",
        "Authorization": auth,
        "Content-CRC32": crc32,
        "Content-Disposition": 'attachment; filename="undefined"',
        "Content-Type": "application/octet-stream",
        "Origin": "https://jimeng.jianying.com",
        "Referer": "https://jimeng.jianying.com/ai-tool/video/generate",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
      },
      body: buffer
    });
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Image upload failed: ${uploadResponse.status} - ${errorText}`);
    }
    logger_default.info(`BufferImage file uploaded successfully`);
    const commitUrl = `https://imagex.bytedanceapi.com/?Action=CommitImageUpload&Version=2018-08-01&ServiceId=${actualServiceId}`;
    const commitTimestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:\-]/g, "").replace(/\.\d{3}Z$/, "Z");
    const commitPayload = JSON.stringify({
      SessionKey: uploadAddress.SessionKey,
      SuccessActionStatus: "200"
    });
    const payloadHash = crypto3.createHash("sha256").update(commitPayload, "utf8").digest("hex");
    const commitRequestHeaders = {
      "x-amz-date": commitTimestamp,
      "x-amz-security-token": session_token,
      "x-amz-content-sha256": payloadHash
    };
    const commitAuthorization = createSignature2("POST", commitUrl, commitRequestHeaders, access_key_id, secret_access_key, session_token, commitPayload);
    const commitResponse = await fetch(commitUrl, {
      method: "POST",
      headers: {
        "accept": "*/*",
        "authorization": commitAuthorization,
        "content-type": "application/json",
        "origin": "https://jimeng.jianying.com",
        "referer": "https://jimeng.jianying.com/ai-tool/video/generate",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
        "x-amz-date": commitTimestamp,
        "x-amz-security-token": session_token,
        "x-amz-content-sha256": payloadHash
      },
      body: commitPayload
    });
    if (!commitResponse.ok) {
      const errorText = await commitResponse.text();
      throw new Error(`Upload commit failed: ${commitResponse.status} - ${errorText}`);
    }
    const commitResult = await commitResponse.json();
    if ((_c = commitResult == null ? void 0 : commitResult.ResponseMetadata) == null ? void 0 : _c.Error) {
      throw new Error(`Upload commit failed: ${JSON.stringify(commitResult.ResponseMetadata.Error)}`);
    }
    if (!((_d = commitResult == null ? void 0 : commitResult.Result) == null ? void 0 : _d.Results) || commitResult.Result.Results.length === 0) {
      throw new Error(`Upload commit response missing result: ${JSON.stringify(commitResult)}`);
    }
    const uploadResult = commitResult.Result.Results[0];
    if (uploadResult.UriStatus !== 2e3) {
      throw new Error(`Image upload status error: UriStatus=${uploadResult.UriStatus}`);
    }
    const fullImageUri = uploadResult.Uri;
    const pluginResult = (_f = (_e = commitResult.Result) == null ? void 0 : _e.PluginResult) == null ? void 0 : _f[0];
    if (pluginResult && pluginResult.ImageUri) {
      logger_default.info(`BufferImage upload complete: ${pluginResult.ImageUri}`);
      return pluginResult.ImageUri;
    }
    logger_default.info(`BufferImage upload complete: ${fullImageUri}`);
    return fullImageUri;
  } catch (error) {
    logger_default.error(`BufferImage upload failed: ${error.message}`);
    throw error;
  }
}
function parseAudioDuration(buffer) {
  try {
    if (buffer.length >= 44 && buffer[0] === 82 && buffer[1] === 73 && buffer[2] === 70 && buffer[3] === 70 && buffer[8] === 87 && buffer[9] === 65 && buffer[10] === 86 && buffer[11] === 69) {
      const byteRate = buffer.readUInt32LE(28);
      if (byteRate > 0) {
        let offset = 12;
        while (offset < buffer.length - 8) {
          const chunkId = buffer.toString("ascii", offset, offset + 4);
          const chunkSize = buffer.readUInt32LE(offset + 4);
          if (chunkId === "data") {
            return Math.round(chunkSize / byteRate * 1e3);
          }
          offset += 8 + chunkSize;
        }
        return Math.round((buffer.length - 44) / byteRate * 1e3);
      }
    }
    return Math.round(buffer.length / (128 * 1e3 / 8) * 1e3);
  } catch {
    return 0;
  }
}
async function uploadMediaForVideo(buffer, mediaType, refreshToken, filename) {
  var _a, _b, _c, _d, _e, _f, _g;
  const label = mediaType === "audio" ? "audio" : "video";
  const fileSize = buffer.length;
  logger_default.info(`Uploading ${label}file, size: ${fileSize} bytes`);
  const tokenResult = await request("post", "/mweb/v1/get_upload_token", refreshToken, {
    data: { scene: 1 }
  });
  const { access_key_id, secret_access_key, session_token, space_name } = tokenResult;
  if (!access_key_id || !secret_access_key || !session_token) {
    throw new Error(`Failed to get ${label} upload token`);
  }
  const spaceName = space_name || "dreamina";
  logger_default.info(`Getting ${label} upload token: spaceName=${spaceName}`);
  const now = /* @__PURE__ */ new Date();
  const timestamp = now.toISOString().replace(/[:\-]/g, "").replace(/\.\d{3}Z$/, "Z");
  const randomStr = Math.random().toString(36).substring(2, 12);
  const vodHost = "https://vod.bytedanceapi.com";
  const applyUrl = `${vodHost}/?Action=ApplyUploadInner&Version=2020-11-19&SpaceName=${spaceName}&FileType=video&IsInner=1&FileSize=${fileSize}&s=${randomStr}`;
  const requestHeaders = {
    "x-amz-date": timestamp,
    "x-amz-security-token": session_token
  };
  const authorization = createSignature2(
    "GET",
    applyUrl,
    requestHeaders,
    access_key_id,
    secret_access_key,
    session_token,
    "",
    "cn-north-1",
    "vod"
  );
  logger_default.info(`Requesting ${label} upload auth: ${applyUrl}`);
  const applyResponse = await fetch(applyUrl, {
    method: "GET",
    headers: {
      "accept": "*/*",
      "accept-language": "zh-CN,zh;q=0.9",
      "authorization": authorization,
      "origin": "https://jimeng.jianying.com",
      "referer": "https://jimeng.jianying.com/ai-tool/video/generate",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
      "x-amz-date": timestamp,
      "x-amz-security-token": session_token
    }
  });
  if (!applyResponse.ok) {
    const errorText = await applyResponse.text();
    throw new Error(`${label} upload auth request failed: ${applyResponse.status} - ${errorText}`);
  }
  const applyResult = await applyResponse.json();
  if ((_a = applyResult == null ? void 0 : applyResult.ResponseMetadata) == null ? void 0 : _a.Error) {
    throw new Error(`${label} upload auth request failed: ${JSON.stringify(applyResult.ResponseMetadata.Error)}`);
  }
  const uploadNodes = (_c = (_b = applyResult == null ? void 0 : applyResult.Result) == null ? void 0 : _b.InnerUploadAddress) == null ? void 0 : _c.UploadNodes;
  if (!uploadNodes || uploadNodes.length === 0) {
    throw new Error(`Failed to get ${label} upload endpoint: ${JSON.stringify(applyResult)}`);
  }
  const uploadNode = uploadNodes[0];
  const storeInfo = (_d = uploadNode.StoreInfos) == null ? void 0 : _d[0];
  if (!storeInfo) {
    throw new Error(`Failed to get ${label} upload storage info: ${JSON.stringify(uploadNode)}`);
  }
  const uploadHost = uploadNode.UploadHost;
  const storeUri = storeInfo.StoreUri;
  const auth = storeInfo.Auth;
  const sessionKey = uploadNode.SessionKey;
  const vid = uploadNode.Vid;
  logger_default.info(`Getting ${label} upload endpoint: host=${uploadHost}, vid=${vid}`);
  const uploadUrl = `https://${uploadHost}/upload/v1/${storeUri}`;
  const crc32 = calculateCRC322(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
  logger_default.info(`Uploading ${label}file: ${uploadUrl}, CRC32=${crc32}`);
  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Accept": "*/*",
      "Authorization": auth,
      "Content-CRC32": crc32,
      "Content-Type": "application/octet-stream",
      "Origin": "https://jimeng.jianying.com",
      "Referer": "https://jimeng.jianying.com/ai-tool/video/generate",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
    },
    body: buffer
  });
  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(`${label} file upload failed: ${uploadResponse.status} - ${errorText}`);
  }
  const uploadData = await uploadResponse.json();
  if ((uploadData == null ? void 0 : uploadData.code) !== 2e3) {
    throw new Error(`${label} file upload failed: code=${uploadData == null ? void 0 : uploadData.code}, message=${uploadData == null ? void 0 : uploadData.message}`);
  }
  logger_default.info(`${label}file uploaded, crc32=${(_e = uploadData.data) == null ? void 0 : _e.crc32}`);
  const commitUrl = `${vodHost}/?Action=CommitUploadInner&Version=2020-11-19&SpaceName=${spaceName}`;
  const commitTimestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:\-]/g, "").replace(/\.\d{3}Z$/, "Z");
  const commitPayload = JSON.stringify({
    SessionKey: sessionKey,
    Functions: []
  });
  const payloadHash = crypto3.createHash("sha256").update(commitPayload, "utf8").digest("hex");
  const commitRequestHeaders = {
    "x-amz-date": commitTimestamp,
    "x-amz-security-token": session_token,
    "x-amz-content-sha256": payloadHash
  };
  const commitAuthorization = createSignature2(
    "POST",
    commitUrl,
    commitRequestHeaders,
    access_key_id,
    secret_access_key,
    session_token,
    commitPayload,
    "cn-north-1",
    "vod"
  );
  logger_default.info(`Committing ${label} upload: ${commitUrl}`);
  const commitResponse = await fetch(commitUrl, {
    method: "POST",
    headers: {
      "accept": "*/*",
      "authorization": commitAuthorization,
      "content-type": "application/json",
      "origin": "https://jimeng.jianying.com",
      "referer": "https://jimeng.jianying.com/ai-tool/video/generate",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
      "x-amz-date": commitTimestamp,
      "x-amz-security-token": session_token,
      "x-amz-content-sha256": payloadHash
    },
    body: commitPayload
  });
  if (!commitResponse.ok) {
    const errorText = await commitResponse.text();
    throw new Error(`${label} upload commit failed: ${commitResponse.status} - ${errorText}`);
  }
  const commitResult = await commitResponse.json();
  if ((_f = commitResult == null ? void 0 : commitResult.ResponseMetadata) == null ? void 0 : _f.Error) {
    throw new Error(`${label} upload commit failed: ${JSON.stringify(commitResult.ResponseMetadata.Error)}`);
  }
  if (!((_g = commitResult == null ? void 0 : commitResult.Result) == null ? void 0 : _g.Results) || commitResult.Result.Results.length === 0) {
    throw new Error(`${label} upload commit response missing result: ${JSON.stringify(commitResult)}`);
  }
  const result = commitResult.Result.Results[0];
  if (!result.Vid) {
    throw new Error(`${label} upload commit response missing Vid: ${JSON.stringify(result)}`);
  }
  const videoMeta = result.VideoMeta || {};
  let duration = videoMeta.Duration ? Math.round(videoMeta.Duration * 1e3) : 0;
  if (duration <= 0 && mediaType === "audio") {
    duration = parseAudioDuration(buffer);
    logger_default.info(`VOD did not return ${label} duration, parsed locally: ${duration}ms`);
  }
  logger_default.info(`${label} upload complete: vid=${result.Vid}, duration=${duration}ms`);
  return {
    vid: result.Vid,
    width: videoMeta.Width || 0,
    height: videoMeta.Height || 0,
    duration,
    fps: videoMeta.Fps || 0
  };
}
async function fetchHighQualityVideoUrl(itemId, refreshToken) {
  var _a, _b, _c, _d, _e, _f;
  try {
    logger_default.info(`Fetching HQ video download URL, item_id: ${itemId}`);
    const result = await request("post", "/mweb/v1/get_local_item_list", refreshToken, {
      data: {
        item_id_list: [itemId],
        pack_item_opt: {
          scene: 1,
          need_data_integrity: true
        },
        is_for_video_download: true
      }
    });
    const responseStr = JSON.stringify(result);
    logger_default.info(`get_local_item_list response size: ${responseStr.length} chars`);
    const itemList = result.item_list || result.local_item_list || [];
    if (itemList.length > 0) {
      const item = itemList[0];
      const videoUrl = ((_c = (_b = (_a = item == null ? void 0 : item.video) == null ? void 0 : _a.transcoded_video) == null ? void 0 : _b.origin) == null ? void 0 : _c.video_url) || ((_d = item == null ? void 0 : item.video) == null ? void 0 : _d.download_url) || ((_e = item == null ? void 0 : item.video) == null ? void 0 : _e.play_url) || ((_f = item == null ? void 0 : item.video) == null ? void 0 : _f.url);
      if (videoUrl) {
        logger_default.info(`Found HQ video URL from structured field: ${videoUrl}`);
        return videoUrl;
      }
    }
    const hqUrlMatch = responseStr.match(/https:\/\/v[0-9]+-dreamnia\.jimeng\.com\/[^"\s\\]+/);
    if (hqUrlMatch && hqUrlMatch[0]) {
      logger_default.info(`Regex matched HQ video URL (dreamnia): ${hqUrlMatch[0]}`);
      return hqUrlMatch[0];
    }
    const jimengUrlMatch = responseStr.match(/https:\/\/v[0-9]+-[^"\\]*\.jimeng\.com\/[^"\s\\]+/);
    if (jimengUrlMatch && jimengUrlMatch[0]) {
      logger_default.info(`Regex matched jimeng video URL: ${jimengUrlMatch[0]}`);
      return jimengUrlMatch[0];
    }
    const anyVideoUrlMatch = responseStr.match(/https:\/\/v[0-9]+-[^"\\]*\.(vlabvod|jimeng)\.com\/[^"\s\\]+/);
    if (anyVideoUrlMatch && anyVideoUrlMatch[0]) {
      logger_default.info(`Extracted video URL from get_local_item_list: ${anyVideoUrlMatch[0]}`);
      return anyVideoUrlMatch[0];
    }
    logger_default.warn(`Could not extract video URL from get_local_item_list response`);
    return null;
  } catch (error) {
    logger_default.warn(`Failed to fetch HQ video download URL: ${error.message}`);
    return null;
  }
}
async function checkVideoJobStatus(historyId, refreshToken) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
  try {
    let result = await request("post", "/mweb/v1/get_history_by_ids", refreshToken, {
      data: { history_ids: [historyId] }
    });
    let historyData = ((_a = result.history_list) == null ? void 0 : _a[0]) || result[historyId];
    if (!historyData) {
      try {
        const alt = await request("post", "/mweb/v1/get_history_records", refreshToken, {
          data: { history_record_ids: [historyId] }
        });
        historyData = (_b = alt.history_records) == null ? void 0 : _b[0];
      } catch (_17) {
      }
    }
    if (!historyData) {
      return { status: "processing" };
    }
    const status = historyData.status;
    const failCode = historyData.fail_code;
    const item_list = historyData.item_list || [];
    if (status === 30) {
      const error = failCode === 2038 ? "\u5185\u5BB9\u88AB\u8FC7\u6EE4" : `\u751F\u6210\u5931\u8D25\uFF0C\u9519\u8BEF\u7801: ${failCode}`;
      return { status: "failed", error };
    }
    if (status === 20) {
      return { status: "processing" };
    }
    const itemId = ((_c = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _c.item_id) || ((_d = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _d.id) || ((_e = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _e.local_item_id) || ((_g = (_f = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _f.common_attr) == null ? void 0 : _g.id);
    if (itemId) {
      try {
        const hqUrl = await fetchHighQualityVideoUrl(String(itemId), refreshToken);
        if (hqUrl) return { status: "completed", url: hqUrl };
      } catch (e) {
        logger_default.warn(`checkVideoJobStatus: HQ URL fetch failed for ${historyId}: ${e.message}`);
      }
    }
    const videoUrl = ((_k = (_j = (_i = (_h = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _h.video) == null ? void 0 : _i.transcoded_video) == null ? void 0 : _j.origin) == null ? void 0 : _k.video_url) || ((_m = (_l = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _l.video) == null ? void 0 : _m.play_url) || ((_o = (_n = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _n.video) == null ? void 0 : _o.download_url) || ((_q = (_p = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _p.video) == null ? void 0 : _q.url);
    if (videoUrl) return { status: "completed", url: videoUrl };
    return { status: "failed", error: "\u672A\u80FDGetting videoURL" };
  } catch (err) {
    logger_default.error(`checkVideoJobStatus: API error for historyId=${historyId}: ${err.message}`);
    return { status: "processing" };
  }
}
async function generateVideo(_model, prompt, {
  ratio = "1:1",
  resolution = "720p",
  duration = 5,
  filePaths = [],
  files = []
}, refreshToken, jobId) {
  const model = getModel2(_model);
  const { width, height } = resolveVideoResolution(resolution, ratio);
  logger_default.info(`Model: ${_model} -> mapped: ${model} ${width}x${height} (${ratio}@${resolution}) duration: ${duration}s`);
  const { totalCredit } = await getCredit(refreshToken);
  if (totalCredit <= 0)
    await receiveCredit(refreshToken);
  let first_frame_image = void 0;
  let end_frame_image = void 0;
  if (files && files.length > 0) {
    let uploadIDs = [];
    logger_default.info(`Processing ${files.length} uploaded file(s) for video generation`);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file || !file.filepath) {
        logger_default.warn(`File ${i + 1} is invalid, skipping`);
        continue;
      }
      try {
        logger_default.info(`Uploading file ${i + 1}: ${file.originalFilename || file.filepath}`);
        const buffer = fs8.readFileSync(file.filepath);
        const imageUri = await uploadImageBufferForVideo(buffer, refreshToken);
        if (imageUri) {
          uploadIDs.push(imageUri);
          logger_default.info(`File ${i + 1} uploaded: ${imageUri}`);
        } else {
          logger_default.error(`File ${i + 1} upload failed: no image_uri returned`);
        }
      } catch (error) {
        logger_default.error(`File ${i + 1} upload failed: ${error.message}`);
        if (i === 0) {
          logger_default.error(`First-frame file upload failed, stopping to avoid wasting credits`);
          throw new APIException(exceptions_default.API_REQUEST_FAILED, `First-frame file upload failed: ${error.message}`);
        } else {
          logger_default.warn(`File ${i + 1} upload failed, skipping and continuing`);
        }
      }
    }
    logger_default.info(`File uploads complete: ${uploadIDs.length} file(s)`);
    if (uploadIDs.length === 0) {
      logger_default.error(`All file uploads failed, stopping to avoid wasting credits`);
      throw new APIException(exceptions_default.API_REQUEST_FAILED, "All file uploads failed, please check that the files are valid");
    }
    if (uploadIDs[0]) {
      first_frame_image = {
        format: "",
        height,
        id: util_default.uuid(),
        image_uri: uploadIDs[0],
        name: "",
        platform_type: 1,
        source_from: "upload",
        type: "image",
        uri: uploadIDs[0],
        width
      };
      logger_default.info(`Set first-frame image: ${uploadIDs[0]}`);
    }
    if (uploadIDs[1]) {
      end_frame_image = {
        format: "",
        height,
        id: util_default.uuid(),
        image_uri: uploadIDs[1],
        name: "",
        platform_type: 1,
        source_from: "upload",
        type: "image",
        uri: uploadIDs[1],
        width
      };
      logger_default.info(`Set last-frame image: ${uploadIDs[1]}`);
    }
  } else if (filePaths && filePaths.length > 0) {
    let uploadIDs = [];
    logger_default.info(`Uploading  ${filePaths.length} image(s) for video generation`);
    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i];
      if (!filePath) {
        logger_default.warn(`Image ${i + 1} path is empty, skipping`);
        continue;
      }
      try {
        logger_default.info(`Uploading image ${i + 1}: ${filePath}`);
        const imageUri = await uploadImageForVideo(filePath, refreshToken);
        if (imageUri) {
          uploadIDs.push(imageUri);
          logger_default.info(`Image ${i + 1} uploaded: ${imageUri}`);
        } else {
          logger_default.error(`Image ${i + 1} upload failed: no image_uri returned`);
        }
      } catch (error) {
        logger_default.error(`Image ${i + 1} upload failed: ${error.message}`);
        if (i === 0) {
          logger_default.error(`First-frame image upload failed, stopping to avoid wasting credits`);
          throw new APIException(exceptions_default.API_REQUEST_FAILED, `First-frame image upload failed: ${error.message}`);
        } else {
          logger_default.warn(`Image ${i + 1} upload failed, skipping and continuing`);
        }
      }
    }
    logger_default.info(`Image uploads complete: ${uploadIDs.length} image(s)`);
    if (uploadIDs.length === 0) {
      logger_default.error(`All image uploads failed, stopping to avoid wasting credits`);
      throw new APIException(exceptions_default.API_REQUEST_FAILED, "All image uploads failed, please check that the image URLs are valid");
    }
    if (uploadIDs[0]) {
      first_frame_image = {
        format: "",
        height,
        id: util_default.uuid(),
        image_uri: uploadIDs[0],
        name: "",
        platform_type: 1,
        source_from: "upload",
        type: "image",
        uri: uploadIDs[0],
        width
      };
      logger_default.info(`Set first-frame image: ${uploadIDs[0]}`);
    }
    if (uploadIDs[1]) {
      end_frame_image = {
        format: "",
        height,
        id: util_default.uuid(),
        image_uri: uploadIDs[1],
        name: "",
        platform_type: 1,
        source_from: "upload",
        type: "image",
        uri: uploadIDs[1],
        width
      };
      logger_default.info(`Set last-frame image: ${uploadIDs[1]}`);
    } else if (filePaths.length > 1) {
      logger_default.warn(`Second image upload failed or not provided, using first-frame only`);
    }
  } else {
    logger_default.info(`No image files provided, generating video from text only`);
  }
  const componentId = util_default.uuid();
  const metricsExtra = JSON.stringify({
    "enterFrom": "click",
    "isDefaultSeed": 1,
    "promptSource": "custom",
    "isRegenerate": false,
    "originSubmitId": util_default.uuid()
  });
  const draftVersion = MODEL_DRAFT_VERSIONS2[_model] || DEFAULT_DRAFT_VERSION;
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(width, height);
  const aspectRatio = `${width / divisor}:${height / divisor}`;
  const { aigc_data } = await request(
    "post",
    "/mweb/v1/aigc_draft/generate",
    refreshToken,
    {
      params: {
        aigc_features: "app_lip_sync",
        web_version: "6.6.0",
        da_version: draftVersion
      },
      data: {
        "extend": {
          "root_model": end_frame_image ? MODEL_MAP2["jimeng-video-3.0"] : model,
          "m_video_commerce_info": {
            benefit_type: "basic_video_operation_vgfm_v_three",
            resource_id: "generate_video",
            resource_id_type: "str",
            resource_sub_type: "aigc"
          },
          "m_video_commerce_info_list": [{
            benefit_type: "basic_video_operation_vgfm_v_three",
            resource_id: "generate_video",
            resource_id_type: "str",
            resource_sub_type: "aigc"
          }]
        },
        "submit_id": util_default.uuid(),
        "metrics_extra": metricsExtra,
        "draft_content": JSON.stringify({
          "type": "draft",
          "id": util_default.uuid(),
          "min_version": "3.0.5",
          "is_from_tsn": true,
          "version": draftVersion,
          "main_component_id": componentId,
          "component_list": [{
            "type": "video_base_component",
            "id": componentId,
            "min_version": "1.0.0",
            "metadata": {
              "type": "",
              "id": util_default.uuid(),
              "created_platform": 3,
              "created_platform_version": "",
              "created_time_in_ms": Date.now(),
              "created_did": ""
            },
            "generate_type": "gen_video",
            "aigc_mode": "workbench",
            "abilities": {
              "type": "",
              "id": util_default.uuid(),
              "gen_video": {
                "id": util_default.uuid(),
                "type": "",
                "text_to_video_params": {
                  "type": "",
                  "id": util_default.uuid(),
                  "model_req_key": model,
                  "priority": 0,
                  "seed": Math.floor(Math.random() * 1e8) + 25e8,
                  "video_aspect_ratio": aspectRatio,
                  "video_gen_inputs": [{
                    duration_ms: duration * 1e3,
                    first_frame_image,
                    end_frame_image,
                    fps: 24,
                    id: util_default.uuid(),
                    min_version: "3.0.5",
                    prompt,
                    resolution,
                    type: "",
                    video_mode: 2
                  }]
                },
                "video_task_extra": metricsExtra
              }
            }
          }]
        }),
        http_common_info: {
          aid: DEFAULT_ASSISTANT_ID3
        }
      }
    }
  );
  const historyId = aigc_data.history_record_id;
  if (!historyId)
    throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "History ID not found");
  logger_default.info(`Job ${jobId}: historyId=${historyId} obtained, handing off to background poller`);
  await updateJobInDb(jobId, {
    status: "processing",
    jimeng_history_id: historyId,
    refresh_token: refreshToken,
    model: _model
  });
  return null;
}
async function generateSeedanceVideo(_model, prompt, {
  ratio = "4:3",
  resolution = "720p",
  duration = 4,
  filePaths = [],
  files = []
}, refreshToken, jobId) {
  const model = getModel2(_model);
  const benefitType = SEEDANCE_BENEFIT_TYPE_MAP[_model] || "dreamina_video_seedance_20_pro";
  const actualDuration = duration || 4;
  const { width, height } = resolveVideoResolution(resolution, ratio);
  logger_default.info(`Seedance generation: model=${_model} -> mapped=${model} ${width}x${height} (${ratio}@${resolution}) duration=${actualDuration}s`);
  const { totalCredit } = await getCredit(refreshToken);
  if (totalCredit <= 0)
    await receiveCredit(refreshToken);
  let uploadedMaterials = [];
  if (files && files.length > 0) {
    logger_default.info(`Seedance: Processing ${files.length} uploaded file(s)`);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file || !file.filepath) {
        logger_default.warn(`Seedance: file ${i + 1} file(s) invalid, skipping`);
        continue;
      }
      const materialType = detectMaterialType(file);
      try {
        logger_default.info(`Seedance: uploading file ${i + 1} (${materialType}): ${file.originalFilename || file.filepath}`);
        const buffer = fs8.readFileSync(file.filepath);
        if (materialType === "image") {
          const imageUri = await uploadImageBufferForVideo(buffer, refreshToken);
          if (imageUri) {
            uploadedMaterials.push({ type: "image", uri: imageUri, width, height });
            logger_default.info(`Seedance: file ${i + 1} image uploaded: ${imageUri}`);
          }
        } else {
          const vodResult = await uploadMediaForVideo(buffer, materialType, refreshToken, file.originalFilename);
          uploadedMaterials.push({
            type: materialType,
            vid: vodResult.vid,
            width: vodResult.width,
            height: vodResult.height,
            duration: vodResult.duration,
            fps: vodResult.fps,
            name: file.originalFilename || ""
          });
          logger_default.info(`Seedance: file ${i + 1} ${materialType === "video" ? "video" : "audio"} uploaded: ${vodResult.vid}`);
        }
      } catch (error) {
        logger_default.error(`Seedance: file ${i + 1} file upload failed: ${error.message}`);
        if (i === 0) {
          throw new APIException(exceptions_default.API_REQUEST_FAILED, `First file upload failed: ${error.message}`);
        }
      }
    }
  } else if (filePaths && filePaths.length > 0) {
    logger_default.info(`Seedance: Uploading  ${filePaths.length} file(s)`);
    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i];
      if (!filePath) continue;
      const materialType = detectMaterialTypeFromUrl(filePath);
      try {
        logger_default.info(`Seedance: uploading file ${i + 1} (${materialType}): ${filePath}`);
        if (materialType === "image") {
          const imageUri = await uploadImageForVideo(filePath, refreshToken);
          if (imageUri) {
            uploadedMaterials.push({ type: "image", uri: imageUri, width, height });
            logger_default.info(`Seedance: file ${i + 1} image uploaded: ${imageUri}`);
          }
        } else {
          const response = await fetch(filePath);
          if (!response.ok) throw new Error(`File download failed: ${response.status}`);
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const vodResult = await uploadMediaForVideo(buffer, materialType, refreshToken);
          uploadedMaterials.push({
            type: materialType,
            vid: vodResult.vid,
            width: vodResult.width,
            height: vodResult.height,
            duration: vodResult.duration,
            fps: vodResult.fps
          });
          logger_default.info(`Seedance: file ${i + 1} ${materialType === "video" ? "video" : "audio"} uploaded: ${vodResult.vid}`);
        }
      } catch (error) {
        logger_default.error(`Seedance: file ${i + 1} file upload failed: ${error.message}`);
        if (i === 0) {
          throw new APIException(exceptions_default.API_REQUEST_FAILED, `First file upload failed: ${error.message}`);
        }
      }
    }
  }
  if (uploadedMaterials.length === 0) {
    throw new APIException(exceptions_default.API_REQUEST_FAILED, "Seedance 2.0 requires at least one file (image/video/audio)");
  }
  logger_default.info(`Seedance: uploaded ${uploadedMaterials.length} file(s)`);
  const hasVideoMaterial = uploadedMaterials.some((m) => m.type === "video");
  const finalBenefitType = hasVideoMaterial ? `${benefitType}_with_video` : benefitType;
  const materialList = uploadedMaterials.map((mat) => {
    const base = { type: "", id: util_default.uuid() };
    if (mat.type === "image") {
      return {
        ...base,
        material_type: "image",
        image_info: {
          type: "image",
          id: util_default.uuid(),
          source_from: "upload",
          platform_type: 1,
          name: "",
          image_uri: mat.uri,
          aigc_image: { type: "", id: util_default.uuid() },
          width: mat.width,
          height: mat.height,
          format: "",
          uri: mat.uri
        }
      };
    } else if (mat.type === "video") {
      return {
        ...base,
        material_type: "video",
        video_info: {
          type: "video",
          id: util_default.uuid(),
          source_from: "upload",
          name: mat.name || "",
          vid: mat.vid,
          fps: mat.fps || 0,
          width: mat.width || 0,
          height: mat.height || 0,
          duration: mat.duration || 0
        }
      };
    } else {
      return {
        ...base,
        material_type: "audio",
        audio_info: {
          type: "audio",
          id: util_default.uuid(),
          source_from: "upload",
          vid: mat.vid,
          duration: mat.duration || 0,
          name: mat.name || ""
        }
      };
    }
  });
  const metaList = buildMetaListFromPrompt(prompt, uploadedMaterials);
  const componentId = util_default.uuid();
  const submitId = util_default.uuid();
  const draftVersion = MODEL_DRAFT_VERSIONS2[_model] || "3.3.9";
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(width, height);
  const aspectRatio = `${width / divisor}:${height / divisor}`;
  const metricsExtra = JSON.stringify({
    isDefaultSeed: 1,
    originSubmitId: submitId,
    isRegenerate: false,
    enterFrom: "click",
    position: "page_bottom_box",
    functionMode: "omni_reference",
    sceneOptions: JSON.stringify([{
      type: "video",
      scene: "BasicVideoGenerateButton",
      modelReqKey: model,
      videoDuration: actualDuration,
      reportParams: {
        enterSource: "generate",
        vipSource: "generate",
        extraVipFunctionKey: model,
        useVipFunctionDetailsReporterHoc: true
      },
      materialTypes: [...new Set(uploadedMaterials.map((m) => MATERIAL_TYPE_CODE[m.type]))]
    }])
  });
  const token = await acquireToken(refreshToken);
  const generateQueryParams = new URLSearchParams({
    aid: String(DEFAULT_ASSISTANT_ID),
    device_platform: "web",
    region: "cn",
    webId: String(WEB_ID),
    da_version: draftVersion,
    web_component_open_flag: "1",
    web_version: "7.5.0",
    aigc_features: "app_lip_sync"
  });
  const generateUrl = `https://jimeng.jianying.com/mweb/v1/aigc_draft/generate?${generateQueryParams.toString()}`;
  const generateBody = {
    extend: {
      root_model: model,
      m_video_commerce_info: {
        benefit_type: finalBenefitType,
        resource_id: "generate_video",
        resource_id_type: "str",
        resource_sub_type: "aigc"
      },
      m_video_commerce_info_list: [{
        benefit_type: finalBenefitType,
        resource_id: "generate_video",
        resource_id_type: "str",
        resource_sub_type: "aigc"
      }]
    },
    submit_id: submitId,
    metrics_extra: metricsExtra,
    draft_content: JSON.stringify({
      type: "draft",
      id: util_default.uuid(),
      min_version: draftVersion,
      min_features: ["AIGC_Video_UnifiedEdit"],
      is_from_tsn: true,
      version: draftVersion,
      main_component_id: componentId,
      component_list: [{
        type: "video_base_component",
        id: componentId,
        min_version: "1.0.0",
        aigc_mode: "workbench",
        metadata: {
          type: "",
          id: util_default.uuid(),
          created_platform: 3,
          created_platform_version: "",
          created_time_in_ms: String(Date.now()),
          created_did: ""
        },
        generate_type: "gen_video",
        abilities: {
          type: "",
          id: util_default.uuid(),
          gen_video: {
            type: "",
            id: util_default.uuid(),
            text_to_video_params: {
              type: "",
              id: util_default.uuid(),
              video_gen_inputs: [{
                type: "",
                id: util_default.uuid(),
                min_version: draftVersion,
                prompt: "",
                // Seedance 2.0 prompt 在 meta_list 中
                video_mode: 2,
                fps: 24,
                duration_ms: actualDuration * 1e3,
                idip_meta_list: [],
                unified_edit_input: {
                  type: "",
                  id: util_default.uuid(),
                  material_list: materialList,
                  meta_list: metaList
                }
              }],
              video_aspect_ratio: aspectRatio,
              seed: Math.floor(Math.random() * 1e9),
              model_req_key: model,
              priority: 0
            },
            video_task_extra: metricsExtra
          }
        },
        process_type: 1
      }]
    }),
    http_common_info: {
      aid: DEFAULT_ASSISTANT_ID
    }
  };
  logger_default.info(`Seedance: sending generate request via browser proxy...`);
  await acquireBrowserSlot(token.substring(0, 8));
  let generateResult;
  try {
    generateResult = await browser_service_default.fetch(
      token,
      generateUrl,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generateBody)
      }
    );
  } finally {
    releaseBrowserSlot();
  }
  const { ret, errmsg, data: generateData } = generateResult;
  if (ret !== void 0 && Number(ret) !== 0) {
    if (Number(ret) === 5e3) {
      throw new APIException(exceptions_default.API_IMAGE_GENERATION_INSUFFICIENT_POINTS, `[Video generation failed]: Jimeng credits may be insufficient, ${errmsg}`);
    }
    throw new APIException(exceptions_default.API_REQUEST_FAILED, `[Jimeng request failed]: ${errmsg}`);
  }
  const aigc_data = (generateData == null ? void 0 : generateData.aigc_data) || generateResult.aigc_data;
  const historyId = aigc_data.history_record_id;
  if (!historyId)
    throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "History ID not found");
  logger_default.info(`Seedance Job ${jobId}: historyId=${historyId} obtained, handing off to background poller`);
  await updateJobInDb(jobId, {
    status: "processing",
    jimeng_history_id: historyId,
    refresh_token: refreshToken,
    model: _model
  });
  return null;
}
function buildMetaListFromPrompt(prompt, materials) {
  const metaList = [];
  const materialCount = materials.length;
  const placeholderRegex = /@(?:图|image)?(\d+)/gi;
  let lastIndex = 0;
  let match;
  while ((match = placeholderRegex.exec(prompt)) !== null) {
    if (match.index > lastIndex) {
      const textBefore = prompt.substring(lastIndex, match.index);
      if (textBefore.trim()) {
        metaList.push({ meta_type: "text", text: textBefore });
      }
    }
    const materialIndex = parseInt(match[1]) - 1;
    if (materialIndex >= 0 && materialIndex < materialCount) {
      metaList.push({
        meta_type: materials[materialIndex].type,
        text: "",
        material_ref: { material_idx: materialIndex }
      });
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < prompt.length) {
    const remainingText = prompt.substring(lastIndex);
    if (remainingText.trim()) {
      metaList.push({ meta_type: "text", text: remainingText });
    }
  }
  if (metaList.length === 0) {
    for (let i = 0; i < materialCount; i++) {
      if (i === 0) {
        metaList.push({ meta_type: "text", text: "\u4F7F\u7528" });
      }
      metaList.push({
        meta_type: materials[i].type,
        text: "",
        material_ref: { material_idx: i }
      });
      if (i < materialCount - 1) {
        metaList.push({ meta_type: "text", text: "\u548C" });
      }
    }
    if (prompt && prompt.trim()) {
      metaList.push({ meta_type: "text", text: `\u7D20\u6750\uFF0C${prompt}` });
    } else {
      metaList.push({ meta_type: "text", text: "\u7D20\u6750\u751F\u6210video" });
    }
  }
  return metaList;
}

// src/api/controllers/chat.ts
var MAX_RETRY_COUNT = 3;
var RETRY_DELAY = 5e3;
function parseModel(model) {
  const [_model, size] = model.split(":");
  const [_17, width, height] = /(\d+)[\W\w](\d+)/.exec(size) ?? [];
  return {
    model: _model,
    width: size ? Math.ceil(parseInt(width) / 2) * 2 : 1024,
    height: size ? Math.ceil(parseInt(height) / 2) * 2 : 1024
  };
}
function isVideoModel(model) {
  return model.startsWith("jimeng-video") || model.startsWith("seedance-");
}
async function createCompletion(messages, refreshToken, _model = DEFAULT_MODEL, retryCount = 0) {
  return (async () => {
    if (messages.length === 0)
      throw new APIException(exceptions_default.API_REQUEST_PARAMS_INVALID, "\u6D88\u606F\u4E0D\u80FD\u4E3A\u7A7A");
    const { model, width, height } = parseModel(_model);
    logger_default.info(messages);
    if (isVideoModel(_model)) {
      try {
        logger_default.info(`\u5F00\u59CB\u751F\u6210\u89C6\u9891\uFF0C\u6A21\u578B: ${_model}`);
        let videoUrl;
        if (isSeedanceModel(_model)) {
          return {
            id: util_default.uuid(),
            model: _model,
            object: "chat.completion",
            choices: [
              {
                index: 0,
                message: {
                  role: "assistant",
                  content: `Seedance 2.0 \u662F\u591A\u56FE\u667A\u80FD\u89C6\u9891\u751F\u6210\u6A21\u578B\uFF0C\u9700\u8981\u4E0A\u4F20\u56FE\u7247\u624D\u80FD\u751F\u6210\u89C6\u9891\u3002

\u8BF7\u4F7F\u7528 POST /v1/videos/generations API \u63A5\u53E3\uFF1A

\`\`\`bash
curl -X POST http://localhost:3000/v1/videos/generations \\
  -H "Authorization: your_token" \\
  -F "model=jimeng-video-seedance-2.0" \\
  -F "prompt=@1 \u56FE\u7247\u4E2D\u7684\u4EBA\u7269\u5F00\u59CB\u8DF3\u821E" \\
  -F "ratio=4:3" \\
  -F "duration=4" \\
  -F "files=@/path/to/image1.jpg" \\
  -F "files=@/path/to/image2.jpg"
\`\`\`

**\u53C2\u6570\u8BF4\u660E\uFF1A**
- \`model\`: jimeng-video-seedance-2.0\uFF08\u63A8\u8350\uFF09\u3001jimeng-video-seedance-2.0-fast\uFF08\u5FEB\u901F\u7248\uFF09\u6216 seedance-2.0\uFF08\u517C\u5BB9\uFF09
- \`prompt\`: \u63D0\u793A\u8BCD\uFF0C\u4F7F\u7528 @1, @2 \u7B49\u5F15\u7528\u4E0A\u4F20\u7684\u56FE\u7247
- \`ratio\`: \u89C6\u9891\u6BD4\u4F8B (\u9ED8\u8BA4 4:3)
- \`duration\`: \u89C6\u9891\u65F6\u957F 4-15 \u79D2 (\u9ED8\u8BA4 4 \u79D2)
- \`files\`: \u4E0A\u4F20\u7684\u56FE\u7247\u6587\u4EF6\uFF08\u652F\u6301\u591A\u5F20\uFF09`
                },
                finish_reason: "stop"
              }
            ],
            usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
            created: util_default.unixTimestamp()
          };
        }
        videoUrl = await generateVideo(
          _model,
          messages[messages.length - 1].content,
          {
            ratio: "16:9",
            resolution: "720p"
            // 默认分辨率
          },
          refreshToken
        );
        logger_default.info(`\u89C6\u9891\u751F\u6210\u6210\u529F\uFF0CURL: ${videoUrl}`);
        return {
          id: util_default.uuid(),
          model: _model,
          object: "chat.completion",
          choices: [
            {
              index: 0,
              message: {
                role: "assistant",
                content: `![video](${videoUrl})
`
              },
              finish_reason: "stop"
            }
          ],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
          created: util_default.unixTimestamp()
        };
      } catch (error) {
        logger_default.error(`\u89C6\u9891\u751F\u6210\u5931\u8D25: ${error.message}`);
        if (error instanceof APIException) {
          throw error;
        }
        return {
          id: util_default.uuid(),
          model: _model,
          object: "chat.completion",
          choices: [
            {
              index: 0,
              message: {
                role: "assistant",
                content: `\u751F\u6210\u89C6\u9891\u5931\u8D25: ${error.message}

\u5982\u679C\u60A8\u5728\u5373\u68A6\u5B98\u7F51\u770B\u5230\u5DF2\u751F\u6210\u7684\u89C6\u9891\uFF0C\u53EF\u80FD\u662F\u83B7\u53D6\u7ED3\u679C\u65F6\u51FA\u73B0\u4E86\u95EE\u9898\uFF0C\u8BF7\u524D\u5F80\u5373\u68A6\u5B98\u7F51\u67E5\u770B\u3002`
              },
              finish_reason: "stop"
            }
          ],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
          created: util_default.unixTimestamp()
        };
      }
    } else {
      const imageUrls = await generateImages(
        model,
        messages[messages.length - 1].content,
        {
          width,
          height
        },
        refreshToken
      );
      return {
        id: util_default.uuid(),
        model: _model || model,
        object: "chat.completion",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: imageUrls.reduce(
                (acc, url, i) => acc + `![image_${i}](${url})
`,
                ""
              )
            },
            finish_reason: "stop"
          }
        ],
        usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
        created: util_default.unixTimestamp()
      };
    }
  })().catch((err) => {
    if (retryCount < MAX_RETRY_COUNT) {
      logger_default.error(`Response error: ${err.stack}`);
      logger_default.warn(`Try again after ${RETRY_DELAY / 1e3}s...`);
      return (async () => {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        return createCompletion(messages, refreshToken, _model, retryCount + 1);
      })();
    }
    throw err;
  });
}
async function createCompletionStream(messages, refreshToken, _model = DEFAULT_MODEL, retryCount = 0) {
  return (async () => {
    const { model, width, height } = parseModel(_model);
    logger_default.info(messages);
    const stream = new PassThrough();
    if (messages.length === 0) {
      logger_default.warn("\u6D88\u606F\u4E3A\u7A7A\uFF0C\u8FD4\u56DE\u7A7A\u6D41");
      stream.end("data: [DONE]\n\n");
      return stream;
    }
    if (isVideoModel(_model)) {
      stream.write(
        "data: " + JSON.stringify({
          id: util_default.uuid(),
          model: _model,
          object: "chat.completion.chunk",
          choices: [
            {
              index: 0,
              delta: { role: "assistant", content: "\u{1F3AC} \u89C6\u9891\u751F\u6210\u4E2D\uFF0C\u8BF7\u7A0D\u5019...\n\u8FD9\u53EF\u80FD\u9700\u89811-2\u5206\u949F\uFF0C\u8BF7\u8010\u5FC3\u7B49\u5F85" },
              finish_reason: null
            }
          ]
        }) + "\n\n"
      );
      logger_default.info(`\u5F00\u59CB\u751F\u6210\u89C6\u9891\uFF0C\u63D0\u793A\u8BCD: ${messages[messages.length - 1].content}`);
      const progressInterval = setInterval(() => {
        stream.write(
          "data: " + JSON.stringify({
            id: util_default.uuid(),
            model: _model,
            object: "chat.completion.chunk",
            choices: [
              {
                index: 0,
                delta: { role: "assistant", content: "." },
                finish_reason: null
              }
            ]
          }) + "\n\n"
        );
      }, 5e3);
      const timeoutId = setTimeout(() => {
        clearInterval(progressInterval);
        logger_default.warn(`\u89C6\u9891\u751F\u6210\u8D85\u65F6\uFF082\u5206\u949F\uFF09\uFF0C\u63D0\u793A\u7528\u6237\u524D\u5F80\u5373\u68A6\u5B98\u7F51\u67E5\u770B`);
        stream.write(
          "data: " + JSON.stringify({
            id: util_default.uuid(),
            model: _model,
            object: "chat.completion.chunk",
            choices: [
              {
                index: 1,
                delta: {
                  role: "assistant",
                  content: "\n\n\u89C6\u9891\u751F\u6210\u65F6\u95F4\u8F83\u957F\uFF08\u5DF2\u7B49\u5F852\u5206\u949F\uFF09\uFF0C\u4F46\u89C6\u9891\u53EF\u80FD\u4ECD\u5728\u751F\u6210\u4E2D\u3002\n\n\u8BF7\u524D\u5F80\u5373\u68A6\u5B98\u7F51\u67E5\u770B\u60A8\u7684\u89C6\u9891\uFF1A\n1. \u8BBF\u95EE https://jimeng.jianying.com/ai-tool/video/generate\n2. \u767B\u5F55\u540E\u67E5\u770B\u60A8\u7684\u521B\u4F5C\u5386\u53F2\n3. \u5982\u679C\u89C6\u9891\u5DF2\u751F\u6210\uFF0C\u60A8\u53EF\u4EE5\u76F4\u63A5\u5728\u5B98\u7F51\u4E0B\u8F7D\u6216\u5206\u4EAB\n\n\u60A8\u4E5F\u53EF\u4EE5\u7EE7\u7EED\u7B49\u5F85\uFF0C\u7CFB\u7EDF\u5C06\u5728\u540E\u53F0\u7EE7\u7EED\u5C1D\u8BD5\u83B7\u53D6\u89C6\u9891\uFF08\u6700\u957F\u7EA620\u5206\u949F\uFF09\u3002"
                },
                finish_reason: "stop"
              }
            ]
          }) + "\n\n"
        );
      }, 2 * 60 * 1e3);
      logger_default.info(`\u5F00\u59CB\u751F\u6210\u89C6\u9891\uFF0C\u6A21\u578B: ${_model}, \u63D0\u793A\u8BCD: ${messages[messages.length - 1].content.substring(0, 50)}...`);
      stream.write(
        "data: " + JSON.stringify({
          id: util_default.uuid(),
          model: _model,
          object: "chat.completion.chunk",
          choices: [
            {
              index: 0,
              delta: {
                role: "assistant",
                content: "\n\n\u{1F3AC} \u89C6\u9891\u751F\u6210\u5DF2\u5F00\u59CB\uFF0C\u8FD9\u53EF\u80FD\u9700\u8981\u51E0\u5206\u949F\u65F6\u95F4..."
              },
              finish_reason: null
            }
          ]
        }) + "\n\n"
      );
      generateVideo(
        _model,
        messages[messages.length - 1].content,
        { ratio: "16:9", resolution: "720p" },
        refreshToken
      ).then((videoUrl) => {
        clearInterval(progressInterval);
        clearTimeout(timeoutId);
        logger_default.info(`\u89C6\u9891\u751F\u6210\u6210\u529F\uFF0CURL: ${videoUrl}`);
        stream.write(
          "data: " + JSON.stringify({
            id: util_default.uuid(),
            model: _model,
            object: "chat.completion.chunk",
            choices: [
              {
                index: 1,
                delta: {
                  role: "assistant",
                  content: `

\u2705 \u89C6\u9891\u751F\u6210\u5B8C\u6210\uFF01

![video](${videoUrl})

\u60A8\u53EF\u4EE5\uFF1A
1. \u76F4\u63A5\u67E5\u770B\u4E0A\u65B9\u89C6\u9891
2. \u4F7F\u7528\u4EE5\u4E0B\u94FE\u63A5\u4E0B\u8F7D\u6216\u5206\u4EAB\uFF1A${videoUrl}`
                },
                finish_reason: null
              }
            ]
          }) + "\n\n"
        );
        stream.write(
          "data: " + JSON.stringify({
            id: util_default.uuid(),
            model: _model,
            object: "chat.completion.chunk",
            choices: [
              {
                index: 2,
                delta: {
                  role: "assistant",
                  content: ""
                },
                finish_reason: "stop"
              }
            ]
          }) + "\n\n"
        );
        stream.end("data: [DONE]\n\n");
      }).catch((err) => {
        clearInterval(progressInterval);
        clearTimeout(timeoutId);
        logger_default.error(`\u89C6\u9891\u751F\u6210\u5931\u8D25: ${err.message}`);
        logger_default.error(`\u9519\u8BEF\u8BE6\u60C5: ${JSON.stringify(err)}`);
        logger_default.error(`\u89C6\u9891\u751F\u6210\u5931\u8D25: ${err.message}`);
        logger_default.error(`\u9519\u8BEF\u8BE6\u60C5: ${JSON.stringify(err)}`);
        let errorMessage = `\u26A0\uFE0F \u89C6\u9891\u751F\u6210\u8FC7\u7A0B\u4E2D\u9047\u5230\u95EE\u9898: ${err.message}`;
        if (err.message.includes("\u5386\u53F2\u8BB0\u5F55\u4E0D\u5B58\u5728")) {
          errorMessage += "\n\n\u53EF\u80FD\u539F\u56E0\uFF1A\n1. \u89C6\u9891\u751F\u6210\u8BF7\u6C42\u5DF2\u53D1\u9001\uFF0C\u4F46API\u65E0\u6CD5\u83B7\u53D6\u5386\u53F2\u8BB0\u5F55\n2. \u89C6\u9891\u751F\u6210\u670D\u52A1\u6682\u65F6\u4E0D\u53EF\u7528\n3. \u5386\u53F2\u8BB0\u5F55ID\u65E0\u6548\u6216\u5DF2\u8FC7\u671F\n\n\u5EFA\u8BAE\u64CD\u4F5C\uFF1A\n1. \u8BF7\u524D\u5F80\u5373\u68A6\u5B98\u7F51\u67E5\u770B\u60A8\u7684\u89C6\u9891\u662F\u5426\u5DF2\u751F\u6210\uFF1Ahttps://jimeng.jianying.com/ai-tool/video/generate\n2. \u5982\u679C\u5B98\u7F51\u5DF2\u663E\u793A\u89C6\u9891\uFF0C\u4F46\u8FD9\u91CC\u65E0\u6CD5\u83B7\u53D6\uFF0C\u53EF\u80FD\u662FAPI\u8FDE\u63A5\u95EE\u9898\n3. \u5982\u679C\u5B98\u7F51\u4E5F\u6CA1\u6709\u663E\u793A\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u6216\u91CD\u65B0\u751F\u6210\u89C6\u9891";
        } else if (err.message.includes("\u83B7\u53D6\u89C6\u9891\u751F\u6210\u7ED3\u679C\u8D85\u65F6")) {
          errorMessage += "\n\n\u89C6\u9891\u751F\u6210\u53EF\u80FD\u4ECD\u5728\u8FDB\u884C\u4E2D\uFF0C\u4F46\u7B49\u5F85\u65F6\u95F4\u5DF2\u8D85\u8FC7\u7CFB\u7EDF\u8BBE\u5B9A\u7684\u9650\u5236\u3002\n\n\u8BF7\u524D\u5F80\u5373\u68A6\u5B98\u7F51\u67E5\u770B\u60A8\u7684\u89C6\u9891\uFF1Ahttps://jimeng.jianying.com/ai-tool/video/generate\n\n\u5982\u679C\u60A8\u5728\u5B98\u7F51\u4E0A\u770B\u5230\u89C6\u9891\u5DF2\u751F\u6210\uFF0C\u4F46\u8FD9\u91CC\u65E0\u6CD5\u663E\u793A\uFF0C\u53EF\u80FD\u662F\u56E0\u4E3A\uFF1A\n1. \u83B7\u53D6\u7ED3\u679C\u7684\u8FC7\u7A0B\u8D85\u65F6\n2. \u7F51\u7EDC\u8FDE\u63A5\u95EE\u9898\n3. API\u8BBF\u95EE\u9650\u5236";
        } else {
          errorMessage += "\n\n\u5982\u679C\u60A8\u5728\u5373\u68A6\u5B98\u7F51\u770B\u5230\u5DF2\u751F\u6210\u7684\u89C6\u9891\uFF0C\u53EF\u80FD\u662F\u83B7\u53D6\u7ED3\u679C\u65F6\u51FA\u73B0\u4E86\u95EE\u9898\u3002\n\n\u8BF7\u8BBF\u95EE\u5373\u68A6\u5B98\u7F51\u67E5\u770B\u60A8\u7684\u521B\u4F5C\u5386\u53F2\uFF1Ahttps://jimeng.jianying.com/ai-tool/video/generate";
        }
        if (err.historyId) {
          errorMessage += `

\u5386\u53F2\u8BB0\u5F55ID: ${err.historyId}\uFF08\u60A8\u53EF\u4EE5\u4F7F\u7528\u6B64ID\u5728\u5B98\u7F51\u641C\u7D22\u60A8\u7684\u89C6\u9891\uFF09`;
        }
        stream.write(
          "data: " + JSON.stringify({
            id: util_default.uuid(),
            model: _model,
            object: "chat.completion.chunk",
            choices: [
              {
                index: 1,
                delta: {
                  role: "assistant",
                  content: `

${errorMessage}`
                },
                finish_reason: "stop"
              }
            ]
          }) + "\n\n"
        );
        stream.end("data: [DONE]\n\n");
      });
    } else {
      stream.write(
        "data: " + JSON.stringify({
          id: util_default.uuid(),
          model: _model || model,
          object: "chat.completion.chunk",
          choices: [
            {
              index: 0,
              delta: { role: "assistant", content: "\u{1F3A8} \u56FE\u50CF\u751F\u6210\u4E2D\uFF0C\u8BF7\u7A0D\u5019..." },
              finish_reason: null
            }
          ]
        }) + "\n\n"
      );
      generateImages(
        model,
        messages[messages.length - 1].content,
        { width, height },
        refreshToken
      ).then((imageUrls) => {
        for (let i = 0; i < imageUrls.length; i++) {
          const url = imageUrls[i];
          stream.write(
            "data: " + JSON.stringify({
              id: util_default.uuid(),
              model: _model || model,
              object: "chat.completion.chunk",
              choices: [
                {
                  index: i + 1,
                  delta: {
                    role: "assistant",
                    content: `![image_${i}](${url})
`
                  },
                  finish_reason: i < imageUrls.length - 1 ? null : "stop"
                }
              ]
            }) + "\n\n"
          );
        }
        stream.write(
          "data: " + JSON.stringify({
            id: util_default.uuid(),
            model: _model || model,
            object: "chat.completion.chunk",
            choices: [
              {
                index: imageUrls.length + 1,
                delta: {
                  role: "assistant",
                  content: "\u56FE\u50CF\u751F\u6210\u5B8C\u6210\uFF01"
                },
                finish_reason: "stop"
              }
            ]
          }) + "\n\n"
        );
        stream.end("data: [DONE]\n\n");
      }).catch((err) => {
        stream.write(
          "data: " + JSON.stringify({
            id: util_default.uuid(),
            model: _model || model,
            object: "chat.completion.chunk",
            choices: [
              {
                index: 1,
                delta: {
                  role: "assistant",
                  content: `\u751F\u6210\u56FE\u7247\u5931\u8D25: ${err.message}`
                },
                finish_reason: "stop"
              }
            ]
          }) + "\n\n"
        );
        stream.end("data: [DONE]\n\n");
      });
    }
    return stream;
  })().catch((err) => {
    if (retryCount < MAX_RETRY_COUNT) {
      logger_default.error(`Response error: ${err.stack}`);
      logger_default.warn(`Try again after ${RETRY_DELAY / 1e3}s...`);
      return (async () => {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        return createCompletionStream(
          messages,
          refreshToken,
          _model,
          retryCount + 1
        );
      })();
    }
    throw err;
  });
}

// src/api/routes/chat.ts
var chat_default = {
  prefix: "/v1/chat",
  post: {
    "/completions": async (request2) => {
      request2.validate("body.model", (v) => _14.isUndefined(v) || _14.isString(v)).validate("body.messages", _14.isArray).validate("headers.authorization", _14.isString);
      const tokens = tokenSplit(request2.headers.authorization);
      const token = _14.sample(tokens);
      const { model, messages, stream } = request2.body;
      if (stream) {
        const stream2 = await createCompletionStream(messages, token, model);
        return new Response(stream2, {
          type: "text/event-stream"
        });
      } else
        return await createCompletion(messages, token, model);
    }
  }
};

// src/api/routes/ping.ts
var ping_default = {
  prefix: "/ping",
  get: {
    "": async () => "pong"
  }
};

// src/api/routes/token.ts
import _15 from "lodash";
var token_default = {
  prefix: "/token",
  post: {
    "/check": async (request2) => {
      request2.validate("body.token", _15.isString);
      const live = await getTokenLiveStatus(request2.body.token);
      return {
        live
      };
    },
    "/points": async (request2) => {
      request2.validate("headers.authorization", _15.isString);
      const tokens = tokenSplit(request2.headers.authorization);
      const points = await Promise.all(tokens.map(async (token) => {
        return {
          token,
          points: await getCredit(token)
        };
      }));
      return points;
    }
  }
};

// src/api/routes/models.ts
var models_default = {
  prefix: "/v1",
  get: {
    "/models": async () => {
      return {
        "data": [
          {
            "id": "jimeng",
            "object": "model",
            "owned_by": "jimeng-free-api"
          },
          {
            "id": "jimeng-5.0",
            "object": "model",
            "owned_by": "jimeng-free-api",
            "description": "\u5373\u68A6AI\u56FE\u50CF\u751F\u6210\u6A21\u578B 5.0 \u7248\u672C\uFF08\u6700\u65B0\uFF09"
          },
          {
            "id": "jimeng-4.6",
            "object": "model",
            "owned_by": "jimeng-free-api",
            "description": "\u5373\u68A6AI\u56FE\u50CF\u751F\u6210\u6A21\u578B 4.6 \u7248\u672C\uFF08\u6700\u65B0\uFF09"
          },
          {
            "id": "jimeng-4.5",
            "object": "model",
            "owned_by": "jimeng-free-api",
            "description": "\u5373\u68A6AI\u56FE\u50CF\u751F\u6210\u6A21\u578B 4.5 \u7248\u672C"
          },
          {
            "id": "jimeng-4.1",
            "object": "model",
            "owned_by": "jimeng-free-api",
            "description": "\u5373\u68A6AI\u56FE\u50CF\u751F\u6210\u6A21\u578B 4.1 \u7248\u672C"
          },
          {
            "id": "jimeng-4.0",
            "object": "model",
            "owned_by": "jimeng-free-api",
            "description": "\u5373\u68A6AI\u56FE\u50CF\u751F\u6210\u6A21\u578B 4.0 \u7248\u672C"
          },
          {
            "id": "jimeng-3.1",
            "object": "model",
            "owned_by": "jimeng-free-api",
            "description": "\u5373\u68A6AI\u56FE\u50CF\u751F\u6210\u6A21\u578B 3.1 \u7248\u672C"
          },
          {
            "id": "jimeng-3.0",
            "object": "model",
            "owned_by": "jimeng-free-api",
            "description": "\u5373\u68A6AI\u56FE\u50CF\u751F\u6210\u6A21\u578B 3.0 \u7248\u672C"
          },
          {
            "id": "jimeng-2.1",
            "object": "model",
            "owned_by": "jimeng-free-api",
            "description": "\u5373\u68A6AI\u56FE\u50CF\u751F\u6210\u6A21\u578B 2.1 \u7248\u672C"
          },
          {
            "id": "jimeng-2.0-pro",
            "object": "model",
            "owned_by": "jimeng-free-api",
            "description": "\u5373\u68A6AI\u56FE\u50CF\u751F\u6210\u6A21\u578B 2.0 \u4E13\u4E1A\u7248"
          },
          {
            "id": "jimeng-2.0",
            "object": "model",
            "owned_by": "jimeng-free-api",
            "description": "\u5373\u68A6AI\u56FE\u50CF\u751F\u6210\u6A21\u578B 2.0 \u7248\u672C"
          },
          {
            "id": "jimeng-1.4",
            "object": "model",
            "owned_by": "jimeng-free-api",
            "description": "\u5373\u68A6AI\u56FE\u50CF\u751F\u6210\u6A21\u578B 1.4 \u7248\u672C"
          },
          {
            "id": "jimeng-xl-pro",
            "object": "model",
            "owned_by": "jimeng-free-api",
            "description": "\u5373\u68A6AI\u56FE\u50CF\u751F\u6210\u6A21\u578B XL Pro \u7248\u672C"
          },
          {
            "id": "jimeng-video-3.5-pro",
            "object": "model",
            "owned_by": "jimeng-free-api",
            "description": "\u5373\u68A6AI\u89C6\u9891\u751F\u6210\u6A21\u578B 3.5 \u4E13\u4E1A\u7248"
          },
          {
            "id": "jimeng-video-3.0",
            "object": "model",
            "owned_by": "jimeng-free-api",
            "description": "\u5373\u68A6AI\u89C6\u9891\u751F\u6210\u6A21\u578B 3.0 \u7248\u672C"
          },
          {
            "id": "jimeng-video-3.0-pro",
            "object": "model",
            "owned_by": "jimeng-free-api",
            "description": "\u5373\u68A6AI\u89C6\u9891\u751F\u6210\u6A21\u578B 3.0 \u4E13\u4E1A\u7248"
          },
          {
            "id": "jimeng-video-2.0",
            "object": "model",
            "owned_by": "jimeng-free-api",
            "description": "\u5373\u68A6AI\u89C6\u9891\u751F\u6210\u6A21\u578B 2.0 \u7248\u672C"
          },
          {
            "id": "jimeng-video-2.0-pro",
            "object": "model",
            "owned_by": "jimeng-free-api",
            "description": "\u5373\u68A6AI\u89C6\u9891\u751F\u6210\u6A21\u578B 2.0 \u4E13\u4E1A\u7248"
          },
          {
            "id": "jimeng-video-seedance-2.0",
            "object": "model",
            "owned_by": "jimeng-free-api",
            "description": "Seedance 2.0 \u591A\u56FE\u667A\u80FD\u89C6\u9891\u751F\u6210\u6A21\u578B\uFF08\u4E0A\u6E38\u6807\u51C6\u540D\u79F0\uFF0C\u652F\u63014-15\u79D2\uFF0C\u591A\u5F20\u56FE\u7247\u6DF7\u5408\u751F\u6210\u89C6\u9891\uFF09"
          },
          {
            "id": "seedance-2.0",
            "object": "model",
            "owned_by": "jimeng-free-api",
            "description": "Seedance 2.0 \u591A\u56FE\u667A\u80FD\u89C6\u9891\u751F\u6210\u6A21\u578B\uFF08jimeng-video-seedance-2.0 \u7684\u522B\u540D\uFF0C\u5411\u540E\u517C\u5BB9\uFF09"
          },
          {
            "id": "seedance-2.0-pro",
            "object": "model",
            "owned_by": "jimeng-free-api",
            "description": "Seedance 2.0 Pro \u591A\u56FE\u667A\u80FD\u89C6\u9891\u751F\u6210\u6A21\u578B\uFF08jimeng-video-seedance-2.0 \u7684\u522B\u540D\uFF0C\u5411\u540E\u517C\u5BB9\uFF09"
          },
          {
            "id": "jimeng-video-seedance-2.0-fast",
            "object": "model",
            "owned_by": "jimeng-free-api",
            "description": "Seedance 2.0-fast \u5FEB\u901F\u591A\u56FE\u667A\u80FD\u89C6\u9891\u751F\u6210\u6A21\u578B\uFF08\u4E0A\u6E38\u6807\u51C6\u540D\u79F0\uFF0C\u652F\u63014-15\u79D2\uFF09"
          },
          {
            "id": "seedance-2.0-fast",
            "object": "model",
            "owned_by": "jimeng-free-api",
            "description": "Seedance 2.0-fast \u5FEB\u901F\u591A\u56FE\u667A\u80FD\u89C6\u9891\u751F\u6210\u6A21\u578B\uFF08jimeng-video-seedance-2.0-fast \u7684\u522B\u540D\uFF0C\u5411\u540E\u517C\u5BB9\uFF09"
          }
        ]
      };
    }
  }
};

// src/api/routes/videos.ts
import _16 from "lodash";
var videos_default = {
  prefix: "/v1/videos",
  post: {
    "/generations": async (request2) => {
      const unsupportedParams = ["size", "width", "height"];
      const bodyKeys = Object.keys(request2.body);
      const foundUnsupported = unsupportedParams.filter((param) => bodyKeys.includes(param));
      if (foundUnsupported.length > 0) {
        throw new Error(`\u4E0D\u652F\u6301\u7684\u53C2\u6570: ${foundUnsupported.join(", ")}\u3002\u8BF7\u4F7F\u7528 ratio \u548C resolution \u53C2\u6570\u63A7\u5236\u89C6\u9891\u5C3A\u5BF8\u3002`);
      }
      const contentType = request2.headers["content-type"] || "";
      const isMultiPart = contentType.startsWith("multipart/form-data");
      request2.validate("body.model", (v) => _16.isUndefined(v) || _16.isString(v)).validate("body.prompt", (v) => _16.isUndefined(v) || _16.isString(v)).validate("body.ratio", (v) => _16.isUndefined(v) || _16.isString(v)).validate("body.resolution", (v) => _16.isUndefined(v) || _16.isString(v)).validate("body.duration", (v) => {
        if (_16.isUndefined(v)) return true;
        if (isMultiPart && typeof v === "string") {
          const num = parseInt(v);
          return num >= 4 && num <= 15 || num === 5 || num === 10;
        }
        return _16.isFinite(v) && (v >= 4 && v <= 15 || v === 5 || v === 10);
      }).validate("body.file_paths", (v) => _16.isUndefined(v) || _16.isArray(v)).validate("body.filePaths", (v) => _16.isUndefined(v) || _16.isArray(v)).validate("body.response_format", (v) => _16.isUndefined(v) || _16.isString(v)).validate("headers.authorization", _16.isString);
      const tokens = tokenSplit(request2.headers.authorization);
      const token = _16.sample(tokens);
      const {
        model = DEFAULT_MODEL2,
        prompt,
        ratio = "1:1",
        resolution = "720p",
        duration = 5,
        file_paths = [],
        filePaths = [],
        response_format = "url"
      } = request2.body;
      const finalDuration = isMultiPart && typeof duration === "string" ? parseInt(duration) : duration;
      const finalFilePaths = filePaths.length > 0 ? filePaths : file_paths;
      const job = createJob();
      logger_default.info(`Job ${job.id}: created for model=${model}`);
      (async () => {
        try {
          updateJob(job.id, { status: "processing" });
          await saveJobToDb(job.id, "pending", job.created);
          await updateJobInDb(job.id, {
            status: "processing",
            model,
            prompt: prompt || "",
            response_format
          });
          let videoUrl;
          if (isSeedanceModel(model)) {
            const seedanceDuration = finalDuration === 5 ? 4 : finalDuration;
            const seedanceRatio = ratio === "1:1" ? "4:3" : ratio;
            videoUrl = await generateSeedanceVideo(
              model,
              prompt,
              {
                ratio: seedanceRatio,
                resolution,
                duration: seedanceDuration,
                filePaths: finalFilePaths,
                files: request2.files
              },
              token,
              job.id
            );
          } else {
            videoUrl = await generateVideo(
              model,
              prompt,
              {
                ratio,
                resolution,
                duration: finalDuration,
                filePaths: finalFilePaths,
                files: request2.files
              },
              token,
              job.id
            );
          }
          if (videoUrl === null) {
            logger_default.info(`Job ${job.id}: handed off to background poller`);
            return;
          }
          if (response_format === "b64_json") {
            const videoBase64 = await util_default.fetchFileBASE64(videoUrl);
            updateJob(job.id, {
              status: "completed",
              result: { b64_json: videoBase64, revised_prompt: prompt }
            });
          } else {
            updateJob(job.id, {
              status: "completed",
              result: { url: videoUrl, revised_prompt: prompt }
            });
          }
          logger_default.info(`Job ${job.id}: completed`);
        } catch (err) {
          const message = (err == null ? void 0 : err.message) || String(err);
          updateJob(job.id, { status: "failed", error: message });
          logger_default.error(`Job ${job.id}: failed - ${message}`);
        }
      })();
      return new Response({
        id: job.id,
        status: job.status,
        created: job.created
      }, { statusCode: 202 });
    }
  }
};

// src/api/routes/video.ts
var video_default = {
  ...videos_default,
  prefix: "/v1/video"
};

// src/api/routes/video-jobs.ts
var video_jobs_default = {
  prefix: "/v1/videos",
  get: {
    "/jobs/:jobId": async (request2) => {
      var _a, _b, _c;
      const jobId = request2.params["jobId"];
      const job = await getJob(jobId);
      if (!job) {
        return new Response({ error: { message: `Job ${jobId} not found`, code: "job_not_found" } }, { statusCode: 404 });
      }
      if (job.status === "completed") {
        return {
          id: job.id,
          status: job.status,
          created: job.created,
          data: [{
            url: (_a = job.result) == null ? void 0 : _a.url,
            b64_json: (_b = job.result) == null ? void 0 : _b.b64_json,
            revised_prompt: (_c = job.result) == null ? void 0 : _c.revised_prompt
          }]
        };
      }
      if (job.status === "failed") {
        return new Response({
          id: job.id,
          status: job.status,
          created: job.created,
          error: { message: job.error }
        }, { statusCode: 422 });
      }
      return {
        id: job.id,
        status: job.status,
        created: job.created,
        queue_position: job.queuePosition
      };
    }
  }
};

// src/api/routes/index.ts
var routes_default = [
  {
    get: {
      "/": async () => {
        const content = await fs9.readFile("public/welcome.html");
        return new Response(content, {
          type: "html",
          headers: {
            Expires: "-1"
          }
        });
      }
    }
  },
  images_default,
  chat_default,
  ping_default,
  token_default,
  models_default,
  videos_default,
  video_default,
  video_jobs_default
];

// src/lib/job-poller.ts
var POLL_INTERVAL_MS = 3e4;
var STUCK_JOB_TIMEOUT_SECONDS = 600;
async function reapStuckJobs() {
  const stuckJobs = await getStuckJobsWithoutHistoryId(STUCK_JOB_TIMEOUT_SECONDS);
  if (stuckJobs.length === 0) return;
  logger_default.warn(`JobPoller: found ${stuckJobs.length} stuck job(s) with no historyId, marking as failed`);
  await Promise.all(stuckJobs.map(async (dbJob) => {
    const errorMsg = "Video generation request failed to reach Jimeng (timed out or service unavailable)";
    await updateJobInDb(dbJob.id, { status: "failed", error_message: errorMsg });
    updateJob(dbJob.id, { status: "failed", error: errorMsg });
    logger_default.warn(`JobPoller: reaped stuck job ${dbJob.id} (created ${Math.floor(Date.now() / 1e3) - dbJob.created_at}s ago)`);
  }));
}
async function pollOnce() {
  await reapStuckJobs();
  const jobs2 = await getProcessingJobsWithHistoryId();
  if (jobs2.length === 0) return;
  logger_default.info(`JobPoller: checking ${jobs2.length} active job(s)`);
  await Promise.all(jobs2.map(async (dbJob) => {
    try {
      const result = await checkVideoJobStatus(dbJob.jimeng_history_id, dbJob.refresh_token);
      if (result.status === "completed" && result.url) {
        const prompt = dbJob.prompt || void 0;
        const responseFormat = dbJob.response_format || "url";
        if (responseFormat === "b64_json") {
          try {
            const b64 = await util_default.fetchFileBASE64(result.url);
            await updateJobInDb(dbJob.id, {
              status: "completed",
              result_b64_json: b64,
              result_revised_prompt: prompt
            });
            updateJob(dbJob.id, {
              status: "completed",
              result: { b64_json: b64, revised_prompt: prompt }
            });
          } catch (b64Err) {
            logger_default.warn(`JobPoller: b64 conversion failed for job ${dbJob.id}, falling back to url: ${b64Err.message}`);
            await updateJobInDb(dbJob.id, {
              status: "completed",
              result_url: result.url,
              result_revised_prompt: prompt
            });
            updateJob(dbJob.id, {
              status: "completed",
              result: { url: result.url, revised_prompt: prompt }
            });
          }
        } else {
          await updateJobInDb(dbJob.id, {
            status: "completed",
            result_url: result.url,
            result_revised_prompt: prompt
          });
          updateJob(dbJob.id, {
            status: "completed",
            result: { url: result.url, revised_prompt: prompt }
          });
        }
        logger_default.info(`JobPoller: job ${dbJob.id} completed, url: ${result.url}`);
      } else if (result.status === "failed") {
        const errorMsg = result.error || "Video generation failed";
        await updateJobInDb(dbJob.id, { status: "failed", error_message: errorMsg });
        updateJob(dbJob.id, { status: "failed", error: errorMsg });
        logger_default.error(`JobPoller: job ${dbJob.id} failed - ${errorMsg}`);
      } else {
        await updateJobInDb(dbJob.id, { last_poll_at: Math.floor(Date.now() / 1e3) });
        logger_default.info(`JobPoller: job ${dbJob.id} still processing (historyId: ${dbJob.jimeng_history_id})`);
      }
    } catch (err) {
      logger_default.error(`JobPoller: error checking job ${dbJob.id}: ${err.message}`);
    }
  }));
}
function startJobPoller() {
  logger_default.info(`JobPoller: started (interval=${POLL_INTERVAL_MS / 1e3}s)`);
  setInterval(async () => {
    try {
      await pollOnce();
    } catch (err) {
      logger_default.error(`JobPoller: unhandled error in poll cycle: ${err.message}`);
    }
  }, POLL_INTERVAL_MS);
}

// src/index.ts
var startupTime = performance.now();
(async () => {
  logger_default.header();
  logger_default.info("<<<< jimeng free server >>>>");
  logger_default.info("Version:", environment_default.package.version);
  logger_default.info("Process id:", process.pid);
  logger_default.info("Environment:", environment_default.env);
  logger_default.info("Service name:", config_default.service.name);
  server_default.attachRoutes(routes_default);
  await server_default.listen();
  startJobPoller();
  config_default.service.bindAddress && logger_default.success("Service bind address:", config_default.service.bindAddress);
})().then(
  () => logger_default.success(
    `Service startup completed (${Math.floor(performance.now() - startupTime)}ms)`
  )
).catch((err) => console.error(err));
//# sourceMappingURL=index.js.map