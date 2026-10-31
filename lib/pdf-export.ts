import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

export interface PdfExportOptions {
  filename?: string;
  reportTitle?: string;
}

/**
 * Universally export any printable report DOM node or selector into an A4 PDF
 * matching the 10px margin print layout with full Bangla & currency symbol fidelity.
 */
export async function exportReportToPdf(
  elementOrSelector: HTMLElement | string,
  options?: PdfExportOptions
): Promise<void> {
  const filename = (options?.filename || "arafat-poultry-report").replace(/\.pdf$/i, "") + ".pdf";

  let targetEl: HTMLElement | null = null;
  if (typeof elementOrSelector === "string") {
    targetEl = document.querySelector<HTMLElement>(elementOrSelector);
  } else {
    targetEl = elementOrSelector;
  }

  if (!targetEl) {
    console.error("PDF Export: Target report element not found");
    return;
  }

  // Clone node offscreen to capture clean light-mode render even if .print-only is display:none on screen
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "0";
  container.style.left = "-9999px";
  container.style.width = "794px"; // Standard A4 width at 96 DPI
  container.style.backgroundColor = "#ffffff";
  container.style.color = "#000000";
  container.style.zIndex = "-9999";
  container.style.padding = "10px"; // Strict 10px margin
  container.style.boxSizing = "border-box";

  const clone = targetEl.cloneNode(true) as HTMLElement;
  clone.style.display = "block";
  clone.style.visibility = "visible";
  clone.style.width = "100%";
  clone.style.backgroundColor = "#ffffff";
  clone.style.color = "#000000";
  clone.classList.remove("hidden", "dark");

  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(clone, {
      scale: 2, // High resolution (retina crispness)
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 794,
    });

    const imgWidth = 190; // A4 width (210mm) - 20mm (10mm left/right margin)
    const pageHeightMm = 297;
    const marginMm = 10;
    const printableHeightMm = pageHeightMm - marginMm * 2; // 277mm

    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pdf = new jsPDF("p", "mm", "a4");

    if (imgHeight <= printableHeightMm) {
      // Fits on a single page
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", marginMm, marginMm, imgWidth, imgHeight);
    } else {
      // Multi-page splitting
      const pageCanvasHeight = (canvas.width * printableHeightMm) / imgWidth;
      let renderedHeight = 0;
      let pageIndex = 0;

      while (renderedHeight < canvas.height) {
        if (pageIndex > 0) {
          pdf.addPage();
        }

        const sourceY = renderedHeight;
        const sliceHeight = Math.min(pageCanvasHeight, canvas.height - sourceY);

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeight;

        const ctx = pageCanvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            sliceHeight,
            0,
            0,
            canvas.width,
            sliceHeight
          );

          const pageSliceHeightMm = (sliceHeight * imgWidth) / canvas.width;
          const pageImgData = pageCanvas.toDataURL("image/png");
          pdf.addImage(pageImgData, "PNG", marginMm, marginMm, imgWidth, pageSliceHeightMm);
        }

        renderedHeight += pageCanvasHeight;
        pageIndex++;
      }
    }

    pdf.save(filename);
  } catch (error) {
    console.error("PDF Generation Error:", error);
    throw error;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

