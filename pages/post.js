import Layout from '../components/MyLayout.js';
import fetch from 'isomorphic-unfetch';
import cheerio from 'cheerio';

const Post =  (props) => (
    <Layout>
      <h1>{props.tourName}</h1>
       <h2>{props.itinerary.title}</h2>
       <div dangerouslySetInnerHTML={{__html: props.itinerary.html}}></div>
       {/* <p>{props.show.summary.replace(/<[/]?p>/g, '')}</p>
       <img src={props.show.image.medium}/> */}
    </Layout>
)

Post.getInitialProps = async function (context) {
  const { id } = context.query
  const res = await fetch(`https://www.eftours.com/${id}`)
  const html = await res.text()

  const $ = cheerio.load(html);

  const tourName = $(".tour-name").first().html();
  console.log(id);
  const itinerary = {
      title: "Itinerary",
      html: $("#itinerary").html()
  }

  
  return { tourName, itinerary };
}

export default Post