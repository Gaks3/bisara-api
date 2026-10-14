import { authedFactory } from "@/factory";

import { listSignsInput, signDetailInput } from "./dictionary.input";
import { dictionaryDetailOutput, dictionaryListOutput } from "./dictionary.output";
import { dictionaryService } from "./dictionary.service";

export const listSigns = authedFactory.build({
  description:
    "Retrieve BISINDO signs dictionary with optional search keyword and category filter.",
  handler: async ({ input }) =>
    dictionaryService.listSigns({
      category: input.category,
      limit: input.limit,
      offset: input.offset,
      search: input.search,
    }),
  input: listSignsInput,
  method: "get",
  operationId: "listDictionarySigns",
  output: dictionaryListOutput,
  summary: "List dictionary signs",
  tag: "Dictionary",
});

export const getSignDetail = authedFactory.build({
  description: "Retrieve sign details, description, and media demonstrations by code.",
  handler: async ({ input }) => dictionaryService.getSignDetail(input.code),
  input: signDetailInput,
  method: "get",
  operationId: "getSignDetail",
  output: dictionaryDetailOutput,
  summary: "Get sign detail",
  tag: "Dictionary",
});
