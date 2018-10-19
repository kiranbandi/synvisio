import React, { Component } from 'react';
import { Link } from 'react-router';
import YouTube from 'react-youtube';

//  Image url handling is convoluted in scss , much easier to set inline and get images from root
let backgroundStyle = { background: 'url(assets/img/synvisio.jpg)' };

class Home extends Component {
  render() {
    return (
      <div>

        <div className="home-header" style={backgroundStyle}>
          <div className="container">
            <div className='col-lg-12 text-lg-left text-md-center text-sm-center text-xs-center'><h1>SynVisio</h1>
              <p>An Interactive Multiscale Synteny Visualization Tool for <a href="http://chibba.pgml.uga.edu/mcscan2/">McScanX</a>.</p>
            </div>
          </div>
        </div>

        <div className="container home-body">
          <h1>How does it work ?</h1>
          <p>SynVisio lets you explore the results of <a href='http://chibba.pgml.uga.edu/mcscan2/'>McScanX</a> a popular synteny and collinearity detection toolkit. </p>
          <p>SynVisio requires two files to run:</p>
          <ul>
            <li>The <b>simplified gff file</b> that was used as an input for a McScanX query.</li>
            <li>The <b>collinearity file</b> generated as an output by McScanX for the same input query.</li>
          </ul>
          <p>
            SynVisio offers three basic types of visualizations a <b>Linear bar plot</b> a <b>Hive plot </b>and a <b>Dot plot</b>. General information regarding the parameters that were set for McScanX and the percetage share of collinear genes, are read from the collinearity
            file and displayed along with the plots. Users can choose the source and the target chromosomes and the type of the plot using the options panel.</p>
          
          
          <YouTube videoId="83ep_AuMWak" />
          
          <p>Use the following links for other videos and tutorials on using SynVisio.</p>
          <p><a href='https://youtu.be/bLqeXwFDUbQ'> Multi-Analysis Hive plot</a></p>
          <p><a href='https://youtu.be/e6CNFLjGFmQ'> Visualizing additional tracks</a></p>
          <p><a href='https://youtu.be/dkInV2QHGVY'> Support for Revisitation using Snapshot Feature </a></p>
          <p><a href='https://youtu.be/C4fTi9bVHEY'> Detailed description of all features in SynVisio </a></p>

          <p>SynVisio works best when opened in <b>Google chrome.</b></p>

          <h1>What Next ?</h1>
          <p>We are working on adding several new features to this tool.The current development progress is documented <a href="https://trello.com/b/ag1Upk33/mcscanx-synteny-visualizer">here</a>.We have loaded up several sample files below that you can play around with :</p>
          <ul>
            <li> <Link to={'/Dashboard/bn'}> Bn </Link> - Brassica napus , Canola </li>
            <li> <Link to={'/Dashboard/bnigra_bol_brapa_ortho'}> B.nigra vs B.oleracea vs B.rapa </Link> - 3 Way comparision between Brassica nigra , Brassica rapa and Brassica oleracea </li>
            <li> <Link to={'/Dashboard/ca_lc_mt'}> Ca vs Lc vs Mt </Link> - 3 Way comparision between Chickpea , Lentils and Barrel Meddick </li>
            <li> <Link to={'/Dashboard/ta_cs'}> Wheat IWGSC </Link> - Wheat , Chinese Spring (With SNP tracks) </li>
            <li> <Link to={'/Dashboard/ta_hb'}> Wheat  Hybrid </Link> - Wheat Hybrid , Artificial Ancestral Hexaplod </li>
            <li> <Link to={'/Dashboard/cs_hb'}> Wheat cross way analysis </Link> - Wheat Chinese Spring vs Artificial Ancestral Hexaplod</li>
            <li> <Link to={'/Dashboard/hs_pt'}> Hs vs Pt </Link> - Hs(Homo sapiens Hg38, Human) vs Pt(Pan troglodytes Pan-tro 3, Chimpanzee)</li>
            <li> <Link to={'/Dashboard/at'}> At </Link> - Arabidopsis thaliana ,Thale cress </li>
            <li> <Link to={'/Dashboard/os_sb'}> Os vs Sb </Link> - Os(Oriza sativa, Rice) vs Sb(Sorghum bicolor , Broom-Corn)</li>
            <li> <Link to={'/Dashboard/at_vv'}> At vs Vv </Link> - At(Arabidopsis thaliana, Thale cress) vs Vv(Vitis vinifera , Grape Vine)</li>
          </ul>
        </div>
      </div >

    )
  }
};

export default Home;


