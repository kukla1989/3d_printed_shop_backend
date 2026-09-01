import { load } from "cheerio";

async function fetchJsonLdFromUrl(url) {
  const res = await fetch(url);
  const html = await res.text();
  const $ = load(html);

  return $('script[type="application/ld+json"]')
    .map((_, script) => {
      try {
        return JSON.parse($(script).html());
      } catch {
        return null;
      }
    })
    .get();
}

export async function fetchShafaData(url) {
  const data = await fetchJsonLdFromUrl(url)

  const { name, image, description, color } = data[0]
  const { price } = data[0].offers;

  return { name, image, description, color, price };
}
