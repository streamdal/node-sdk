import { Audience } from "@streamdal/protos/protos/sp_common";

import { OperationType, Streamdal, StreamdalConfigs } from "../streamdal.js";
import { loadData } from "./billing.js";

const serviceKVConfig: StreamdalConfigs = {
  streamdalUrl: "localhost:8082",
  streamdalToken: "1234",
  serviceName: "kv-service",
  pipelineTimeout: "100",
  stepTimeout: "10",
  dryRun: false,
};

const KVProducer: Audience = {
  serviceName: "kv-service",
  componentName: "postgresql",
  operationType: OperationType.PRODUCER,
  operationName: "import",
};

/**
 * 1. run this
 * 2. go to the console, create a pipeline with a "Key/Value" step type,
 *    choose type "Exists", mode "Dynamic", and use "event_id" for key.
 * 3. Add the following key via the server rest api:
 *
 *    curl --header "Content-Type: application/json" \
 *      -H "Authorization: Bearer 1234" \
 *      --request PUT \
 *      --data '{"kvs": [{"key": "eaab67a7-f8af-48b9-b65f-1f0f15de9956","value": "eaab67a7-f8af-48b9-b65f-1f0f15de9956"}]}' \
 *      "http://localhost:8081/api/v1/kv"
 */
export const kv = () => {
  const kvService = new Streamdal(serviceKVConfig);
  const kvData = loadData("./src/sandbox/assets/sample-welcome-producer.json");

  //
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  setInterval(async () => {
    const result = await kvService.process({
      audience: KVProducer,
      data: new TextEncoder().encode(JSON.stringify(kvData[0])),
    });

    //
    // Key exists, this will result in a pipeline step running without error
    // if this is part of multi-step or multi-pipeline you will need to inspect pipelineStatus
    console.debug(result.error);
  }, 1000);

  //
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  setInterval(async () => {
    const result = await kvService.process({
      audience: KVProducer,
      data: new TextEncoder().encode(JSON.stringify(kvData[1])),
    });

    //
    // Key does not exist, this will result in an error
    // if this is part of multi-step or multi-pipeline you will need to inspect pipelineStatus
    console.debug(result.error);
  }, 1000);
};
