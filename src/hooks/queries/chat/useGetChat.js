import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import clientAxios from "../../../utils/axios/clientAxios";

export default function useGetChat() {
  const lang = useSelector((state) => state.language.lang);
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("user_id");

  const { isLoading, data, error } = useQuery({
    queryKey: ["chat", lang, userId],
    queryFn: async () => {
      try {
        const res = await clientAxios.get(`/client/chat/details`, {
          params: {
            user_id: userId,
            user_type:
              localStorage.getItem("userType") === "client"
                ? "user"
                : "company",
          },
        });
        if (res.status === 200) {
          return res.data.data || {};
        }
      } catch (error) {
        console.error("Error fetching product:", error.message);
        throw error;
      }
    },
    enabled: Boolean(userId),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  return { isLoading, data, error };
}
