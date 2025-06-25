import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import clientAxios from "../../../libs/axios/clientAxios";

function useGetCompanyCategories() {
  const lang = useSelector((state) => state.language.lang);

  const { isLoading, data, error } = useQuery({
    queryKey: ["company-categories", lang],
    queryFn: async () => {
      try {
        const res = await clientAxios.get("/company/categories");
        if (res.status === 200) {
          return res.data?.data?.data;
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return { isLoading, data, error };
}

export default useGetCompanyCategories;
