<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class PdfService
{
    /**
     * Default dimensions for the PDF (240mm x 90mm in points)
     */
    private const DEFAULT_WIDTH = 680.31;  // 240mm in points

    private const DEFAULT_HEIGHT = 255.12; // 90mm in points

    /**
     * Generate a PDF from HTML content
     *
     * @param  string  $content  The HTML content to include in the PDF
     * @param  array  $options  Options for PDF generation (filename, download, dimensions)
     */
    public function generatePdf(string $content, array $options = []): Response
    {
        $filename = $options['filename'] ?? 'document.pdf';
        $download = $options['download'] ?? true;
        $width = $options['width'] ?? self::DEFAULT_WIDTH;
        $height = $options['height'] ?? self::DEFAULT_HEIGHT;

        if (! str_ends_with($filename, '.pdf')) {
            $filename .= '.pdf';
        }

        $html = $this->generateHtmlTemplate($content, $width, $height);

        $pdf = Pdf::loadHTML($html);
        $pdf->setPaper([0, 0, $width, $height]);

        if ($download) {
            return $pdf->download($filename);
        }

        return $pdf->stream($filename);
    }

    /**
     * Generate the HTML template for the PDF
     *
     * @param  string  $content  The content to include in the template
     * @param  float  $width  Width in points
     * @param  float  $height  Height in points
     */
    public function generateHtmlTemplate(string $content, float $width = self::DEFAULT_WIDTH, float $height = self::DEFAULT_HEIGHT): string
    {
        // Convert points to mm for CSS
        $widthMm = $width / 2.83465;
        $heightMm = $height / 2.83465;
        $contentWidthMm = $widthMm - 20; // 10mm padding on each side
        $contentHeightMm = $heightMm - 20; // 10mm padding on top and bottom

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        html, body {
            margin: 0;
            padding: 0;
            width: {$widthMm}mm;
            height: {$heightMm}mm;
            overflow: hidden;
        }
        body {
            padding: 10mm;
            font-family: sans-serif;
            page-break-inside: avoid;
            page-break-after: avoid;
        }
        .content {
            width: {$contentWidthMm}mm;
            height: {$contentHeightMm}mm;
            overflow: hidden;
            page-break-inside: avoid;
            page-break-after: avoid;
        }
    </style>
</head>
<body>
    <div class="content">
        {$content}
    </div>
</body>
</html>
HTML;
    }
}
