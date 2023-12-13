import { Audience } from "@streamdal/protos/protos/sp_common";

import { OperationType, Streamdal, StreamdalConfigs } from "../streamdal.js";
import { loadData } from "./billing.js";
import { runPipeline } from "./index.js";

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

const welcome = new Streamdal(serviceKVConfig);
const wpData = loadData("./src/sandbox/assets/sample-welcome-producer.json");

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
  //
  // Key exists, this will result in a pipeline step running without error
  runPipeline(welcome, KVProducer, wpData[0], 1000);
  //
  // Key does not exist, this will result in a pipeline step running without error
  runPipeline(welcome, KVProducer, wpData[1], 1000);
};
