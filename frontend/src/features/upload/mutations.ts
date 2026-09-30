import { useMutation } from "@tanstack/react-query";

import { uploadDataset } from "../../lib/api";
import { queryClient } from "../../lib/queryClient";

export function useUploadDataset() {
  return useMutation({
    mutationFn: uploadDataset,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["datasets"],
      });
    },
  });
}