import { z } from "zod";

/**
 * Zod schemas for the raw YAML rule files. Validation happens once at load
 * (see detectionSchemaLoader.ts) so a malformed rule fails loudly in tests and
 * at startup instead of being silently dropped or cast to the wrong shape.
 */

const featureTypeSchema = z.enum([
  "string",
  "number",
  "array",
  "object",
  "boolean",
]);

const libraryDependencySchema = z.enum([
  "clientjs",
  "fingerprintjs",
  "deviceDetector",
]);

const exemplaryValuesSchema = z.array(z.unknown());

const abuseIndicationSchema = z.object({ bot: z.string() }).strict();

export type RawOutputFeature = {
  name: string;
  type: z.infer<typeof featureTypeSchema>;
  description: string;
  abuseIndication: { bot: string };
  exemplaryValues?: unknown[];
  outputs?: Record<string, RawOutputFeature>;
};

const outputFeatureSchema: z.ZodType<RawOutputFeature> = z.lazy(() =>
  z
    .object({
      name: z.string().min(1),
      type: featureTypeSchema,
      description: z.string().min(1),
      abuseIndication: abuseIndicationSchema,
      exemplaryValues: exemplaryValuesSchema.optional(),
      outputs: z.record(z.string(), outputFeatureSchema).optional(),
    })
    .strict()
);

const rootRuleSchema = z
  .object({
    name: z.string().min(1),
    type: z.literal("object"),
    code: z.string().trim().min(1),
    description: z.string().min(1),
    abuseIndication: abuseIndicationSchema,
    exemplaryValues: exemplaryValuesSchema.optional(),
    dependency: libraryDependencySchema.optional(),
    outputs: z.record(z.string(), outputFeatureSchema),
  })
  .strict();

/** A rule file: exactly one top-level key (the rule id) mapping to a root rule. */
export const ruleFileSchema = z
  .record(z.string().regex(/^[a-z][a-z0-9_]*$/, "rule id must be snake_case"), rootRuleSchema)
  .refine((file) => Object.keys(file).length === 1, {
    message: "Expected exactly one rule per YAML file",
  });

export type LibraryDependency = z.infer<typeof libraryDependencySchema>;

/** Formats zod issues as `path: message` lines for error output. */
export const formatIssues = (error: z.ZodError): string =>
  error.issues
    .map((issue) => `  ${issue.path.join(".") || "<root>"}: ${issue.message}`)
    .join("\n");
