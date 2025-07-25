import CompaniesAds from "@/components/companies/CompaniesAds";
import { getCompanyProducts } from "@/services/companies/getCompanyProducts";
import { getQueryClient } from "@/utils/queryCLient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata({ searchParams }) {
  const t = await getTranslations("meta");
  const {
    search,
    country_id,
    city_id,
    category_id,
    type,
    sort,
    sub_category_id,
  } = searchParams || {};

  const hasFilters =
    search || category_id || sub_category_id || country_id || city_id;

  return {
    title: hasFilters
      ? `${t("companyAds.searchTitle")} "${search || ""}"`
      : t("companyAds.title"),
    description: hasFilters
      ? `${t("companyAds.searchDescription")} "${search || ""}"`
      : t("companyAds.description"),
  };
}

export default async function page({ searchParams }) {
  const storeSearchparams = await searchParams;
  const lang = (await getLocale()).split("-")[1];

  const {
    search,
    country_id,
    city_id,
    category_id,
    type,
    sort,
    sub_category_id,
  } = storeSearchparams;

  const queryClient = getQueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: [
      "company-products",
      country_id,
      type,
      sort,
      city_id,
      // id,
      category_id,
      sub_category_id,
      lang,
    ],
    queryFn: ({ pageParam = 1 }) =>
      getCompanyProducts({
        pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const nextUrl = lastPage?.data?.links?.next;
      return nextUrl ? new URL(nextUrl).searchParams.get("page") : undefined;
    },
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CompaniesAds />
    </HydrationBoundary>
  );
}
