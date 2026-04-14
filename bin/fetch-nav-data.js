#!/usr/bin/env node
/**
 * Local dev script: fetches navigation data from Hygraph and writes it to
 * assets/navdata.json. Committing this file lets production load the nav data
 * without exposing the Hygraph endpoint client-side.
 *
 * Usage: `node bin/fetch-nav-data.js` (or `yarn fetch-nav-data`)
 */
const fs = require("fs");
const path = require("path");

const HYGRAPH_ENDPOINT =
  process.env.HYGRAPH_ENDPOINT ||
  "https://us-west-2.cdn.hygraph.com/content/cld3gw4bb0hr001ue9afzcunb/master";

const NAVIGATION_MENU_ID = "clezyiora1akc0an0g68whmx0";

const NAVIGATION_MENU_QUERY = `
  query GetNavigationMenu($id: ID!) {
    navigationMenu(where: { id: $id }) {
      beautyItems   { id name link showInHomeTabs flagAsNew iconImage { id url } }
      wellnessItems { id name link showInHomeTabs flagAsNew iconImage { id url } }
      fitnessItems  { id name link showInHomeTabs flagAsNew iconImage { id url } }
      featureItems  { id name description link showInHomeTabs flagAsNew iconImage { id url } }
    }
  }
`;

const RESOURCES_NAV_POSTS_QUERY = `
  query GetResourcesNavPosts {
    trendingPosts: blogPosts(
      first: 1
      where: { category_contains_some: [Beauty], postTypeSelect: Learn }
      orderBy: date_DESC
    ) {
      id title slug publishedAt coverImage { id url }
    }
    proPosts: blogPostsConnection(
      first: 2
      where: { postTypeSelect: SalesUpdates }
      orderBy: publishedAt_DESC
    ) {
      edges { node { id title slug publishedAt coverImage { id url } } }
    }
  }
`;

async function gql(query, variables) {
  const res = await fetch(HYGRAPH_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`Hygraph request failed: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(`Hygraph returned errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}

async function main() {
  const [menuData, postsData] = await Promise.all([
    gql(NAVIGATION_MENU_QUERY, { id: NAVIGATION_MENU_ID }),
    gql(RESOURCES_NAV_POSTS_QUERY),
  ]);

  if (!menuData || !menuData.navigationMenu) {
    throw new Error("No navigationMenu returned from Hygraph");
  }

  const payload = {
    fetchedAt: new Date().toISOString(),
    navigationMenu: menuData.navigationMenu,
    resourcesNavPosts: {
      trendingPosts: postsData.trendingPosts || [],
      proPosts: (postsData.proPosts?.edges || []).map((edge) => edge.node),
    },
  };

  const outPath = path.join(__dirname, "..", "assets", "navdata.json");
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n");
  console.log(`Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
