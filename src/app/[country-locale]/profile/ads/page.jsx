import AdsList from "@/components/profile/ads/AdsList";
import MyAdsHeader from "@/components/profile/ads/MyAdsHeader";
import { getUserProducts } from "@/services/products/getUserProducts";
import { getQueryClient } from "@/utils/queryCLient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("meta");

  return {
    title: t("myAds.title"),
    description: t("myAds.description"),
  };
}

export default async function page() {
  const queryCLient = getQueryClient();

  await queryCLient.prefetchInfiniteQuery({
    queryKey: ["user-products"],
    queryFn: ({ pageParam = 1 }) => getUserProducts(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const nextUrl = lastPage?.data?.links?.next;
      return nextUrl ? new URL(nextUrl).searchParams.get("page") : undefined;
    },
  });
  return (
    <div className="tab-content">
      <div className="tab-content-pane ">
        <section className="products_section w-100">
          <div className="row">
            <MyAdsHeader />
          </div>
          <HydrationBoundary state={dehydrate(queryCLient)}>
            <AdsList />
          </HydrationBoundary>
        </section>
      </div>
    </div>
  );
}
