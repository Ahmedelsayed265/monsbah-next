import { useInfiniteQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import axiosInstance from "../../../utils/axiosInstance";

function useGetAllProducts({ id, enabled }) {
  const lang = useSelector((state) => state.language.lang);

  const {
    isLoading,
    data,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["allProducts", id, lang],

    queryFn: async ({ pageParam = 1 }) => {
      const res = await axiosInstance.get("/client/products", {
        params: {
          page: pageParam,
          user_id: id,
        },
      });
      if (res.status === 200) {
        return {
          data: res.data?.data?.data,
          total: res.data?.data?.meta?.total,
          per_page: res.data?.data?.meta?.per_page,
        };
      } else {
        throw new Error("Failed to fetch products");
      }
    },

    getNextPageParam: (lastPage, pages) => {
      const isMore = lastPage.data.length >= lastPage.per_page;
      return isMore ? pages.length + 1 : undefined;
    },

    enabled: Boolean(id) && Boolean(enabled),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
  });

  return {
    isLoading,
    data: data?.pages.flatMap((page) => page.data),
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  };
}

export default useGetAllProducts;
