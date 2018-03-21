import Layout from "../components/MyLayout.js";


const Post = props => (
  <Layout>
    <div className={"page-with-header-image"}>
      <div dangerouslySetInnerHTML={{ __html: props.mainStyle + props.gtmScript  }} />
      <div dangerouslySetInnerHTML={{ __html: props.scriptBundles }} />
      <style>{`body{background-color:#fff}`}</style>

      <div dangerouslySetInnerHTML={{ __html: props.tourHeader }} />
      <div dangerouslySetInnerHTML={{ __html: props.itinerary }} />
      {/* <div dangerouslySetInnerHTML={{ __html: props.panelizrScripts }} /> */}
      <script type="text/javascript" defer src="//media.eftours.com/Content/js/libs/jquery-2.1.1.min.js" />


    </div>
  </Layout>
);

Post.getInitialProps = async function({req, query}) {
  const { id } = query;
  const baseUrl = req ? `${req.protocol}://${req.get('Host')}` : '';
  const res = await fetch(`${baseUrl}/api/lowfat/${id}`);
  return await res.json();
};

export default Post;
