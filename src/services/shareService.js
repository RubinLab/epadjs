import { toast } from "react-toastify";
import { getExportLinks } from "./studyServices";

const buildContent = ({ data: results }) => {
  if (!results || results.length === 0) throw new Error("no links returned");
  const displayName = sessionStorage.getItem("displayName") || "";
  const caseWord = results.length === 1 ? "this interesting case" : "these interesting cases";

  const htmlParts = results.map(
    (r) => `${r.name}<br/><a href="${r.link}">${r.study_desc}</a>`
  );
  const textParts = results.map(
    (r) => `${r.name}\n${r.study_desc}\n${r.link}`
  );

  const html = `<div>Hey,<br/><br/>Take a look at ${caseWord} on STELLA!<br/><br/>${htmlParts.join("<br/><br/>")}<br/><br/>Make sure you are within the SHC firewall or on VPN to access STELLA.<br/><br/>${displayName}</div>`;
  const text = `Hey,\n\nTake a look at ${caseWord} on STELLA!\n\n${textParts.join("\n\n")}\n\nMake sure you are within the SHC firewall or on VPN to access STELLA.\n\n${displayName}`;

  return { html, text, count: results.length };
};

export async function shareStudies(bodyArr) {
  const fetchPromise = getExportLinks(bodyArr);
  const contentPromise = fetchPromise.then(buildContent);
  const htmlBlobPromise = contentPromise.then((c) => new Blob([c.html], { type: "text/html" }));
  const textBlobPromise = contentPromise.then((c) => new Blob([c.text], { type: "text/plain" }));

  try {
    if (navigator.clipboard && typeof ClipboardItem !== "undefined") {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": htmlBlobPromise,
          "text/plain": textBlobPromise,
        }),
      ]);
    } else if (navigator.clipboard) {
      const textBlob = await textBlobPromise;
      await navigator.clipboard.writeText(await textBlob.text());
    } else {
      const textBlob = await textBlobPromise;
      const textStr = await textBlob.text();
      const ta = document.createElement("textarea");
      ta.value = textStr;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }

    const { count } = await contentPromise;
    toast.success(
      `Copied ${count} ${count === 1 ? "study" : "studies"} to clipboard`,
      { position: "top-right", autoClose: 3000 }
    );
  } catch (err) {
    console.error(err);
    const message = err.message === "no links returned"
      ? "Share failed: no links returned."
      : "Share failed. Please try again.";
    toast.error(message, { position: "top-right" });
  }
}
