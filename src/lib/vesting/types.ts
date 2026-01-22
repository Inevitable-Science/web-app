import z from "zod";

export interface Schedule {
  amountTotal: bigint;
  beneficiary: string;
  cliff: bigint;
  duration: bigint;
  released: bigint;
  revokable: boolean;
  start: bigint;
  status: number;
}

export const ScheduleSchemaZ = z.object({
  id: z.string(),
  amountTotal: z.bigint(),
  beneficiary: z.string(),
  cliff: z.bigint(),
  duration: z.bigint(),
  released: z.bigint(),
  revokable: z.boolean(),
  start: z.bigint(),
  status: z.number(),
});

export type ScheduleType = z.infer<typeof ScheduleSchemaZ>;

export interface ProcessedSchedule extends Schedule {
  id: string;
  releasableAmount: bigint;
}
