import { Audience } from "@streamdal/snitch-protos/protos/sp_common.js";
import { ClientType } from "@streamdal/snitch-protos/protos/sp_info.js";
import { IInternalClient } from "@streamdal/snitch-protos/protos/sp_internal.client.js";
import { v4 as uuidv4 } from "uuid";

// import { version } from "../../package.json";
import { InternalPipeline, processResponse } from "./pipeline.js";

export const sessionId = uuidv4();

export interface RegisterConfigs {
  grpcClient: IInternalClient;
  snitchToken: string;
  serviceName: string;
  dryRun: boolean;
  audiences?: Audience[];
}

//
// fyi, the init flag is because we can't await pipeline initialization
// in our constructor so we do it on processPipeline only if needed
export const internal = {
  pipelineInitialized: false,
  pipelines: new Map<string, InternalPipeline>(),
  audiences: new Set<string>(),
};

export const audienceKey = (audience: Audience) =>
  JSON.stringify(audience).toLowerCase();

export const register = async ({
  grpcClient,
  serviceName,
  snitchToken,
  dryRun,
  audiences,
}: RegisterConfigs) => {
  try {
    console.info(`### registering with grpc server...`);

    const call = grpcClient.register(
      {
        sessionId,
        serviceName,
        dryRun,
        clientInfo: {
          clientType: ClientType.SDK,
          libraryName: "snitch-node-client",
          libraryVersion: "0.0.1",
          language: "Typescript",
          arch: process.arch,
          os: process.platform,
        },
        ...(audiences ? { audiences } : { audiences: [] }),
      },
      {
        meta: { "auth-token": snitchToken },
      }
    );

    console.info(`### registered with grpc server`);
    for await (const response of call.responses) {
      response.command.oneofKind !== "keepAlive" &&
        console.debug("processing response command...", response);
      processResponse(response);
    }
  } catch (error) {
    console.error("Error registering with grpc server", error);
  }
};
