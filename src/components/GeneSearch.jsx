import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { findGeneMatch } from '../redux/actions/actions';

class GeneSearch extends Component {

    constructor(props) {
        super(props);
        this.searchForGene = this.searchForGene.bind(this);
    }

    searchForGene(event) {
        let geneId = document.getElementById('gene-input-search').value;
        this.props.findGeneMatch(geneId);
    }

    render() {
        const { searchResult = [] } = this.props;

        const searchResultContent = searchResult.map((val, index) => {
            return <p key={'search-result-' + index}><b>Alignment Score : </b> {val.score} <b>Type: </b>{val.type} <b>Source: </b>{val.source} <b>Target: </b>{val.target}</p>
        })

        return (
            <div>
                <div className='snapshot-header'>
                    <h4>
                        Gene Search Panel
                        <span className="icon icon-chevron-right"></span>
                    </h4>
                </div>
                <div className='snapshot-inner'>
                    <input id='gene-input-search' className="form-control" type="text" placeholder="Search..." />
                    <button type="submit" className="btn btn-primary-outline" onClick={this.searchForGene}>
                        SEARCH <span className="icon icon-magnifying-glass"></span>
                    </button>

                    <div className='snapshot-inner-result'>
                        {searchResultContent}
                    </div>
                </div>

            </div>
        );
    }
}

function mapStateToProps(state) {
    return { searchResult: state.oracle.searchResult };
}

function mapDispatchToProps(dispatch) {
    return { findGeneMatch: bindActionCreators(findGeneMatch, dispatch) };
}

export default connect(mapStateToProps, mapDispatchToProps)(GeneSearch);


