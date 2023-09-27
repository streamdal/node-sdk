import { Metric } from "@streamdal/snitch-protos/protos/sp_common";
import { IInternalClient } from "@streamdal/snitch-protos/protos/sp_internal.client";
import ReadWriteLock from "rwlock";

export const METRIC_INTERVAL = 1000;

export const metrics: Metric[] = [];
export const lock = new ReadWriteLock();

export interface MetricsConfigs {
  grpcClient: IInternalClient;
  snitchToken: string;
}

// eslint-disable-next-line @typescript-eslint/require-await
export const sendMetrics = async (configs: MetricsConfigs) => {
  if (!metrics.length) {
    console.debug(`### no metrics found, skipping`);
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  lock.writeLock(async (release) => {
    try {
      const call = configs.grpcClient.metrics(
        {
          metrics,
        },
        { meta: { "auth-token": configs.snitchToken } }
      );
      console.debug(`### metrics sent`, metrics);

      const status = await call.status;
      console.debug("metrics send status", status);
      metrics.length = 0;
    } catch (e) {
      console.error("error sending metrics", e);
    }

    release();
  });
};
