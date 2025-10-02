import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type Status = "Aktiv" | "Deaktiv";
export type PlanItem = {
  id: string;
  docNo: string;
  projectName: string;
  year: number;
  description: string;
  volumeDivision:
    | "Bərabər Bölünmə"
    | "Tarixi Məlumatlara Əsaslanan Bölgü"
    | "Dəyişən Bölünmə";
  status: Status;
};

type GetParams = {
  page: number;
  limit: number;
  search?: string;
  status?: string[];
  volume?: string[];
};

type ListResponse = { items: PlanItem[]; total: number };

export const plansApi = createApi({
  reducerPath: "plansApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000",
  }),
  tagTypes: ["Plans"],
  endpoints: (build) => ({
    getPlans: build.query<ListResponse, GetParams>({
      query: ({ page, limit, search, status, volume }) => {
        const p = new URLSearchParams();
        p.set("_page", String(page));
        p.set("_limit", String(limit));
        if (search) p.set("q", search);
        status?.forEach((s) => p.append("status", s));
        volume?.forEach((v) => p.append("volumeDivision", v));
        return `/plans?${p.toString()}`;
      },
      transformResponse: (resp: PlanItem[], meta) => ({
        items: resp,
        total: Number(
          meta?.response?.headers.get("x-total-count") ?? resp.length
        ),
      }),
      providesTags: (r) =>
        r
          ? [
              ...r.items.map(({ id }) => ({ type: "Plans" as const, id })),
              { type: "Plans" as const, id: "LIST" },
            ]
          : [{ type: "Plans", id: "LIST" }],
    }),

    addPlan: build.mutation<PlanItem, Omit<PlanItem, "id">>({
      query: (body) => ({ url: "/plans", method: "POST", body }),
      invalidatesTags: (result) =>
        result
          ? [
              { type: "Plans", id: result.id },
              { type: "Plans", id: "LIST" },
            ]
          : [{ type: "Plans", id: "LIST" }],
    }),

    updatePlan: build.mutation<
      PlanItem,
      Partial<PlanItem> & Pick<PlanItem, "id">
    >({
      query: ({ id, ...patch }) => ({
        url: `/plans/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (r, e, a) => [{ type: "Plans", id: a.id }],
    }),

    deletePlan: build.mutation<{ id: string }, string>({
      query: (id) => ({ url: `/plans/${id}`, method: "DELETE" }),
      invalidatesTags: (r, e, id) => [
        { type: "Plans", id },
        { type: "Plans", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetPlansQuery,
  useAddPlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,
} = plansApi;
