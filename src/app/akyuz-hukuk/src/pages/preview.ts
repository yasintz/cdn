const url = 'https://akyuzhukukdanismanlik.com';
export function getPreviewHtml(content: string) {
  return `
    


<!doctype html>
<html lang="tr">
    <head>
        <meta charset="utf-8">
        <title>Akyüz Hukuk & Danışmanlık</title>
        <meta content="width=device-width, initial-scale=1.0" name="viewport">
        <meta content="Avukat, Mustafa Akyüz, Danışmanlık, Arabuluculuk, Akyüz hukuk" name="keywords">
        <meta content="Akyüz Hukuk & Danışmanlık" name="description">
        <meta name="robots" content="index, follow">  
		<meta name="revisit-after" content="7 days">
        <!-- Favicon -->
        <link href="img/law.png" rel="icon">
        <!-- Google Font -->
        <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@1,600;1,700;1,800&family=Roboto:wght@400;500&display=swap" rel="stylesheet"> 
        <!-- CSS Libraries -->
        <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.0/css/all.min.css" rel="stylesheet">
        <link href="${url}/lib/animate/animate.min.css" rel="stylesheet">
        <link href="${url}/lib/owlcarousel/assets/owl.carousel.min.css" rel="stylesheet">
        <!-- Template Stylesheet -->
        <link href="${url}/css/style.css" rel="stylesheet">
		<script async src="https://www.googletagmanager.com/gtag/js?id=G-3L25TKRPQM"></script>
		<script>
		  window.dataLayer = window.dataLayer || [];
		  function gtag(){dataLayer.push(arguments);}
		  gtag('js', new Date());

		  gtag('config', 'G-3L25TKRPQM');
		</script>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2073864393851197" crossorigin="anonymous"></script>
    </head>
    <body>
        <div class="wrapper">
        <!-- Portfolio Start -->
        <div class="portfolio">
            <div class="container">
                ${content
                  .split('img/')
                  .join(`${url}/img/`)}                      
            </div>
        </div>
    </div>
</div>
        </div>

        <!-- JavaScript Libraries -->
        <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.bundle.min.js"></script>
        <script src="${url}/lib/easing/easing.min.js"></script>
        <script src="${url}/lib/owlcarousel/owl.carousel.min.js"></script>
        <script src="${url}/lib/isotope/isotope.pkgd.min.js"></script>

        <!-- Template Javascript -->
        <script src="${url}/js/main.js"></script>
    </body>
</html>

    `;
}
