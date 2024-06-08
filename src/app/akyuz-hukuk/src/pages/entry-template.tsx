import { ArticleType, ArticleTypeEnum } from '../store';

export function entryTemplate(articles: ArticleType[]) {
  return `
    <div class="section-header">
    <h2>Makalelerimiz</h2>
</div>

<div class="row portfolio-container">
    <a href="#idare">
        <div class="col-lg-4 col-md-6 col-sm-12 portfolio-item six">
            <div class="portfolio-wrap">
                <img src="img/hukuk10.jpg" alt="Portfolio Image">
                <figure>
                    <p>İDARE</p>
                    <a href="#idare">İdare hukuku</a>
                    <span>17.09.2022</span>
                </figure>
            </div>
        </div>
    </a>
    <a href="#ceza">
        <div class="col-lg-4 col-md-6 col-sm-12 portfolio-item second">
            <div class="portfolio-wrap">
                <img src="img/portfolio-2.jpg" alt="Portfolio Image">
                <figure>
                    <p>Ceza Hukuku</p>
                    <a href="#ceza">Ceza Durumları</a>
                    <span>17.09.2022</span>
                </figure>
            </div>
        </div>
    </a>
    <a href="#icra">
        <div class="col-lg-4 col-md-6 col-sm-12 portfolio-item eight">
            <div class="portfolio-wrap">
                <img src="img/hukuk12.jpg" alt="Portfolio Image">
                <figure>
                    <p>İcra Hukuku</p>
                    <a href="#icra">İcra Takibi ve Hukuku</a>
                    <span>17.09.2022</span>
                </figure>
            </div>
        </div>
    </a>

</div> 
</div>
</div>
<!-- Portfolio Start -->

<div class="single">
<div class="container">
<div class="section-header">
    <h2>Makalelerimiz</h2>
</div>
<div class="row">
    <div class="col-12">
        <img id="idare" class="img-fluid rounded" src="img/hukuk23.jpg" alt="Image" >
        <h1 class="mb-4">İDARE</h1>
        <ul>
        ${articles
          .filter((a) => a.type === ArticleTypeEnum.Idare)
          .map(
            (article) =>
              ` <li class="mb-4"><a href="?makale=${article.id}">${article.title}</a></li>`
          )
          .join('')}
        </ul>

        <img id="ceza" class="img-fluid rounded" src="img/hukuk24.jpg" alt="Image" >
        <h1 class="mb-4">CEZA</h1>
        <ul>
        ${articles
          .filter((a) => a.type === ArticleTypeEnum.Ceza)
          .map(
            (article) =>
              `<li class="mb-4"><a href="?makale=${article.id}">${article.title}</a></li>`
          )
          .join('')}
        </ul>

        <img id="icra" class="img-fluid rounded" src="img/hukuk20.jpg" alt="Image" >
        <h1 class="mb-4">İCRA</h1>
        <ul>
        ${articles
          .filter((a) => a.type === ArticleTypeEnum.Icra)
          .map(
            (article) =>
              `<li class="mb-4"><a href="?makale=${article.id}">${article.title}</a></li>`
          )
          .join('')}
        </ul>    
`;
}
