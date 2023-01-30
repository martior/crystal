import type { Express, Request, Response } from "express";

import type { GrafservConfig, RequestDigest } from "../../../interfaces.js";
import { OptionsFromConfig } from "../../../options.js";
import { getBodyFromRequest, processHeaders } from "../../../utils.js";
import { NodeGrafserv } from "../../node/index.js";

declare global {
  namespace Grafserv {
    interface RequestDigestFrameworkMeta {
      expressv4: {
        req: Request;
        res: Response;
      };
    }
  }
}

export class ExpressGrafserv extends NodeGrafserv {
  protected getDigest(
    dynamicOptions: OptionsFromConfig,
    req: Request,
    res: Response,
  ): RequestDigest {
    return {
      httpVersionMajor: req.httpVersionMajor,
      httpVersionMinor: req.httpVersionMinor,
      isSecure: req.secure,
      method: req.method,
      path: req.path,
      headers: processHeaders(req.headers),
      getQueryParams() {
        return req.query as Record<string, string | string[]>;
      },
      getBody() {
        return (
          req.body ?? getBodyFromRequest(req, dynamicOptions.maxRequestLength)
        );
      },
      meta: {
        expressv4: {
          req,
          res,
        },
      },
    };
  }

  addTo(app: Express) {
    app.use(this.createHandler());
  }
}

export function grafserv(config: GrafservConfig) {
  return new ExpressGrafserv(config);
}
