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

// src/lib/x-bogus.ts
import { createHash } from "crypto";
var SHIFT_ARRAY = "Dkdpgh4ZKsQB80/Mfvw36XI1R25-WUAlEi7NLboqYTOPuzmFjJnryx9HVGcaStCe";
var MAGIC = 536919696;
function md5Hex(input) {
  return createHash("md5").update(input).digest("hex");
}
function md5Double(input) {
  const first = createHash("md5").update(input).digest();
  return createHash("md5").update(first).digest("hex");
}
function rc4Encrypt(plaintext, key) {
  const sBox = Array.from({ length: 256 }, (_17, i) => i);
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = j + sBox[i] + key[i % key.length] & 255;
    [sBox[i], sBox[j]] = [sBox[j], sBox[i]];
  }
  let i2 = 0;
  let j2 = 0;
  let result = "";
  for (let k = 0; k < plaintext.length; k++) {
    i2 = i2 + 1 & 255;
    j2 = j2 + sBox[i2] & 255;
    [sBox[i2], sBox[j2]] = [sBox[j2], sBox[i2]];
    const keystream = sBox[sBox[i2] + sBox[j2] & 255];
    result += String.fromCharCode(plaintext.charCodeAt(k) ^ keystream);
  }
  return result;
}
function b64Encode(input, alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=") {
  const result = [];
  for (let i = 0; i < input.length; i += 3) {
    const num1 = input.charCodeAt(i);
    const num2 = i + 1 < input.length ? input.charCodeAt(i + 1) : -1;
    const num3 = i + 2 < input.length ? input.charCodeAt(i + 2) : -1;
    const arr1 = num1 >> 2;
    const arr2 = num2 >= 0 ? (3 & num1) << 4 | num2 >> 4 : (3 & num1) << 4;
    const arr3 = num2 >= 0 ? (15 & num2) << 2 | num3 >> 6 : 64;
    const arr4 = num3 >= 0 ? 63 & num3 : 64;
    result.push(alphabet[arr1], alphabet[arr2], alphabet[arr3], alphabet[arr4]);
  }
  return result.join("");
}
function filterList(numList) {
  const indices = [3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 4, 6, 8, 10, 12, 14, 16, 18, 20];
  return indices.map((x) => numList[x - 1]);
}
function scramble(chars) {
  const [a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s] = chars;
  return String.fromCharCode(
    a,
    k,
    b,
    l,
    c,
    m,
    d,
    n,
    e,
    o,
    f,
    p,
    g,
    q,
    h,
    r,
    i,
    s,
    j
  );
}
function computeChecksum(saltList) {
  let cs = 64;
  for (let i = 3; i < saltList.length; i++) {
    cs ^= saltList[i];
  }
  return cs;
}
function xBogus(params, userAgent, timestamp, data = "") {
  const md5Data = md5Double(data);
  const md5Params = md5Double(params);
  const rc4Ua = rc4Encrypt(userAgent, [0, 1, 14]);
  const b64Ua = b64Encode(rc4Ua);
  const md5Ua = md5Hex(b64Ua);
  const md5ParamsBytes = Buffer.from(md5Params, "hex");
  const md5DataBytes = Buffer.from(md5Data, "hex");
  const md5UaBytes = Buffer.from(md5Ua, "hex");
  const saltList = [
    timestamp,
    MAGIC,
    64,
    0,
    1,
    14,
    md5ParamsBytes[md5ParamsBytes.length - 2],
    md5ParamsBytes[md5ParamsBytes.length - 1],
    md5DataBytes[md5DataBytes.length - 2],
    md5DataBytes[md5DataBytes.length - 1],
    md5UaBytes[md5UaBytes.length - 2],
    md5UaBytes[md5UaBytes.length - 1]
  ];
  saltList.push(timestamp >> 24 & 255);
  saltList.push(timestamp >> 16 & 255);
  saltList.push(timestamp >> 8 & 255);
  saltList.push(timestamp & 255);
  saltList.push(saltList[1] >> 24 & 255);
  saltList.push(saltList[1] >> 16 & 255);
  saltList.push(saltList[1] >> 8 & 255);
  saltList.push(saltList[1] & 255);
  saltList.push(computeChecksum(saltList));
  saltList.push(255);
  const numList = filterList(saltList);
  const rc4Result = rc4Encrypt(scramble(numList), [255]);
  const prefixed = "\xFF" + rc4Result;
  return b64Encode(prefixed, SHIFT_ARRAY);
}
function signXBogus(params, userAgent, data = "") {
  const timestamp = Math.floor(Date.now() / 1e3);
  const bogus = xBogus(params, userAgent, timestamp, data);
  return params + "&X-Bogus=" + bogus;
}

// src/lib/x-gnarly.ts
import { createHash as createHash2 } from "crypto";
var CUSTOM_ALPHABET = "u09tbS3UvgDEe6r-ZVMXzLpsAohTn7mdINQlW412GqBjfYiyk8JORCF5/xKHwacP=";
var MASK_32 = 4294967295;
var CRYPTO_CONSTANTS = [
  4294967295,
  138,
  1498001188,
  211147047,
  253,
  null,
  203,
  288,
  9,
  1196819126,
  3212677781,
  135,
  263,
  193,
  58,
  18,
  244,
  2931180889,
  240,
  173,
  268,
  2157053261,
  261,
  175,
  14,
  5,
  171,
  270,
  156,
  258,
  13,
  15,
  3732962506,
  185,
  169,
  2,
  6,
  132,
  162,
  200,
  3,
  160,
  217618912,
  62,
  2517678443,
  44,
  164,
  4,
  96,
  183,
  2903579748,
  3863347763,
  119,
  181,
  10,
  190,
  8,
  2654435769,
  259,
  104,
  230,
  128,
  2633865432,
  225,
  1,
  257,
  143,
  179,
  16,
  600974999,
  185100057,
  32,
  188,
  53,
  2718276124,
  177,
  196,
  4294967296,
  147,
  117,
  17,
  49,
  7,
  28,
  12,
  266,
  216,
  11,
  0,
  45,
  166,
  247,
  1451689750
];
var CHACHA_INITIAL_STATE = [
  CRYPTO_CONSTANTS[9],
  // 1196819126
  CRYPTO_CONSTANTS[69],
  // 600974999
  CRYPTO_CONSTANTS[51],
  // 2903579748
  CRYPTO_CONSTANTS[92]
  // 1451689750
];
function ensure32(value) {
  return value & MASK_32;
}
function rotateLeft(value, shift) {
  return ensure32(value << shift | value >>> 32 - shift);
}
function chachaQuarterRound(state, a, b, c, d) {
  state[a] = ensure32(state[a] + state[b]);
  state[d] = rotateLeft(state[d] ^ state[a], 16);
  state[c] = ensure32(state[c] + state[d]);
  state[b] = rotateLeft(state[b] ^ state[c], 12);
  state[a] = ensure32(state[a] + state[b]);
  state[d] = rotateLeft(state[d] ^ state[a], 8);
  state[c] = ensure32(state[c] + state[d]);
  state[b] = rotateLeft(state[b] ^ state[c], 7);
}
function chachaBlockFunction(initialState, numRounds) {
  const working = [...initialState];
  let roundCount = 0;
  while (roundCount < numRounds) {
    chachaQuarterRound(working, 0, 4, 8, 12);
    chachaQuarterRound(working, 1, 5, 9, 13);
    chachaQuarterRound(working, 2, 6, 10, 14);
    chachaQuarterRound(working, 3, 7, 11, 15);
    roundCount++;
    if (roundCount >= numRounds) break;
    chachaQuarterRound(working, 0, 5, 10, 15);
    chachaQuarterRound(working, 1, 6, 11, 12);
    chachaQuarterRound(working, 2, 7, 12, 13);
    chachaQuarterRound(working, 3, 4, 13, 14);
    roundCount++;
  }
  for (let i = 0; i < 16; i++) {
    working[i] = ensure32(working[i] + initialState[i]);
  }
  return working;
}
var prngState = initializePrngState();
var stateIndex = CRYPTO_CONSTANTS[88];
function initializePrngState() {
  const tsMs = Date.now();
  return [
    CRYPTO_CONSTANTS[44],
    CRYPTO_CONSTANTS[74],
    CRYPTO_CONSTANTS[10],
    CRYPTO_CONSTANTS[62],
    CRYPTO_CONSTANTS[42],
    CRYPTO_CONSTANTS[17],
    CRYPTO_CONSTANTS[2],
    CRYPTO_CONSTANTS[21],
    CRYPTO_CONSTANTS[3],
    CRYPTO_CONSTANTS[70],
    CRYPTO_CONSTANTS[50],
    CRYPTO_CONSTANTS[32],
    CRYPTO_CONSTANTS[0] & tsMs,
    Math.floor(Math.random() * (CRYPTO_CONSTANTS[77] - 1)),
    Math.floor(Math.random() * (CRYPTO_CONSTANTS[77] - 1)),
    Math.floor(Math.random() * (CRYPTO_CONSTANTS[77] - 1))
  ];
}
function generateRandomFloat() {
  const blockOutput = chachaBlockFunction(prngState, 8);
  const randomValue = blockOutput[stateIndex];
  const highBits = (blockOutput[stateIndex + 8] & 4294967280) >>> 11;
  if (stateIndex === 7) {
    prngState[12] = ensure32(prngState[12] + 1);
    stateIndex = 0;
  } else {
    stateIndex++;
  }
  return (randomValue + 4294967296 * highBits) / 2 ** 53;
}
function convertNumberToBytes(value) {
  if (value < 255 * 255) {
    return [value >> 8 & 255, value & 255];
  }
  return [
    value >> 24 & 255,
    value >> 16 & 255,
    value >> 8 & 255,
    value & 255
  ];
}
function stringToBigEndianInt(input) {
  const buf = Buffer.from(input.substring(0, 4), "utf-8");
  let acc = 0;
  for (const byte of buf) {
    acc = (acc << 8 | byte) >>> 0;
  }
  return acc;
}
function chachaEncryptData(keyWords, rounds, data) {
  const fullWordsCount = Math.floor(data.length / 4);
  const remainingBytes = data.length % 4;
  const totalWords = Math.ceil(data.length / 4);
  const wordArray = new Int32Array(totalWords);
  for (let i = 0; i < fullWordsCount; i++) {
    const bi = 4 * i;
    wordArray[i] = (data[bi] | data[bi + 1] << 8 | data[bi + 2] << 16 | data[bi + 3] << 24) >>> 0;
  }
  if (remainingBytes) {
    let partial = 0;
    const base = 4 * fullWordsCount;
    for (let b = 0; b < remainingBytes; b++) {
      partial |= data[base + b] << 8 * b;
    }
    wordArray[fullWordsCount] = partial;
  }
  const fullState = [...CHACHA_INITIAL_STATE, ...keyWords];
  let wordOffset = 0;
  while (wordOffset + 16 < wordArray.length) {
    const keystream2 = chachaBlockFunction(fullState, rounds);
    fullState[12] = ensure32(fullState[12] + 1);
    for (let k = 0; k < 16; k++) {
      wordArray[wordOffset + k] = (wordArray[wordOffset + k] ^ keystream2[k]) >>> 0;
    }
    wordOffset += 16;
  }
  const remaining = wordArray.length - wordOffset;
  const keystream = chachaBlockFunction(fullState, rounds);
  for (let k = 0; k < remaining; k++) {
    wordArray[wordOffset + k] = (wordArray[wordOffset + k] ^ keystream[k]) >>> 0;
  }
  for (let i = 0; i < fullWordsCount; i++) {
    const w = wordArray[i] >>> 0;
    const bi = 4 * i;
    data[bi] = w & 255;
    data[bi + 1] = w >>> 8 & 255;
    data[bi + 2] = w >>> 16 & 255;
    data[bi + 3] = w >>> 24 & 255;
  }
  if (remainingBytes) {
    const w = wordArray[fullWordsCount] >>> 0;
    const base = 4 * fullWordsCount;
    for (let b = 0; b < remainingBytes; b++) {
      data[base + b] = w >>> 8 * b & 255;
    }
  }
}
function customBase64Encode(input) {
  const result = [];
  const fullBlockLength = Math.floor(input.length / 3) * 3;
  for (let i = 0; i < fullBlockLength; i += 3) {
    const block = input.charCodeAt(i) << 16 | input.charCodeAt(i + 1) << 8 | input.charCodeAt(i + 2);
    result.push(
      CUSTOM_ALPHABET[block >>> 18 & 63],
      CUSTOM_ALPHABET[block >>> 12 & 63],
      CUSTOM_ALPHABET[block >>> 6 & 63],
      CUSTOM_ALPHABET[block & 63]
    );
  }
  return result.join("");
}
function getXGnarly(queryString, requestBody, userAgent) {
  prngState = initializePrngState();
  stateIndex = 0;
  const timestampMs = Date.now();
  const md5Query = createHash2("md5").update(queryString).digest("hex");
  const md5Body = createHash2("md5").update(requestBody).digest("hex");
  const md5Ua = createHash2("md5").update(userAgent).digest("hex");
  const dataObj = {};
  const keyOrder = [];
  function add(key, value) {
    dataObj[key] = value;
    if (!keyOrder.includes(key)) keyOrder.push(key);
  }
  add(1, 1);
  add(2, 14);
  add(3, md5Query);
  add(4, md5Body);
  add(5, md5Ua);
  add(6, Math.floor(timestampMs / 1e3));
  add(7, 1938040196);
  add(8, timestampMs % 2147483648);
  add(9, "5.1.2");
  add(10, "1.0.0.316");
  add(11, 1);
  let checksum = 0;
  for (let i = 1; i <= 11; i++) {
    const val = dataObj[i];
    const xorVal = typeof val === "number" ? val : stringToBigEndianInt(val);
    checksum ^= xorVal;
  }
  add(12, ensure32(checksum));
  let finalChecksum = 0;
  for (const key of keyOrder) {
    const val = dataObj[key];
    if (typeof val === "number") {
      finalChecksum ^= val;
    }
  }
  add(0, ensure32(finalChecksum));
  const payloadBytes = [];
  payloadBytes.push(keyOrder.length);
  for (const key of keyOrder) {
    payloadBytes.push(key);
    const val = dataObj[key];
    const valBytes = typeof val === "number" ? convertNumberToBytes(val) : Array.from(Buffer.from(val, "utf-8"));
    payloadBytes.push(...convertNumberToBytes(valBytes.length));
    payloadBytes.push(...valBytes);
  }
  const baseString = String.fromCharCode(...payloadBytes);
  const encryptionKeyWords = [];
  const keyBytesArray = [];
  let roundAccumulator = 0;
  for (let i = 0; i < 12; i++) {
    const rv = generateRandomFloat();
    const wordValue = Math.floor(rv * 4294967296) >>> 0;
    encryptionKeyWords.push(wordValue);
    roundAccumulator = roundAccumulator + (wordValue & 15) & 15;
    keyBytesArray.push(
      wordValue & 255,
      wordValue >>> 8 & 255,
      wordValue >>> 16 & 255,
      wordValue >>> 24 & 255
    );
  }
  const encryptionRounds = roundAccumulator + 5;
  const dataBuffer = Buffer.from(Array.from(baseString).map((c) => c.charCodeAt(0)));
  const fullState = [...CHACHA_INITIAL_STATE, ...encryptionKeyWords];
  chachaEncryptData(encryptionKeyWords, encryptionRounds, dataBuffer);
  const encryptedData = String.fromCharCode(...dataBuffer);
  let insertionPosition = 0;
  for (const b of keyBytesArray) {
    insertionPosition = (insertionPosition + b) % (encryptedData.length + 1);
  }
  for (let i = 0; i < encryptedData.length; i++) {
    insertionPosition = (insertionPosition + encryptedData.charCodeAt(i)) % (encryptedData.length + 1);
  }
  const keyString = String.fromCharCode(...keyBytesArray);
  const controlByte = String.fromCharCode((1 << 6 ^ 1 << 3 ^ 3) & 255);
  const finalString = controlByte + encryptedData.substring(0, insertionPosition) + keyString + encryptedData.substring(insertionPosition);
  return customBase64Encode(finalString);
}

// src/api/controllers/core.ts
var DEFAULT_ASSISTANT_ID = 513695;
var DEFAULT_ASSISTANT_ID_INTERNATIONAL = 513641;
var VERSION_CODE = "8.4.0";
var PLATFORM_CODE = "7";
var DEVICE_ID = Math.random() * 1e18 + 7e18;
var WEB_ID = Math.random() * 1e18 + 7e18;
var USER_ID = util_default.uuid(false);
var BASE_URL_CN = "https://jimeng.jianying.com";
var BASE_URL_US_COMMERCE = "https://commerce.us.capcut.com";
var BASE_URL_HK_COMMERCE = "https://commerce-api-sg.capcut.com";
var BASE_URL_DREAMINA_US = "https://dreamina-api.us.capcut.com";
var BASE_URL_DREAMINA_HK = "https://mweb-api-sg.capcut.com";
var DA_VERSION = "3.3.9";
var WEB_VERSION = "7.5.0";
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
var INTERNATIONAL_REGION_MAP = {
  hk: { region: "HK", lan: "en", loc: "hk" },
  jp: { region: "JP", lan: "ja", loc: "jp" },
  sg: { region: "SG", lan: "en", loc: "sg" },
  al: { region: "AL", lan: "en", loc: "al" },
  az: { region: "AZ", lan: "en", loc: "az" },
  bh: { region: "BH", lan: "en", loc: "bh" },
  ca: { region: "CA", lan: "en", loc: "ca" },
  cl: { region: "CL", lan: "en", loc: "cl" },
  de: { region: "DE", lan: "en", loc: "de" },
  gb: { region: "GB", lan: "en", loc: "gb" },
  gy: { region: "GY", lan: "en", loc: "gy" },
  il: { region: "IL", lan: "en", loc: "il" },
  iq: { region: "IQ", lan: "en", loc: "iq" },
  it: { region: "IT", lan: "en", loc: "it" },
  jo: { region: "JO", lan: "en", loc: "jo" },
  kg: { region: "KG", lan: "en", loc: "kg" },
  om: { region: "OM", lan: "en", loc: "om" },
  pk: { region: "PK", lan: "en", loc: "pk" },
  pt: { region: "PT", lan: "en", loc: "pt" },
  sa: { region: "SA", lan: "en", loc: "sa" },
  se: { region: "SE", lan: "en", loc: "se" },
  tr: { region: "TR", lan: "en", loc: "tr" },
  tz: { region: "TZ", lan: "en", loc: "tz" },
  uz: { region: "UZ", lan: "en", loc: "uz" },
  ve: { region: "VE", lan: "en", loc: "ve" },
  xk: { region: "XK", lan: "en", loc: "xk" }
};
function parseRegionFromToken(refreshToken) {
  const token = refreshToken.toLowerCase();
  const isUS = token.startsWith("us-");
  const prefixMatch = token.match(/^([a-z]{2})-/);
  let regionCode = "CN";
  let isInternational = false;
  if (prefixMatch && INTERNATIONAL_REGION_MAP[prefixMatch[1]]) {
    regionCode = INTERNATIONAL_REGION_MAP[prefixMatch[1]].region;
    isInternational = true;
  }
  if (isUS) {
    regionCode = "US";
    isInternational = true;
  }
  return {
    isUS,
    regionCode,
    isInternational,
    isCN: !isInternational
  };
}
function getAssistantId(regionInfo) {
  if (regionInfo.isInternational) return DEFAULT_ASSISTANT_ID_INTERNATIONAL;
  return DEFAULT_ASSISTANT_ID;
}
function generateCookie(refreshToken) {
  const regionInfo = parseRegionFromToken(refreshToken);
  const token = regionInfo.isInternational ? refreshToken.substring(3) : refreshToken;
  return [
    `_tea_web_id=${WEB_ID}`,
    `is_staff_user=false`,
    ...regionInfo.isCN ? [`store-region=cn-gd`, `store-region-src=uid`] : [],
    `sid_guard=${token}%7C${util_default.unixTimestamp()}%7C5184000%7CMon%2C+03-Feb-2025+08%3A17%3A09+GMT`,
    `uid_tt=${USER_ID}`,
    `uid_tt_ss=${USER_ID}`,
    `sid_tt=${token}`,
    `sessionid=${token}`,
    `sessionid_ss=${token}`,
    `sid_tt=${token}`
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
function getCookiesForBrowserInternational(refreshToken) {
  const regionInfo = parseRegionFromToken(refreshToken);
  const token = regionInfo.isInternational ? refreshToken.substring(3) : refreshToken;
  const domain = ".capcut.com";
  return [
    { name: "_tea_web_id", value: String(WEB_ID), domain, path: "/" },
    { name: "is_staff_user", value: "false", domain, path: "/" },
    { name: "uid_tt", value: USER_ID, domain, path: "/" },
    { name: "uid_tt_ss", value: USER_ID, domain, path: "/" },
    { name: "sid_tt", value: token, domain, path: "/" },
    { name: "sessionid", value: token, domain, path: "/" },
    { name: "sessionid_ss", value: token, domain, path: "/" },
    { name: "sid_guard", value: `${token}%7C${util_default.unixTimestamp()}%7C5184000%7CMon%2C+03-Feb-2025+08%3A17%3A09+GMT`, domain, path: "/" }
  ];
}
async function getCredit(refreshToken) {
  const {
    credit: { gift_credit, purchase_credit, vip_credit }
  } = await request("POST", "/commerce/v1/benefits/user_credit", refreshToken, {
    data: {},
    headers: {
      // Cookie: 'x-web-secsdk-uid=ef44bd0d-0cf6-448c-b517-fd1b5a7267ba; s_v_web_id=verify_m4b1lhlu_DI8qKRlD_7mJJ_4eqx_9shQ_s8eS2QLAbc4n; passport_csrf_token=86f3619c0c4a9c13f24117f71dc18524; passport_csrf_token_default=86f3619c0c4a9c13f24117f71dc18524; n_mh=9-mIeuD4wZnlYrrOvfzG3MuT6aQmCUtmr8FxV8Kl8xY; sid_guard=aabbddddddddddddddd%7C1733386629%7C5184000%7CMon%2C+03-Feb-2025+08%3A17%3A09+GMT; uid_tt=59a46c7d3f34bda9588b93590cca2e12; uid_tt_ss=59a46c7d3f34bda9588b93590cca2e12; sid_tt=aabbddddddddddddddd; sessionid=aabbddddddddddddddd; sessionid_ss=aabbddddddddddddddd; is_staff_user=false; sid_ucp_v1=1.0.0-KGRiOGY2ODQyNWU1OTk3NzRhYTE2ZmZhYmFjNjdmYjY3NzRmZGRiZTgKHgjToPCw0cwbEIXDxboGGJ-tHyAMMITDxboGOAhAJhoCaGwiIGE3ZWI3NDVhZWM0NGJiMzE4NmRiYzIwODNlYTllMWE2; ssid_ucp_v1=1.0.0-KGRiOGY2ODQyNWU1OTk3NzRhYTE2ZmZhYmFjNjdmYjY3NzRmZGRiZTgKHgjToPCw0cwbEIXDxboGGJ-tHyAMMITDxboGOAhAJhoCaGwiIGE3ZWI3NDVhZWM0NGJiMzE4NmRiYzIwODNlYTllMWE2; store-region=cn-gd; store-region-src=uid; user_spaces_idc={"7444764277623653426":"lf"}; ttwid=1|cxHJViEev1mfkjntdMziir8SwbU8uPNVSaeh9QpEUs8|1733966961|d8d52f5f56607427691be4ac44253f7870a34d25dd05a01b4d89b8a7c5ea82ad; _tea_web_id=7444838473275573797; fpk1=fa6c6a4d9ba074b90003896f36b6960066521c1faec6a60bdcb69ec8ddf85e8360b4c0704412848ec582b2abca73d57a; odin_tt=efe9dc150207879b88509e651a1c4af4e7ffb4cfcb522425a75bd72fbf894eda570bbf7ffb551c8b1de0aa2bfa0bd1be6c4157411ecdcf4464fcaf8dd6657d66',
      Referer: "https://jimeng.jianying.com/ai-tool/image/generate"
      // "Device-Time": 1733966964,
      // Sign: "f3dbb824b378abea7c03cbb152b3a365"
    }
  });
  logger_default.info(`
\u79EF\u5206\u4FE1\u606F: 
\u8D60\u9001\u79EF\u5206: ${gift_credit}, \u8D2D\u4E70\u79EF\u5206: ${purchase_credit}, VIP\u79EF\u5206: ${vip_credit}`);
  return {
    giftCredit: gift_credit,
    purchaseCredit: purchase_credit,
    vipCredit: vip_credit,
    totalCredit: gift_credit + purchase_credit + vip_credit
  };
}
async function receiveCredit(refreshToken) {
  logger_default.info("\u6B63\u5728\u6536\u53D6\u4ECA\u65E5\u79EF\u5206...");
  const { cur_total_credits, receive_quota } = await request("POST", "/commerce/v1/benefits/credit_receive", refreshToken, {
    data: {
      time_zone: "Asia/Shanghai"
    },
    headers: {
      Referer: "https://jimeng.jianying.com/ai-tool/image/generate"
    }
  });
  logger_default.info(`
\u4ECA\u65E5${receive_quota}\u79EF\u5206\u6536\u53D6\u6210\u529F
\u5269\u4F59\u79EF\u5206: ${cur_total_credits}`);
  return cur_total_credits;
}
async function request(method, uri, refreshToken, options = {}) {
  const regionInfo = parseRegionFromToken(refreshToken);
  const rawToken = regionInfo.isInternational ? refreshToken.substring(3) : refreshToken;
  const token = await acquireToken(rawToken);
  const deviceTime = util_default.unixTimestamp();
  const sign = util_default.md5(
    `9e2c|${uri.slice(-7)}|${PLATFORM_CODE}|${VERSION_CODE}|${deviceTime}||11ac`
  );
  let baseUrl = BASE_URL_CN;
  let region = "cn";
  let lan = "zh-Hans";
  let loc = "cn";
  if (regionInfo.isUS) {
    baseUrl = uri.startsWith("/commerce/") ? BASE_URL_US_COMMERCE : BASE_URL_DREAMINA_US;
    region = "US";
    lan = "en";
    loc = "us";
  } else if (regionInfo.isInternational) {
    const prefix = refreshToken.substring(0, 2).toLowerCase();
    const regionCfg = INTERNATIONAL_REGION_MAP[prefix];
    baseUrl = uri.startsWith("/commerce/") ? BASE_URL_HK_COMMERCE : BASE_URL_DREAMINA_HK;
    region = (regionCfg == null ? void 0 : regionCfg.region) || "HK";
    lan = (regionCfg == null ? void 0 : regionCfg.lan) || "en";
    loc = (regionCfg == null ? void 0 : regionCfg.loc) || "hk";
  }
  const origin = new URL(baseUrl).origin;
  const fullUrl = `${baseUrl}${uri}`;
  const requestParams = {
    aid: getAssistantId(regionInfo),
    device_platform: "web",
    region,
    ...regionInfo.isInternational ? {} : { webId: WEB_ID },
    da_version: DA_VERSION,
    os: "windows",
    web_component_open_flag: 1,
    web_version: WEB_VERSION,
    aigc_features: "app_lip_sync",
    ...options.params || {}
  };
  const headers = {
    ...FAKE_HEADERS,
    Appid: getAssistantId(regionInfo),
    Lan: lan,
    Loc: loc,
    Origin: origin,
    Referer: origin,
    Cookie: generateCookie(refreshToken),
    "Device-Time": deviceTime,
    Sign: sign,
    "Sign-Ver": "1",
    Tdid: "",
    ...options.headers || {}
  };
  let signedParams = { ...requestParams };
  let signedHeaders = { ...headers };
  let signedUrl = fullUrl;
  if (regionInfo.isInternational || regionInfo.isUS) {
    const userAgent = FAKE_HEADERS["User-Agent"];
    const qsParts = Object.entries(requestParams).map(([k, v]) => `${k}=${v}`);
    const queryString = qsParts.join("&");
    const bodyString = options.data ? JSON.stringify(options.data) : "";
    const signedQS = signXBogus(queryString, userAgent, bodyString);
    signedUrl = `${baseUrl}${uri}?${signedQS}`;
    signedParams = {};
    const xGnarly = getXGnarly(queryString, bodyString, userAgent);
    signedHeaders["X-Gnarly"] = xGnarly;
    logger_default.info(`\u5DF2\u6DFB\u52A0 X-Bogus \u548C X-Gnarly \u7B7E\u540D\uFF0CURL: ${signedUrl.substring(0, 200)}`);
  }
  logger_default.info(`\u53D1\u9001\u8BF7\u6C42: ${method.toUpperCase()} ${fullUrl}`);
  logger_default.info(`\u8BF7\u6C42\u53C2\u6570: ${JSON.stringify(signedParams)}`);
  logger_default.info(`\u8BF7\u6C42\u6570\u636E: ${JSON.stringify(options.data || {})}`);
  let retries = 0;
  const maxRetries = 3;
  let lastError = null;
  while (retries <= maxRetries) {
    try {
      if (retries > 0) {
        logger_default.info(`\u7B2C ${retries} \u6B21\u91CD\u8BD5\u8BF7\u6C42: ${method.toUpperCase()} ${fullUrl}`);
        await new Promise((resolve) => setTimeout(resolve, 1e3 * retries));
      }
      const response = await axios2.request({
        method,
        url: signedUrl,
        params: signedParams,
        headers: signedHeaders,
        timeout: 45e3,
        // 增加超时时间到45秒
        validateStatus: () => true,
        // 允许任何状态码
        ..._7.omit(options, "params", "headers")
      });
      logger_default.info(`\u54CD\u5E94\u72B6\u6001: ${response.status} ${response.statusText}`);
      if (options.responseType == "stream") return response;
      const responseDataSummary = JSON.stringify(response.data).substring(0, 500) + (JSON.stringify(response.data).length > 500 ? "..." : "");
      logger_default.info(`\u54CD\u5E94\u6570\u636E\u6458\u8981: ${responseDataSummary}`);
      if (response.status >= 400) {
        logger_default.warn(`HTTP\u9519\u8BEF: ${response.status} ${response.statusText}`);
        if (retries < maxRetries) {
          retries++;
          continue;
        }
      }
      return checkResult(response);
    } catch (error) {
      lastError = error;
      logger_default.error(`\u8BF7\u6C42\u5931\u8D25 (\u5C1D\u8BD5 ${retries + 1}/${maxRetries + 1}): ${error.message}`);
      if ((error.code === "ECONNABORTED" || error.code === "ETIMEDOUT" || error.message.includes("timeout") || error.message.includes("network")) && retries < maxRetries) {
        retries++;
        continue;
      }
      break;
    }
  }
  logger_default.error(`\u8BF7\u6C42\u5931\u8D25\uFF0C\u5DF2\u91CD\u8BD5 ${retries} \u6B21: ${lastError.message}`);
  if (lastError.response) {
    logger_default.error(`\u54CD\u5E94\u72B6\u6001: ${lastError.response.status}`);
    logger_default.error(`\u54CD\u5E94\u6570\u636E: ${JSON.stringify(lastError.response.data)}`);
  }
  throw lastError;
}
function checkResult(result) {
  const { ret, errmsg, data } = result.data;
  if (ret === "" && errmsg === "") return data ?? result.data;
  if (!_7.isFinite(Number(ret))) return result.data;
  if (ret === "0") return data;
  if (ret === "5000")
    throw new APIException(exceptions_default.API_IMAGE_GENERATION_INSUFFICIENT_POINTS, `[\u65E0\u6CD5\u751F\u6210\u56FE\u50CF]: \u5373\u68A6\u79EF\u5206\u53EF\u80FD\u4E0D\u8DB3\uFF0C${errmsg}`);
  throw new APIException(exceptions_default.API_REQUEST_FAILED, `[\u8BF7\u6C42jimeng\u5931\u8D25]: ${errmsg}`);
}
function tokenSplit(authorization) {
  return authorization.replace("Bearer ", "").split(",");
}
async function acquireToken(refreshToken) {
  return parseRegionFromToken(refreshToken).isInternational ? refreshToken.substring(3) : refreshToken;
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
var SCRIPT_WHITELIST_DOMAINS = [
  "vlabstatic.com",
  "bytescm.com",
  "jianying.com",
  "byteimg.com",
  "capcutstatic.com",
  "capcut.com",
  "bytegecko.com",
  "bytedance.com",
  "bytegoofy.com",
  "ttwstatic.com"
];
var BLOCKED_RESOURCE_TYPES = ["image", "font", "stylesheet", "media"];
var SESSION_IDLE_TIMEOUT = 10 * 60 * 1e3;
var BDMS_READY_TIMEOUT = 3e4;
var INTERNATIONAL_API_HOST_MAP = {
  "dreamina.capcut.com": "mweb-api-sg.capcut.com",
  "dreamina.us.capcut.com": "dreamina-api.us.capcut.com"
};
var BrowserService = class {
  browser = null;
  sessions = /* @__PURE__ */ new Map();
  launching = null;
  /**
   * 懒启动浏览器实例
   */
  async ensureBrowser() {
    var _a;
    if ((_a = this.browser) == null ? void 0 : _a.isConnected()) {
      return this.browser;
    }
    if (this.launching) {
      return this.launching;
    }
    this.launching = (async () => {
      logger_default.info("BrowserService: \u6B63\u5728\u542F\u52A8 Chromium \u6D4F\u89C8\u5668...");
      try {
        this.browser = await chromium.launch({
          headless: true,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--no-first-run",
            "--no-zygote",
            "--single-process"
          ]
        });
        this.browser.on("disconnected", () => {
          logger_default.warn("BrowserService: \u6D4F\u89C8\u5668\u5DF2\u65AD\u5F00\u8FDE\u63A5");
          this.browser = null;
          this.sessions.clear();
        });
        logger_default.info("BrowserService: Chromium \u6D4F\u89C8\u5668\u542F\u52A8\u6210\u529F");
        return this.browser;
      } finally {
        this.launching = null;
      }
    })();
    return this.launching;
  }
  /**
   * 获取或创建指定 token 的浏览器会话
   * @param token raw sessionid (不含前缀)
   * @param region "cn" 或 "international"
   */
  async getSession(token, region = "cn") {
    const sessionKey = `${region}:${token}`;
    const existing = this.sessions.get(sessionKey);
    if (existing) {
      existing.lastUsed = Date.now();
      if (existing.idleTimer) {
        clearTimeout(existing.idleTimer);
      }
      existing.idleTimer = setTimeout(() => this.closeSession(sessionKey), SESSION_IDLE_TIMEOUT);
      return existing;
    }
    return this.createSession(token, region);
  }
  /**
   * 国际版 API 请求路由重写
   * 浏览器页面在 dreamina.capcut.com，但 API 在 mweb-api-sg.capcut.com
   * secsdk 要求同源才能正确签名，所以将同源请求代理转发到实际 API
   */
  async setupInternationalApiRoute(page) {
    await page.route("**/mweb/**", async (route) => {
      const request2 = route.request();
      const url = new URL(request2.url());
      const apiHost = INTERNATIONAL_API_HOST_MAP[url.hostname];
      if (!apiHost) {
        return route.continue();
      }
      const targetUrl = `${url.protocol}//${apiHost}${url.pathname}${url.search}`;
      logger_default.info(`BrowserService: API \u8DEF\u7531\u91CD\u5199 ${request2.url().substring(0, 80)} \u2192 ${targetUrl.substring(0, 80)}`);
      logger_default.info(`BrowserService: [DEBUG] \u5B8C\u6574URL: ${request2.url()}`);
      const headers = request2.headers();
      const headerKeys = Object.keys(headers).filter((k) => !["accept", "accept-language", "user-agent", "sec-ch-ua", "sec-ch-ua-mobile", "sec-ch-ua-platform", "sec-fetch-dest", "sec-fetch-mode", "sec-fetch-site", "origin", "referer"].includes(k));
      logger_default.info(`BrowserService: [DEBUG] \u7279\u6B8A\u8BF7\u6C42\u5934: ${JSON.stringify(headerKeys.reduce((acc, k) => ({ ...acc, [k]: headers[k] }), {}))}`);
      logger_default.info(`BrowserService: [DEBUG] \u67E5\u8BE2\u53C2\u6570: ${url.search}`);
      try {
        const response = await route.fetch({ url: targetUrl });
        await route.fulfill({ response });
      } catch (err) {
        logger_default.error(`BrowserService: API \u8DEF\u7531\u91CD\u5199\u5931\u8D25: ${err.message}`);
        await route.abort();
      }
    });
  }
  /**
   * 创建新的浏览器会话
   */
  async createSession(token, region = "cn") {
    const browser = await this.ensureBrowser();
    const sessionKey = `${region}:${token}`;
    logger_default.info(`BrowserService: \u4E3A token ${token.substring(0, 8)}... (${region}) \u521B\u5EFA\u65B0\u4F1A\u8BDD`);
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
      viewport: { width: 1920, height: 1080 },
      locale: region === "international" ? "en-US" : "zh-CN"
    });
    if (region === "international") {
      await context.setExtraHTTPHeaders({
        "x-requested-with": "XMLHttpRequest",
        "loc": "en"
      });
    }
    const cookies = region === "international" ? getCookiesForBrowserInternational(token) : getCookiesForBrowser(token);
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
          logger_default.info(`BrowserService: [SCRIPT] \u5C4F\u853D\u811A\u672C: ${url.substring(0, 150)}`);
          return route.abort();
        }
      }
      return route.continue();
    });
    const page = await context.newPage();
    if (region === "international") {
      await this.setupInternationalApiRoute(page);
    }
    const navUrl = region === "international" ? "https://dreamina.capcut.com/ai-tool/video/generate" : "https://jimeng.jianying.com/ai-tool/video/generate";
    logger_default.info(`BrowserService: \u6B63\u5728\u5BFC\u822A\u5230 ${navUrl} ...`);
    await page.goto(navUrl, {
      waitUntil: "domcontentloaded",
      timeout: 3e4
    });
    const sdkName = region === "international" ? "secsdk" : "bdms";
    logger_default.info(`BrowserService: \u7B49\u5F85 ${sdkName} SDK \u5C31\u7EEA...`);
    try {
      if (region === "international") {
        await page.waitForFunction(
          () => {
            return window.__secsdk || window.__ac_nonce || window.byted_acrawler || // secsdk 会修改 fetch，注入签名 headers
            window.fetch.toString().indexOf("native code") === -1;
          },
          { timeout: BDMS_READY_TIMEOUT }
        );
        logger_default.info(`BrowserService: secsdk \u68C0\u6D4B\u5230\uFF0C\u89E6\u53D1\u9875\u9762\u4EA4\u4E92\u4EE5\u6FC0\u6D3B\u7B7E\u540D...`);
        await page.mouse.move(100, 100);
        await page.mouse.click(100, 100);
        await new Promise((resolve) => setTimeout(resolve, 3e3));
      } else {
        await page.waitForFunction(
          () => {
            var _a;
            return ((_a = window.bdms) == null ? void 0 : _a.init) || window.byted_acrawler || window.fetch.toString().indexOf("native code") === -1;
          },
          { timeout: BDMS_READY_TIMEOUT }
        );
      }
      logger_default.info(`BrowserService: ${sdkName} SDK \u5DF2\u5C31\u7EEA`);
    } catch (err) {
      logger_default.warn(
        `BrowserService: ${sdkName} SDK \u7B49\u5F85\u8D85\u65F6\uFF0C\u53EF\u80FD\u672A\u5B8C\u5168\u52A0\u8F7D\uFF0C\u7EE7\u7EED\u5C1D\u8BD5...`
      );
    }
    const session = {
      context,
      page,
      lastUsed: Date.now(),
      idleTimer: setTimeout(() => this.closeSession(sessionKey), SESSION_IDLE_TIMEOUT),
      region
    };
    this.sessions.set(sessionKey, session);
    return session;
  }
  /**
   * 关闭指定 token 的会话
   */
  async closeSession(token) {
    const session = this.sessions.get(token);
    if (!session) return;
    logger_default.info(`BrowserService: \u5173\u95ED\u7A7A\u95F2\u4F1A\u8BDD ${token.substring(0, 8)}...`);
    if (session.idleTimer) {
      clearTimeout(session.idleTimer);
    }
    try {
      await session.context.close();
    } catch (err) {
    }
    this.sessions.delete(token);
  }
  /**
   * 将国际版 API URL 转为同源的页面 URL（用于 page.evaluate 中的 fetch）
   * 例如 mweb-api-sg.capcut.com/xxx → dreamina.capcut.com/xxx
   */
  rewriteInternationalUrl(url) {
    try {
      const parsed = new URL(url);
      for (const [pageHost, apiHost] of Object.entries(INTERNATIONAL_API_HOST_MAP)) {
        if (parsed.hostname === apiHost) {
          return `${parsed.protocol}//${pageHost}${parsed.pathname}${parsed.search}`;
        }
      }
    } catch {
    }
    return url;
  }
  /**
   * 通过浏览器代理发送 fetch 请求
   * bdms/secsdk SDK 会自动拦截 fetch 并注入 a_bogus 签名
   *
   * @param token sessionid（raw，不含前缀）
   * @param url 完整的请求 URL
   * @param options fetch 选项 (method, headers, body)
   * @param region 区域: "cn" 或 "international"
   * @returns 解析后的 JSON 响应
   */
  async fetch(token, url, options, region = "cn") {
    const sessionToken = region === "international" && /^[a-z]{2}-/i.test(token) ? token.substring(3) : token;
    const session = await this.getSession(sessionToken, region);
    const fetchUrl = region === "international" ? this.rewriteInternationalUrl(url) : url;
    logger_default.info(`BrowserService: \u4EE3\u7406\u8BF7\u6C42 ${options.method || "GET"} ${fetchUrl.substring(0, 100)}...`);
    try {
      const result = await session.page.evaluate(
        async ({ url: url2, options: options2 }) => {
          try {
            const res = await window.fetch(url2, {
              method: options2.method || "GET",
              headers: {
                "Content-Type": "application/json",
                "x-requested-with": "XMLHttpRequest",
                ...options2.headers || {}
              },
              body: options2.body,
              credentials: "include"
            });
            const text = await res.text();
            return { ok: res.ok, status: res.status, text, url: res.url };
          } catch (err) {
            return { ok: false, status: 0, text: "", error: err.message };
          }
        },
        { url: fetchUrl, options }
      );
      if (result.url) {
        logger_default.info(`BrowserService: \u5B9E\u9645\u8BF7\u6C42 URL: ${result.url.substring(0, 200)}`);
      }
      if (result.error) {
        throw new Error(`\u6D4F\u89C8\u5668 fetch \u5931\u8D25: ${result.error}`);
      }
      logger_default.info(`BrowserService: \u54CD\u5E94\u72B6\u6001 ${result.status}`);
      try {
        return JSON.parse(result.text);
      } catch {
        logger_default.warn(`BrowserService: \u54CD\u5E94\u4E0D\u662F\u6709\u6548 JSON: ${result.text.substring(0, 200)}`);
        return result.text;
      }
    } catch (err) {
      logger_default.error(`BrowserService: \u8BF7\u6C42\u6267\u884C\u5931\u8D25: ${err.message}`);
      const sessionKey = `${region}:${sessionToken}`;
      await this.closeSession(sessionKey);
      throw err;
    }
  }
  /**
   * 关闭所有会话和浏览器实例
   */
  async close() {
    logger_default.info("BrowserService: \u6B63\u5728\u5173\u95ED\u6240\u6709\u4F1A\u8BDD\u548C\u6D4F\u89C8\u5668...");
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
    logger_default.info("BrowserService: \u5DF2\u5173\u95ED");
  }
};
var browserService = new BrowserService();
var browser_service_default = browserService;

// src/lib/initialize.ts
import { Pool } from "pg";
async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    logger_default.warn("DATABASE_URL not set, skipping database initialization");
    return;
  }
  const pool2 = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5e3
  });
  try {
    await pool2.query(`
            CREATE TABLE IF NOT EXISTS video_jobs (
                id UUID PRIMARY KEY,
                status VARCHAR(20) NOT NULL DEFAULT 'pending',
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                jimeng_history_id VARCHAR(255),
                refresh_token TEXT,
                model VARCHAR(255),
                prompt TEXT,
                response_format VARCHAR(50),
                error_message TEXT,
                result_url TEXT,
                result_b64_json TEXT,
                result_revised_prompt TEXT,
                last_poll_at INTEGER
            )
        `);
    logger_default.success("DB: video_jobs table initialized");
  } catch (err) {
    logger_default.error(`DB: failed to initialize tables: ${err.message}`);
    throw err;
  } finally {
    await pool2.end();
  }
}
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
  /** 上传的原始文件对象 */
  rawFiles;
  /** 按字段名归类的上传文件 */
  filesMap;
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
    this.rawFiles = rawFiles || {};
    this.filesMap = {};
    if (rawFiles) {
      if (Array.isArray(rawFiles)) {
        this.files = rawFiles;
        if (rawFiles.length > 0) this.filesMap.files = rawFiles;
      } else if (typeof rawFiles === "object") {
        const filesArray = [];
        for (const key in rawFiles) {
          const fileOrFiles = rawFiles[key];
          const normalizedFiles = Array.isArray(fileOrFiles) ? fileOrFiles.filter(Boolean) : fileOrFiles ? [fileOrFiles] : [];
          if (normalizedFiles.length === 0) continue;
          this.filesMap[key] = normalizedFiles;
          filesArray.push(...normalizedFiles);
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
import fs8 from "fs-extra";

// src/api/routes/images.ts
import fs6 from "fs";
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
            images = imageFiles.map((file) => fs6.readFileSync(file.filepath));
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
        images = imageFiles.map((file) => fs6.readFileSync(file.filepath));
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
import fs7 from "fs";
import path6 from "path";
import { ProxyAgent as UndiciProxyAgent } from "undici";
var DEFAULT_ASSISTANT_ID3 = 513695;
var DEFAULT_MODEL2 = "jimeng-video-3.0";
var DEFAULT_DRAFT_VERSION = "3.2.8";
var MODEL_DRAFT_VERSIONS2 = {
  "jimeng-video-3.5-pro": "3.3.4",
  "jimeng-video-3.0-pro": "3.2.8",
  "jimeng-video-3.0": "3.2.8",
  // Seedance 模型（与上游 iptag/jimeng-api 保持一致）
  "jimeng-video-seedance-2.0": "3.3.9",
  "seedance-2.0": "3.3.9",
  "seedance-2.0-pro": "3.3.9",
  // Seedance 2.0-fast 模型（v1.9.3 新增）
  "jimeng-video-seedance-2.0-fast": "3.3.9",
  "seedance-2.0-fast": "3.3.9",
  // Seedance 2.0 Fast VIP Vision 模型（文生视频，model_req_key=dreamina_seedance_40_vision）
  "jimeng-video-seedance-2.0-fast-vip": "3.3.12",
  "seedance-2.0-fast-vip": "3.3.12",
  // Seedance 2.0 VIP Vision 模型（主模态能力，model_req_key=dreamina_seedance_40_pro_vision）
  "jimeng-video-seedance-2.0-vip": "3.3.12",
  "seedance-2.0-vip": "3.3.12"
};
var MODEL_MAP2 = {
  "jimeng-video-3.5-pro": "dreamina_ic_generate_video_model_vgfm_3.5_pro",
  "jimeng-video-3.0-pro": "dreamina_ic_generate_video_model_vgfm_3.0_pro",
  "jimeng-video-3.0": "dreamina_ic_generate_video_model_vgfm_3.0",
  // Seedance 多图智能视频生成模型（jimeng-video-seedance-2.0 为上游标准名称）
  "jimeng-video-seedance-2.0": "dreamina_seedance_40_pro",
  "seedance-2.0": "dreamina_seedance_40_pro",
  "seedance-2.0-pro": "dreamina_seedance_40_pro",
  // Seedance 2.0-fast 快速生成模型（v1.9.3 新增，内部模型为 dreamina_seedance_40）
  "jimeng-video-seedance-2.0-fast": "dreamina_seedance_40",
  "seedance-2.0-fast": "dreamina_seedance_40",
  // Seedance 2.0 Fast VIP Vision 文生视频模型（内部模型为 dreamina_seedance_40_vision）
  "jimeng-video-seedance-2.0-fast-vip": "dreamina_seedance_40_vision",
  "seedance-2.0-fast-vip": "dreamina_seedance_40_vision",
  // Seedance 2.0 VIP Vision 文生视频模型（内部模型为 dreamina_seedance_40_pro_vision）
  "jimeng-video-seedance-2.0-vip": "dreamina_seedance_40_pro_vision",
  "seedance-2.0-vip": "dreamina_seedance_40_pro_vision"
};
var SEEDANCE_BENEFIT_TYPE_MAP = {
  "jimeng-video-seedance-2.0": "dreamina_video_seedance_20_pro",
  "seedance-2.0": "dreamina_video_seedance_20_pro",
  "seedance-2.0-pro": "dreamina_video_seedance_20_pro",
  // Seedance 2.0-fast（v1.9.3 新增，注意：无 "video_" 前缀）
  "jimeng-video-seedance-2.0-fast": "dreamina_seedance_20_fast",
  "seedance-2.0-fast": "dreamina_seedance_20_fast",
  // Seedance 2.0 Fast VIP Vision（benefit_type 与国际版一致：seedance_20_fast_720p_output）
  "jimeng-video-seedance-2.0-fast-vip": "seedance_20_fast_720p_output",
  "seedance-2.0-fast-vip": "seedance_20_fast_720p_output",
  // Seedance 2.0 VIP Vision（主模态能力，benefit_type：seedance_20_pro_720p_output）
  "jimeng-video-seedance-2.0-vip": "seedance_20_pro_720p_output",
  "seedance-2.0-vip": "seedance_20_pro_720p_output"
};
var INTERNATIONAL_VIDEO_MODEL_MAP = {
  "jimeng-video-3.5-pro": "dreamina_ic_generate_video_model_vgfm_3.5_pro",
  "jimeng-video-3.0-pro": "dreamina_ic_generate_video_model_vgfm_3.0_pro",
  "jimeng-video-3.0": "dreamina_ic_generate_video_model_vgfm_3.0"
};
var INTERNATIONAL_SEEDANCE_MODEL_MAP = {
  "jimeng-video-seedance-2.0": "dreamina_seedance_40_pro",
  "seedance-2.0-pro": "dreamina_seedance_40_pro",
  "jimeng-video-seedance-2.0-fast": "dreamina_seedance_40",
  "seedance-2.0-fast": "dreamina_seedance_40",
  "jimeng-video-seedance-2.0-fast-vip": "dreamina_seedance_40_vision",
  "seedance-2.0-fast-vip": "dreamina_seedance_40_vision",
  "jimeng-video-seedance-2.0-vip": "dreamina_seedance_40_pro_vision",
  "seedance-2.0-vip": "dreamina_seedance_40_pro_vision"
};
var INTERNATIONAL_SEEDANCE_BENEFIT_TYPE_MAP = {
  "jimeng-video-seedance-2.0": "seedance_20_pro_720p_output",
  "seedance-2.0-pro": "seedance_20_pro_720p_output",
  "jimeng-video-seedance-2.0-fast": "seedance_20_fast_720p_output",
  "seedance-2.0-fast": "seedance_20_fast_720p_output",
  "jimeng-video-seedance-2.0-fast-vip": "seedance_20_fast_720p_output",
  "seedance-2.0-fast-vip": "seedance_20_fast_720p_output",
  "jimeng-video-seedance-2.0-vip": "seedance_20_pro_720p_output",
  "seedance-2.0-vip": "seedance_20_pro_720p_output"
};
function getVideoBenefitType(model) {
  if (model.includes("3.5_pro")) {
    return "dreamina_video_seedance_15_pro";
  }
  if (model.includes("3.5")) {
    return "dreamina_video_seedance_15";
  }
  return "basic_video_operation_vgfm_v_three";
}
function getInternationalVideoDraftVersion(_model) {
  if (Object.prototype.hasOwnProperty.call(INTERNATIONAL_VIDEO_MODEL_MAP, _model)) {
    return "3.3.12";
  }
  return MODEL_DRAFT_VERSIONS2[_model] || DEFAULT_DRAFT_VERSION;
}
function isSeedanceModel(model) {
  return model.startsWith("seedance-") || model.startsWith("jimeng-video-seedance-");
}
function isInternationalVideoModel(model) {
  return Object.prototype.hasOwnProperty.call(INTERNATIONAL_VIDEO_MODEL_MAP, model) || Object.prototype.hasOwnProperty.call(INTERNATIONAL_SEEDANCE_MODEL_MAP, model);
}
function getInternationalVideoModel(model) {
  return INTERNATIONAL_VIDEO_MODEL_MAP[model] || INTERNATIONAL_SEEDANCE_MODEL_MAP[model];
}
function isInternationalSeedanceModel(model) {
  return Object.prototype.hasOwnProperty.call(INTERNATIONAL_SEEDANCE_MODEL_MAP, model);
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
    throw new Error(`\u4E0D\u652F\u6301\u7684\u89C6\u9891\u5206\u8FA8\u7387 "${resolution}"\u3002\u652F\u6301\u7684\u5206\u8FA8\u7387: ${supportedResolutions}`);
  }
  const ratioConfig = resolutionGroup[ratio];
  if (!ratioConfig) {
    const supportedRatios = Object.keys(resolutionGroup).join(", ");
    throw new Error(`\u5728 "${resolution}" \u5206\u8FA8\u7387\u4E0B\uFF0C\u4E0D\u652F\u6301\u7684\u6BD4\u4F8B "${ratio}"\u3002\u652F\u6301\u7684\u6BD4\u4F8B: ${supportedRatios}`);
  }
  return {
    width: ratioConfig.width,
    height: ratioConfig.height
  };
}
function getModel2(model) {
  return MODEL_MAP2[model] || MODEL_MAP2[DEFAULT_MODEL2];
}
var BASE_URL_IMAGEX_SG = "https://imagex-normal-sg.capcutapi.com";
var BASE_URL_IMAGEX_US = "https://imagex16-normal-us-ttp.capcutapi.us";
function getUploadAWSRegion(regionInfo) {
  if (regionInfo.isUS) return "us-east-1";
  if (regionInfo.isInternational) return "ap-southeast-1";
  return "cn-north-1";
}
function getImageXHost(regionInfo) {
  if (regionInfo.isCN) return "https://imagex.bytedanceapi.com";
  if (regionInfo.isUS) return BASE_URL_IMAGEX_US;
  return BASE_URL_IMAGEX_SG;
}
function getUploadOrigin(regionInfo) {
  if (regionInfo.isUS) return "https://dreamina-api.us.capcut.com";
  if (regionInfo.isInternational) return "https://mweb-api-sg.capcut.com";
  return "https://jimeng.jianying.com";
}
function getUploadReferer(regionInfo) {
  const origin = getUploadOrigin(regionInfo);
  return `${origin}/ai-tool/video/generate`;
}
function resolveServiceId(tokenResult, regionInfo) {
  const rawServiceId = regionInfo.isInternational ? tokenResult.space_name : tokenResult.service_id;
  if (rawServiceId) return rawServiceId;
  return regionInfo.isInternational ? "wopfjsm1ax" : "tb4s082cfz";
}
var _proxyDispatcher = void 0;
function getProxyDispatcher() {
  if (_proxyDispatcher !== void 0) return _proxyDispatcher;
  const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy || process.env.ALL_PROXY || process.env.all_proxy;
  if (proxyUrl) {
    try {
      _proxyDispatcher = new UndiciProxyAgent(proxyUrl);
      logger_default.info(`\u4E0A\u4F20\u4EE3\u7406\u5DF2\u542F\u7528: ${proxyUrl}`);
    } catch (e) {
      logger_default.warn(`\u521B\u5EFA\u4EE3\u7406 dispatcher \u5931\u8D25: ${e.message}`);
      _proxyDispatcher = null;
    }
  } else {
    _proxyDispatcher = null;
  }
  return _proxyDispatcher;
}
async function proxyFetch(url, init) {
  const dispatcher = getProxyDispatcher();
  if (dispatcher && init) {
    init.dispatcher = dispatcher;
  } else if (dispatcher && !init) {
    init = { dispatcher };
  }
  return fetch(url, init);
}
async function cnFetch(url, init) {
  return fetch(url, init);
}
function regionFetch(regionInfo) {
  return (regionInfo == null ? void 0 : regionInfo.isInternational) ? proxyFetch : cnFetch;
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
async function uploadImageForVideo(imageUrl, refreshToken, regionInfo) {
  var _a, _b, _c, _d, _e, _f;
  try {
    logger_default.info(`\u5F00\u59CB\u4E0A\u4F20\u89C6\u9891\u56FE\u7247: ${imageUrl}`);
    const ri = regionInfo || parseRegionFromToken(refreshToken);
    const rf = regionFetch(ri);
    const awsRegion = getUploadAWSRegion(ri);
    const imageXHost = getImageXHost(ri);
    const uploadOrigin = getUploadOrigin(ri);
    const uploadReferer = getUploadReferer(ri);
    const tokenResult = await request("post", "/mweb/v1/get_upload_token", refreshToken, {
      data: {
        scene: 2
        // AIGC 图片上传场景
      }
    });
    const { access_key_id, secret_access_key, session_token, service_id, space_name } = tokenResult;
    if (!access_key_id || !secret_access_key || !session_token) {
      throw new Error("\u83B7\u53D6\u4E0A\u4F20\u4EE4\u724C\u5931\u8D25");
    }
    const actualServiceId = resolveServiceId(tokenResult, ri);
    logger_default.info(`\u83B7\u53D6\u4E0A\u4F20\u4EE4\u724C\u6210\u529F: service_id=${actualServiceId}`);
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`\u4E0B\u8F7D\u56FE\u7247\u5931\u8D25: ${imageResponse.status}`);
    }
    const imageBuffer = await imageResponse.arrayBuffer();
    const fileSize = imageBuffer.byteLength;
    const crc32 = calculateCRC322(imageBuffer);
    logger_default.info(`\u56FE\u7247\u4E0B\u8F7D\u5B8C\u6210: \u5927\u5C0F=${fileSize}\u5B57\u8282, CRC32=${crc32}`);
    const now = /* @__PURE__ */ new Date();
    const timestamp = now.toISOString().replace(/[:\-]/g, "").replace(/\.\d{3}Z$/, "Z");
    const randomStr = Math.random().toString(36).substring(2, 12);
    const applyUrl = `${imageXHost}/?Action=ApplyImageUpload&Version=2018-08-01&ServiceId=${actualServiceId}&FileSize=${fileSize}&s=${randomStr}${ri.isInternational ? "&device_platform=web" : ""}`;
    const requestHeaders = {
      "x-amz-date": timestamp,
      "x-amz-security-token": session_token
    };
    const authorization = createSignature2("GET", applyUrl, requestHeaders, access_key_id, secret_access_key, session_token, "", awsRegion, "imagex");
    logger_default.info(`\u7533\u8BF7\u4E0A\u4F20\u6743\u9650: ${applyUrl}`);
    const applyResponse = await rf(applyUrl, {
      method: "GET",
      headers: {
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9",
        "authorization": authorization,
        "origin": uploadOrigin,
        "referer": uploadReferer,
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
    const uploadResponse = await rf(uploadUrl, {
      method: "POST",
      headers: {
        "Accept": "*/*",
        "Accept-Language": "zh-CN,zh;q=0.9",
        "Authorization": auth,
        "Connection": "keep-alive",
        "Content-CRC32": crc32,
        "Content-Disposition": 'attachment; filename="undefined"',
        "Content-Type": "application/octet-stream",
        "Origin": uploadOrigin,
        "Referer": uploadReferer,
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
      throw new Error(`\u56FE\u7247\u4E0A\u4F20\u5931\u8D25: ${uploadResponse.status} - ${errorText}`);
    }
    logger_default.info(`\u56FE\u7247\u6587\u4EF6\u4E0A\u4F20\u6210\u529F`);
    const commitUrl = `${imageXHost}/?Action=CommitImageUpload&Version=2018-08-01&ServiceId=${actualServiceId}`;
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
    const commitAuthorization = createSignature2("POST", commitUrl, commitRequestHeaders, access_key_id, secret_access_key, session_token, commitPayload, awsRegion, "imagex");
    const commitResponse = await rf(commitUrl, {
      method: "POST",
      headers: {
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9",
        "authorization": commitAuthorization,
        "content-type": "application/json",
        "origin": uploadOrigin,
        "referer": uploadReferer,
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
    if (pluginResult && pluginResult.ImageUri) {
      logger_default.info(`\u89C6\u9891\u56FE\u7247\u4E0A\u4F20\u5B8C\u6210: ${pluginResult.ImageUri}`);
      return pluginResult.ImageUri;
    }
    logger_default.info(`\u89C6\u9891\u56FE\u7247\u4E0A\u4F20\u5B8C\u6210: ${fullImageUri}`);
    return fullImageUri;
  } catch (error) {
    logger_default.error(`\u89C6\u9891\u56FE\u7247\u4E0A\u4F20\u5931\u8D25: ${error.message}`);
    throw error;
  }
}
async function uploadImageBufferForVideo(buffer, refreshToken, regionInfo) {
  var _a, _b, _c, _d, _e, _f;
  try {
    logger_default.info(`\u5F00\u59CB\u4ECEBuffer\u4E0A\u4F20\u89C6\u9891\u56FE\u7247\uFF0C\u5927\u5C0F: ${buffer.length}\u5B57\u8282`);
    const ri = regionInfo || parseRegionFromToken(refreshToken);
    const rf = regionFetch(ri);
    const awsRegion = getUploadAWSRegion(ri);
    const imageXHost = getImageXHost(ri);
    const uploadOrigin = getUploadOrigin(ri);
    const uploadReferer = getUploadReferer(ri);
    const tokenResult = await request("post", "/mweb/v1/get_upload_token", refreshToken, {
      data: {
        scene: 2
      }
    });
    const { access_key_id, secret_access_key, session_token, service_id, space_name } = tokenResult;
    if (!access_key_id || !secret_access_key || !session_token) {
      throw new Error("\u83B7\u53D6\u4E0A\u4F20\u4EE4\u724C\u5931\u8D25");
    }
    const actualServiceId = resolveServiceId(tokenResult, ri);
    logger_default.info(`\u83B7\u53D6\u4E0A\u4F20\u4EE4\u724C\u6210\u529F: service_id=${actualServiceId}`);
    const fileSize = buffer.length;
    const crc32 = calculateCRC322(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
    logger_default.info(`Buffer\u5927\u5C0F: ${fileSize}\u5B57\u8282, CRC32=${crc32}`);
    const now = /* @__PURE__ */ new Date();
    const timestamp = now.toISOString().replace(/[:\-]/g, "").replace(/\.\d{3}Z$/, "Z");
    const randomStr = Math.random().toString(36).substring(2, 12);
    const applyUrl = `${imageXHost}/?Action=ApplyImageUpload&Version=2018-08-01&ServiceId=${actualServiceId}&FileSize=${fileSize}&s=${randomStr}${ri.isInternational ? "&device_platform=web" : ""}`;
    const requestHeaders = {
      "x-amz-date": timestamp,
      "x-amz-security-token": session_token
    };
    const authorization = createSignature2("GET", applyUrl, requestHeaders, access_key_id, secret_access_key, session_token, "", awsRegion, "imagex");
    const applyResponse = await rf(applyUrl, {
      method: "GET",
      headers: {
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9",
        "authorization": authorization,
        "origin": uploadOrigin,
        "referer": uploadReferer,
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
    const uploadAddress = (_b = applyResult == null ? void 0 : applyResult.Result) == null ? void 0 : _b.UploadAddress;
    if (!uploadAddress || !uploadAddress.StoreInfos || !uploadAddress.UploadHosts) {
      throw new Error(`\u83B7\u53D6\u4E0A\u4F20\u5730\u5740\u5931\u8D25: ${JSON.stringify(applyResult)}`);
    }
    const storeInfo = uploadAddress.StoreInfos[0];
    const uploadHost = uploadAddress.UploadHosts[0];
    const auth = storeInfo.Auth;
    const uploadUrl = `https://${uploadHost}/upload/v1/${storeInfo.StoreUri}`;
    const uploadResponse = await rf(uploadUrl, {
      method: "POST",
      headers: {
        "Accept": "*/*",
        "Authorization": auth,
        "Content-CRC32": crc32,
        "Content-Disposition": 'attachment; filename="undefined"',
        "Content-Type": "application/octet-stream",
        "Origin": uploadOrigin,
        "Referer": uploadReferer,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
      },
      body: buffer
    });
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`\u56FE\u7247\u4E0A\u4F20\u5931\u8D25: ${uploadResponse.status} - ${errorText}`);
    }
    logger_default.info(`Buffer\u56FE\u7247\u6587\u4EF6\u4E0A\u4F20\u6210\u529F`);
    const commitUrl = `${imageXHost}/?Action=CommitImageUpload&Version=2018-08-01&ServiceId=${actualServiceId}`;
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
    const commitAuthorization = createSignature2("POST", commitUrl, commitRequestHeaders, access_key_id, secret_access_key, session_token, commitPayload, awsRegion, "imagex");
    const commitResponse = await rf(commitUrl, {
      method: "POST",
      headers: {
        "accept": "*/*",
        "authorization": commitAuthorization,
        "content-type": "application/json",
        "origin": uploadOrigin,
        "referer": uploadReferer,
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
    if (pluginResult && pluginResult.ImageUri) {
      logger_default.info(`Buffer\u89C6\u9891\u56FE\u7247\u4E0A\u4F20\u5B8C\u6210: ${pluginResult.ImageUri}`);
      return pluginResult.ImageUri;
    }
    logger_default.info(`Buffer\u89C6\u9891\u56FE\u7247\u4E0A\u4F20\u5B8C\u6210: ${fullImageUri}`);
    return fullImageUri;
  } catch (error) {
    logger_default.error(`Buffer\u89C6\u9891\u56FE\u7247\u4E0A\u4F20\u5931\u8D25: ${error.message}`);
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
async function uploadMediaForVideo(buffer, mediaType, refreshToken, filename, regionInfo) {
  var _a, _b, _c, _d, _e, _f, _g;
  const label = mediaType === "audio" ? "\u97F3\u9891" : "\u89C6\u9891";
  const fileSize = buffer.length;
  logger_default.info(`\u5F00\u59CB\u4E0A\u4F20${label}\u6587\u4EF6\uFF0C\u5927\u5C0F: ${fileSize} \u5B57\u8282`);
  const ri = regionInfo || parseRegionFromToken(refreshToken);
  const rf = regionFetch(ri);
  const awsRegion = getUploadAWSRegion(ri);
  const uploadOrigin = getUploadOrigin(ri);
  const uploadReferer = getUploadReferer(ri);
  const tokenResult = await request("post", "/mweb/v1/get_upload_token", refreshToken, {
    data: { scene: 1 }
  });
  const { access_key_id, secret_access_key, session_token, space_name } = tokenResult;
  if (!access_key_id || !secret_access_key || !session_token) {
    throw new Error(`\u83B7\u53D6${label}\u4E0A\u4F20\u4EE4\u724C\u5931\u8D25`);
  }
  const spaceName = space_name || "dreamina";
  logger_default.info(`\u83B7\u53D6${label}\u4E0A\u4F20\u4EE4\u724C\u6210\u529F: spaceName=${spaceName}`);
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
    awsRegion,
    "vod"
  );
  logger_default.info(`\u7533\u8BF7${label}\u4E0A\u4F20\u6743\u9650: ${applyUrl}`);
  const applyResponse = await rf(applyUrl, {
    method: "GET",
    headers: {
      "accept": "*/*",
      "accept-language": "zh-CN,zh;q=0.9",
      "authorization": authorization,
      "origin": uploadOrigin,
      "referer": uploadReferer,
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
      "x-amz-date": timestamp,
      "x-amz-security-token": session_token
    }
  });
  if (!applyResponse.ok) {
    const errorText = await applyResponse.text();
    throw new Error(`\u7533\u8BF7${label}\u4E0A\u4F20\u6743\u9650\u5931\u8D25: ${applyResponse.status} - ${errorText}`);
  }
  const applyResult = await applyResponse.json();
  if ((_a = applyResult == null ? void 0 : applyResult.ResponseMetadata) == null ? void 0 : _a.Error) {
    throw new Error(`\u7533\u8BF7${label}\u4E0A\u4F20\u6743\u9650\u5931\u8D25: ${JSON.stringify(applyResult.ResponseMetadata.Error)}`);
  }
  const uploadNodes = (_c = (_b = applyResult == null ? void 0 : applyResult.Result) == null ? void 0 : _b.InnerUploadAddress) == null ? void 0 : _c.UploadNodes;
  if (!uploadNodes || uploadNodes.length === 0) {
    throw new Error(`\u83B7\u53D6${label}\u4E0A\u4F20\u8282\u70B9\u5931\u8D25: ${JSON.stringify(applyResult)}`);
  }
  const uploadNode = uploadNodes[0];
  const storeInfo = (_d = uploadNode.StoreInfos) == null ? void 0 : _d[0];
  if (!storeInfo) {
    throw new Error(`\u83B7\u53D6${label}\u4E0A\u4F20\u5B58\u50A8\u4FE1\u606F\u5931\u8D25: ${JSON.stringify(uploadNode)}`);
  }
  const uploadHost = uploadNode.UploadHost;
  const storeUri = storeInfo.StoreUri;
  const auth = storeInfo.Auth;
  const sessionKey = uploadNode.SessionKey;
  const vid = uploadNode.Vid;
  logger_default.info(`\u83B7\u53D6${label}\u4E0A\u4F20\u8282\u70B9\u6210\u529F: host=${uploadHost}, vid=${vid}`);
  const uploadUrl = `https://${uploadHost}/upload/v1/${storeUri}`;
  const crc32 = calculateCRC322(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
  logger_default.info(`\u5F00\u59CB\u4E0A\u4F20${label}\u6587\u4EF6: ${uploadUrl}, CRC32=${crc32}`);
  const uploadResponse = await rf(uploadUrl, {
    method: "POST",
    headers: {
      "Accept": "*/*",
      "Authorization": auth,
      "Content-CRC32": crc32,
      "Content-Type": "application/octet-stream",
      "Origin": uploadOrigin,
      "Referer": uploadReferer,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
    },
    body: buffer
  });
  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(`${label}\u6587\u4EF6\u4E0A\u4F20\u5931\u8D25: ${uploadResponse.status} - ${errorText}`);
  }
  const uploadData = await uploadResponse.json();
  if ((uploadData == null ? void 0 : uploadData.code) !== 2e3) {
    throw new Error(`${label}\u6587\u4EF6\u4E0A\u4F20\u5931\u8D25: code=${uploadData == null ? void 0 : uploadData.code}, message=${uploadData == null ? void 0 : uploadData.message}`);
  }
  logger_default.info(`${label}\u6587\u4EF6\u4E0A\u4F20\u6210\u529F: crc32=${(_e = uploadData.data) == null ? void 0 : _e.crc32}`);
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
    awsRegion,
    "vod"
  );
  logger_default.info(`\u63D0\u4EA4${label}\u4E0A\u4F20\u786E\u8BA4: ${commitUrl}`);
  const commitResponse = await rf(commitUrl, {
    method: "POST",
    headers: {
      "accept": "*/*",
      "authorization": commitAuthorization,
      "content-type": "application/json",
      "origin": uploadOrigin,
      "referer": uploadReferer,
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
      "x-amz-date": commitTimestamp,
      "x-amz-security-token": session_token,
      "x-amz-content-sha256": payloadHash
    },
    body: commitPayload
  });
  if (!commitResponse.ok) {
    const errorText = await commitResponse.text();
    throw new Error(`\u63D0\u4EA4${label}\u4E0A\u4F20\u5931\u8D25: ${commitResponse.status} - ${errorText}`);
  }
  const commitResult = await commitResponse.json();
  if ((_f = commitResult == null ? void 0 : commitResult.ResponseMetadata) == null ? void 0 : _f.Error) {
    throw new Error(`\u63D0\u4EA4${label}\u4E0A\u4F20\u5931\u8D25: ${JSON.stringify(commitResult.ResponseMetadata.Error)}`);
  }
  if (!((_g = commitResult == null ? void 0 : commitResult.Result) == null ? void 0 : _g.Results) || commitResult.Result.Results.length === 0) {
    throw new Error(`\u63D0\u4EA4${label}\u4E0A\u4F20\u54CD\u5E94\u7F3A\u5C11\u7ED3\u679C: ${JSON.stringify(commitResult)}`);
  }
  const result = commitResult.Result.Results[0];
  if (!result.Vid) {
    throw new Error(`\u63D0\u4EA4${label}\u4E0A\u4F20\u54CD\u5E94\u7F3A\u5C11 Vid: ${JSON.stringify(result)}`);
  }
  const videoMeta = result.VideoMeta || {};
  let duration = videoMeta.Duration ? Math.round(videoMeta.Duration * 1e3) : 0;
  if (duration <= 0 && mediaType === "audio") {
    duration = parseAudioDuration(buffer);
    logger_default.info(`VOD \u672A\u8FD4\u56DE${label}\u65F6\u957F\uFF0C\u672C\u5730\u89E3\u6790: ${duration}ms`);
  }
  logger_default.info(`${label}\u4E0A\u4F20\u5B8C\u6210: vid=${result.Vid}, duration=${duration}ms`);
  return {
    vid: result.Vid,
    width: videoMeta.Width || 0,
    height: videoMeta.Height || 0,
    duration,
    fps: videoMeta.Fps || 0
  };
}
async function fetchHighQualityVideoUrl(itemId, refreshToken) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  try {
    logger_default.info(`\u5C1D\u8BD5\u83B7\u53D6\u9AD8\u8D28\u91CF\u89C6\u9891\u4E0B\u8F7DURL\uFF0Citem_id: ${itemId}`);
    const regionInfo = parseRegionFromToken(refreshToken);
    const isInternational = regionInfo.isInternational || regionInfo.isUS;
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
    logger_default.info(`get_local_item_list \u54CD\u5E94\u5927\u5C0F: ${responseStr.length} \u5B57\u7B26`);
    let videoUrl = null;
    const itemList = result.item_list || result.local_item_list || [];
    if (itemList.length > 0) {
      const item = itemList[0];
      videoUrl = ((_c = (_b = (_a = item == null ? void 0 : item.common_attr) == null ? void 0 : _a.transcoded_video) == null ? void 0 : _b.origin) == null ? void 0 : _c.video_url) || (item == null ? void 0 : item.result_url) || ((_f = (_e = (_d = item == null ? void 0 : item.video) == null ? void 0 : _d.transcoded_video) == null ? void 0 : _e.origin) == null ? void 0 : _f.video_url) || ((_g = item == null ? void 0 : item.video) == null ? void 0 : _g.download_url) || ((_h = item == null ? void 0 : item.video) == null ? void 0 : _h.play_url) || ((_i = item == null ? void 0 : item.video) == null ? void 0 : _i.url);
      if (videoUrl) {
        logger_default.info(`\u4ECEget_local_item_list\u7ED3\u6784\u5316\u5B57\u6BB5\u83B7\u53D6\u5230\u9AD8\u6E05\u89C6\u9891URL`);
      }
    }
    if (!videoUrl) {
      const hqUrlMatch = responseStr.match(/https:\/\/v[0-9]+-dreamnia\.jimeng\.com\/[^"\s\\]+/);
      if (hqUrlMatch && hqUrlMatch[0]) {
        videoUrl = hqUrlMatch[0];
        logger_default.info(`\u6B63\u5219\u63D0\u53D6\u5230\u9AD8\u8D28\u91CF\u89C6\u9891URL (dreamnia)`);
      }
    }
    if (!videoUrl) {
      const jimengUrlMatch = responseStr.match(/https:\/\/v[0-9]+-[^"\\]*\.jimeng\.com\/[^"\s\\]+/);
      if (jimengUrlMatch && jimengUrlMatch[0]) {
        videoUrl = jimengUrlMatch[0];
        logger_default.info(`\u6B63\u5219\u63D0\u53D6\u5230jimeng\u89C6\u9891URL`);
      }
    }
    if (!videoUrl) {
      const anyVideoUrlMatch = responseStr.match(/https:\/\/[^"\s\\]+\.(?:vlabvod|jimeng|capcut)\.com\/[^"\s\\]+/);
      if (anyVideoUrlMatch && anyVideoUrlMatch[0]) {
        videoUrl = anyVideoUrlMatch[0];
        logger_default.info(`\u4ECEget_local_item_list\u63D0\u53D6\u5230\u89C6\u9891URL`);
      }
    }
    if (!videoUrl) {
      const capcutUrlMatch = responseStr.match(/https:\/\/[^"\s\\]*capcut\.com\/[^"\s\\]+/);
      if (capcutUrlMatch && capcutUrlMatch[0]) {
        videoUrl = capcutUrlMatch[0];
        logger_default.info(`\u6B63\u5219\u63D0\u53D6\u5230\u56FD\u9645\u7248 CapCut \u89C6\u9891URL`);
      }
    }
    if (!videoUrl) {
      logger_default.warn(`\u672A\u80FD\u4ECEget_local_item_list\u54CD\u5E94\u4E2D\u63D0\u53D6\u5230\u89C6\u9891URL`);
      return null;
    }
    if (isInternational) {
      try {
        await request("post", "/commerce/v3/resource/benefit_metadata", refreshToken, {
          data: {
            query_list: [
              { resource_type: "aigc", resource_id: "get_all", benefit_type_list: [] },
              { resource_type: "normal_func", resource_id: "get_all", benefit_type_list: [] }
            ]
          }
        });
        logger_default.info(`\u56FD\u9645\u7248\u6743\u76CAAPI benefit_metadata \u8C03\u7528\u5B8C\u6210`);
      } catch (e) {
        logger_default.warn(`\u56FD\u9645\u7248\u6743\u76CAAPI benefit_metadata \u8C03\u7528\u5931\u8D25: ${e.message}`);
      }
      try {
        await request("post", "/commerce/v3/benefits/batch_get_user_benefit", refreshToken, {
          data: {
            query_list: [
              { resource_type: "aigc", resource_id: "get_all", benefit_type_list: [] },
              { resource_type: "normal_func", resource_id: "get_all", benefit_type_list: [] }
            ]
          }
        });
        logger_default.info(`\u56FD\u9645\u7248\u6743\u76CAAPI batch_get_user_benefit \u8C03\u7528\u5B8C\u6210`);
      } catch (e) {
        logger_default.warn(`\u56FD\u9645\u7248\u6743\u76CAAPI batch_get_user_benefit \u8C03\u7528\u5931\u8D25: ${e.message}`);
      }
    }
    if (videoUrl.includes("display_watermark_busi_aigc")) {
      logger_default.warn(`\u89C6\u9891URL\u5305\u542B\u514D\u8D39\u8D26\u53F7\u6C34\u5370\u6807\u8BC6 (display_watermark_busi_aigc)\uFF0C\u89C6\u9891\u5C06\u5E26\u6709\u6C34\u5370`);
    } else if (videoUrl.includes("display_watermark_aigc")) {
      logger_default.info(`\u89C6\u9891URL\u5305\u542BVIP\u8D26\u53F7\u6807\u8BC6 (display_watermark_aigc)\uFF0CVIP\u7528\u6237\u6B64URL\u4E3A\u65E0\u6C34\u5370\u7248\u672C`);
    }
    logger_default.info(`\u83B7\u53D6\u5230\u89C6\u9891URL: ${videoUrl}`);
    return videoUrl;
  } catch (error) {
    logger_default.warn(`\u83B7\u53D6\u9AD8\u8D28\u91CF\u89C6\u9891\u4E0B\u8F7DURL\u5931\u8D25: ${error.message}`);
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
      const error = failCode === 2038 ? "Content filtered" : `Generation failed, error code: ${failCode}`;
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
    return { status: "failed", error: "Failed to extract video URL" };
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
}, refreshToken) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
  const model = getModel2(_model);
  const { width, height } = resolveVideoResolution(resolution, ratio);
  logger_default.info(`\u4F7F\u7528\u6A21\u578B: ${_model} \u6620\u5C04\u6A21\u578B: ${model} ${width}x${height} (${ratio}@${resolution}) \u65F6\u957F: ${duration}\u79D2`);
  const { totalCredit } = await getCredit(refreshToken);
  if (totalCredit <= 0)
    await receiveCredit(refreshToken);
  let first_frame_image = void 0;
  let end_frame_image = void 0;
  if (files && files.length > 0) {
    let uploadIDs = [];
    logger_default.info(`\u5F00\u59CB\u5904\u7406 ${files.length} \u4E2A\u4E0A\u4F20\u6587\u4EF6\u7528\u4E8E\u89C6\u9891\u751F\u6210`);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file || !file.filepath) {
        logger_default.warn(`\u7B2C ${i + 1} \u4E2A\u6587\u4EF6\u65E0\u6548\uFF0C\u8DF3\u8FC7`);
        continue;
      }
      try {
        logger_default.info(`\u5F00\u59CB\u4E0A\u4F20\u7B2C ${i + 1} \u4E2A\u6587\u4EF6: ${file.originalFilename || file.filepath}`);
        const buffer = fs7.readFileSync(file.filepath);
        const imageUri = await uploadImageBufferForVideo(buffer, refreshToken);
        if (imageUri) {
          uploadIDs.push(imageUri);
          logger_default.info(`\u7B2C ${i + 1} \u4E2A\u6587\u4EF6\u4E0A\u4F20\u6210\u529F: ${imageUri}`);
        } else {
          logger_default.error(`\u7B2C ${i + 1} \u4E2A\u6587\u4EF6\u4E0A\u4F20\u5931\u8D25: \u672A\u83B7\u53D6\u5230 image_uri`);
        }
      } catch (error) {
        logger_default.error(`\u7B2C ${i + 1} \u4E2A\u6587\u4EF6\u4E0A\u4F20\u5931\u8D25: ${error.message}`);
        if (i === 0) {
          logger_default.error(`\u9996\u5E27\u6587\u4EF6\u4E0A\u4F20\u5931\u8D25\uFF0C\u505C\u6B62\u89C6\u9891\u751F\u6210\u4EE5\u907F\u514D\u6D6A\u8D39\u79EF\u5206`);
          throw new APIException(exceptions_default.API_REQUEST_FAILED, `\u9996\u5E27\u6587\u4EF6\u4E0A\u4F20\u5931\u8D25: ${error.message}`);
        } else {
          logger_default.warn(`\u7B2C ${i + 1} \u4E2A\u6587\u4EF6\u4E0A\u4F20\u5931\u8D25\uFF0C\u5C06\u8DF3\u8FC7\u6B64\u6587\u4EF6\u7EE7\u7EED\u5904\u7406`);
        }
      }
    }
    logger_default.info(`\u6587\u4EF6\u4E0A\u4F20\u5B8C\u6210\uFF0C\u6210\u529F\u4E0A\u4F20 ${uploadIDs.length} \u4E2A\u6587\u4EF6`);
    if (uploadIDs.length === 0) {
      logger_default.error(`\u6240\u6709\u6587\u4EF6\u4E0A\u4F20\u5931\u8D25\uFF0C\u505C\u6B62\u89C6\u9891\u751F\u6210\u4EE5\u907F\u514D\u6D6A\u8D39\u79EF\u5206`);
      throw new APIException(exceptions_default.API_REQUEST_FAILED, "\u6240\u6709\u6587\u4EF6\u4E0A\u4F20\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u6587\u4EF6\u662F\u5426\u6709\u6548");
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
      logger_default.info(`\u8BBE\u7F6E\u9996\u5E27\u56FE\u7247: ${uploadIDs[0]}`);
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
      logger_default.info(`\u8BBE\u7F6E\u5C3E\u5E27\u56FE\u7247: ${uploadIDs[1]}`);
    }
  } else if (filePaths && filePaths.length > 0) {
    let uploadIDs = [];
    logger_default.info(`\u5F00\u59CB\u4E0A\u4F20 ${filePaths.length} \u5F20\u56FE\u7247\u7528\u4E8E\u89C6\u9891\u751F\u6210`);
    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i];
      if (!filePath) {
        logger_default.warn(`\u7B2C ${i + 1} \u5F20\u56FE\u7247\u8DEF\u5F84\u4E3A\u7A7A\uFF0C\u8DF3\u8FC7`);
        continue;
      }
      try {
        logger_default.info(`\u5F00\u59CB\u4E0A\u4F20\u7B2C ${i + 1} \u5F20\u56FE\u7247: ${filePath}`);
        const imageUri = await uploadImageForVideo(filePath, refreshToken);
        if (imageUri) {
          uploadIDs.push(imageUri);
          logger_default.info(`\u7B2C ${i + 1} \u5F20\u56FE\u7247\u4E0A\u4F20\u6210\u529F: ${imageUri}`);
        } else {
          logger_default.error(`\u7B2C ${i + 1} \u5F20\u56FE\u7247\u4E0A\u4F20\u5931\u8D25: \u672A\u83B7\u53D6\u5230 image_uri`);
        }
      } catch (error) {
        logger_default.error(`\u7B2C ${i + 1} \u5F20\u56FE\u7247\u4E0A\u4F20\u5931\u8D25: ${error.message}`);
        if (i === 0) {
          logger_default.error(`\u9996\u5E27\u56FE\u7247\u4E0A\u4F20\u5931\u8D25\uFF0C\u505C\u6B62\u89C6\u9891\u751F\u6210\u4EE5\u907F\u514D\u6D6A\u8D39\u79EF\u5206`);
          throw new APIException(exceptions_default.API_REQUEST_FAILED, `\u9996\u5E27\u56FE\u7247\u4E0A\u4F20\u5931\u8D25: ${error.message}`);
        } else {
          logger_default.warn(`\u7B2C ${i + 1} \u5F20\u56FE\u7247\u4E0A\u4F20\u5931\u8D25\uFF0C\u5C06\u8DF3\u8FC7\u6B64\u56FE\u7247\u7EE7\u7EED\u5904\u7406`);
        }
      }
    }
    logger_default.info(`\u56FE\u7247\u4E0A\u4F20\u5B8C\u6210\uFF0C\u6210\u529F\u4E0A\u4F20 ${uploadIDs.length} \u5F20\u56FE\u7247`);
    if (uploadIDs.length === 0) {
      logger_default.error(`\u6240\u6709\u56FE\u7247\u4E0A\u4F20\u5931\u8D25\uFF0C\u505C\u6B62\u89C6\u9891\u751F\u6210\u4EE5\u907F\u514D\u6D6A\u8D39\u79EF\u5206`);
      throw new APIException(exceptions_default.API_REQUEST_FAILED, "\u6240\u6709\u56FE\u7247\u4E0A\u4F20\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u56FE\u7247URL\u662F\u5426\u6709\u6548");
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
      logger_default.info(`\u8BBE\u7F6E\u9996\u5E27\u56FE\u7247: ${uploadIDs[0]}`);
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
      logger_default.info(`\u8BBE\u7F6E\u5C3E\u5E27\u56FE\u7247: ${uploadIDs[1]}`);
    } else if (filePaths.length > 1) {
      logger_default.warn(`\u7B2C\u4E8C\u5F20\u56FE\u7247\u4E0A\u4F20\u5931\u8D25\u6216\u672A\u63D0\u4F9B\uFF0C\u5C06\u4EC5\u4F7F\u7528\u9996\u5E27\u56FE\u7247`);
    }
  } else {
    logger_default.info(`\u672A\u63D0\u4F9B\u56FE\u7247\u6587\u4EF6\uFF0C\u5C06\u8FDB\u884C\u7EAF\u6587\u672C\u89C6\u9891\u751F\u6210`);
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
    throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u8BB0\u5F55ID\u4E0D\u5B58\u5728");
  let status = 20, failCode, item_list = [];
  let retryCount = 0;
  const maxRetries = 120;
  await new Promise((resolve) => setTimeout(resolve, 5e3));
  logger_default.info(`\u5F00\u59CB\u8F6E\u8BE2\u89C6\u9891\u751F\u6210\u7ED3\u679C\uFF0C\u5386\u53F2ID: ${historyId}\uFF0C\u6700\u5927\u91CD\u8BD5\u6B21\u6570: ${maxRetries}`);
  logger_default.info(`\u5373\u68A6\u5B98\u7F51API\u5730\u5740: https://jimeng.jianying.com/mweb/v1/get_history_by_ids`);
  logger_default.info(`\u89C6\u9891\u751F\u6210\u8BF7\u6C42\u5DF2\u53D1\u9001\uFF0C\u8BF7\u540C\u65F6\u5728\u5373\u68A6\u5B98\u7F51\u67E5\u770B: https://jimeng.jianying.com/ai-tool/video/generate`);
  while (status === 20 && retryCount < maxRetries) {
    try {
      const requestUrl = "/mweb/v1/get_history_by_ids";
      const requestData = {
        history_ids: [historyId]
      };
      let result;
      let useAlternativeApi = retryCount > 10 && retryCount % 2 === 0;
      if (useAlternativeApi) {
        logger_default.info(`\u5C1D\u8BD5\u5907\u7528API\u8BF7\u6C42\u65B9\u5F0F\uFF0CURL: ${requestUrl}, \u5386\u53F2ID: ${historyId}, \u91CD\u8BD5\u6B21\u6570: ${retryCount + 1}/${maxRetries}`);
        const alternativeRequestData = {
          history_record_ids: [historyId]
        };
        result = await request("post", "/mweb/v1/get_history_records", refreshToken, {
          data: alternativeRequestData
        });
        logger_default.info(`\u5907\u7528API\u54CD\u5E94\u6458\u8981: ${JSON.stringify(result).substring(0, 500)}...`);
      } else {
        logger_default.info(`\u53D1\u9001\u8BF7\u6C42\u83B7\u53D6\u89C6\u9891\u751F\u6210\u7ED3\u679C\uFF0CURL: ${requestUrl}, \u5386\u53F2ID: ${historyId}, \u91CD\u8BD5\u6B21\u6570: ${retryCount + 1}/${maxRetries}`);
        result = await request("post", requestUrl, refreshToken, {
          data: requestData
        });
        const responseStr = JSON.stringify(result);
        logger_default.info(`\u6807\u51C6API\u54CD\u5E94\u6458\u8981: ${responseStr.substring(0, 300)}...`);
      }
      let historyData;
      if (useAlternativeApi && result.history_records && result.history_records.length > 0) {
        historyData = result.history_records[0];
        logger_default.info(`\u4ECE\u5907\u7528API\u83B7\u53D6\u5230\u5386\u53F2\u8BB0\u5F55`);
      } else if (result.history_list && result.history_list.length > 0) {
        historyData = result.history_list[0];
        logger_default.info(`\u4ECE\u6807\u51C6API\u83B7\u53D6\u5230\u5386\u53F2\u8BB0\u5F55`);
      } else if (result[historyId]) {
        historyData = result[historyId];
        logger_default.info(`\u4ECEhistoryId\u952E\u83B7\u53D6\u5230\u5386\u53F2\u8BB0\u5F55`);
      } else {
        logger_default.warn(`\u5386\u53F2\u8BB0\u5F55\u4E0D\u5B58\u5728\uFF0C\u91CD\u8BD5\u4E2D (${retryCount + 1}/${maxRetries})... \u5386\u53F2ID: ${historyId}`);
        logger_default.info(`\u8BF7\u540C\u65F6\u5728\u5373\u68A6\u5B98\u7F51\u68C0\u67E5\u89C6\u9891\u662F\u5426\u5DF2\u751F\u6210: https://jimeng.jianying.com/ai-tool/video/generate`);
        retryCount++;
        const waitTime = Math.min(2e3 * (retryCount + 1), 3e4);
        logger_default.info(`\u7B49\u5F85 ${waitTime}ms \u540E\u8FDB\u884C\u7B2C ${retryCount + 1} \u6B21\u91CD\u8BD5`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }
      logger_default.info(`\u83B7\u53D6\u5230\u5386\u53F2\u8BB0\u5F55\u7ED3\u679C: ${JSON.stringify(historyData)}`);
      status = historyData.status;
      failCode = historyData.fail_code;
      item_list = historyData.item_list || [];
      logger_default.info(`\u89C6\u9891\u751F\u6210\u72B6\u6001: ${status}, \u5931\u8D25\u4EE3\u7801: ${failCode || "\u65E0"}, \u9879\u76EE\u5217\u8868\u957F\u5EA6: ${item_list.length}`);
      let tempVideoUrl = (_d = (_c = (_b = (_a = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _a.video) == null ? void 0 : _b.transcoded_video) == null ? void 0 : _c.origin) == null ? void 0 : _d.video_url;
      if (!tempVideoUrl) {
        tempVideoUrl = ((_f = (_e = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _e.video) == null ? void 0 : _f.play_url) || ((_h = (_g = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _g.video) == null ? void 0 : _h.download_url) || ((_j = (_i = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _i.video) == null ? void 0 : _j.url);
      }
      if (tempVideoUrl) {
        logger_default.info(`\u68C0\u6D4B\u5230\u89C6\u9891URL: ${tempVideoUrl}`);
      }
      if (status === 30) {
        const error = failCode === 2038 ? new APIException(exceptions_default.API_CONTENT_FILTERED, "\u5185\u5BB9\u88AB\u8FC7\u6EE4") : new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, `\u751F\u6210\u5931\u8D25\uFF0C\u9519\u8BEF\u7801: ${failCode}`);
        error.historyId = historyId;
        throw error;
      }
      if (status === 20) {
        const waitTime = 2e3 * Math.min(retryCount + 1, 5);
        logger_default.info(`\u89C6\u9891\u751F\u6210\u4E2D\uFF0C\u72B6\u6001\u7801: ${status}\uFF0C\u7B49\u5F85 ${waitTime}ms \u540E\u7EE7\u7EED\u67E5\u8BE2`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    } catch (error) {
      logger_default.error(`\u8F6E\u8BE2\u89C6\u9891\u751F\u6210\u7ED3\u679C\u51FA\u9519: ${error.message}`);
      retryCount++;
      await new Promise((resolve) => setTimeout(resolve, 2e3 * (retryCount + 1)));
    }
  }
  if (retryCount >= maxRetries && status === 20) {
    logger_default.error(`\u89C6\u9891\u751F\u6210\u8D85\u65F6\uFF0C\u5DF2\u5C1D\u8BD5 ${retryCount} \u6B21\uFF0C\u603B\u8017\u65F6\u7EA6 ${Math.floor(retryCount * 2e3 / 1e3 / 60)} \u5206\u949F`);
    const error = new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u83B7\u53D6\u89C6\u9891\u751F\u6210\u7ED3\u679C\u8D85\u65F6\uFF0C\u8BF7\u7A0D\u540E\u5728\u5373\u68A6\u5B98\u7F51\u67E5\u770B\u60A8\u7684\u89C6\u9891");
    error.historyId = historyId;
    throw error;
  }
  const itemId = ((_k = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _k.item_id) || ((_l = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _l.id) || ((_m = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _m.local_item_id) || ((_o = (_n = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _n.common_attr) == null ? void 0 : _o.id);
  if (itemId) {
    try {
      const hqVideoUrl = await fetchHighQualityVideoUrl(String(itemId), refreshToken);
      if (hqVideoUrl) {
        logger_default.info(`\u89C6\u9891\u751F\u6210\u6210\u529F\uFF08\u9AD8\u8D28\u91CF\uFF09\uFF0CURL: ${hqVideoUrl}`);
        return hqVideoUrl;
      }
    } catch (error) {
      logger_default.warn(`\u83B7\u53D6\u9AD8\u8D28\u91CF\u89C6\u9891URL\u5931\u8D25\uFF0C\u5C06\u4F7F\u7528\u9884\u89C8URL\u4F5C\u4E3A\u56DE\u9000: ${error.message}`);
    }
  } else {
    logger_default.warn(`\u672A\u80FD\u4ECEitem_list\u4E2D\u63D0\u53D6item_id\uFF0C\u5C06\u4F7F\u7528\u9884\u89C8URL\u3002item_list[0]\u952E: ${(item_list == null ? void 0 : item_list[0]) ? Object.keys(item_list[0]).join(", ") : "\u65E0"}`);
  }
  let videoUrl = (_s = (_r = (_q = (_p = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _p.video) == null ? void 0 : _q.transcoded_video) == null ? void 0 : _r.origin) == null ? void 0 : _s.video_url;
  if (!videoUrl) {
    if ((_u = (_t = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _t.video) == null ? void 0 : _u.play_url) {
      videoUrl = item_list[0].video.play_url;
      logger_default.info(`\u4ECEplay_url\u83B7\u53D6\u5230\u89C6\u9891URL: ${videoUrl}`);
    } else if ((_w = (_v = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _v.video) == null ? void 0 : _w.download_url) {
      videoUrl = item_list[0].video.download_url;
      logger_default.info(`\u4ECEdownload_url\u83B7\u53D6\u5230\u89C6\u9891URL: ${videoUrl}`);
    } else if ((_y = (_x = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _x.video) == null ? void 0 : _y.url) {
      videoUrl = item_list[0].video.url;
      logger_default.info(`\u4ECEurl\u83B7\u53D6\u5230\u89C6\u9891URL: ${videoUrl}`);
    } else {
      logger_default.error(`\u672A\u80FD\u83B7\u53D6\u89C6\u9891URL\uFF0Citem_list: ${JSON.stringify(item_list)}`);
      const error = new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u672A\u80FD\u83B7\u53D6\u89C6\u9891URL\uFF0C\u8BF7\u7A0D\u540E\u5728\u5373\u68A6\u5B98\u7F51\u67E5\u770B");
      error.historyId = historyId;
      throw error;
    }
  }
  logger_default.info(`\u89C6\u9891\u751F\u6210\u6210\u529F\uFF0CURL: ${videoUrl}`);
  return videoUrl;
}
async function generateSeedanceVideo(_model, prompt, {
  ratio = "4:3",
  resolution = "720p",
  duration = 4,
  filePaths = [],
  files = []
}, refreshToken) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
  const model = getModel2(_model);
  const benefitType = SEEDANCE_BENEFIT_TYPE_MAP[_model] || "dreamina_video_seedance_20_pro";
  const actualDuration = duration || 4;
  const { width, height } = resolveVideoResolution(resolution, ratio);
  logger_default.info(`Seedance 2.0 \u751F\u6210: \u6A21\u578B=${_model} \u6620\u5C04=${model} ${width}x${height} (${ratio}@${resolution}) \u65F6\u957F=${actualDuration}\u79D2`);
  const { totalCredit } = await getCredit(refreshToken);
  if (totalCredit <= 0)
    await receiveCredit(refreshToken);
  let uploadedMaterials = [];
  if (files && files.length > 0) {
    logger_default.info(`Seedance: \u5F00\u59CB\u5904\u7406 ${files.length} \u4E2A\u4E0A\u4F20\u6587\u4EF6`);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file || !file.filepath) {
        logger_default.warn(`Seedance: \u7B2C ${i + 1} \u4E2A\u6587\u4EF6\u65E0\u6548\uFF0C\u8DF3\u8FC7`);
        continue;
      }
      const materialType = detectMaterialType(file);
      try {
        logger_default.info(`Seedance: \u5F00\u59CB\u4E0A\u4F20\u7B2C ${i + 1} \u4E2A\u6587\u4EF6 (${materialType}): ${file.originalFilename || file.filepath}`);
        const buffer = fs7.readFileSync(file.filepath);
        if (materialType === "image") {
          const imageUri = await uploadImageBufferForVideo(buffer, refreshToken);
          if (imageUri) {
            uploadedMaterials.push({ type: "image", uri: imageUri, width, height });
            logger_default.info(`Seedance: \u7B2C ${i + 1} \u4E2A\u56FE\u7247\u4E0A\u4F20\u6210\u529F: ${imageUri}`);
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
          logger_default.info(`Seedance: \u7B2C ${i + 1} \u4E2A${materialType === "video" ? "\u89C6\u9891" : "\u97F3\u9891"}\u4E0A\u4F20\u6210\u529F: ${vodResult.vid}`);
        }
      } catch (error) {
        logger_default.error(`Seedance: \u7B2C ${i + 1} \u4E2A\u6587\u4EF6\u4E0A\u4F20\u5931\u8D25: ${error.message}`);
        if (i === 0) {
          throw new APIException(exceptions_default.API_REQUEST_FAILED, `\u9996\u4E2A\u6587\u4EF6\u4E0A\u4F20\u5931\u8D25: ${error.message}`);
        }
      }
    }
  } else if (filePaths && filePaths.length > 0) {
    logger_default.info(`Seedance: \u5F00\u59CB\u4E0A\u4F20 ${filePaths.length} \u4E2A\u6587\u4EF6`);
    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i];
      if (!filePath) continue;
      const materialType = detectMaterialTypeFromUrl(filePath);
      try {
        logger_default.info(`Seedance: \u5F00\u59CB\u4E0A\u4F20\u7B2C ${i + 1} \u4E2A\u6587\u4EF6 (${materialType}): ${filePath}`);
        if (materialType === "image") {
          const imageUri = await uploadImageForVideo(filePath, refreshToken);
          if (imageUri) {
            uploadedMaterials.push({ type: "image", uri: imageUri, width, height });
            logger_default.info(`Seedance: \u7B2C ${i + 1} \u4E2A\u56FE\u7247\u4E0A\u4F20\u6210\u529F: ${imageUri}`);
          }
        } else {
          const response = await fetch(filePath);
          if (!response.ok) throw new Error(`\u4E0B\u8F7D\u6587\u4EF6\u5931\u8D25: ${response.status}`);
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
          logger_default.info(`Seedance: \u7B2C ${i + 1} \u4E2A${materialType === "video" ? "\u89C6\u9891" : "\u97F3\u9891"}\u4E0A\u4F20\u6210\u529F: ${vodResult.vid}`);
        }
      } catch (error) {
        logger_default.error(`Seedance: \u7B2C ${i + 1} \u4E2A\u6587\u4EF6\u4E0A\u4F20\u5931\u8D25: ${error.message}`);
        if (i === 0) {
          throw new APIException(exceptions_default.API_REQUEST_FAILED, `\u9996\u4E2A\u6587\u4EF6\u4E0A\u4F20\u5931\u8D25: ${error.message}`);
        }
      }
    }
  }
  if (uploadedMaterials.length === 0) {
    throw new APIException(exceptions_default.API_REQUEST_FAILED, "Seedance 2.0 \u9700\u8981\u81F3\u5C11\u4E00\u4E2A\u6587\u4EF6\uFF08\u56FE\u7247/\u89C6\u9891/\u97F3\u9891\uFF09");
  }
  logger_default.info(`Seedance: \u6210\u529F\u4E0A\u4F20 ${uploadedMaterials.length} \u4E2A\u6587\u4EF6`);
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
    commerce_with_input_video: "1",
    web_version: "7.5.0",
    aigc_features: "app_lip_sync"
  });
  const generateUrl = `https://jimeng.jianying.com/mweb/v1/aigc_draft/generate?${generateQueryParams.toString()}`;
  const generateBody = {
    extend: {
      root_model: model,
      workspace_id: 0,
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
  logger_default.info(`Seedance: \u901A\u8FC7\u6D4F\u89C8\u5668\u4EE3\u7406\u53D1\u9001 generate \u8BF7\u6C42...`);
  const generateResult = await browser_service_default.fetch(
    token,
    generateUrl,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(generateBody)
    }
  );
  const { ret, errmsg, data: generateData } = generateResult;
  if (ret !== void 0 && Number(ret) !== 0) {
    if (Number(ret) === 5e3) {
      throw new APIException(exceptions_default.API_IMAGE_GENERATION_INSUFFICIENT_POINTS, `[\u65E0\u6CD5\u751F\u6210\u89C6\u9891]: \u5373\u68A6\u79EF\u5206\u53EF\u80FD\u4E0D\u8DB3\uFF0C${errmsg}`);
    }
    throw new APIException(exceptions_default.API_REQUEST_FAILED, `[\u8BF7\u6C42jimeng\u5931\u8D25]: ${errmsg}`);
  }
  const aigc_data = (generateData == null ? void 0 : generateData.aigc_data) || generateResult.aigc_data;
  const historyId = aigc_data.history_record_id;
  if (!historyId)
    throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u8BB0\u5F55ID\u4E0D\u5B58\u5728");
  let status = 20, failCode, item_list = [];
  let retryCount = 0;
  const maxRetries = 120;
  await new Promise((resolve) => setTimeout(resolve, 5e3));
  logger_default.info(`Seedance: \u5F00\u59CB\u8F6E\u8BE2\u89C6\u9891\u751F\u6210\u7ED3\u679C\uFF0C\u5386\u53F2ID: ${historyId}`);
  while (status === 20 && retryCount < maxRetries) {
    try {
      const result = await request("post", "/mweb/v1/get_history_by_ids", refreshToken, {
        data: { history_ids: [historyId] }
      });
      const responseStr = JSON.stringify(result);
      logger_default.info(`Seedance: \u8F6E\u8BE2\u54CD\u5E94\u6458\u8981: ${responseStr.substring(0, 300)}...`);
      let historyData = ((_a = result.history_list) == null ? void 0 : _a[0]) || result[historyId];
      if (!historyData) {
        retryCount++;
        const waitTime = Math.min(2e3 * (retryCount + 1), 3e4);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }
      status = historyData.status;
      failCode = historyData.fail_code;
      item_list = historyData.item_list || [];
      logger_default.info(`Seedance: \u72B6\u6001=${status}, \u5931\u8D25\u7801=${failCode || "\u65E0"}`);
      if (status === 30) {
        const error = failCode === 2038 ? new APIException(exceptions_default.API_CONTENT_FILTERED, "\u5185\u5BB9\u88AB\u8FC7\u6EE4") : new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, `\u751F\u6210\u5931\u8D25\uFF0C\u9519\u8BEF\u7801: ${failCode}`);
        error.historyId = historyId;
        throw error;
      }
      if (status === 20) {
        const waitTime = 2e3 * Math.min(retryCount + 1, 5);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
      retryCount++;
    } catch (error) {
      if (error instanceof APIException) throw error;
      logger_default.error(`Seedance: \u8F6E\u8BE2\u51FA\u9519: ${error.message}`);
      retryCount++;
      await new Promise((resolve) => setTimeout(resolve, 2e3 * (retryCount + 1)));
    }
  }
  if (retryCount >= maxRetries && status === 20) {
    const error = new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u89C6\u9891\u751F\u6210\u8D85\u65F6");
    error.historyId = historyId;
    throw error;
  }
  const seedanceItemId = ((_b = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _b.item_id) || ((_c = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _c.id) || ((_d = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _d.local_item_id) || ((_f = (_e = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _e.common_attr) == null ? void 0 : _f.id);
  if (seedanceItemId) {
    try {
      const hqVideoUrl = await fetchHighQualityVideoUrl(String(seedanceItemId), refreshToken);
      if (hqVideoUrl) {
        logger_default.info(`Seedance: \u89C6\u9891\u751F\u6210\u6210\u529F\uFF08\u9AD8\u8D28\u91CF\uFF09\uFF0CURL: ${hqVideoUrl}`);
        return hqVideoUrl;
      }
    } catch (error) {
      logger_default.warn(`Seedance: \u83B7\u53D6\u9AD8\u8D28\u91CF\u89C6\u9891URL\u5931\u8D25\uFF0C\u5C06\u4F7F\u7528\u9884\u89C8URL\u4F5C\u4E3A\u56DE\u9000: ${error.message}`);
    }
  } else {
    logger_default.warn(`Seedance: \u672A\u80FD\u4ECEitem_list\u4E2D\u63D0\u53D6item_id\uFF0C\u5C06\u4F7F\u7528\u9884\u89C8URL\u3002item_list[0]\u952E: ${(item_list == null ? void 0 : item_list[0]) ? Object.keys(item_list[0]).join(", ") : "\u65E0"}`);
  }
  let videoUrl = ((_j = (_i = (_h = (_g = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _g.video) == null ? void 0 : _h.transcoded_video) == null ? void 0 : _i.origin) == null ? void 0 : _j.video_url) || ((_l = (_k = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _k.video) == null ? void 0 : _l.play_url) || ((_n = (_m = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _m.video) == null ? void 0 : _n.download_url) || ((_p = (_o = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _o.video) == null ? void 0 : _p.url);
  if (!videoUrl) {
    const error = new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u672A\u80FD\u83B7\u53D6\u89C6\u9891URL");
    error.historyId = historyId;
    throw error;
  }
  logger_default.info(`Seedance: \u89C6\u9891\u751F\u6210\u6210\u529F\uFF0CURL: ${videoUrl}`);
  return videoUrl;
}
function getCanonicalMaterialEntries(materialRegistry) {
  return [...new Map([...materialRegistry].filter(([key, value]) => key === value.fieldName)).values()].sort((a, b) => a.idx - b.idx);
}
async function pollHistoryForVideoUrl(historyId, refreshToken) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w;
  const regionInfo = parseRegionFromToken(refreshToken);
  let status = 20, failCode, item_list = [];
  let retryCount = 0;
  const maxRetries = 120;
  await new Promise((resolve) => setTimeout(resolve, 5e3));
  while (status === 20 && retryCount < maxRetries) {
    try {
      const result = await request("post", "/mweb/v1/get_history_by_ids", refreshToken, {
        data: {
          history_ids: [historyId],
          ...regionInfo.isInternational ? { http_common_info: { aid: getAssistantId(regionInfo) } } : {}
        }
      });
      const historyData = ((_a = result.history_list) == null ? void 0 : _a[0]) || result[historyId] || ((_c = (_b = result.data) == null ? void 0 : _b.history_list) == null ? void 0 : _c[0]);
      if (!historyData) {
        retryCount++;
        const waitTime = Math.min(2e3 * (retryCount + 1), 3e4);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }
      status = historyData.status;
      failCode = historyData.fail_code;
      item_list = historyData.item_list || historyData.items || [];
      if (status === 30 || status === 3) {
        const error = failCode === 2038 ? new APIException(exceptions_default.API_CONTENT_FILTERED, "\u5185\u5BB9\u88AB\u8FC7\u6EE4") : new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, `\u751F\u6210\u5931\u8D25\uFF0C\u9519\u8BEF\u7801: ${failCode}`);
        error.historyId = historyId;
        throw error;
      }
      if (status === 20 || status === 1) {
        const waitTime = 2e3 * Math.min(retryCount + 1, 5);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
      retryCount++;
    } catch (error) {
      if (error instanceof APIException) throw error;
      retryCount++;
      await new Promise((resolve) => setTimeout(resolve, 2e3 * (retryCount + 1)));
    }
  }
  if (retryCount >= maxRetries && (status === 20 || status === 1)) {
    const error = new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u89C6\u9891\u751F\u6210\u8D85\u65F6");
    error.historyId = historyId;
    throw error;
  }
  const itemId = ((_d = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _d.item_id) || ((_e = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _e.id) || ((_f = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _f.local_item_id) || ((_h = (_g = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _g.common_attr) == null ? void 0 : _h.id);
  if (itemId) {
    try {
      const hqVideoUrl = await fetchHighQualityVideoUrl(String(itemId), refreshToken);
      if (hqVideoUrl) return hqVideoUrl;
    } catch (error) {
      logger_default.warn(`\u83B7\u53D6\u9AD8\u8D28\u91CF\u89C6\u9891URL\u5931\u8D25\uFF0C\u5C06\u4F7F\u7528\u9884\u89C8URL\u4F5C\u4E3A\u56DE\u9000: ${error.message}`);
    }
  }
  const videoUrl = ((_l = (_k = (_j = (_i = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _i.common_attr) == null ? void 0 : _j.transcoded_video) == null ? void 0 : _k.origin) == null ? void 0 : _l.video_url) || ((_m = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _m.result_url) || ((_q = (_p = (_o = (_n = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _n.video) == null ? void 0 : _o.transcoded_video) == null ? void 0 : _p.origin) == null ? void 0 : _q.video_url) || ((_s = (_r = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _r.video) == null ? void 0 : _s.play_url) || ((_u = (_t = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _t.video) == null ? void 0 : _u.download_url) || ((_w = (_v = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _v.video) == null ? void 0 : _w.url);
  if (!videoUrl) {
    const error = new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u672A\u80FD\u83B7\u53D6\u89C6\u9891URL");
    error.historyId = historyId;
    throw error;
  }
  return videoUrl;
}
function parseOmniPrompt(prompt, materialRegistry) {
  const refNames = [...materialRegistry.keys()].sort((a, b) => b.length - a.length).map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (refNames.length === 0) {
    return [{ meta_type: "text", text: prompt }];
  }
  const buildMaterialRef = (entry) => {
    var _a;
    if (entry.type === "image" && entry.imageUri) {
      return { uri: entry.imageUri };
    }
    if (entry.type === "video" && ((_a = entry.videoResult) == null ? void 0 : _a.vid)) {
      return { vid: entry.videoResult.vid };
    }
    return { material_idx: entry.idx };
  };
  const pattern = new RegExp(`@(${refNames.join("|")})`, "g");
  const meta_list = [];
  let lastIndex = 0;
  let match;
  while ((match = pattern.exec(prompt)) !== null) {
    if (match.index > lastIndex) {
      const textSegment = prompt.slice(lastIndex, match.index);
      if (textSegment) {
        meta_list.push({ meta_type: "text", text: textSegment });
      }
    }
    const refName = match[1];
    const entry = materialRegistry.get(refName);
    if (entry) {
      meta_list.push({
        meta_type: entry.type,
        text: "",
        material_ref: buildMaterialRef(entry)
      });
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < prompt.length) {
    meta_list.push({ meta_type: "text", text: prompt.slice(lastIndex) });
  }
  if (meta_list.length === 0) {
    meta_list.push({ meta_type: "text", text: prompt });
  }
  return meta_list;
}
function collectInternationalMaterialFields(filesMap, body) {
  const imageFields = [];
  const videoFields = [];
  for (const fieldName of Object.keys(filesMap || {})) {
    if (fieldName === "image_file" || fieldName.startsWith("image_file_")) imageFields.push(fieldName);
    if (fieldName === "video_file" || fieldName.startsWith("video_file_")) videoFields.push(fieldName);
  }
  for (let i = 1; i <= 9; i++) {
    const fieldName = `image_file_${i}`;
    if (typeof (body == null ? void 0 : body[fieldName]) === "string" && body[fieldName].startsWith("http") && !imageFields.includes(fieldName)) imageFields.push(fieldName);
  }
  for (let i = 1; i <= 3; i++) {
    const fieldName = `video_file_${i}`;
    if (typeof (body == null ? void 0 : body[fieldName]) === "string" && body[fieldName].startsWith("http") && !videoFields.includes(fieldName)) videoFields.push(fieldName);
  }
  if (typeof (body == null ? void 0 : body.image_file) === "string" && body.image_file.startsWith("http") && !imageFields.includes("image_file")) imageFields.push("image_file");
  if (typeof (body == null ? void 0 : body.video_file) === "string" && body.video_file.startsWith("http") && !videoFields.includes("video_file")) videoFields.push("video_file");
  return { imageFields, videoFields };
}
async function uploadInternationalImageUrl(imageUrl, refreshToken, regionInfo) {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`\u4E0B\u8F7D\u56FE\u7247\u5931\u8D25: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  return uploadImageBufferForVideo(buffer, refreshToken, regionInfo);
}
async function uploadInternationalVideoUrl(videoUrl, refreshToken, regionInfo) {
  const response = await fetch(videoUrl);
  if (!response.ok) throw new Error(`\u4E0B\u8F7D\u89C6\u9891\u5931\u8D25: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  return uploadMediaForVideo(buffer, "video", refreshToken, void 0, regionInfo);
}
async function generateInternationalVideoCore(_model, prompt = "", {
  ratio = "1:1",
  resolution = "720p",
  duration = 5,
  filePaths = [],
  files = []
}, refreshToken, onHistoryId) {
  if (!Object.prototype.hasOwnProperty.call(INTERNATIONAL_VIDEO_MODEL_MAP, _model)) {
    throw new APIException(exceptions_default.API_REQUEST_PARAMS_INVALID, `\u56FD\u9645\u63A5\u53E3\u6682\u4E0D\u652F\u6301\u6A21\u578B: ${_model}`);
  }
  const regionInfo = parseRegionFromToken(refreshToken);
  if (regionInfo.isCN) {
    throw new APIException(exceptions_default.API_REQUEST_FAILED, "\u56FD\u9645\u89C6\u9891\u63A5\u53E3\u4EC5\u63A5\u53D7\u56FD\u9645 token\uFF08hk-/jp-/sg-/al-/az-/bh-/ca-/cl-/de-/gb-/gy-/il-/iq-/it-/jo-/kg-/om-/pk-/pt-/sa-/se-/tr-/tz-/uz-/ve-/xk-\uFF09");
  }
  const model = getInternationalVideoModel(_model);
  const assistantId = getAssistantId(regionInfo);
  const { width, height } = resolveVideoResolution(resolution, ratio);
  const draftVersion = getInternationalVideoDraftVersion(_model);
  logger_default.info(`\u56FD\u9645\u666E\u901A\u89C6\u9891\u751F\u6210: \u6A21\u578B=${_model} \u6620\u5C04=${model} ${width}x${height} (${ratio}@${resolution}) \u65F6\u957F=${duration}\u79D2`);
  const { totalCredit } = await getCredit(refreshToken);
  if (totalCredit <= 0) await receiveCredit(refreshToken);
  await request("post", "/mweb/v1/workspace/update", refreshToken, {
    params: {
      os: "windows",
      web_version: "7.5.0",
      da_version: draftVersion,
      aigc_features: "app_lip_sync"
    },
    data: { workspace_id: 0 },
    headers: { Referer: "https://dreamina.capcut.com/" }
  });
  let first_frame_image = void 0;
  let end_frame_image = void 0;
  if (files && files.length > 0) {
    const uploadIDs = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file || !file.filepath) continue;
      try {
        const buffer = fs7.readFileSync(file.filepath);
        const imageUri = await uploadImageBufferForVideo(buffer, refreshToken, regionInfo);
        if (imageUri) uploadIDs.push(imageUri);
      } catch (error) {
        if (i === 0) throw new APIException(exceptions_default.API_REQUEST_FAILED, `\u9996\u5E27\u6587\u4EF6\u4E0A\u4F20\u5931\u8D25: ${error.message}`);
      }
    }
    if (uploadIDs.length === 0) throw new APIException(exceptions_default.API_REQUEST_FAILED, "\u6240\u6709\u6587\u4EF6\u4E0A\u4F20\u5931\u8D25");
    if (uploadIDs[0]) {
      first_frame_image = { format: "", height, id: util_default.uuid(), image_uri: uploadIDs[0], name: "", platform_type: 1, source_from: "upload", type: "image", uri: uploadIDs[0], width };
    }
    if (uploadIDs[1]) {
      end_frame_image = { format: "", height, id: util_default.uuid(), image_uri: uploadIDs[1], name: "", platform_type: 1, source_from: "upload", type: "image", uri: uploadIDs[1], width };
    }
  } else if (filePaths && filePaths.length > 0) {
    const uploadIDs = [];
    for (let i = 0; i < filePaths.length; i++) {
      if (!filePaths[i]) continue;
      try {
        const imageUri = await uploadImageForVideo(filePaths[i], refreshToken, regionInfo);
        if (imageUri) uploadIDs.push(imageUri);
      } catch (error) {
        if (i === 0) throw new APIException(exceptions_default.API_REQUEST_FAILED, `\u9996\u5E27\u56FE\u7247\u4E0A\u4F20\u5931\u8D25: ${error.message}`);
      }
    }
    if (uploadIDs.length === 0) throw new APIException(exceptions_default.API_REQUEST_FAILED, "\u6240\u6709\u56FE\u7247\u4E0A\u4F20\u5931\u8D25");
    if (uploadIDs[0]) {
      first_frame_image = { format: "", height, id: util_default.uuid(), image_uri: uploadIDs[0], name: "", platform_type: 1, source_from: "upload", type: "image", uri: uploadIDs[0], width };
    }
    if (uploadIDs[1]) {
      end_frame_image = { format: "", height, id: util_default.uuid(), image_uri: uploadIDs[1], name: "", platform_type: 1, source_from: "upload", type: "image", uri: uploadIDs[1], width };
    }
  }
  const componentId = util_default.uuid();
  const submitId = util_default.uuid();
  const metricsExtra = JSON.stringify({
    promptSource: "custom",
    isDefaultSeed: 1,
    originSubmitId: submitId,
    isRegenerate: false,
    enterFrom: "click",
    position: "page_bottom_box",
    functionMode: "first_last_frames",
    sceneOptions: JSON.stringify([{
      type: "video",
      scene: "BasicVideoGenerateButton",
      resolution,
      modelReqKey: model,
      videoDuration: duration,
      reportParams: {
        enterSource: "generate",
        vipSource: "generate",
        extraVipFunctionKey: `${model}-${resolution}`,
        useVipFunctionDetailsReporterHoc: true
      },
      materialTypes: []
    }])
  });
  const aspectRatio = ratio;
  const internationalVideoReferer = regionInfo.isUS ? "https://dreamina-api.us.capcut.com/ai-tool/generate?type=video" : "https://dreamina.capcut.com/ai-tool/generate?type=video";
  const { aigc_data } = await request("post", "/mweb/v1/aigc_draft/generate", refreshToken, {
    params: {
      aigc_features: "app_lip_sync",
      commerce_with_input_video: "1",
      web_version: "7.5.0",
      da_version: draftVersion
    },
    data: {
      extend: {
        root_model: end_frame_image ? INTERNATIONAL_VIDEO_MODEL_MAP["jimeng-video-3.0"] : model,
        m_video_commerce_info: {
          benefit_type: getVideoBenefitType(model),
          resource_id: "generate_video",
          resource_id_type: "str",
          resource_sub_type: "aigc"
        },
        workspace_id: 0,
        m_video_commerce_info_list: [{
          benefit_type: getVideoBenefitType(model),
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
        min_version: "3.0.5",
        min_features: [],
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
            created_time_in_ms: Date.now().toString(),
            created_did: ""
          },
          generate_type: "gen_video",
          abilities: {
            type: "",
            id: util_default.uuid(),
            gen_video: {
              id: util_default.uuid(),
              type: "",
              text_to_video_params: {
                type: "",
                id: util_default.uuid(),
                model_req_key: model,
                priority: 0,
                seed: Math.floor(Math.random() * 4294967296),
                video_aspect_ratio: aspectRatio,
                video_gen_inputs: [{
                  duration_ms: duration * 1e3,
                  first_frame_image,
                  end_frame_image,
                  fps: 24,
                  id: util_default.uuid(),
                  min_version: "3.0.5",
                  prompt,
                  resolution,
                  type: "",
                  video_mode: 2,
                  idip_meta_list: []
                }]
              },
              video_task_extra: metricsExtra
            }
          },
          process_type: 1
        }]
      }),
      http_common_info: { aid: assistantId }
    },
    headers: { Referer: "https://dreamina.capcut.com/" }
  });
  const historyId = aigc_data == null ? void 0 : aigc_data.history_record_id;
  if (!historyId) throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u8BB0\u5F55ID\u4E0D\u5B58\u5728");
  if (onHistoryId) onHistoryId(historyId);
  const videoUrl = await pollHistoryForVideoUrl(historyId, refreshToken);
  return { url: videoUrl, historyId };
}
async function generateInternationalVideo(_model, prompt = "", options, refreshToken) {
  const { url } = await generateInternationalVideoCore(_model, prompt, options, refreshToken);
  return url;
}
async function generateInternationalSeedanceVideo(_model, prompt = "", {
  ratio = "4:3",
  resolution = "720p",
  duration = 4,
  filePaths = [],
  filesMap = {},
  body = {}
}, refreshToken) {
  var _a, _b, _c;
  if (!isInternationalSeedanceModel(_model)) {
    throw new APIException(exceptions_default.API_REQUEST_PARAMS_INVALID, `\u56FD\u9645\u63A5\u53E3\u6682\u4E0D\u652F\u6301\u6A21\u578B: ${_model}`);
  }
  const regionInfo = parseRegionFromToken(refreshToken);
  if (regionInfo.isCN) throw new APIException(exceptions_default.API_REQUEST_FAILED, "\u56FD\u9645 Seedance \u63A5\u53E3\u4EC5\u63A5\u53D7\u56FD\u9645 token\uFF08hk-/jp-/sg-/al-/az-/bh-/ca-/cl-/de-/gb-/gy-/iq-/it-/jo-/kg-/om-/pk-/sa-/se-/tr-/tz-/ve-\uFF09");
  if (regionInfo.isUS) throw new APIException(exceptions_default.API_REQUEST_FAILED, "US token \u6682\u4E0D\u652F\u6301\u56FD\u9645 Seedance 2.0 / 2.0-fast");
  const actualDuration = Math.max(4, Math.min(15, duration));
  const { width, height } = resolveVideoResolution(resolution, ratio);
  const model = INTERNATIONAL_SEEDANCE_MODEL_MAP[_model];
  const assistantId = getAssistantId(regionInfo);
  const seed = Math.floor(Math.random() * 4294967296);
  const isFastModel = _model === "seedance-2.0-fast" || _model === "jimeng-video-seedance-2.0-fast";
  const { totalCredit } = await getCredit(refreshToken);
  if (totalCredit <= 0 && !isFastModel) {
    throw new APIException(
      exceptions_default.API_IMAGE_GENERATION_INSUFFICIENT_POINTS,
      "\u56FD\u9645 Seedance \u8D26\u6237\u79EF\u5206\u4E0D\u8DB3"
    );
  }
  if (totalCredit <= 0 && isFastModel) {
    logger_default.info("\u56FD\u9645 Seedance-fast \u5F53\u524D\u79EF\u5206\u4E3A 0\uFF0C\u4ECD\u7EE7\u7EED\u5C1D\u8BD5\u751F\u6210");
  }
  await request("post", "/mweb/v1/update_settings", refreshToken, {
    data: {
      custom_settings: {
        aigc_compliance_confirmed: true
      }
    }
  });
  const materialRegistry = /* @__PURE__ */ new Map();
  const promptHasExplicitRefs = /@(?:[A-Za-z_][A-Za-z0-9_]*|(?:图|image)?\d+)/.test(prompt || "");
  let materialIdx = 0;
  const canonicalKeys = /* @__PURE__ */ new Set(["image_file", "video_file"]);
  for (let i = 1; i <= 9; i++) canonicalKeys.add(`image_file_${i}`);
  for (let i = 1; i <= 3; i++) canonicalKeys.add(`video_file_${i}`);
  const registerAlias = (name, entry) => {
    if (name && !canonicalKeys.has(name) && !materialRegistry.has(name)) materialRegistry.set(name, entry);
  };
  const { imageFields, videoFields } = collectInternationalMaterialFields(filesMap, body);
  if (imageFields.length + videoFields.length + filePaths.length === 0) throw new APIException(exceptions_default.API_REQUEST_FAILED, "\u56FD\u9645 Seedance \u63A5\u53E3\u81F3\u5C11\u9700\u8981\u4E00\u4E2A\u7D20\u6750");
  if (imageFields.length + filePaths.length > 9) throw new APIException(exceptions_default.API_REQUEST_FAILED, "\u56FE\u7247\u7D20\u6750\u6700\u591A 9 \u4E2A");
  if (videoFields.length > 3) throw new APIException(exceptions_default.API_REQUEST_FAILED, "\u89C6\u9891\u7D20\u6750\u6700\u591A 3 \u4E2A");
  if (imageFields.length + videoFields.length + filePaths.length > 12) throw new APIException(exceptions_default.API_REQUEST_FAILED, "\u7D20\u6750\u603B\u6570\u6700\u591A 12 \u4E2A");
  for (const fieldName of imageFields) {
    const imageFile = (_a = filesMap == null ? void 0 : filesMap[fieldName]) == null ? void 0 : _a[0];
    const imageUrl = body == null ? void 0 : body[fieldName];
    const imageUri = imageFile ? await uploadImageBufferForVideo(fs7.readFileSync(imageFile.filepath), refreshToken, regionInfo) : await uploadInternationalImageUrl(imageUrl, refreshToken, regionInfo);
    const entry = { idx: materialIdx++, type: "image", fieldName, imageUri, imageWidth: width, imageHeight: height };
    materialRegistry.set(fieldName, entry);
    if (imageFile == null ? void 0 : imageFile.originalFilename) registerAlias(imageFile.originalFilename, entry);
  }
  let slotIndex = 1;
  for (const url of filePaths) {
    while (slotIndex <= 9 && materialRegistry.has(`image_file_${slotIndex}`)) slotIndex++;
    if (slotIndex > 9) break;
    const fieldName = `image_file_${slotIndex}`;
    const imageUri = await uploadInternationalImageUrl(url, refreshToken, regionInfo);
    materialRegistry.set(fieldName, { idx: materialIdx++, type: "image", fieldName, imageUri, imageWidth: width, imageHeight: height });
    slotIndex++;
  }
  for (const fieldName of videoFields) {
    const videoFile = (_b = filesMap == null ? void 0 : filesMap[fieldName]) == null ? void 0 : _b[0];
    const videoUrl = body == null ? void 0 : body[fieldName];
    const vodResult = videoFile ? await uploadMediaForVideo(fs7.readFileSync(videoFile.filepath), "video", refreshToken, videoFile.originalFilename, regionInfo) : await uploadInternationalVideoUrl(videoUrl, refreshToken, regionInfo);
    const entry = { idx: materialIdx++, type: "video", fieldName, videoResult: { vid: vodResult.vid, width: vodResult.width || 0, height: vodResult.height || 0, duration: vodResult.duration || 0, fps: vodResult.fps || 0 } };
    materialRegistry.set(fieldName, entry);
    if (videoFile == null ? void 0 : videoFile.originalFilename) registerAlias(videoFile.originalFilename, entry);
  }
  const orderedEntries = getCanonicalMaterialEntries(materialRegistry);
  const materialList = orderedEntries.map((entry) => {
    const base = { type: "", id: util_default.uuid() };
    if (entry.type === "image") {
      return {
        ...base,
        material_type: "image",
        image_info: {
          type: "image",
          id: util_default.uuid(),
          source_from: "upload",
          platform_type: 1,
          name: "",
          image_uri: entry.imageUri,
          aigc_image: { type: "", id: util_default.uuid() },
          width: entry.imageWidth || 0,
          height: entry.imageHeight || 0,
          format: "",
          uri: entry.imageUri
        }
      };
    }
    return {
      ...base,
      material_type: "video",
      video_info: {
        type: "video",
        id: util_default.uuid(),
        source_from: "upload",
        name: "",
        vid: entry.videoResult.vid,
        fps: entry.videoResult.fps,
        width: entry.videoResult.width,
        height: entry.videoResult.height,
        duration: entry.videoResult.duration
      }
    };
  });
  const materialTypes = [];
  for (const entry of orderedEntries) {
    if (entry.type === "image") {
      materialTypes.push(1);
    } else {
      materialTypes.push(2);
    }
  }
  const meta_list = parseOmniPrompt(prompt || "", materialRegistry);
  if (!promptHasExplicitRefs && meta_list.every((item) => item.meta_type === "text")) {
    for (const entry of orderedEntries) {
      meta_list.unshift({
        meta_type: entry.type,
        text: "",
        material_ref: entry.type === "image" ? { uri: entry.imageUri } : { vid: (_c = entry.videoResult) == null ? void 0 : _c.vid }
      });
    }
  }
  const componentId = util_default.uuid();
  const submitId = util_default.uuid();
  const metricsExtra = JSON.stringify({ position: "page_bottom_box", isDefaultSeed: 1, originSubmitId: submitId, isRegenerate: false, enterFrom: "click", functionMode: "omni_reference", sceneOptions: JSON.stringify([{ type: "video", scene: "BasicVideoGenerateButton", modelReqKey: model, videoDuration: actualDuration, materialTypes }]) });
  const draftContent = JSON.stringify({
    type: "draft",
    id: util_default.uuid(),
    min_version: "3.3.9",
    min_features: ["AIGC_Video_UnifiedEdit"],
    is_from_tsn: true,
    version: "3.3.12",
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
              min_version: "3.3.9",
              prompt: "",
              video_mode: 2,
              fps: 24,
              duration_ms: actualDuration * 1e3,
              idip_meta_list: [],
              unified_edit_input: {
                type: "",
                id: util_default.uuid(),
                material_list: materialList,
                meta_list
              }
            }],
            video_aspect_ratio: ratio,
            seed,
            model_req_key: model,
            priority: 0
          },
          video_task_extra: metricsExtra
        }
      },
      process_type: 1
    }]
  });
  const baseUrl = "https://mweb-api-sg.capcut.com";
  const generateQueryParams = new URLSearchParams({
    aid: String(assistantId),
    device_platform: "web",
    region: regionInfo.regionCode,
    os: "windows",
    commerce_with_input_video: "1",
    web_component_open_flag: "1",
    web_version: "7.5.0",
    aigc_features: "app_lip_sync",
    da_version: "3.3.12"
  });
  const generateUrl = `${baseUrl}/mweb/v1/aigc_draft/generate?${generateQueryParams.toString()}`;
  const generateBody = {
    submit_id: submitId,
    extend: {
      root_model: model,
      workspace_id: 0,
      m_video_commerce_info: {
        benefit_type: INTERNATIONAL_SEEDANCE_BENEFIT_TYPE_MAP[_model],
        resource_id: "generate_video",
        resource_id_type: "str",
        resource_sub_type: "aigc"
      },
      m_video_commerce_info_list: [{
        benefit_type: INTERNATIONAL_SEEDANCE_BENEFIT_TYPE_MAP[_model],
        resource_id: "generate_video",
        resource_id_type: "str",
        resource_sub_type: "aigc"
      }]
    },
    metrics_extra: metricsExtra,
    draft_content: draftContent,
    http_common_info: { aid: assistantId }
  };
  const token = await acquireToken(refreshToken);
  logger_default.info(`\u56FD\u9645 Seedance generate payload: ${JSON.stringify(generateBody)}`);
  logger_default.info(`\u56FD\u9645 Seedance: \u53D1\u9001 generate \u8BF7\u6C42\uFF08\u4F7F\u7528 X-Bogus/X-Gnarly \u7B7E\u540D\uFF09...`);
  const { aigc_data: generateData } = await request(
    "post",
    "/mweb/v1/aigc_draft/generate",
    refreshToken,
    {
      data: generateBody
    }
  );
  const historyId = generateData == null ? void 0 : generateData.history_record_id;
  if (!historyId) {
    throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, `\u8BB0\u5F55ID\u4E0D\u5B58\u5728: ${JSON.stringify(generateData)}`);
  }
  logger_default.info(`\u56FD\u9645 Seedance: \u89C6\u9891\u751F\u6210\u4EFB\u52A1\u5DF2\u63D0\u4EA4\uFF0Chistory_id: ${historyId}`);
  return pollHistoryForVideoUrl(historyId, refreshToken);
}
async function _generateInternationalSeedanceVideoWithHistoryId(_model, prompt, {
  ratio = "4:3",
  resolution = "720p",
  duration = 4,
  filePaths = [],
  filesMap = {},
  body = {}
}, refreshToken, onHistoryId) {
  var _a, _b, _c;
  const regionInfo = parseRegionFromToken(refreshToken);
  if (regionInfo.isCN) throw new APIException(exceptions_default.API_REQUEST_FAILED, "\u56FD\u9645 Seedance \u63A5\u53E3\u4EC5\u63A5\u53D7\u56FD\u9645 token");
  if (regionInfo.isUS) throw new APIException(exceptions_default.API_REQUEST_FAILED, "US token \u6682\u4E0D\u652F\u6301\u56FD\u9645 Seedance 2.0 / 2.0-fast");
  const actualDuration = Math.max(4, Math.min(15, duration));
  const { width, height } = resolveVideoResolution(resolution, ratio);
  const model = INTERNATIONAL_SEEDANCE_MODEL_MAP[_model];
  const assistantId = getAssistantId(regionInfo);
  const seed = Math.floor(Math.random() * 4294967296);
  const isFastModel = _model === "seedance-2.0-fast" || _model === "jimeng-video-seedance-2.0-fast";
  const { totalCredit } = await getCredit(refreshToken);
  if (totalCredit <= 0 && !isFastModel) {
    throw new APIException(exceptions_default.API_IMAGE_GENERATION_INSUFFICIENT_POINTS, "\u56FD\u9645 Seedance \u8D26\u6237\u79EF\u5206\u4E0D\u8DB3");
  }
  await request("post", "/mweb/v1/update_settings", refreshToken, {
    data: { custom_settings: { aigc_compliance_confirmed: true } }
  });
  const materialRegistry = /* @__PURE__ */ new Map();
  const promptHasExplicitRefs = /@(?:[A-Za-z_][A-Za-z0-9_]*|(?:图|image)?\d+)/.test(prompt || "");
  let materialIdx = 0;
  const canonicalKeys = /* @__PURE__ */ new Set(["image_file", "video_file"]);
  for (let i = 1; i <= 9; i++) canonicalKeys.add(`image_file_${i}`);
  for (let i = 1; i <= 3; i++) canonicalKeys.add(`video_file_${i}`);
  const registerAlias = (name, entry) => {
    if (name && !canonicalKeys.has(name) && !materialRegistry.has(name)) materialRegistry.set(name, entry);
  };
  const { imageFields, videoFields } = collectInternationalMaterialFields(filesMap, body);
  for (const fieldName of imageFields) {
    const imageFile = (_a = filesMap == null ? void 0 : filesMap[fieldName]) == null ? void 0 : _a[0];
    const imageUrl = body == null ? void 0 : body[fieldName];
    const imageUri = imageFile ? await uploadImageBufferForVideo(fs7.readFileSync(imageFile.filepath), refreshToken, regionInfo) : await uploadInternationalImageUrl(imageUrl, refreshToken, regionInfo);
    const entry = { idx: materialIdx++, type: "image", fieldName, imageUri, imageWidth: width, imageHeight: height };
    materialRegistry.set(fieldName, entry);
    if (imageFile == null ? void 0 : imageFile.originalFilename) registerAlias(imageFile.originalFilename, entry);
  }
  let slotIndex = 1;
  for (const url of filePaths) {
    while (slotIndex <= 9 && materialRegistry.has(`image_file_${slotIndex}`)) slotIndex++;
    if (slotIndex > 9) break;
    const fieldName = `image_file_${slotIndex}`;
    const imageUri = await uploadInternationalImageUrl(url, refreshToken, regionInfo);
    materialRegistry.set(fieldName, { idx: materialIdx++, type: "image", fieldName, imageUri, imageWidth: width, imageHeight: height });
    slotIndex++;
  }
  for (const fieldName of videoFields) {
    const videoFile = (_b = filesMap == null ? void 0 : filesMap[fieldName]) == null ? void 0 : _b[0];
    const videoUrl2 = body == null ? void 0 : body[fieldName];
    const vodResult = videoFile ? await uploadMediaForVideo(fs7.readFileSync(videoFile.filepath), "video", refreshToken, videoFile.originalFilename, regionInfo) : await uploadInternationalVideoUrl(videoUrl2, refreshToken, regionInfo);
    const entry = { idx: materialIdx++, type: "video", fieldName, videoResult: { vid: vodResult.vid, width: vodResult.width || 0, height: vodResult.height || 0, duration: vodResult.duration || 0, fps: vodResult.fps || 0 } };
    materialRegistry.set(fieldName, entry);
    if (videoFile == null ? void 0 : videoFile.originalFilename) registerAlias(videoFile.originalFilename, entry);
  }
  const orderedEntries = getCanonicalMaterialEntries(materialRegistry);
  const materialList = orderedEntries.map((entry) => {
    const base = { type: "", id: util_default.uuid() };
    if (entry.type === "image") {
      return { ...base, material_type: "image", image_info: { type: "image", id: util_default.uuid(), source_from: "upload", platform_type: 1, name: "", image_uri: entry.imageUri, aigc_image: { type: "", id: util_default.uuid() }, width: entry.imageWidth || 0, height: entry.imageHeight || 0, format: "", uri: entry.imageUri } };
    }
    return { ...base, material_type: "video", video_info: { type: "video", id: util_default.uuid(), source_from: "upload", name: "", vid: entry.videoResult.vid, fps: entry.videoResult.fps, width: entry.videoResult.width, height: entry.videoResult.height, duration: entry.videoResult.duration } };
  });
  const materialTypes = orderedEntries.map((e) => e.type === "image" ? 1 : 2);
  const meta_list = parseOmniPrompt(prompt || "", materialRegistry);
  if (!promptHasExplicitRefs && meta_list.every((item) => item.meta_type === "text")) {
    for (const entry of orderedEntries) {
      meta_list.unshift({
        meta_type: entry.type,
        text: "",
        material_ref: entry.type === "image" ? { uri: entry.imageUri } : { vid: (_c = entry.videoResult) == null ? void 0 : _c.vid }
      });
    }
  }
  const componentId = util_default.uuid();
  const submitId = util_default.uuid();
  const metricsExtra = JSON.stringify({ position: "page_bottom_box", isDefaultSeed: 1, originSubmitId: submitId, isRegenerate: false, enterFrom: "click", functionMode: "omni_reference", sceneOptions: JSON.stringify([{ type: "video", scene: "BasicVideoGenerateButton", modelReqKey: model, videoDuration: actualDuration, materialTypes }]) });
  const draftContent = JSON.stringify({
    type: "draft",
    id: util_default.uuid(),
    min_version: "3.3.9",
    min_features: ["AIGC_Video_UnifiedEdit"],
    is_from_tsn: true,
    version: "3.3.12",
    main_component_id: componentId,
    component_list: [{ type: "video_base_component", id: componentId, min_version: "1.0.0", aigc_mode: "workbench", metadata: { type: "", id: util_default.uuid(), created_platform: 3, created_platform_version: "", created_time_in_ms: String(Date.now()), created_did: "" }, generate_type: "gen_video", abilities: { type: "", id: util_default.uuid(), gen_video: { type: "", id: util_default.uuid(), text_to_video_params: { type: "", id: util_default.uuid(), video_gen_inputs: [{ type: "", id: util_default.uuid(), min_version: "3.3.9", prompt: "", video_mode: 2, fps: 24, duration_ms: actualDuration * 1e3, idip_meta_list: [], unified_edit_input: { type: "", id: util_default.uuid(), material_list: materialList, meta_list } }], video_aspect_ratio: ratio, seed, model_req_key: model, priority: 0 }, video_task_extra: metricsExtra } }, process_type: 1 }]
  });
  const generateBody = {
    submit_id: submitId,
    extend: { root_model: model, workspace_id: 0, m_video_commerce_info: { benefit_type: INTERNATIONAL_SEEDANCE_BENEFIT_TYPE_MAP[_model], resource_id: "generate_video", resource_id_type: "str", resource_sub_type: "aigc" }, m_video_commerce_info_list: [{ benefit_type: INTERNATIONAL_SEEDANCE_BENEFIT_TYPE_MAP[_model], resource_id: "generate_video", resource_id_type: "str", resource_sub_type: "aigc" }] },
    metrics_extra: metricsExtra,
    draft_content: draftContent,
    http_common_info: { aid: assistantId }
  };
  logger_default.info(`\u5F02\u6B65\u4EFB\u52A1-\u56FD\u9645Seedance: \u53D1\u9001 generate \u8BF7\u6C42...`);
  const { aigc_data: generateData } = await request("post", "/mweb/v1/aigc_draft/generate", refreshToken, {
    params: {
      commerce_with_input_video: "1"
    },
    data: generateBody
  });
  const historyId = generateData == null ? void 0 : generateData.history_record_id;
  if (!historyId) throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, `\u8BB0\u5F55ID\u4E0D\u5B58\u5728: ${JSON.stringify(generateData)}`);
  logger_default.info(`\u5F02\u6B65\u4EFB\u52A1-\u56FD\u9645Seedance: \u751F\u6210\u8BF7\u6C42\u5DF2\u63D0\u4EA4, historyId=${historyId}`);
  if (onHistoryId) onHistoryId(historyId);
  const videoUrl = await pollHistoryForVideoUrl(historyId, refreshToken);
  return { url: videoUrl, historyId };
}
function submitInternationalAsyncVideoTask(model, prompt, options, refreshToken) {
  if (activeAsyncCount >= MAX_ASYNC_CONCURRENCY) {
    throw new APIException(exceptions_default.API_REQUEST_FAILED, `\u5F53\u524D\u5F02\u6B65\u4EFB\u52A1\u5E76\u53D1\u6570\u5DF2\u8FBE\u4E0A\u9650 (${MAX_ASYNC_CONCURRENCY})\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5`);
  }
  if (!fs7.existsSync(ASYNC_TASK_DIR)) {
    fs7.mkdirSync(ASYNC_TASK_DIR, { recursive: true });
  }
  const taskId = util_default.uuid();
  const task = {
    taskId,
    status: "processing",
    model,
    prompt,
    refreshToken,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  task._promise = new Promise((resolve) => {
    task._resolve = resolve;
  });
  asyncTaskStore.set(taskId, task);
  saveTaskToFile(task);
  activeAsyncCount++;
  logger_default.info(`\u56FD\u9645\u5F02\u6B65\u4EFB\u52A1\u5DF2\u521B\u5EFA: ${taskId}, \u6A21\u578B: ${model}, \u5F53\u524D\u5E76\u53D1: ${activeAsyncCount}/${MAX_ASYNC_CONCURRENCY}`);
  (async () => {
    try {
      let url;
      if (isInternationalSeedanceModel(model)) {
        const result = await _generateInternationalSeedanceVideoWithHistoryId(
          model,
          prompt,
          {
            ratio: options.ratio,
            resolution: options.resolution,
            duration: options.duration,
            filePaths: options.filePaths,
            filesMap: options.filesMap,
            body: options.body
          },
          refreshToken,
          (historyId) => {
            task.historyId = historyId;
            saveTaskToFile(task);
            logger_default.info(`\u56FD\u9645\u5F02\u6B65\u4EFB\u52A1: historyId \u5DF2\u4FDD\u5B58, ${taskId} -> ${historyId}`);
          }
        );
        url = result.url;
      } else {
        const result = await generateInternationalVideoCore(
          model,
          prompt,
          {
            ratio: options.ratio,
            resolution: options.resolution,
            duration: options.duration,
            filePaths: options.filePaths,
            files: options.files
          },
          refreshToken,
          (historyId) => {
            task.historyId = historyId;
            saveTaskToFile(task);
            logger_default.info(`\u56FD\u9645\u5F02\u6B65\u4EFB\u52A1-\u666E\u901A\u89C6\u9891: historyId \u5DF2\u4FDD\u5B58, ${taskId} -> ${historyId}`);
          }
        );
        url = result.url;
      }
      task.status = "succeeded";
      task.result = { url, revised_prompt: prompt };
      task.updatedAt = Date.now();
      saveTaskToFile(task);
      logger_default.info(`\u56FD\u9645\u5F02\u6B65\u4EFB\u52A1\u6210\u529F: ${taskId}, \u89C6\u9891URL: ${url}`);
    } catch (error) {
      const errorMsg = (error == null ? void 0 : error.message) || "";
      if (errorMsg.includes("\u8D85\u65F6")) {
        task.updatedAt = Date.now();
        saveTaskToFile(task);
        logger_default.warn(`\u56FD\u9645\u5F02\u6B65\u4EFB\u52A1\u540E\u53F0\u8F6E\u8BE2\u8D85\u65F6\uFF0C\u4FDD\u6301 processing \u72B6\u6001: ${taskId}, historyId=${task.historyId}`);
      } else {
        task.status = "failed";
        task.error = error instanceof APIException ? `[${error.code}] ${error.message}` : errorMsg || "\u672A\u77E5\u9519\u8BEF";
        task.updatedAt = Date.now();
        saveTaskToFile(task);
        logger_default.error(`\u56FD\u9645\u5F02\u6B65\u4EFB\u52A1\u5931\u8D25: ${taskId}, \u9519\u8BEF: ${task.error}`);
      }
    } finally {
      activeAsyncCount--;
      if (task._resolve) task._resolve();
    }
  })();
  return taskId;
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
      metaList.push({ meta_type: "text", text: "\u7D20\u6750\u751F\u6210\u89C6\u9891" });
    }
  }
  return metaList;
}
async function pollVideoResult(historyId, refreshToken, maxRetries = 120) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
  let status = 20, failCode, item_list = [];
  let retryCount = 0;
  logger_default.info(`\u8F6E\u8BE2\u89C6\u9891\u7ED3\u679C: historyId=${historyId}, maxRetries=${maxRetries}`);
  while (status === 20 && retryCount < maxRetries) {
    try {
      const result = await request("post", "/mweb/v1/get_history_by_ids", refreshToken, {
        data: { history_ids: [historyId] }
      });
      const responseStr = JSON.stringify(result);
      logger_default.info(`\u8F6E\u8BE2\u54CD\u5E94\u6458\u8981: ${responseStr.substring(0, 300)}...`);
      let historyData = ((_a = result.history_list) == null ? void 0 : _a[0]) || result[historyId];
      if (!historyData) {
        retryCount++;
        const waitTime = Math.min(2e3 * (retryCount + 1), 3e4);
        logger_default.info(`\u5386\u53F2\u8BB0\u5F55\u672A\u627E\u5230\uFF0C\u7B49\u5F85 ${waitTime}ms \u540E\u91CD\u8BD5 (${retryCount}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }
      status = historyData.status;
      failCode = historyData.fail_code;
      item_list = historyData.item_list || [];
      logger_default.info(`\u8F6E\u8BE2\u72B6\u6001: status=${status}, failCode=${failCode || "\u65E0"}, items=${item_list.length}`);
      if (status === 30) {
        const error = failCode === 2038 ? new APIException(exceptions_default.API_CONTENT_FILTERED, "\u5185\u5BB9\u88AB\u8FC7\u6EE4") : new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, `\u751F\u6210\u5931\u8D25\uFF0C\u9519\u8BEF\u7801: ${failCode}`);
        error.historyId = historyId;
        throw error;
      }
      if (status === 20) {
        const waitTime = 2e3 * Math.min(retryCount + 1, 5);
        logger_default.info(`\u89C6\u9891\u751F\u6210\u4E2D\uFF0C\u7B49\u5F85 ${waitTime}ms \u540E\u7EE7\u7EED\u67E5\u8BE2 (${retryCount + 1}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
      retryCount++;
    } catch (error) {
      if (error instanceof APIException) throw error;
      logger_default.error(`\u8F6E\u8BE2\u51FA\u9519: ${error.message}`);
      retryCount++;
      await new Promise((resolve) => setTimeout(resolve, 2e3 * (retryCount + 1)));
    }
  }
  if (retryCount >= maxRetries && status === 20) {
    const error = new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u89C6\u9891\u751F\u6210\u8D85\u65F6");
    error.historyId = historyId;
    throw error;
  }
  const itemId = ((_b = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _b.item_id) || ((_c = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _c.id) || ((_d = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _d.local_item_id) || ((_f = (_e = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _e.common_attr) == null ? void 0 : _f.id);
  if (itemId) {
    try {
      const hqVideoUrl = await fetchHighQualityVideoUrl(String(itemId), refreshToken);
      if (hqVideoUrl) {
        logger_default.info(`\u89C6\u9891\u751F\u6210\u6210\u529F\uFF08\u9AD8\u8D28\u91CF\uFF09\uFF0CURL: ${hqVideoUrl}`);
        return hqVideoUrl;
      }
    } catch (error) {
      logger_default.warn(`\u83B7\u53D6\u9AD8\u8D28\u91CF\u89C6\u9891URL\u5931\u8D25: ${error.message}`);
    }
  }
  let videoUrl = ((_j = (_i = (_h = (_g = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _g.video) == null ? void 0 : _h.transcoded_video) == null ? void 0 : _i.origin) == null ? void 0 : _j.video_url) || ((_l = (_k = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _k.video) == null ? void 0 : _l.play_url) || ((_n = (_m = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _m.video) == null ? void 0 : _n.download_url) || ((_p = (_o = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _o.video) == null ? void 0 : _p.url);
  if (!videoUrl) {
    const error = new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u672A\u80FD\u83B7\u53D6\u89C6\u9891URL");
    error.historyId = historyId;
    throw error;
  }
  logger_default.info(`\u89C6\u9891\u751F\u6210\u6210\u529F\uFF0CURL: ${videoUrl}`);
  return videoUrl;
}
async function checkVideoStatusByHistoryId(historyId, refreshToken) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
  try {
    const result = await request("post", "/mweb/v1/get_history_by_ids", refreshToken, {
      data: { history_ids: [historyId] }
    });
    let historyData = ((_a = result.history_list) == null ? void 0 : _a[0]) || result[historyId];
    if (!historyData) {
      logger_default.info(`\u5373\u65F6\u67E5\u8BE2: \u672A\u627E\u5230\u5386\u53F2\u8BB0\u5F55 historyId=${historyId}`);
      return null;
    }
    const status = historyData.status;
    const failCode = historyData.fail_code;
    const item_list = historyData.item_list || [];
    logger_default.info(`\u5373\u65F6\u67E5\u8BE2: historyId=${historyId}, status=${status}, failCode=${failCode || "\u65E0"}, items=${item_list.length}`);
    if (status === 20) {
      return null;
    }
    if (status === 30) {
      logger_default.warn(`\u5373\u65F6\u67E5\u8BE2: \u89C6\u9891\u751F\u6210\u5931\u8D25, historyId=${historyId}, failCode=${failCode}`);
      return null;
    }
    const itemId = ((_b = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _b.item_id) || ((_c = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _c.id) || ((_d = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _d.local_item_id) || ((_f = (_e = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _e.common_attr) == null ? void 0 : _f.id);
    if (itemId) {
      try {
        const hqVideoUrl = await fetchHighQualityVideoUrl(String(itemId), refreshToken);
        if (hqVideoUrl) {
          logger_default.info(`\u5373\u65F6\u67E5\u8BE2: \u83B7\u53D6\u9AD8\u8D28\u91CF\u89C6\u9891URL\u6210\u529F, historyId=${historyId}`);
          return hqVideoUrl;
        }
      } catch (error) {
        logger_default.warn(`\u5373\u65F6\u67E5\u8BE2: \u83B7\u53D6\u9AD8\u8D28\u91CF\u89C6\u9891URL\u5931\u8D25: ${error.message}`);
      }
    }
    const videoUrl = ((_j = (_i = (_h = (_g = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _g.video) == null ? void 0 : _h.transcoded_video) == null ? void 0 : _i.origin) == null ? void 0 : _j.video_url) || ((_l = (_k = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _k.video) == null ? void 0 : _l.play_url) || ((_n = (_m = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _m.video) == null ? void 0 : _n.download_url) || ((_p = (_o = item_list == null ? void 0 : item_list[0]) == null ? void 0 : _o.video) == null ? void 0 : _p.url);
    if (videoUrl) {
      logger_default.info(`\u5373\u65F6\u67E5\u8BE2: \u83B7\u53D6\u9884\u89C8\u89C6\u9891URL\u6210\u529F, historyId=${historyId}`);
      return videoUrl;
    }
    if (item_list.length === 0) {
      logger_default.info(`\u5373\u65F6\u67E5\u8BE2: item_list \u4E3A\u7A7A\uFF0C\u53EF\u80FD\u4ECD\u5728\u5904\u7406, historyId=${historyId}`);
      return null;
    }
    logger_default.warn(`\u5373\u65F6\u67E5\u8BE2: item_list \u975E\u7A7A\u4F46\u65E0\u6CD5\u63D0\u53D6\u89C6\u9891URL, historyId=${historyId}`);
    return null;
  } catch (error) {
    logger_default.error(`\u5373\u65F6\u67E5\u8BE2\u51FA\u9519: historyId=${historyId}, ${error.message}`);
    return null;
  }
}
function clearTaskRuntimeWaiters(task) {
  task._resolve = void 0;
  task._promise = void 0;
}
var ASYNC_TASK_DIR = path6.join(process.cwd(), "tmp", "async-tasks");
var asyncTaskStore = /* @__PURE__ */ new Map();
var activeAsyncCount = 0;
var MAX_ASYNC_CONCURRENCY = 10;
var TASK_EXPIRY_MS = 24 * 60 * 60 * 1e3;
function taskFilePath(taskId) {
  return path6.join(ASYNC_TASK_DIR, `${taskId}.json`);
}
function saveTaskToFile(task) {
  try {
    const data = {
      taskId: task.taskId,
      status: task.status,
      model: task.model,
      prompt: task.prompt,
      refreshToken: task.refreshToken,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      historyId: task.historyId,
      result: task.result,
      error: task.error
    };
    fs7.writeFileSync(taskFilePath(task.taskId), JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    logger_default.error(`\u4FDD\u5B58\u4EFB\u52A1\u6587\u4EF6\u5931\u8D25: ${task.taskId}, ${err.message}`);
  }
}
function loadTaskFromFile(filePath) {
  try {
    const raw = fs7.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    logger_default.error(`\u52A0\u8F7D\u4EFB\u52A1\u6587\u4EF6\u5931\u8D25: ${filePath}, ${err.message}`);
    return null;
  }
}
function deleteTaskFile(taskId) {
  try {
    const fp = taskFilePath(taskId);
    if (fs7.existsSync(fp)) {
      fs7.unlinkSync(fp);
    }
  } catch (err) {
    logger_default.error(`\u5220\u9664\u4EFB\u52A1\u6587\u4EF6\u5931\u8D25: ${taskId}, ${err.message}`);
  }
}
function restoreTasksFromFiles() {
  try {
    if (!fs7.existsSync(ASYNC_TASK_DIR)) {
      fs7.mkdirSync(ASYNC_TASK_DIR, { recursive: true });
      return;
    }
    const files = fs7.readdirSync(ASYNC_TASK_DIR).filter((f) => f.endsWith(".json"));
    if (files.length === 0) return;
    logger_default.info(`\u53D1\u73B0 ${files.length} \u4E2A\u5F02\u6B65\u4EFB\u52A1\u6587\u4EF6\uFF0C\u5F00\u59CB\u6062\u590D...`);
    for (const file of files) {
      const data = loadTaskFromFile(path6.join(ASYNC_TASK_DIR, file));
      if (!data) continue;
      if (Date.now() - data.updatedAt > TASK_EXPIRY_MS) {
        deleteTaskFile(data.taskId);
        logger_default.info(`\u6062\u590D\u65F6\u6E05\u7406\u8FC7\u671F\u4EFB\u52A1: ${data.taskId}`);
        continue;
      }
      if (data.status !== "processing") {
        const task2 = data;
        asyncTaskStore.set(data.taskId, task2);
        logger_default.info(`\u6062\u590D\u5DF2\u5B8C\u6210\u4EFB\u52A1: ${data.taskId}, \u72B6\u6001: ${data.status}`);
        continue;
      }
      if (activeAsyncCount >= MAX_ASYNC_CONCURRENCY) {
        logger_default.warn(`\u6062\u590D\u4EFB\u52A1 ${data.taskId} \u8DF3\u8FC7\uFF1A\u5E76\u53D1\u5DF2\u6EE1 ${activeAsyncCount}/${MAX_ASYNC_CONCURRENCY}`);
        const task2 = data;
        asyncTaskStore.set(data.taskId, task2);
        continue;
      }
      const task = {
        ...data,
        _promise: void 0,
        _resolve: void 0
      };
      task._promise = new Promise((resolve) => {
        task._resolve = resolve;
      });
      asyncTaskStore.set(data.taskId, task);
      activeAsyncCount++;
      logger_default.info(`\u6062\u590D\u5E76\u91CD\u542F processing \u4EFB\u52A1: ${data.taskId}, \u5F53\u524D\u5E76\u53D1: ${activeAsyncCount}/${MAX_ASYNC_CONCURRENCY}`);
      restartPollingForTask(task);
    }
    logger_default.info(`\u4EFB\u52A1\u6062\u590D\u5B8C\u6210\uFF0C\u5F53\u524D\u6D3B\u8DC3\u5E76\u53D1: ${activeAsyncCount}/${MAX_ASYNC_CONCURRENCY}`);
  } catch (err) {
    logger_default.error(`\u6062\u590D\u4EFB\u52A1\u6587\u4EF6\u51FA\u9519: ${err.message}`);
  }
}
function restartPollingForTask(task) {
  (async () => {
    try {
      if (!task.historyId) {
        task.status = "failed";
        task.error = "\u4EFB\u52A1\u7F3A\u5C11 historyId\uFF0C\u65E0\u6CD5\u6062\u590D\u8F6E\u8BE2";
        task.updatedAt = Date.now();
        saveTaskToFile(task);
        logger_default.error(`\u6062\u590D\u4EFB\u52A1\u5931\u8D25: ${task.taskId}, \u7F3A\u5C11 historyId`);
        return;
      }
      logger_default.info(`\u6062\u590D\u4EFB\u52A1\u8F6E\u8BE2: ${task.taskId}, historyId=${task.historyId}`);
      const videoUrl = await pollVideoResult(task.historyId, task.refreshToken);
      task.status = "succeeded";
      task.result = { url: videoUrl, revised_prompt: task.prompt };
      task.updatedAt = Date.now();
      saveTaskToFile(task);
      logger_default.info(`\u6062\u590D\u4EFB\u52A1\u8F6E\u8BE2\u6210\u529F: ${task.taskId}`);
    } catch (error) {
      const errorMsg = (error == null ? void 0 : error.message) || "";
      if (errorMsg.includes("\u8D85\u65F6")) {
        task.updatedAt = Date.now();
        saveTaskToFile(task);
        logger_default.warn(`\u6062\u590D\u4EFB\u52A1\u8F6E\u8BE2\u8D85\u65F6\uFF0C\u4FDD\u6301 processing \u72B6\u6001: ${task.taskId}, historyId=${task.historyId}\uFF0C\u7B49\u5F85\u7528\u6237\u67E5\u8BE2\u65F6 on-demand \u68C0\u67E5`);
      } else {
        task.status = "failed";
        task.error = error instanceof APIException ? `[${error.code}] ${error.message}` : errorMsg || "\u672A\u77E5\u9519\u8BEF";
        task.updatedAt = Date.now();
        saveTaskToFile(task);
        logger_default.error(`\u6062\u590D\u4EFB\u52A1\u8F6E\u8BE2\u5931\u8D25: ${task.taskId}, ${task.error}`);
      }
    } finally {
      activeAsyncCount--;
      if (task._resolve) task._resolve();
      clearTaskRuntimeWaiters(task);
    }
  })();
}
setInterval(() => {
  const now = Date.now();
  for (const [taskId, task] of asyncTaskStore) {
    if (now - task.updatedAt > TASK_EXPIRY_MS) {
      asyncTaskStore.delete(taskId);
      deleteTaskFile(taskId);
      logger_default.info(`\u5F02\u6B65\u4EFB\u52A1\u5DF2\u8FC7\u671F\u6E05\u7406: ${taskId}`);
    }
  }
}, 30 * 60 * 1e3);
restoreTasksFromFiles();
async function _generateVideoWithHistoryId(_model, prompt, options, refreshToken, onHistoryId) {
  const model = getModel2(_model);
  const { ratio = "1:1", resolution = "720p", duration = 5, filePaths = [], files = [] } = options;
  const { width, height } = resolveVideoResolution(resolution, ratio);
  logger_default.info(`\u5F02\u6B65\u4EFB\u52A1-\u666E\u901A\u89C6\u9891: \u6A21\u578B=${_model} \u6620\u5C04=${model} ${width}x${height} (${ratio}@${resolution}) \u65F6\u957F=${duration}\u79D2`);
  const { totalCredit } = await getCredit(refreshToken);
  if (totalCredit <= 0) await receiveCredit(refreshToken);
  let first_frame_image = void 0;
  let end_frame_image = void 0;
  if (files && files.length > 0) {
    let uploadIDs = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file || !file.filepath) continue;
      try {
        const buffer = fs7.readFileSync(file.filepath);
        const imageUri = await uploadImageBufferForVideo(buffer, refreshToken);
        if (imageUri) uploadIDs.push(imageUri);
      } catch (error) {
        if (i === 0) throw new APIException(exceptions_default.API_REQUEST_FAILED, `\u9996\u5E27\u6587\u4EF6\u4E0A\u4F20\u5931\u8D25: ${error.message}`);
      }
    }
    if (uploadIDs.length === 0) throw new APIException(exceptions_default.API_REQUEST_FAILED, "\u6240\u6709\u6587\u4EF6\u4E0A\u4F20\u5931\u8D25");
    if (uploadIDs[0]) {
      first_frame_image = { format: "", height, id: util_default.uuid(), image_uri: uploadIDs[0], name: "", platform_type: 1, source_from: "upload", type: "image", uri: uploadIDs[0], width };
    }
    if (uploadIDs[1]) {
      end_frame_image = { format: "", height, id: util_default.uuid(), image_uri: uploadIDs[1], name: "", platform_type: 1, source_from: "upload", type: "image", uri: uploadIDs[1], width };
    }
  } else if (filePaths && filePaths.length > 0) {
    let uploadIDs = [];
    for (let i = 0; i < filePaths.length; i++) {
      if (!filePaths[i]) continue;
      try {
        const imageUri = await uploadImageForVideo(filePaths[i], refreshToken);
        if (imageUri) uploadIDs.push(imageUri);
      } catch (error) {
        if (i === 0) throw new APIException(exceptions_default.API_REQUEST_FAILED, `\u9996\u5E27\u56FE\u7247\u4E0A\u4F20\u5931\u8D25: ${error.message}`);
      }
    }
    if (uploadIDs.length === 0) throw new APIException(exceptions_default.API_REQUEST_FAILED, "\u6240\u6709\u56FE\u7247\u4E0A\u4F20\u5931\u8D25");
    if (uploadIDs[0]) {
      first_frame_image = { format: "", height, id: util_default.uuid(), image_uri: uploadIDs[0], name: "", platform_type: 1, source_from: "upload", type: "image", uri: uploadIDs[0], width };
    }
    if (uploadIDs[1]) {
      end_frame_image = { format: "", height, id: util_default.uuid(), image_uri: uploadIDs[1], name: "", platform_type: 1, source_from: "upload", type: "image", uri: uploadIDs[1], width };
    }
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
  const { aigc_data } = await request("post", "/mweb/v1/aigc_draft/generate", refreshToken, {
    params: {
      aigc_features: "app_lip_sync",
      web_version: "6.6.0",
      da_version: draftVersion
    },
    data: {
      "extend": {
        "root_model": end_frame_image ? MODEL_MAP2["jimeng-video-3.0"] : model,
        "m_video_commerce_info": { benefit_type: "basic_video_operation_vgfm_v_three", resource_id: "generate_video", resource_id_type: "str", resource_sub_type: "aigc" },
        "m_video_commerce_info_list": [{ benefit_type: "basic_video_operation_vgfm_v_three", resource_id: "generate_video", resource_id_type: "str", resource_sub_type: "aigc" }]
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
          "metadata": { "type": "", "id": util_default.uuid(), "created_platform": 3, "created_platform_version": "", "created_time_in_ms": Date.now(), "created_did": "" },
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
      http_common_info: { aid: DEFAULT_ASSISTANT_ID3 }
    }
  });
  const historyId = aigc_data.history_record_id;
  if (!historyId) throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u8BB0\u5F55ID\u4E0D\u5B58\u5728");
  logger_default.info(`\u5F02\u6B65\u4EFB\u52A1-\u666E\u901A\u89C6\u9891: \u751F\u6210\u8BF7\u6C42\u5DF2\u63D0\u4EA4, historyId=${historyId}`);
  if (onHistoryId) onHistoryId(historyId);
  const videoUrl = await pollVideoResult(historyId, refreshToken);
  return { url: videoUrl, historyId };
}
async function _generateSeedanceVideoWithHistoryId(_model, prompt, options, refreshToken, onHistoryId) {
  const model = getModel2(_model);
  const benefitType = SEEDANCE_BENEFIT_TYPE_MAP[_model] || "dreamina_video_seedance_20_pro";
  const { ratio = "4:3", resolution = "720p", duration = 4, filePaths = [], files = [] } = options;
  const actualDuration = duration || 4;
  const { width, height } = resolveVideoResolution(resolution, ratio);
  logger_default.info(`\u5F02\u6B65\u4EFB\u52A1-Seedance: \u6A21\u578B=${_model} \u6620\u5C04=${model} ${width}x${height} (${ratio}@${resolution}) \u65F6\u957F=${actualDuration}\u79D2`);
  const { totalCredit } = await getCredit(refreshToken);
  if (totalCredit <= 0) await receiveCredit(refreshToken);
  let uploadedMaterials = [];
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file || !file.filepath) continue;
      const materialType = detectMaterialType(file);
      try {
        const buffer = fs7.readFileSync(file.filepath);
        if (materialType === "image") {
          const imageUri = await uploadImageBufferForVideo(buffer, refreshToken);
          if (imageUri) uploadedMaterials.push({ type: "image", uri: imageUri, width, height });
        } else {
          const vodResult = await uploadMediaForVideo(buffer, materialType, refreshToken, file.originalFilename);
          uploadedMaterials.push({ type: materialType, vid: vodResult.vid, width: vodResult.width, height: vodResult.height, duration: vodResult.duration, fps: vodResult.fps, name: file.originalFilename || "" });
        }
      } catch (error) {
        if (i === 0) throw new APIException(exceptions_default.API_REQUEST_FAILED, `\u9996\u4E2A\u6587\u4EF6\u4E0A\u4F20\u5931\u8D25: ${error.message}`);
      }
    }
  } else if (filePaths && filePaths.length > 0) {
    for (let i = 0; i < filePaths.length; i++) {
      if (!filePaths[i]) continue;
      const materialType = detectMaterialTypeFromUrl(filePaths[i]);
      try {
        if (materialType === "image") {
          const imageUri = await uploadImageForVideo(filePaths[i], refreshToken);
          if (imageUri) uploadedMaterials.push({ type: "image", uri: imageUri, width, height });
        } else {
          const response = await fetch(filePaths[i]);
          if (!response.ok) throw new Error(`\u4E0B\u8F7D\u6587\u4EF6\u5931\u8D25: ${response.status}`);
          const buffer = Buffer.from(await response.arrayBuffer());
          const vodResult = await uploadMediaForVideo(buffer, materialType, refreshToken);
          uploadedMaterials.push({ type: materialType, vid: vodResult.vid, width: vodResult.width, height: vodResult.height, duration: vodResult.duration, fps: vodResult.fps });
        }
      } catch (error) {
        if (i === 0) throw new APIException(exceptions_default.API_REQUEST_FAILED, `\u9996\u4E2A\u6587\u4EF6\u4E0A\u4F20\u5931\u8D25: ${error.message}`);
      }
    }
  }
  if (uploadedMaterials.length === 0) {
    throw new APIException(exceptions_default.API_REQUEST_FAILED, "Seedance 2.0 \u9700\u8981\u81F3\u5C11\u4E00\u4E2A\u6587\u4EF6");
  }
  const hasVideoMaterial = uploadedMaterials.some((m) => m.type === "video");
  const finalBenefitType = hasVideoMaterial ? `${benefitType}_with_video` : benefitType;
  const materialList = uploadedMaterials.map((mat) => {
    const base = { type: "", id: util_default.uuid() };
    if (mat.type === "image") {
      return { ...base, material_type: "image", image_info: { type: "image", id: util_default.uuid(), source_from: "upload", platform_type: 1, name: "", image_uri: mat.uri, aigc_image: { type: "", id: util_default.uuid() }, width: mat.width, height: mat.height, format: "", uri: mat.uri } };
    } else if (mat.type === "video") {
      return { ...base, material_type: "video", video_info: { type: "video", id: util_default.uuid(), source_from: "upload", name: mat.name || "", vid: mat.vid, fps: mat.fps || 0, width: mat.width || 0, height: mat.height || 0, duration: mat.duration || 0 } };
    } else {
      return { ...base, material_type: "audio", audio_info: { type: "audio", id: util_default.uuid(), source_from: "upload", vid: mat.vid, duration: mat.duration || 0, name: mat.name || "" } };
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
    sceneOptions: JSON.stringify([{ type: "video", scene: "BasicVideoGenerateButton", modelReqKey: model, videoDuration: actualDuration, reportParams: { enterSource: "generate", vipSource: "generate", extraVipFunctionKey: model, useVipFunctionDetailsReporterHoc: true }, materialTypes: [...new Set(uploadedMaterials.map((m) => MATERIAL_TYPE_CODE[m.type]))] }])
  });
  const token = await acquireToken(refreshToken);
  const generateQueryParams = new URLSearchParams({
    aid: String(DEFAULT_ASSISTANT_ID),
    device_platform: "web",
    region: "cn",
    webId: String(WEB_ID),
    da_version: draftVersion,
    web_component_open_flag: "1",
    commerce_with_input_video: "1",
    web_version: "7.5.0",
    aigc_features: "app_lip_sync"
  });
  const generateUrl = `https://jimeng.jianying.com/mweb/v1/aigc_draft/generate?${generateQueryParams.toString()}`;
  const generateBody = {
    extend: {
      root_model: model,
      workspace_id: 0,
      m_video_commerce_info: { benefit_type: finalBenefitType, resource_id: "generate_video", resource_id_type: "str", resource_sub_type: "aigc" },
      m_video_commerce_info_list: [{ benefit_type: finalBenefitType, resource_id: "generate_video", resource_id_type: "str", resource_sub_type: "aigc" }]
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
        metadata: { type: "", id: util_default.uuid(), created_platform: 3, created_platform_version: "", created_time_in_ms: String(Date.now()), created_did: "" },
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
                video_mode: 2,
                fps: 24,
                duration_ms: actualDuration * 1e3,
                idip_meta_list: [],
                unified_edit_input: { type: "", id: util_default.uuid(), material_list: materialList, meta_list: metaList }
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
    http_common_info: { aid: DEFAULT_ASSISTANT_ID }
  };
  logger_default.info(`\u5F02\u6B65\u4EFB\u52A1-Seedance: \u901A\u8FC7\u6D4F\u89C8\u5668\u4EE3\u7406\u53D1\u9001 generate \u8BF7\u6C42...`);
  const generateResult = await browser_service_default.fetch(token, generateUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(generateBody)
  });
  const { ret, errmsg, data: generateData } = generateResult;
  if (ret !== void 0 && Number(ret) !== 0) {
    if (Number(ret) === 5e3) {
      throw new APIException(exceptions_default.API_IMAGE_GENERATION_INSUFFICIENT_POINTS, `[\u65E0\u6CD5\u751F\u6210\u89C6\u9891]: \u5373\u68A6\u79EF\u5206\u53EF\u80FD\u4E0D\u8DB3\uFF0C${errmsg}`);
    }
    throw new APIException(exceptions_default.API_REQUEST_FAILED, `[\u8BF7\u6C42jimeng\u5931\u8D25]: ${errmsg}`);
  }
  const aigc_data = (generateData == null ? void 0 : generateData.aigc_data) || generateResult.aigc_data;
  const historyId = aigc_data.history_record_id;
  if (!historyId) throw new APIException(exceptions_default.API_IMAGE_GENERATION_FAILED, "\u8BB0\u5F55ID\u4E0D\u5B58\u5728");
  logger_default.info(`\u5F02\u6B65\u4EFB\u52A1-Seedance: \u751F\u6210\u8BF7\u6C42\u5DF2\u63D0\u4EA4, historyId=${historyId}`);
  if (onHistoryId) onHistoryId(historyId);
  const videoUrl = await pollVideoResult(historyId, refreshToken);
  return { url: videoUrl, historyId };
}
function submitAsyncVideoTask(model, prompt, options, refreshToken) {
  if (activeAsyncCount >= MAX_ASYNC_CONCURRENCY) {
    throw new APIException(
      exceptions_default.API_REQUEST_FAILED,
      `\u5F53\u524D\u5F02\u6B65\u4EFB\u52A1\u5E76\u53D1\u6570\u5DF2\u8FBE\u4E0A\u9650 (${MAX_ASYNC_CONCURRENCY})\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5`
    );
  }
  if (!fs7.existsSync(ASYNC_TASK_DIR)) {
    fs7.mkdirSync(ASYNC_TASK_DIR, { recursive: true });
  }
  const taskId = util_default.uuid();
  const task = {
    taskId,
    status: "processing",
    model,
    prompt,
    refreshToken,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  task._promise = new Promise((resolve) => {
    task._resolve = resolve;
  });
  asyncTaskStore.set(taskId, task);
  saveTaskToFile(task);
  activeAsyncCount++;
  logger_default.info(
    `\u5F02\u6B65\u4EFB\u52A1\u5DF2\u521B\u5EFA: ${taskId}, \u6A21\u578B: ${model}, \u5F53\u524D\u5E76\u53D1: ${activeAsyncCount}/${MAX_ASYNC_CONCURRENCY}`
  );
  (async () => {
    try {
      let videoUrl;
      if (isSeedanceModel(model)) {
        const seedanceDuration = options.duration === 5 ? 4 : options.duration;
        const seedanceRatio = options.ratio === "1:1" ? "4:3" : options.ratio;
        const { url } = await _generateSeedanceVideoWithHistoryId(
          model,
          prompt,
          {
            ratio: seedanceRatio,
            resolution: options.resolution,
            duration: seedanceDuration,
            filePaths: options.filePaths,
            files: options.files
          },
          refreshToken,
          // onHistoryId 回调：在获取到 historyId 后立即保存到 task 文件
          (historyId) => {
            task.historyId = historyId;
            saveTaskToFile(task);
            logger_default.info(`\u5F02\u6B65\u4EFB\u52A1-Seedance: historyId \u5DF2\u4FDD\u5B58, ${taskId} -> ${historyId}`);
          }
        );
        videoUrl = url;
      } else {
        const { url } = await _generateVideoWithHistoryId(
          model,
          prompt,
          {
            ratio: options.ratio,
            resolution: options.resolution,
            duration: options.duration,
            filePaths: options.filePaths,
            files: options.files
          },
          refreshToken,
          // onHistoryId 回调：在获取到 historyId 后立即保存到 task 文件
          (historyId) => {
            task.historyId = historyId;
            saveTaskToFile(task);
            logger_default.info(`\u5F02\u6B65\u4EFB\u52A1-\u666E\u901A\u89C6\u9891: historyId \u5DF2\u4FDD\u5B58, ${taskId} -> ${historyId}`);
          }
        );
        videoUrl = url;
      }
      task.status = "succeeded";
      task.result = {
        url: videoUrl,
        revised_prompt: prompt
      };
      task.updatedAt = Date.now();
      saveTaskToFile(task);
      logger_default.info(`\u5F02\u6B65\u4EFB\u52A1\u6210\u529F: ${taskId}, \u89C6\u9891URL: ${videoUrl}`);
    } catch (error) {
      const errorMsg = (error == null ? void 0 : error.message) || "";
      if (errorMsg.includes("\u8D85\u65F6")) {
        task.updatedAt = Date.now();
        saveTaskToFile(task);
        logger_default.warn(`\u5F02\u6B65\u4EFB\u52A1\u540E\u53F0\u8F6E\u8BE2\u8D85\u65F6\uFF0C\u4FDD\u6301 processing \u72B6\u6001: ${taskId}, historyId=${task.historyId}\uFF0C\u7B49\u5F85\u7528\u6237\u67E5\u8BE2\u65F6 on-demand \u68C0\u67E5`);
      } else {
        task.status = "failed";
        task.error = error instanceof APIException ? `[${error.code}] ${error.message}` : errorMsg || "\u672A\u77E5\u9519\u8BEF";
        task.updatedAt = Date.now();
        saveTaskToFile(task);
        logger_default.error(`\u5F02\u6B65\u4EFB\u52A1\u5931\u8D25: ${taskId}, \u9519\u8BEF: ${task.error}`);
      }
    } finally {
      activeAsyncCount--;
      if (task._resolve) {
        task._resolve();
      }
      clearTaskRuntimeWaiters(task);
    }
  })();
  return taskId;
}
async function queryAsyncVideoTask(taskId) {
  let task = asyncTaskStore.get(taskId);
  if (!task) {
    const fp = taskFilePath(taskId);
    if (!fs7.existsSync(fp)) {
      throw new APIException(
        exceptions_default.API_REQUEST_PARAMS_INVALID,
        `\u4EFB\u52A1ID\u4E0D\u5B58\u5728\u6216\u5DF2\u8FC7\u671F: ${taskId}`
      );
    }
    const data = loadTaskFromFile(fp);
    if (!data) {
      throw new APIException(
        exceptions_default.API_REQUEST_PARAMS_INVALID,
        `\u4EFB\u52A1\u6570\u636E\u635F\u574F: ${taskId}`
      );
    }
    task = data;
    asyncTaskStore.set(taskId, task);
    logger_default.info(`\u4ECE\u6587\u4EF6\u52A0\u8F7D\u4EFB\u52A1: ${taskId}, \u72B6\u6001: ${task.status}`);
  }
  if (task.status === "succeeded" || task.status === "failed") {
    return task;
  }
  if (task.status === "processing") {
    if (task._promise) {
      logger_default.info(`\u67E5\u8BE2\u63A5\u53E3\u7B49\u5F85\u540E\u53F0\u8F6E\u8BE2\u5B8C\u6210: ${taskId}`);
      await task._promise;
      if (task.status === "succeeded" || task.status === "failed") {
        return task;
      }
    }
    if (task.historyId) {
      logger_default.info(`on-demand \u5373\u65F6\u67E5\u8BE2: ${taskId}, historyId=${task.historyId}`);
      const videoUrl = await checkVideoStatusByHistoryId(task.historyId, task.refreshToken);
      if (videoUrl) {
        task.status = "succeeded";
        task.result = { url: videoUrl, revised_prompt: task.prompt };
        task.updatedAt = Date.now();
        saveTaskToFile(task);
        logger_default.info(`on-demand \u67E5\u8BE2\u53D1\u73B0\u89C6\u9891\u5DF2\u5B8C\u6210: ${taskId}, URL: ${videoUrl}`);
      } else {
        logger_default.info(`on-demand \u67E5\u8BE2: \u89C6\u9891\u4ECD\u5728\u5904\u7406\u4E2D, ${taskId}`);
      }
    } else {
      logger_default.warn(`processing \u4EFB\u52A1\u7F3A\u5C11 historyId\uFF0C\u65E0\u6CD5 on-demand \u67E5\u8BE2: ${taskId}`);
    }
  }
  return task;
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
            "id": "jimeng-video-seedance-2.0",
            "object": "model",
            "owned_by": "jimeng-free-api",
            "description": "Seedance 2.0 \u591A\u56FE\u667A\u80FD\u89C6\u9891\u751F\u6210\u6A21\u578B\uFF08\u56FD\u5185\u517C\u5BB9\u63A5\u53E3\u53EF\u7528\uFF1B\u56FD\u9645 token hk-/jp-/sg- \u5EFA\u8BAE\u8D70 /v1/videos/international/generations\uFF09"
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
            "description": "Seedance 2.0-fast \u5FEB\u901F\u591A\u56FE\u667A\u80FD\u89C6\u9891\u751F\u6210\u6A21\u578B\uFF08\u56FD\u5185\u517C\u5BB9\u63A5\u53E3\u53EF\u7528\uFF1B\u56FD\u9645 token hk-/jp-/sg- \u5EFA\u8BAE\u8D70 /v1/videos/international/generations\uFF09"
          },
          {
            "id": "seedance-2.0-fast",
            "object": "model",
            "owned_by": "jimeng-free-api",
            "description": "Seedance 2.0-fast \u5FEB\u901F\u591A\u56FE\u667A\u80FD\u89C6\u9891\u751F\u6210\u6A21\u578B\uFF08jimeng-video-seedance-2.0-fast \u7684\u522B\u540D\uFF0C\u5411\u540E\u517C\u5BB9\uFF09"
          },
          {
            "id": "jimeng-video-seedance-2.0-fast-vip",
            "object": "model",
            "owned_by": "jimeng-free-api",
            "description": "Seedance 2.0 Fast VIP Vision \u6587\u751F\u89C6\u9891\u6A21\u578B\uFF08dreamina_seedance_40_vision\uFF0CVIP \u5FEB\u901F\u7248\uFF0C\u652F\u6301\u6587\u751F\u89C6\u9891\u548C\u56FE\u751F\u89C6\u9891\uFF09"
          },
          {
            "id": "seedance-2.0-fast-vip",
            "object": "model",
            "owned_by": "jimeng-free-api",
            "description": "Seedance 2.0 Fast VIP Vision \u6587\u751F\u89C6\u9891\u6A21\u578B\uFF08jimeng-video-seedance-2.0-fast-vip \u7684\u522B\u540D\uFF0C\u5411\u540E\u517C\u5BB9\uFF09"
          },
          {
            "id": "jimeng-video-seedance-2.0-vip",
            "object": "model",
            "owned_by": "jimeng-free-api",
            "description": "Seedance 2.0 VIP Vision \u4E3B\u6A21\u6001\u80FD\u529B\u89C6\u9891\u6A21\u578B\uFF08dreamina_seedance_40_pro_vision\uFF0CVIP \u4E13\u4E1A\u7248\uFF0C\u4E3B\u6A21\u6001\u80FD\u529B\uFF09"
          },
          {
            "id": "seedance-2.0-vip",
            "object": "model",
            "owned_by": "jimeng-free-api",
            "description": "Seedance 2.0 VIP Vision \u4E3B\u6A21\u6001\u80FD\u529B\u89C6\u9891\u6A21\u578B\uFF08jimeng-video-seedance-2.0-vip \u7684\u522B\u540D\uFF0C\u5411\u540E\u517C\u5BB9\uFF09"
          }
        ]
      };
    }
  }
};

// src/api/routes/videos.ts
import _16 from "lodash";
import os2 from "os";

// src/lib/job-store.ts
import { v1 as uuid2 } from "uuid";

// src/lib/db.ts
import { Pool as Pool2 } from "pg";
var pool = new Pool2({
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

// src/api/routes/videos.ts
var MEMORY_GATE_MB = parseInt(process.env.MEMORY_GATE_MB || "100", 10);
function checkMemoryGate() {
  const freeMB = Math.round(os2.freemem() / 1024 / 1024);
  if (freeMB < MEMORY_GATE_MB) {
    logger_default.warn(`VideoRoute: memory gate triggered - ${freeMB}MB free, need ${MEMORY_GATE_MB}MB, rejecting job`);
    return new Response(
      { error: { message: `Service temporarily unavailable: low memory (${freeMB}MB free). Please retry in 60 seconds.`, type: "server_error", code: "service_unavailable" } },
      { statusCode: 503, headers: { "Retry-After": "60" } }
    );
  }
  return null;
}
var videos_default = {
  prefix: "/v1/videos",
  post: {
    // ========== 1. Domestic Sync → now async with PostgreSQL ==========
    "/generations": async (request2) => {
      const unsupportedParams = ["size", "width", "height"];
      const bodyKeys = Object.keys(request2.body);
      const foundUnsupported = unsupportedParams.filter((param) => bodyKeys.includes(param));
      if (foundUnsupported.length > 0) {
        throw new Error(`Unsupported parameters: ${foundUnsupported.join(", ")}. Use ratio and resolution to control video dimensions.`);
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
      const memBlock = checkMemoryGate();
      if (memBlock) return memBlock;
      const job = createJob();
      const freeMB = Math.round(os2.freemem() / 1024 / 1024);
      logger_default.info(`Job ${job.id}: created for domestic model=${model} (memory: ${freeMB}MB free)`);
      (async () => {
        try {
          updateJob(job.id, { status: "processing" });
          await updateJobInDb(job.id, {
            status: "processing",
            model,
            prompt: prompt || "",
            response_format,
            refresh_token: token
          });
          let videoUrl;
          if (isSeedanceModel(model)) {
            const seedanceDuration = finalDuration === 5 ? 4 : finalDuration;
            const seedanceRatio = ratio === "1:1" ? "4:3" : ratio;
            videoUrl = await generateSeedanceVideo(
              model,
              prompt,
              { ratio: seedanceRatio, resolution, duration: seedanceDuration, filePaths: finalFilePaths, files: request2.files },
              token
            );
          } else {
            videoUrl = await generateVideo(
              model,
              prompt,
              { ratio, resolution, duration: finalDuration, filePaths: finalFilePaths, files: request2.files },
              token
            );
          }
          if (response_format === "b64_json") {
            const videoBase64 = await util_default.fetchFileBASE64(videoUrl);
            updateJob(job.id, { status: "completed", result: { b64_json: videoBase64, revised_prompt: prompt } });
            await updateJobInDb(job.id, { status: "completed", result_b64_json: videoBase64, result_revised_prompt: prompt || "" });
          } else {
            updateJob(job.id, { status: "completed", result: { url: videoUrl, revised_prompt: prompt } });
            await updateJobInDb(job.id, { status: "completed", result_url: videoUrl, result_revised_prompt: prompt || "" });
          }
          logger_default.info(`Job ${job.id}: completed, url: ${videoUrl}`);
        } catch (err) {
          const message = (err == null ? void 0 : err.message) || String(err);
          updateJob(job.id, { status: "failed", error: message });
          await updateJobInDb(job.id, { status: "failed", error_message: message });
          logger_default.error(`Job ${job.id}: failed - ${message}`);
        }
      })();
      return new Response({
        id: job.id,
        status: job.status,
        created: job.created
      }, { statusCode: 202 });
    },
    // ========== 2. International Sync → now async with PostgreSQL ==========
    "/international/generations": async (request2) => {
      const contentType = request2.headers["content-type"] || "";
      const isMultiPart = contentType.startsWith("multipart/form-data");
      const allowedModels = [
        "seedance-2.0-fast",
        "seedance-2.0-pro",
        "jimeng-video-seedance-2.0-fast",
        "jimeng-video-seedance-2.0",
        "jimeng-video-seedance-2.0-fast-vip",
        "seedance-2.0-fast-vip",
        "jimeng-video-seedance-2.0-vip",
        "seedance-2.0-vip",
        "jimeng-video-3.5-pro",
        "jimeng-video-3.0",
        "jimeng-video-3.0-pro"
      ];
      const hasKeyedUrlFields = Object.keys(request2.body || {}).some((key) => (key === "image_file" || key === "video_file" || key.startsWith("image_file_") || key.startsWith("video_file_")) && _16.isString(request2.body[key]));
      const hasKeyedFiles = Object.keys(request2.filesMap || {}).some(
        (key) => key === "image_file" || key === "video_file" || key.startsWith("image_file_") || key.startsWith("video_file_")
      );
      request2.validate("body.model", (v) => _16.isString(v) && allowedModels.includes(v)).validate("body.prompt", (v) => _16.isUndefined(v) || _16.isString(v)).validate("body.ratio", (v) => _16.isUndefined(v) || _16.isString(v)).validate("body.resolution", (v) => _16.isUndefined(v) || _16.isString(v)).validate("body.file_paths", (v) => _16.isUndefined(v) || _16.isArray(v)).validate("body.filePaths", (v) => _16.isUndefined(v) || _16.isArray(v)).validate("body.response_format", (v) => _16.isUndefined(v) || _16.isString(v)).validate("headers.authorization", _16.isString);
      const tokens = tokenSplit(request2.headers.authorization);
      const token = _16.sample(tokens);
      const {
        model,
        prompt = "",
        ratio,
        resolution = "720p",
        duration,
        file_paths = [],
        filePaths = [],
        response_format = "url"
      } = request2.body;
      const isSeedance = isInternationalSeedanceModel(model);
      const finalDuration = _16.isUndefined(duration) ? isSeedance ? 4 : 5 : isMultiPart && typeof duration === "string" ? parseInt(duration) : duration;
      const finalRatio = _16.isUndefined(ratio) ? isSeedance ? "4:3" : "1:1" : ratio;
      const finalFilePaths = filePaths.length > 0 ? filePaths : file_paths;
      if (!_16.isFinite(finalDuration) || !Number.isInteger(Number(finalDuration))) {
        throw new Error("Invalid duration parameter");
      }
      if (isSeedance) {
        if (finalDuration < 4 || finalDuration > 15) {
          throw new Error("International Seedance model duration supports 4-15 seconds only");
        }
        if (!hasKeyedFiles && !hasKeyedUrlFields && finalFilePaths.length === 0) {
          throw new Error("International Seedance requires at least one material: keyed multipart file, keyed URL field, or file_paths/filePaths");
        }
      } else if (isInternationalVideoModel(model)) {
        if (finalDuration !== 5 && finalDuration !== 10) {
          throw new Error("International video model duration supports 5 or 10 seconds only");
        }
      } else {
        throw new Error(`International endpoint does not support model: ${model}`);
      }
      const memBlock = checkMemoryGate();
      if (memBlock) return memBlock;
      const job = createJob();
      logger_default.info(`Job ${job.id}: created for international model=${model}`);
      (async () => {
        try {
          updateJob(job.id, { status: "processing" });
          await updateJobInDb(job.id, {
            status: "processing",
            model,
            prompt: prompt || "",
            response_format,
            refresh_token: token
          });
          let videoUrl;
          if (isSeedance) {
            videoUrl = await generateInternationalSeedanceVideo(
              model,
              prompt,
              { ratio: finalRatio, resolution, duration: finalDuration, filePaths: finalFilePaths, filesMap: request2.filesMap, body: request2.body },
              token
            );
          } else {
            videoUrl = await generateInternationalVideo(
              model,
              prompt,
              { ratio: finalRatio, resolution, duration: finalDuration, filePaths: finalFilePaths, files: request2.files },
              token
            );
          }
          if (response_format === "b64_json") {
            const videoBase64 = await util_default.fetchFileBASE64(videoUrl);
            updateJob(job.id, { status: "completed", result: { b64_json: videoBase64, revised_prompt: prompt } });
            await updateJobInDb(job.id, { status: "completed", result_b64_json: videoBase64, result_revised_prompt: prompt || "" });
          } else {
            updateJob(job.id, { status: "completed", result: { url: videoUrl, revised_prompt: prompt } });
            await updateJobInDb(job.id, { status: "completed", result_url: videoUrl, result_revised_prompt: prompt || "" });
          }
          logger_default.info(`Job ${job.id}: completed, url: ${videoUrl}`);
        } catch (err) {
          const message = (err == null ? void 0 : err.message) || String(err);
          updateJob(job.id, { status: "failed", error: message });
          await updateJobInDb(job.id, { status: "failed", error_message: message });
          logger_default.error(`Job ${job.id}: failed - ${message}`);
        }
      })();
      return new Response({
        id: job.id,
        status: job.status,
        created: job.created
      }, { statusCode: 202 });
    },
    // ========== 3. International Async → upstream logic + PostgreSQL ==========
    "/international/generations/async": async (request2) => {
      const contentType = request2.headers["content-type"] || "";
      const isMultiPart = contentType.startsWith("multipart/form-data");
      const allowedModels = [
        "seedance-2.0-fast",
        "seedance-2.0-pro",
        "jimeng-video-seedance-2.0-fast",
        "jimeng-video-seedance-2.0",
        "jimeng-video-seedance-2.0-fast-vip",
        "seedance-2.0-fast-vip",
        "jimeng-video-seedance-2.0-vip",
        "seedance-2.0-vip",
        "jimeng-video-3.5-pro",
        "jimeng-video-3.0",
        "jimeng-video-3.0-pro"
      ];
      const hasKeyedUrlFields = Object.keys(request2.body || {}).some((key) => (key === "image_file" || key === "video_file" || key.startsWith("image_file_") || key.startsWith("video_file_")) && _16.isString(request2.body[key]));
      const hasKeyedFiles = Object.keys(request2.filesMap || {}).some(
        (key) => key === "image_file" || key === "video_file" || key.startsWith("image_file_") || key.startsWith("video_file_")
      );
      request2.validate("body.model", (v) => _16.isString(v) && allowedModels.includes(v)).validate("body.prompt", (v) => _16.isUndefined(v) || _16.isString(v)).validate("body.ratio", (v) => _16.isUndefined(v) || _16.isString(v)).validate("body.resolution", (v) => _16.isUndefined(v) || _16.isString(v)).validate("body.file_paths", (v) => _16.isUndefined(v) || _16.isArray(v)).validate("body.filePaths", (v) => _16.isUndefined(v) || _16.isArray(v)).validate("headers.authorization", _16.isString);
      const tokens = tokenSplit(request2.headers.authorization);
      const token = _16.sample(tokens);
      const {
        model,
        prompt = "",
        ratio,
        resolution = "720p",
        duration,
        file_paths = [],
        filePaths = []
      } = request2.body;
      const isSeedance = isInternationalSeedanceModel(model);
      const finalDuration = _16.isUndefined(duration) ? isSeedance ? 4 : 5 : isMultiPart && typeof duration === "string" ? parseInt(duration) : duration;
      const finalRatio = _16.isUndefined(ratio) ? isSeedance ? "4:3" : "1:1" : ratio;
      const finalFilePaths = filePaths.length > 0 ? filePaths : file_paths;
      if (!_16.isFinite(finalDuration) || !Number.isInteger(Number(finalDuration))) {
        throw new Error("Invalid duration parameter");
      }
      if (isSeedance) {
        if (finalDuration < 4 || finalDuration > 15) {
          throw new Error("International Seedance model duration supports 4-15 seconds only");
        }
        if (!hasKeyedFiles && !hasKeyedUrlFields && finalFilePaths.length === 0) {
          throw new Error("International Seedance requires at least one material");
        }
      } else if (isInternationalVideoModel(model)) {
        if (finalDuration !== 5 && finalDuration !== 10) {
          throw new Error("International video model duration supports 5 or 10 seconds only");
        }
      } else {
        throw new Error(`International endpoint does not support model: ${model}`);
      }
      const job = createJob();
      await updateJobInDb(job.id, { status: "processing", model, prompt: prompt || "", refresh_token: token });
      logger_default.info(`Job ${job.id}: created for intl async model=${model}`);
      const taskId = submitInternationalAsyncVideoTask(
        model,
        prompt,
        { ratio: finalRatio, resolution, duration: finalDuration, filePaths: finalFilePaths, files: request2.files, filesMap: request2.filesMap, body: request2.body },
        token
      );
      await updateJobInDb(job.id, { jimeng_history_id: taskId });
      (async () => {
        const MAX_POLL = 300;
        const POLL_INTERVAL = 1e4;
        for (let i = 0; i < MAX_POLL; i++) {
          await new Promise((r) => setTimeout(r, POLL_INTERVAL));
          try {
            const task = await queryAsyncVideoTask(taskId);
            if (task.status === "succeeded") {
              updateJob(job.id, { status: "completed", result: { url: task.result.url, revised_prompt: task.result.revised_prompt } });
              await updateJobInDb(job.id, { status: "completed", result_url: task.result.url, result_revised_prompt: task.result.revised_prompt || "" });
              logger_default.info(`Job ${job.id}: intl async completed, url: ${task.result.url}`);
              return;
            } else if (task.status === "failed") {
              updateJob(job.id, { status: "failed", error: task.error });
              await updateJobInDb(job.id, { status: "failed", error_message: task.error || "Unknown error" });
              logger_default.error(`Job ${job.id}: intl async failed - ${task.error}`);
              return;
            }
          } catch (err) {
            logger_default.warn(`Job ${job.id}: intl async poll error: ${err.message}`);
          }
        }
        updateJob(job.id, { status: "failed", error: "Async task timed out" });
        await updateJobInDb(job.id, { status: "failed", error_message: "Async task timed out" });
      })();
      return {
        created: util_default.unixTimestamp(),
        id: job.id,
        task_id: taskId,
        status: "processing",
        message: "Task submitted. Query status via GET /v1/videos/jobs/{id} or GET /v1/videos/international/generations/async/{task_id}"
      };
    },
    // ========== 4. Domestic Async → upstream logic + PostgreSQL ==========
    "/generations/async": async (request2) => {
      const contentType = request2.headers["content-type"] || "";
      const isMultiPart = contentType.startsWith("multipart/form-data");
      request2.validate("body.model", (v) => _16.isUndefined(v) || _16.isString(v)).validate("body.prompt", (v) => _16.isUndefined(v) || _16.isString(v)).validate("body.ratio", (v) => _16.isUndefined(v) || _16.isString(v)).validate("body.resolution", (v) => _16.isUndefined(v) || _16.isString(v)).validate("body.duration", (v) => {
        if (_16.isUndefined(v)) return true;
        if (isMultiPart && typeof v === "string") {
          const num = parseInt(v);
          return num >= 4 && num <= 15 || num === 5 || num === 10;
        }
        return _16.isFinite(v) && (v >= 4 && v <= 15 || v === 5 || v === 10);
      }).validate("body.file_paths", (v) => _16.isUndefined(v) || _16.isArray(v)).validate("body.filePaths", (v) => _16.isUndefined(v) || _16.isArray(v)).validate("headers.authorization", _16.isString);
      const tokens = tokenSplit(request2.headers.authorization);
      const token = _16.sample(tokens);
      const {
        model = DEFAULT_MODEL2,
        prompt,
        ratio = "1:1",
        resolution = "720p",
        duration = 5,
        file_paths = [],
        filePaths = []
      } = request2.body;
      const finalDuration = isMultiPart && typeof duration === "string" ? parseInt(duration) : duration;
      const finalFilePaths = filePaths.length > 0 ? filePaths : file_paths;
      const job = createJob();
      await updateJobInDb(job.id, { status: "processing", model, prompt: prompt || "", refresh_token: token });
      logger_default.info(`Job ${job.id}: created for domestic async model=${model}`);
      const taskId = submitAsyncVideoTask(
        model,
        prompt,
        { ratio, resolution, duration: finalDuration, filePaths: finalFilePaths, files: request2.files },
        token
      );
      await updateJobInDb(job.id, { jimeng_history_id: taskId });
      (async () => {
        const MAX_POLL = 300;
        const POLL_INTERVAL = 1e4;
        for (let i = 0; i < MAX_POLL; i++) {
          await new Promise((r) => setTimeout(r, POLL_INTERVAL));
          try {
            const task = await queryAsyncVideoTask(taskId);
            if (task.status === "succeeded") {
              updateJob(job.id, { status: "completed", result: { url: task.result.url, revised_prompt: task.result.revised_prompt } });
              await updateJobInDb(job.id, { status: "completed", result_url: task.result.url, result_revised_prompt: task.result.revised_prompt || "" });
              logger_default.info(`Job ${job.id}: domestic async completed, url: ${task.result.url}`);
              return;
            } else if (task.status === "failed") {
              updateJob(job.id, { status: "failed", error: task.error });
              await updateJobInDb(job.id, { status: "failed", error_message: task.error || "Unknown error" });
              logger_default.error(`Job ${job.id}: domestic async failed - ${task.error}`);
              return;
            }
          } catch (err) {
            logger_default.warn(`Job ${job.id}: domestic async poll error: ${err.message}`);
          }
        }
        updateJob(job.id, { status: "failed", error: "Async task timed out" });
        await updateJobInDb(job.id, { status: "failed", error_message: "Async task timed out" });
      })();
      return {
        created: util_default.unixTimestamp(),
        id: job.id,
        task_id: taskId,
        status: "processing",
        message: "Task submitted. Query status via GET /v1/videos/jobs/{id} or GET /v1/videos/generations/async/{task_id}"
      };
    }
  },
  get: {
    // ========== International async task status (upstream compat) ==========
    "/international/generations/async/:taskId": async (request2) => {
      const { taskId } = request2.params;
      if (!taskId) {
        throw new Error("Missing task_id parameter");
      }
      const task = await queryAsyncVideoTask(taskId);
      if (task.status === "succeeded") {
        return {
          created: util_default.unixTimestamp(),
          task_id: task.taskId,
          status: "succeeded",
          data: [{
            url: task.result.url,
            revised_prompt: task.result.revised_prompt
          }]
        };
      } else if (task.status === "failed") {
        return {
          created: util_default.unixTimestamp(),
          task_id: task.taskId,
          status: "failed",
          error: task.error
        };
      } else {
        return {
          created: util_default.unixTimestamp(),
          task_id: task.taskId,
          status: task.status,
          message: "Task is processing"
        };
      }
    },
    // ========== Domestic async task status (upstream compat) ==========
    "/generations/async/:taskId": async (request2) => {
      const { taskId } = request2.params;
      if (!taskId) {
        throw new Error("Missing task_id parameter");
      }
      const task = await queryAsyncVideoTask(taskId);
      if (task.status === "succeeded") {
        return {
          created: util_default.unixTimestamp(),
          task_id: task.taskId,
          status: "succeeded",
          data: [{
            url: task.result.url,
            revised_prompt: task.result.revised_prompt
          }]
        };
      } else if (task.status === "failed") {
        return {
          created: util_default.unixTimestamp(),
          task_id: task.taskId,
          status: "failed",
          error: task.error
        };
      } else {
        return {
          created: util_default.unixTimestamp(),
          task_id: task.taskId,
          status: task.status,
          message: "Task is processing"
        };
      }
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
        const content = await fs8.readFile("public/welcome.html");
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
  try {
    await initializeDatabase();
  } catch (err) {
    logger_default.warn("Database initialization failed, continuing anyway");
  }
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