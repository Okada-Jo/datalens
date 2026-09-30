import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createTransformation,
  getTransformations,
  deleteTransformation,
} from "../lib/api";

import type {
  CreateTransformationInput,
} from "../lib/api";

export function useTransformations(
  datasetId: string | undefined,
) {
  return useQuery({
    queryKey: [
      "datasets",
      datasetId,
      "transformations",
    ],

    queryFn: () => {
      if (!datasetId) {
        throw new Error(
          "Dataset ID is required.",
        );
      }

      return getTransformations(datasetId);
    },

    enabled: Boolean(datasetId),
  });
}

export function useCreateTransformation(
  datasetId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      input: CreateTransformationInput,
    ) => {
      return createTransformation(
        datasetId,
        input,
      );
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["datasets", datasetId],
      });
    },
  });
}

export function useDeleteTransformation(
  datasetId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      transformationId: string,
    ) => {
      return deleteTransformation(
        datasetId,
        transformationId,
      );
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["datasets", datasetId],
      });
    },
  });
}