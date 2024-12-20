import useSWR from "swr";

import { DEV_MODE } from "../../env";
import { HydrationData } from "../../../../libs/types/hydration";
import { HOMEPAGE, HOMEPAGE_ITEMS } from "../../telemetry/constants";

import "./index.scss";

export default function FeaturedArticles(props: HydrationData<any>) {
  const fallbackData = props.hyData ? props : undefined;
  const { data: { hyData } = {} } = useSWR<any>(
    "./index.json",
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status} on ${url}: ${text}`);
      }
      return await response.json();
    },
    {
      fallbackData,
      revalidateOnFocus: DEV_MODE,
      revalidateOnMount: !fallbackData,
    }
  );

  return hyData?.featuredArticles.length ? (
    <div className="featured-articles">
      <h2>Featured articles</h2>
      <div className="tile-container">
        {hyData.featuredArticles.map((article, index) => {
          return (
            <div className="article-tile" key={article.mdn_url}>
              {article.tag && (
                <a
                  href={article.tag.uri}
                  className="tile-tag"
                  data-glean={`${HOMEPAGE}: ${HOMEPAGE_ITEMS.ARTICLE_TAG} ${index + 1}`}
                >
                  {article.tag.title}
                </a>
              )}
              <h3 className="tile-title">
                <a
                  href={article.mdn_url}
                  data-glean={`${HOMEPAGE}: ${HOMEPAGE_ITEMS.ARTICLE} ${index + 1}`}
                >
                  {article.title}
                </a>
              </h3>
              <p>{article.summary}</p>
            </div>
          );
        })}
      </div>
    </div>
  ) : null;
}
