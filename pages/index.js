import Layout from '../components/MyLayout.js'
import Link from 'next/link'
import fetch from 'isomorphic-unfetch'
import {tours} from '../test-data/tours.json';


const Index = (props) => (
  <Layout>
    <h1>EF Tours!</h1>
    <ul>
      {props.tours.map((tour, index) => (
        <li key={tour.code}>
          <Link as={`/p/${tour.code}`} href={`/post?id=${tour.code}`}>
            <a>{tour.title}</a>
          </Link>
        </li>
      ))}
    </ul>
  </Layout>
);

Index.getInitialProps = async function() {
  console.log(tours);
  return { tours };
}

export default Index