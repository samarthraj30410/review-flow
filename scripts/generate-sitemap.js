const fs = require("fs");
const path = require("path");
const { SitemapStream, streamToPromise } = require("sitemap");

const SITE_URL = "https://reviewflo.in";

const root = process.cwd();

function findHtmlFiles(dir) {
    let files = [];

    for (const file of fs.readdirSync(dir)) {
        const full = path.join(dir, file);

        // Skip folders we don't want to scan
        if (
            full.includes("node_modules") ||
            full.includes(".git") ||
            full.includes("scripts") ||
            full.includes(`${path.sep}404${path.sep}`)
        ) {
            continue;
        }

        if (fs.statSync(full).isDirectory()) {
            files = files.concat(findHtmlFiles(full));
        } else if (file.endsWith(".html")) {

            // Skip files that shouldn't be indexed
            if (
                file.startsWith("google") ||
                file === "404.html"
            ) {
                continue;
            }

            files.push(full);
        }
    }

    return files;
}

(async () => {
    try {
        const sitemap = new SitemapStream({
            hostname: SITE_URL,
        });

        const htmlFiles = findHtmlFiles(root);

        for (const file of htmlFiles) {

            let url = "/" +
                path.relative(root, file)
                    .replace(/\\/g, "/")
                    .replace(/index\.html$/, "")
                    .replace(/\.html$/, "");

            if (url === "/") {
                url = "";
            }

            sitemap.write({
                url,
                lastmod: new Date().toISOString(),
            });
        }

        sitemap.end();

        const xml = await streamToPromise(sitemap);

        fs.writeFileSync(
            path.join(root, "sitemap.xml"),
            xml.toString()
        );

        console.log("✅ sitemap.xml generated successfully!");
    } catch (err) {
        console.error("❌ Error generating sitemap:");
        console.error(err);
    }
})();