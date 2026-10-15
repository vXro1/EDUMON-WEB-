import { useEffect } from "react";

const SITE = "https://edumon.uniautonoma.edu.co";

function upsert(selector, create) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
}

function metaTag(attr, key) {
  return upsert(`meta[${attr}="${key}"]`, () => {
    const m = document.createElement("meta");
    m.setAttribute(attr, key);
    return m;
  });
}

export function usePageMeta({ title, description, path, noindex = false }) {
  useEffect(() => {
    const desc = metaTag("name", "description");
    const robots = metaTag("name", "robots");
    const ogTitle = metaTag("property", "og:title");
    const ogDesc = metaTag("property", "og:description");
    const ogUrl = metaTag("property", "og:url");
    const canonical = upsert('link[rel="canonical"]', () => {
      const l = document.createElement("link");
      l.setAttribute("rel", "canonical");
      return l;
    });

    const previous = {
      title: document.title,
      desc: desc.getAttribute("content"),
      robots: robots.getAttribute("content"),
      ogTitle: ogTitle.getAttribute("content"),
      ogDesc: ogDesc.getAttribute("content"),
      ogUrl: ogUrl.getAttribute("content"),
      canonical: canonical.getAttribute("href"),
    };

    const url = `${SITE}${path ?? window.location.pathname}`;
    if (title) {
      document.title = title;
      ogTitle.setAttribute("content", title);
    }
    if (description) {
      desc.setAttribute("content", description);
      ogDesc.setAttribute("content", description);
    }
    robots.setAttribute("content", noindex ? "noindex, follow" : "index, follow");
    ogUrl.setAttribute("content", url);
    canonical.setAttribute("href", url);

    return () => {
      document.title = previous.title;
      if (previous.desc != null) desc.setAttribute("content", previous.desc);
      if (previous.robots != null) robots.setAttribute("content", previous.robots);
      if (previous.ogTitle != null) ogTitle.setAttribute("content", previous.ogTitle);
      if (previous.ogDesc != null) ogDesc.setAttribute("content", previous.ogDesc);
      if (previous.ogUrl != null) ogUrl.setAttribute("content", previous.ogUrl);
      if (previous.canonical != null) canonical.setAttribute("href", previous.canonical);
    };
  }, [title, description, path, noindex]);
}
