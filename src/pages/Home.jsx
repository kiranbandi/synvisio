import React, { Component } from 'react';
import { Link } from 'react-router';

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
            SynVisio offers two basic forms of visualizations a <b>Linear bar plot</b> and a <b>Dot plot</b>. General information regarding the paramters that were set for McScanX and the percetage share of collinear genes, are read from the collinearity
            file and displayed along with the plots. Users can choose the source and the target chromosomes and the type of the plot using the options panel. Users also have a theming option that they can choose which toggles the background of the plot making
            it easier to visualize outlier points and links.</p>

          <h1>Linear Bar Plot</h1>
          <p>This plot visualises chromosomes as horizontal bars and connects genetically collinear regions between source and target regions with links. There are three levels of view for this plot <b>whole genome level view</b> ,<b>chromosome level view</b>        and <b>block level view</b> with each offering synteny visualization at a different scale. The genome view uses colors to distniguish different chromosomes and can be used to see which source and target chromosomes share collinear regions. The
            width of the links represents the length of the sequences that are collinear.Hovering the mouse over a source chromosome displays all the links for which that chromosome is a source. Clicking on a source chromosome marker displays only the links
            emerging from that chromosome.Double clicking on any marker resets this effect. To investigate a region further users can click on a source chromosome and then click on a target chromosome to invoke the chromosome view for that particular source
            and target chromosome. The chromosome view uses colour to distniguish between a direct alignment and a reversed / flipped alignment. Users can use the mouse to zoom and pan the plot to investigate links.Hovering over a link also displays additional
            information regarding the link like the E value , match score and the count.Double clicking on a link highlights that particular link and It also opens up the block view for that particular alignment. The reset icon at the top right corner can
            be used to reset the plot to its original state. The block View like the chromosome view can be zoomed and panned , also clicking on the flip icon (arrow shaped) inverts the target block which can help researchers investigating alignment blocks
            which are flipped.
          </p>

          <h1>Dot Plot</h1>
          <p>A dot plot is simply the two dimensional representation of the similarity matrix between two sequences. The source chromosomes and target chromosomes are on the X and Y axes respectively and a link between two regions is represented by a dot.If the
            link is longer its represented by a line the length of which depends on the length of the match. This plot can be zoomed and panned for closer investigation using the mouse.Hovering over a dot or a line shows the user additional information regarding
            that link and double clicking on a link opens up the block view for that particular alignment.This view works in the same way as the block view in the Linear bar plot.
          </p>

          <h1>What Next ?</h1>
          <p>We are working on adding several new features to this tool.The current development progress is documented <a href="https://trello.com/b/ag1Upk33/mcscanx-synteny-visualizer">here</a>.We are also working on offering users the ability to upload their
              own sequences.But for the time being we have loaded up several sample files as listed below :</p>
          <ul>
            <li> <Link to={'/Dashboard/bn'}> Bn </Link> - Brassica napus , Canola </li>
            <li> <Link to={'/Dashboard/at'}> At </Link> - Arabidopsis thaliana ,Thale cress </li>
            <li> <Link to={'/Dashboard/os_sb'}> Os vs Sb </Link> - Os(Oriza sativa, Rice) vs Sb(Sorghum bicolor , Corn)</li>
            <li> <Link to={'/Dashboard/at_vv'}> At vs Vv </Link> - At(Arabidopsis thaliana, Thale cress) vs Vv(Vitis vinifera , Grape Vine)</li>
          </ul>

        </div>
      </div >

    )
  }
};

export default Home;


